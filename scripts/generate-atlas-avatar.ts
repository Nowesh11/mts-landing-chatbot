// scripts/generate-atlas-avatar.ts
// Run with: npx tsx scripts/generate-atlas-avatar.ts
//
// Generates the Atlas chatbot avatar directly on brand navy (#0B1F3A) —
// no transparency needed, drops straight into a circular UI element.

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
  "A premium stylized digital sculpture of Atlas, the Greek Titan, rendered as a powerful bust and shoulders carved from dark navy stone or brushed dark metal, with glowing lime-green (#C6D92E) cracks and energy lines running through the material like veins of light, holding or bearing a luminous glowing lime-green sphere (representing the Earth/globe) above one shoulder, dramatic rim lighting emphasizing the figure's strength and form, mythological and iconic, circular centered composition, solid deep navy background color exactly #0B1F3A filling the entire square canvas edge to edge, premium sculptural digital art style similar to a high-end game or film title card, NOT a photorealistic human face, artistic and abstract rather than literal, no text"

async function generate() {
  try {
    const result = await model.generateContent(prompt)
    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData)

    if (imagePart?.inlineData?.data) {
      const buffer = Buffer.from(imagePart.inlineData.data, "base64")
      fs.writeFileSync(path.join(outputDir, "atlas-avatar.png"), buffer)
      console.log("✓ Saved atlas-avatar.png")
    } else {
      console.warn("✗ No image returned — try adjusting the prompt and re-running.")
    }
  } catch (err: any) {
    console.error("✗ Error generating avatar:", err.message ?? err)
  }
}

generate()