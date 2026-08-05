import { createFileRoute } from "@tanstack/react-router";
import { json, sanitizeInput, checkRateLimit, getClientIp, authenticate } from "@/routes/api/-_utils";
import { searchStoriesForAssistant, FormattedStoryPayload } from "@/lib/services/ai-assistant-indexer.server";
import { findMatchingFAQ, PLATFORM_INFO } from "@/lib/services/website-knowledge";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = getClientIp(request);
        const { allowed } = checkRateLimit(ip, 60, 60 * 1000); // 60 requests per minute
        if (!allowed) {
          return json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        try {
          const body = await request.json();
          const message = sanitizeInput(String(body.message || ""));
          const lang = body.lang || "en";
          const isHindi = lang === "hi";
          const history = body.history || [];

          if (!message.trim()) {
            return json({ error: "Message is required" }, { status: 400 });
          }

          // 1. Authenticated User Profile Context
          const user = await authenticate(request);
          let userContext = "";
          if (user) {
            userContext = `\nAuthenticated User: ${user.email}\n`;
          }

          // 2. Perform RAG Search across India Story Project Repository
          const searchResult = await searchStoriesForAssistant(message, 5);
          const { exactMatch, stories, matchedEntityType } = searchResult;

          // 3. Platform FAQ Knowledge Check
          const faqAnswer = findMatchingFAQ(message, isHindi);

          // 4. Construct RAG Context for Gemini System Prompt
          let storiesRAGContext = "";
          if (exactMatch) {
            storiesRAGContext = `
EXACT STORY MATCH FOUND:
- Title: ${exactMatch.title} (${exactMatch.titleHi || ""})
- Slug: ${exactMatch.slug}
- State/District: ${exactMatch.stateName} ${exactMatch.cityName ? `/ ${exactMatch.cityName}` : ""}
- Author: ${exactMatch.authorName} (${exactMatch.authorBio || "Editorial Author"})
- Category/Themes: ${exactMatch.themes.join(", ") || "Heritage"}
- Reading Time: ${exactMatch.readTime}
- Excerpt: ${exactMatch.excerpt}
- Historical Significance: ${exactMatch.historicalSignificance}
- Cultural Significance: ${exactMatch.culturalSignificance}
- Story Cover Image: ${exactMatch.image}
- View Count: ${exactMatch.viewCount}
`;
          } else if (stories.length > 0) {
            storiesRAGContext = `
MATCHING REPOSITORY STORIES (${matchedEntityType}):
` + stories.map((s, idx) => `
${idx + 1}. "${s.title}" (Slug: ${s.slug})
   State: ${s.stateName} | Author: ${s.authorName} | Read Time: ${s.readTime}
   Themes: ${s.themes.join(", ")}
   Excerpt: ${s.excerpt}
`).join("\n");
          } else {
            storiesRAGContext = "No direct matching stories found in the repository index.";
          }

          const historyContext = history.length > 0
            ? history.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")
            : "First message in this conversation session.";

          // System Prompt as mandated by Phase 19 & Phase 2/3/4/5/6/7 requirements
          const systemPrompt = `
You are the official AI Story Assistant of India Story Project (Production 3.0).
You know every published story. You know every author. You know every category. You know every state and district.
You help users discover stories, guide contributors step-by-step, answer website questions, and combine India Story Project knowledge with Gemini knowledge.
Always prioritize India Story Project content before external information. Whenever possible recommend stories and highlight clicking the interactive Story Cards rendered below your message.

=== CONVERSATION HISTORY ===
${historyContext}

USER QUESTION: "${message}"
LANGUAGE: ${isHindi ? "Hindi (हिन्दी)" : "English"}
${userContext}
=== RAG KNOWLEDGE BASE CONTEXT ===
${storiesRAGContext}

${faqAnswer ? `=== INDEXED WEBSITE FAQ ANSWER ===\n${faqAnswer}\n` : ""}

=== RESPONSE GUIDELINES ===
1. **EXACT TITLE QUERY**: If the user asks about a specific story title (e.g., "${exactMatch ? exactMatch.title : "The Weaver of Pochampally"}"):
   - Provide a rich, inspiring response introducing the story.
   - Mention the Title, Author, State/District, Reading Time, and Category.
   - Highlight why it is important (Historical Significance & Cultural Significance).
   - Inform the user to click the **READ STORY** card rendered below to open \`/stories/${exactMatch ? exactMatch.slug : "slug"}\`.

2. **CATEGORY / STATE / SEARCH QUERY**: If the user asks for a region (e.g., Rajasthan) or topic (e.g., Water, Education, Freedom Fighter):
   - Summarize the significance of that region or topic in Indian heritage.
   - Introduce the top matching stories provided in the RAG Context.
   - Tell them to browse the rich story cards right below.

3. **OUTSIDE / GENERAL KNOWLEDGE QUERY**: If the user asks about general topics (e.g., "What is Rajasthan?", "What is UNESCO?", "What is a stepwell / baori?", "What is Pochampally?"):
   - Answer with rich historical/cultural facts from your Gemini knowledge.
   - Seamlessly connect it with India Story Project repository: "We also have relevant stories about this on India Story Project. Check out the recommended stories below!"

4. **STORY WRITING & SUBMISSION ASSISTANT**: If the user wants to submit or draft a story:
   - Act like an encouraging writing mentor (like ChatGPT).
   - Never ask everything at once! Guide them step-by-step:
     * Step 1: Suggest a catchy Title & Subtitle.
     * Step 2: Ask for State/District & Location context.
     * Step 3: Help format the narrative body with structure (Intro, Conflict/Action, Impact).
     * Step 4: Remind them to add photos & references, and direct them to submit at \`/share-story\`.

5. Keep formatting clean with GitHub Markdown (headers \`###\`, bullet points, bold terms). Keep tone warm, respectful, and narrative-driven.
`;

          const apiKey = process.env.GEMINI_API_KEY || "";
          if (!apiKey) {
            return json(
              {
                error: "GEMINI_API_KEY is not configured",
                details: "Missing environment variable GEMINI_API_KEY",
              },
              { status: 500 }
            );
          }

          const modelsToTry = [
            "gemini-flash-latest",
            "gemini-flash-lite-latest",
            "gemini-2.0-flash",
          ];

          let replyText = "";
          let lastError: any = null;

          for (const model of modelsToTry) {
            try {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: systemPrompt }] }],
                }),
              });

              const data = await res.json();
              if (res.ok) {
                replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (replyText) break;
              } else {
                lastError = data.error || { message: res.statusText };
              }
            } catch (err: any) {
              lastError = { message: err.message || "Fetch failed" };
            }
          }

          if (!replyText && lastError) {
            return json(
              { error: lastError.message || "Failed to generate AI response" },
              { status: 500 }
            );
          }

          // Combine exactMatch payload with list of stories
          const finalStoriesPayload: FormattedStoryPayload[] = [];
          if (exactMatch) {
            finalStoriesPayload.push(exactMatch);
          }
          for (const s of stories) {
            if (!finalStoriesPayload.some((existing) => existing.id === s.id)) {
              finalStoriesPayload.push(s);
            }
          }

          // Smart Suggestions generation (Phase 14)
          const suggestions = isHindi
            ? [
                "राजस्थान की कहानियाँ",
                "कहानी कैसे प्रकाशित करें?",
                "लोक कला और संस्कृति",
                "प्रसिद्ध बावडियाँ (Stepwells)",
              ]
            : [
                "Stories from Rajasthan",
                "How to publish my story?",
                "Folk Art & Heritage",
                "Discover Stepwells of India",
              ];

          return json({
            reply: replyText,
            exactMatch,
            stories: finalStoriesPayload.slice(0, 4),
            suggestions,
          });
        } catch (error: any) {
          console.error("Chat API Error:", error);
          return json({ error: error.message || "Failed to process request" }, { status: 500 });
        }
      },
    },
  },
});
