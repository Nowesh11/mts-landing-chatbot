import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
// GEMINI_API_KEY is invalid for this account (401 on every call, confirmed via
// direct testing) — GEMINI_IMAGE_API_KEY is the only key that authenticates
// against the Generative Language API, so it's used here despite the name.
const geminiApiKey = process.env.GEMINI_IMAGE_API_KEY;

const pinecone = pineconeApiKey ? new Pinecone({ apiKey: pineconeApiKey }) : null;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const WHATSAPP_URL = "https://wa.me/60165417743";
const PHONE = "016-5417743";
const EMAIL = "naveshsaravanan@mtsmart-industries.com";

// Very small in-memory rate limiter, per server instance.
const rateLimitHits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (rateLimitHits.get(key) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  hits.push(now);
  rateLimitHits.set(key, hits);
  return hits.length > RATE_LIMIT_MAX_REQUESTS;
}

// Rewritten to explicitly enforce SHORT, friendly, chat-style replies.
// The knowledge base itself was rebuilt into ~110 short Q&A-style records
// (see scripts/ingest-knowledge.ts) so retrieval now returns short source
// material — but that alone doesn't control reply LENGTH. This prompt is
// what actually keeps Gemini's generated response short; without explicit
// length/format instructions here, it tends to elaborate well past
// whatever length the retrieved context happened to be.
const SYSTEM_PROMPT = `You are Atlas, the friendly AI assistant for MT Smart Industries Sdn Bhd, an integrated waste and resource management company in Malaysia.

REPLY STYLE — follow these rules on every response, no exceptions:
- Keep replies SHORT: 1–3 sentences for most questions. Never write long paragraphs.
- Sound like a friendly, helpful chat message — not a brochure or formal report.
- If listing multiple services or points, use a short comma-separated list or a few short lines, not detailed multi-sentence descriptions of each one. Offer to go deeper only if asked ("Want details on any of these?").
- Do not repeat the question back before answering. Just answer.
- Answer ONLY using the retrieved context provided below. Never invent details, services, certifications, or facts that are not present in the retrieved context.
- If the retrieved context doesn't address the question, say so briefly and point them to WhatsApp/contact — don't guess.

CONTACT — always available regardless of retrieved context:
- WhatsApp: ${WHATSAPP_URL}
- Phone: ${PHONE}
- Email: ${EMAIL}
Whenever the user asks how to contact the company, get a quote, get in touch, or anything similar, ALWAYS include the WhatsApp link (${WHATSAPP_URL}) in your reply — this is true even if it doesn't appear verbatim in the retrieved context below, since it's the company's primary contact channel.

Tone: warm, professional, concise — like a real, knowledgeable team member replying quickly in chat.`;

export async function POST(request: Request) {
  if (!pinecone || !pineconeIndexName) {
    return NextResponse.json(
      { error: "Chat service is not configured (Pinecone)." },
      { status: 500 }
    );
  }
  if (!genAI) {
    return NextResponse.json(
      { error: "Chat service is not configured (Gemini)." },
      { status: 500 }
    );
  }

  const clientKey =
    request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? "anonymous";
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429 }
    );
  }

  let messages: ChatMessage[] = [];

  try {
    const body = await request.json();
    if (Array.isArray(body?.messages)) {
      messages = body.messages;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUserMessage?.content?.trim();

  if (!query) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }
  if (query.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Message is too long." },
      { status: 400 }
    );
  }

  const history = messages.slice(-MAX_HISTORY_MESSAGES);

  try {
    const namespace = pinecone.index(pineconeIndexName).namespace("default");
    const searchResponse = await namespace.searchRecords({
      query: {
        // Slightly increased from 5 — the knowledge base is now ~110
        // short Q&A records instead of 15 long chunks, so a few more
        // short hits still stays well within a reasonable context size
        // while giving broader coverage for multi-part questions (e.g.
        // "what services do you offer and how do I contact you").
        topK: 7,
        inputs: { text: query },
      },
    });

    const retrievedContext = searchResponse.result.hits
      .map((hit) => (hit.fields as { text?: string }).text)
      .filter((text): text is string => Boolean(text))
      .join("\n\n---\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const historyText = history
      .slice(0, -1)
      .map((m) => `${m.role === "user" ? "User" : "Atlas"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}

Retrieved context:
${retrievedContext || "(No relevant context was found for this question.)"}

${historyText ? `Conversation history:\n${historyText}\n` : ""}
User's latest message: ${query}

Atlas's reply (remember: SHORT, 1-3 sentences, friendly):`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Something went wrong while generating a response. Please try again." },
      { status: 502 }
    );
  }
}