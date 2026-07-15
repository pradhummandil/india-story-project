import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/$slug/audio")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const slug = params.slug?.trim();
        if (!slug) {
          return json({ error: "Story identifier is required" }, { status: 400 });
        }

        const urlObj = new URL(request.url);
        const lang = urlObj.searchParams.get("lang") === "hi" ? "hi" : "en";
        const download = urlObj.searchParams.get("download") === "true";

        try {
          // Resolve story from database (supports id or slug)
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            slug,
          );
          const story = await prisma.story.findFirst({
            where: isUuid ? { id: slug } : { slug },
          });

          if (!story) {
            return json({ error: "Story not found" }, { status: 404 });
          }

          // Choose content based on language
          const title = lang === "hi" && story.titleHi ? story.titleHi : story.title;
          const excerpt = lang === "hi" && story.excerptHi ? story.excerptHi : story.excerpt;
          const content = lang === "hi" && story.contentHi ? story.contentHi : story.content;

          // Strip HTML tags and normalize whitespace
          const cleanText = `${title}. ${excerpt}. ${content}`
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/\s+/g, " ")
            .trim();

          if (!cleanText) {
            return json({ error: "No text content available to synthesize" }, { status: 400 });
          }

          // Split text into chunks for Google Translate TTS (max 180 chars)
          const chunks = splitTextIntoChunks(cleanText, 180);

          if (chunks.length === 0) {
            return json({ error: "Failed to segment content for TTS" }, { status: 400 });
          }

          // Fetch chunks sequentially to synthesize full audio buffer
          const ttsLang = lang === "hi" ? "hi" : "en";
          const buffers: Buffer[] = [];

          for (const chunk of chunks) {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
            const ttsRes = await fetch(ttsUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
              },
            });

            if (ttsRes.ok) {
              const arrayBuffer = await ttsRes.arrayBuffer();
              buffers.push(Buffer.from(arrayBuffer));
            }
          }

          if (buffers.length === 0) {
            return json({ error: "Failed to generate speech audio" }, { status: 500 });
          }

          const combinedBuffer = Buffer.concat(buffers);

          return new Response(combinedBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
              "Content-Disposition": download
                ? `attachment; filename="${story.slug}-${lang}.mp3"`
                : `inline; filename="${story.slug}-${lang}.mp3"`,
            },
          });
        } catch (error) {
          console.error("TTS Audio generator error:", error);
          return json({ error: "Internal server error during speech synthesis" }, { status: 500 });
        }
      },
    },
  },
});

function splitTextIntoChunks(text: string, maxLength = 180): string[] {
  // Split by sentence terminators
  const sentences = text.match(/[^.!?।;]+[.!?।;]?/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Force-split sentences that are too long (e.g. no punctuation)
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > maxLength) {
      const words = chunk.split(/\s+/);
      let subChunk = "";
      for (const word of words) {
        if ((subChunk + " " + word).length > maxLength) {
          if (subChunk.trim()) {
            finalChunks.push(subChunk.trim());
          }
          subChunk = word;
        } else {
          subChunk += (subChunk ? " " : "") + word;
        }
      }
      if (subChunk.trim()) {
        finalChunks.push(subChunk.trim());
      }
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks;
}
