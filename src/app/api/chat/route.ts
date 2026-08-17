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

const SYSTEM_PROMPT = `You are Atlas, the AI assistant for MT Smart Industries Sdn Bhd, an integrated waste and resource management company in Malaysia.

Answer ONLY using the retrieved context provided below. Speak knowledgeably and warmly about MT Smart Industries' services, as a genuine representative of the company. Never invent details, services, certifications, or facts that are not present in the retrieved context.

If the retrieved context does not actually address the user's question, say so clearly and suggest they contact the MT Smart Industries team directly using the phone/email from the context (if available), rather than guessing or making something up.

Tone: helpful, professional, warm, and concise.`;

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
        topK: 5,
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

Atlas's reply:`;

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
