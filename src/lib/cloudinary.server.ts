import crypto from "crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "";

export const isCloudinaryConfigured = (): boolean => {
  return !!(cloudName && (apiSecret || uploadPreset));
};

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder = "india_story_project"
): Promise<string | null> {
  if (!isCloudinaryConfigured()) {
    console.warn("[Cloudinary Service] Credentials not configured in .env. Falling back to Supabase.");
    return null;
  }

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: contentType });
    formData.append("file", blob, fileName);
    formData.append("folder", folder);

    if (apiSecret) {
      // Signed Upload
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const signatureInput = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureInput).digest("hex");

      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
    } else if (uploadPreset) {
      // Unsigned Upload
      formData.append("upload_preset", uploadPreset);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cloudinary Service] API Error response:", errorText);
      return null;
    }

    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("[Cloudinary Service] Exception during upload:", error);
    return null;
  }
}
