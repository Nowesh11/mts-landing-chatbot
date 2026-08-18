// scripts/generate-harry-avatar.ts
// Run with: npx tsx scripts/generate-harry-avatar.ts
//
// Generates Harry's avatar — a stylized African Congo Grey Parrot —
// directly on brand navy (#0B1F3A) so it drops straight into a circular
// UI element with no transparency handling needed.

import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({ path: ".env.local" })

const apiKey = process.env.GEMINI_IMAGE_API_KEY
if (!apiKey) {
  console.error("Missing GEMINI_IMAGE_API_KEY in .env.local — stopping.")
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image" })

const outputDir = path.join(process.cwd(), "public", "images")
fs.mkdirSync(outputDir, { recursive: true })

const prompt =
  "A premium stylized digital portrait of Harry, an African Congo Grey " +
  "Parrot mascot character — accurate species coloring: soft pale grey " +
  "feathers covering the body and head, a distinctive vivid scarlet red " +
  "tail, pale grey-white facial mask around the eyes, dark charcoal " +
  "curved beak, expressive intelligent amber-orange eyes looking directly " +
  "at the viewer. Rendered as a close-up head-and-shoulders bust portrait, " +
  "centered and facing forward, with a premium illustrated/digital-art " +
  "style (clean linework, soft directional lighting, subtle feather " +
  "texture detail) rather than flat cartoon or photorealistic. A subtle " +
  "glowing lime-green (#C6D92E) rim light traces the edge of the head and " +
  "feathers for brand-accent contrast against the dark background. Solid " +
  "deep navy background color exactly #0B1F3A filling the entire square " +
  "canvas edge to edge, no gradient, no scenery. Friendly, warm, " +
  "intelligent expression suitable for a helpful chatbot mascot. No text, " +
  "no logos, no watermarks."

async function generate() {
  try {
    const result = await model.generateContent(prompt)
    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData)

    if (imagePart?.inlineData?.data) {
      const buffer = Buffer.from(imagePart.inlineData.data, "base64")
      fs.writeFileSync(path.join(outputDir, "harry-avatar.png"), buffer)
      console.log("✓ Saved harry-avatar.png")
    } else {
      console.warn("✗ No image returned — try adjusting the prompt and re-running.")
    }
  } catch (err: any) {
    console.error("✗ Error generating avatar:", err.message ?? err)
  }
}

generate()