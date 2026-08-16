// scripts/generate-location-images.ts
// Run with: npx tsx scripts/generate-location-images.ts
//
// Generates the 3 Contact section location photos.
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
    "Realistic photo, exterior of a modest Malaysian company headquarters building in a light industrial neighborhood, single-storey commercial shoplot with signage board, parked vehicles nearby, overcast tropical daylight, documentary architectural photography, realistic textures and lighting, no text",
  "location-processing-facility.png":
    "Realistic photo, industrial waste segregation and processing facility yard, stacked recyclable materials sorted by type, roll-off bins, corrugated metal warehouse structure, forklift in the background, overcast daylight, documentary industrial photography, realistic, no text",
  "location-purchasing-yard.png":
    "Realistic photo, open-air scrap and material purchasing yard, organized piles of metal scrap and recovered materials, weighing area, chain-link fencing, overcast tropical daylight, documentary industrial photography, realistic, no text",
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateAll() {
  const entries = Object.entries(prompts)
  console.log(`Generating ${entries.length} location images...\n`)

  let succeeded = 0
  let failed = 0

  for (const [filename, prompt] of entries) {
    try {
      const result = await model.generateContent(prompt)
      const parts = result.response.candidates?.[0]?.content?.parts ?? []
      const imagePart = parts.find((p: any) => p.inlineData)

      if (imagePart?.inlineData?.data) {
        const buffer = Buffer.from(imagePart.inlineData.data, "base64")
        fs.writeFileSync(path.join(outputDir, filename), buffer)
        console.log(`✓ Saved ${filename}`)
        succeeded++
      } else {
        console.warn(`✗ No image returned for ${filename} — likely safety filter or empty response.`)
        failed++
      }
    } catch (err: any) {
      console.error(`✗ Error generating ${filename}:`, err.message ?? err)
      failed++
    }
    await delay(1500)
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`)
}

generateAll()
