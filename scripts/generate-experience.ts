// scripts/generate-experience-images.ts
// Run with: npx tsx scripts/generate-experience-images.ts
//
// Regenerates ONLY the 9 Project Experience images (3 categories x 3 shots).
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
  "experience-dismantling-1.png":
    "Realistic photo, worker in hard hat and safety harness carefully dismantling large industrial machinery inside a factory, exposed steel framework, work lights, dust particles visible in the air, documentary photojournalism style, realistic textures and lighting, no text",
  "experience-dismantling-2.png":
    "Realistic photo, close-up of hands using tools to disassemble industrial equipment components, factory setting, safety gloves, focused technical documentary shot, realistic, no text",
  "experience-dismantling-3.png":
    "Realistic photo, wide shot of a factory floor mid-dismantling with structural steel and machinery partially removed, natural light through high windows, documentary style, realistic, no text",
  "experience-construction-1.png":
    "Realistic photo, construction site with segregated green skip bins labeled by material type, excavator in background, workers in hi-vis coordinating material handling, overcast daylight, realistic construction documentary photography, no text",
  "experience-construction-2.png":
    "Realistic photo, close-up of a worker sorting construction debris into labeled bins, gloves and hi-vis vest, site background, natural daylight, documentary style, realistic, no text",
  "experience-construction-3.png":
    "Realistic photo, wide shot of an active construction site with cranes and stacked material bins, overcast sky, realistic construction photography, no text",
  "experience-factory-1.png":
    "Realistic photo, interior of a partially cleared industrial factory floor, exposed structural beams, scattered materials being organized, natural light through high windows, dusty atmospheric haze, documentary style, realistic, no text",
  "experience-factory-2.png":
    "Realistic photo, workers clearing debris and old equipment from a factory interior, natural light, hi-vis safety gear, documentary photojournalism style, realistic, no text",
  "experience-factory-3.png":
    "Realistic photo, wide shot of an emptied industrial warehouse space mid-clearance, sunlight streaming through high windows, dust in the air, documentary style, realistic, no text",
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateAll() {
  const entries = Object.entries(prompts)
  console.log(`Generating ${entries.length} Project Experience images...\n`)

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