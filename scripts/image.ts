// scripts/generate-location-images.ts
// Run with: npx tsx scripts/generate-location-images.ts
//
// Generates 3 location-representative images for the Contact section.
// Same .env.local GEMINI_IMAGE_API_KEY as your other generation scripts.

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

const prompts: Record<string, string> = {
  "location-hq.png":
    "Realistic photo, exterior of a modest industrial company headquarters building in Malaysia, single-story office building with a small signage area, parked cars, clear daytime lighting, documentary architectural photography style, realistic, no visible text or logos on the building",
  "location-processing-facility.png":
    "Realistic photo, industrial waste segregation and processing facility exterior, large warehouse building with roller doors, sorted material bins visible near the entrance, overcast daylight, documentary photography style, realistic, no text",
  "location-purchasing-yard.png":
    "Realistic photo, wide shot of an outdoor material purchasing yard with stacked metal scrap and a forklift, open-air industrial yard setting, golden hour lighting, documentary industrial photography, realistic, no text",
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateAll() {
  for (const [filename, prompt] of Object.entries(prompts)) {
    try {
      const result = await model.generateContent(prompt)
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
      console.error(`✗ Error generating ${filename}:`, err.message ?? err)
    }
    await delay(1500)
  }
  console.log("\nDone.")
}

generateAll()