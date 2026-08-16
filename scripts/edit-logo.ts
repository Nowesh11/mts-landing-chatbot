

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

const logoPath = path.join(process.cwd(), "public", "images", "MTS LOGO.png")
const outputDir = path.join(process.cwd(), "public", "images")

const logoBuffer = fs.readFileSync(logoPath)
const logoBase64 = logoBuffer.toString("base64")

const edits: Record<string, string> = {
  "MTS_LOGO_transparent.png":
    "Remove the white background from this logo completely, making it fully transparent. Keep every other detail of the logo exactly as it is — same colors, same gradients, same shapes, same text. Only the background should change to transparent, nothing else.",
  "MTS_LOGO_white.png":
    "Recolor this entire logo to be solid pure white (#FFFFFF), including all text and the arrow graphic, removing all the original blue/green gradient coloring. Keep the exact same shapes, proportions, and layout — only the color changes to solid white. Make the background fully transparent.",
}

async function editLogo() {
  for (const [filename, prompt] of Object.entries(edits)) {
    try {
      const result = await model.generateContent([
        { inlineData: { mimeType: "image/png", data: logoBase64 } },
        { text: prompt },
      ])

      const parts = result.response.candidates?.[0]?.content?.parts ?? []
      const imagePart = parts.find((p: any) => p.inlineData)

      if (imagePart?.inlineData?.data) {
        const buffer = Buffer.from(imagePart.inlineData.data, "base64")
        fs.writeFileSync(path.join(outputDir, filename), buffer)
        console.log(`✓ Saved ${filename}`)
      } else {
        console.warn(`✗ No image returned for ${filename}`)
      }
    } catch (err: any) {
      console.error(`✗ Error editing for ${filename}:`, err.message ?? err)
    }
  }
}

editLogo()