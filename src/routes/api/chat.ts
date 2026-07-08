import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { message, lang } = body;
          if (!message?.trim()) {
            return json({ error: "Message is required" }, { status: 400 });
          }

          const q = message.toLowerCase().trim();
          const isHindi = lang === "hi";

          // Query the stories database directly to form dynamic, real responses!
          const stories = await prisma.story.findMany({
            where: {
              status: "Published",
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
                { category: { name: { contains: q, mode: "insensitive" } } },
                { state: { name: { contains: q, mode: "insensitive" } } },
              ],
            },
            take: 3,
            select: {
              title: true,
              titleHi: true,
              slug: true,
              excerpt: true,
              excerptHi: true,
              category: { select: { name: true } },
              state: { select: { name: true } },
            },
          });

          let reply = "";
          const suggestions: string[] = [];

          if (stories.length > 0) {
            if (isHindi) {
              reply = `मुझे आपकी खोज से संबंधित ${stories.length} प्रेरणादायक कहानियाँ मिली हैं:\n\n`;
              stories.forEach((s) => {
                const title = s.titleHi || s.title;
                const excerpt = s.excerptHi || s.excerpt;
                reply += `* **[${title}](/stories/${s.slug})** (${s.state?.name || "भारत"})\n  ${excerpt.slice(0, 100)}...\n\n`;
                suggestions.push(`${title} के बारे में बताएं`);
              });
              reply += `आप इन कहानियों को पढ़ने के लिए लिंक पर क्लिक कर सकते हैं। क्या आप किसी विशिष्ट क्षेत्र या श्रेणी के बारे में जानना चाहते हैं?`;
            } else {
              reply = `I found ${stories.length} inspiring stories related to your search:\n\n`;
              stories.forEach((s) => {
                reply += `* **[${s.title}](/stories/${s.slug})** (${s.state?.name || "India"})\n  ${s.excerpt.slice(0, 100)}...\n\n`;
                suggestions.push(`Tell me more about ${s.title}`);
              });
              reply += `Click the links to read the full stories. Would you like to filter by category or region?`;
            }
          } else {
            // General response if no direct story match is found
            if (isHindi) {
              reply = `नमस्ते! मैं भारत की लोक कथाओं, गुमनाम नायकों और सांस्कृतिक विरासत को जानने में आपकी सहायता कर सकता हूँ।\n\nमुझे आपके संदेश से सीधे मेल खाती कोई कहानी नहीं मिली, लेकिन आप इनमें से कुछ खोज सकते हैं:\n* **श्रेणियाँ**: संस्कृति, विज्ञान, पर्यावरण, विरासत।\n* **राज्य**: केरल, महाराष्ट्र, राजस्थान, असम।\n\nआप मुझसे क्या पूछना चाहेंगे?`;
              suggestions.push("केरल की कहानियाँ दिखाएँ");
              suggestions.push("संस्कृति श्रेणी की कहानियाँ");
              suggestions.push("प्रमुख नायकों के बारे में बताएं");
            } else {
              reply = `Hello! I'm your India Story Guide. I can help you discover unsung heroes, cultural heritage, and grassroots innovations across every state.\n\nI couldn't find a direct story match for your query, but you can try searching for:\n* **Categories**: Culture, Science, Environment, Heritage.\n* **States**: Kerala, Maharashtra, Rajasthan, Assam.\n\nWhat would you like to explore?`;
              suggestions.push("Show stories from Kerala");
              suggestions.push("Explore Culture stories");
              suggestions.push("Who are the local heroes?");
            }
          }

          return json({ reply, suggestions });
        } catch (e: any) {
          return json({ error: e.message || "Failed to parse query" }, { status: 500 });
        }
      },
    },
  },
});
