import crypto from "crypto";

/**
 * Upload a file buffer to Cloudinary using the signed upload API.
 * Reads env vars inside the function (not at module scope) for SSR compatibility.
 * Throws on failure — callers should catch and surface the actual error.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder = "india_story_project",
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not set. Add it to your .env file.");
  }

  if (!apiSecret && !uploadPreset) {
    throw new Error("Either CLOUDINARY_API_SECRET or CLOUDINARY_UPLOAD_PRESET must be set.");
  }

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: contentType });
  formData.append("file", blob, fileName);
  formData.append("folder", folder);

  if (apiSecret && apiKey) {
    // Signed upload — more secure, required for production
    const timestamp = Math.round(Date.now() / 1000).toString();
    const signatureInput = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureInput).digest("hex");

    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
  } else if (uploadPreset) {
    // Unsigned upload — OK for development
    formData.append("upload_preset", uploadPreset);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errJson = await response.json();
      detail = errJson?.error?.message ?? JSON.stringify(errJson);
    } catch {
      detail = await response.text().catch(() => `HTTP ${response.status}`);
    }
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error(`Cloudinary returned no secure_url. Response: ${JSON.stringify(data)}`);
  }

  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
  };
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  return !!(cloudName && (apiSecret || uploadPreset));
}

export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/image/upload/");
  if (parts.length < 2) return null;
  const pathPart = parts[1];
  const pathParts = pathPart.split("/");
  if (pathParts[0].startsWith("v") && /^\d+$/.test(pathParts[0].slice(1))) {
    pathParts.shift();
  }
  const publicIdWithExt = pathParts.join("/");
  const dotIndex = publicIdWithExt.lastIndexOf(".");
  if (dotIndex === -1) return publicIdWithExt;
  return publicIdWithExt.slice(0, dotIndex);
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[Cloudinary Service] Deletion skipped: credentials not fully configured.");
    return false;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000).toString();
    const signatureInput = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureInput).digest("hex");

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Cloudinary Service] Delete API Error: ${err}`);
      return false;
    }

    const data = await res.json();
    return data.result === "ok";
  } catch (error) {
    console.error("[Cloudinary Service] Exception during deletion:", error);
    return false;
  }
}
