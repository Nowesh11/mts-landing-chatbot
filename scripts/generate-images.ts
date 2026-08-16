

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

// Every image from the project plan, keyed by the filename you'll reference in code.
const prompts: Record<string, string> = {
  // Hero (01)
  "hero.png":
    "Realistic photograph, wide industrial waste processing yard at golden hour, workers in high-visibility safety gear and hard hats in the mid-distance, sorted metal scrap and RORO bins visible, warm dusk lighting with long shadows, slight haze/atmosphere, shot on a 35mm lens, documentary photojournalism style, no text, no logos, realistic skin tones and materials, not illustrated, not 3D render",

  // Our Solutions (04) — 5 core services
  "service-industrial-waste.png":
    "Realistic photo, close-up of segregated industrial waste bins labeled plastic and metal, worker in orange hi-vis sorting materials, factory interior, natural window light, documentary style, realistic textures, no text overlays",
  "service-dismantling.png":
    "Realistic photo, worker in hard hat and safety goggles carefully dismantling industrial machinery with hand tools, factory floor, focused close-up on hands and machinery, natural work lighting, photojournalistic, realistic",
  "service-construction.png":
    "Realistic photo, aerial-ish angle of construction site with excavator loading debris into a green skip bin, safety cones, cranes in background, overcast daylight, realistic construction photography",
  "service-material-recovery.png":
    "Realistic photo, forklift moving stacked baled metal scrap in an industrial yard, golden-hour lighting, motion slightly implied, realistic industrial photography",
  "service-roro.png":
    "Realistic photo, row of large RORO waste bins in an industrial yard, clean and organized, overcast neutral daylight, wide angle, realistic",

  // Resource & Sustainability Solutions (04B)
  "resource-food-waste.png":
    "Realistic photo, commercial food waste collection bins being loaded for organic recovery, staff wearing gloves and hi-vis, clean organics handling facility, natural daylight, documentary style, realistic, no text",
  "resource-food-waste-detail.png":
    "Realistic photo, close-up of dark rich organic fertiliser/compost being handled by gloved hands, agricultural or facility setting, natural light, macro documentary photography, realistic, no text",
  "resource-energy-audit.png":
    "Realistic photo, engineer conducting an energy audit inside an industrial facility, holding a tablet and thermal imaging device, control panels and machinery in the background, focused technical documentary style, realistic lighting, no text",
  "resource-energy-audit-detail.png":
    "Realistic photo, close-up of an industrial control panel or energy monitoring dashboard display with gauges and readouts, engineer's hand adjusting a control, focused technical documentary style, realistic lighting, no text",

  // Project Experience (07) — carousel, 3 per category
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

  // Our Journey (08)
  "journey.png":
    "Realistic photo, wide shot of an industrial recycling yard with sorted metal stacks and a forklift in motion, golden hour lighting, sense of scale and history, documentary photography, realistic, no text",

  // Final CTA (09)
  "final-cta.png":
    "Realistic photo, industrial facility silhouette at blue hour dusk, quiet and calm mood, minimal detail, dark and moody for text overlay, realistic photography, no text",
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateAll() {
  const entries = Object.entries(prompts)
  console.log(`Generating ${entries.length} images...\n`)

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
        console.warn(`✗ No image returned for ${filename} — likely blocked by safety filters or an empty response. Prompt: "${prompt.slice(0, 60)}..."`)
        failed++
      }
    } catch (err: any) {
      console.error(`✗ Error generating ${filename}:`, err.message ?? err)
      failed++
    }

    // Small delay between calls to stay well under rate limits
    await delay(1500)
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`)
  if (failed > 0) {
    console.log("Re-run the script — it will overwrite existing files, so you can safely retry just by running it again. To retry only the failed ones, comment out the successful entries above first.")
  }
}

generateAll()