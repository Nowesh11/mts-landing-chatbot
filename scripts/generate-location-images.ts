// scripts/generate-location-images.ts
// Run with: npx tsx scripts/generate-location-images.ts
//
// Generates the 3 Contact section location photos, WITH the "MT SMART"
// company name visible on signage in each shot.
//
// IMPORTANT CAVEAT: AI image models are unreliable at rendering legible
// text — letters can come out garbled, misspelled, or warped. This script
// generates MORE candidates for the HQ shot specifically (where the
// banner is most prominent/important) to improve your odds of getting a
// clean result, but you should expect to need a few tries and to
// hand-pick the best one. If text quality stays bad after several runs,
// the more reliable fallback is: generate the location WITHOUT text
// (previous version of this script), then composite your actual
// MTS_LOGO_white.png onto a blank signage board afterward in an image
// editor — that guarantees crisp, correct text since it's your real logo,
// not AI-rendered letters.

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

const QUALITY_SUFFIX =
  "Shot on a full-frame DSLR with a 35mm lens, natural depth of field, " +
  "eye-level three-quarter angle composition, soft overcast tropical " +
  "daylight (no harsh shadows), true-to-life color grading, sharp focus " +
  "with authentic environmental detail — weathering, dust, minor wear, " +
  "parked vehicles, realistic ground texture. Documentary commercial " +
  "real-estate photography style, professional but unstaged. " +
  "No watermarks, no people's faces in close-up, no cartoonish or " +
  "illustrated look, no oversaturated colors, no perfectly clean/sterile " +
  "appearance."

// Explicit, careful text-rendering instructions — being this specific
// (exact wording, exact placement, font style, high contrast, large
// clear letterforms) measurably improves legible-text success rate
// versus a vague "put the company name somewhere" instruction.
const TEXT_INSTRUCTION =
  "IMPORTANT: render the text \"MT SMART\" in bold, clean, sans-serif " +
  "uppercase letters, spelled EXACTLY as written, on a rectangular " +
  "signage board — white or light-colored background, dark navy blue " +
  "lettering, high contrast, large and clearly legible, centered on the " +
  "board, no other text or slogans on the same board."

const prompts: Record<string, { prompt: string; candidates: number }> = {
  "location-hq.png": {
    candidates: 4, // most important text shot — generate the most tries
    prompt:
      "A well-maintained single-storey commercial shoplot building serving as a company headquarters in a light-industrial Malaysian business park. Clean rendered concrete facade painted in muted navy and white tones, a rectangular signage board mounted above the entrance, sliding glass front doors, a small paved parking area in front with 2-3 parked cars and a company pickup truck, a covered walkway/awning along the front, roadside curb visible, neighboring similar shoplots partially visible at the edges of frame. " +
      TEXT_INSTRUCTION +
      " " +
      QUALITY_SUFFIX,
  },
  "location-processing-facility.png": {
    candidates: 3,
    prompt:
      "The yard of an industrial waste segregation and processing facility: a large corrugated steel warehouse structure with a high roll-up door, a small rectangular signage board mounted beside the main gate, in front of the warehouse an open concrete yard with waste materials neatly segregated into steel bins and stacked crates by material type (metal scrap, plastics, cardboard bales), a yellow forklift mid-scene actively moving a pallet, overhead structural lighting fixtures visible under the roof line, safety cones marking a work zone, chain-link perimeter fencing with a gate in the background. " +
      TEXT_INSTRUCTION +
      " " +
      QUALITY_SUFFIX,
  },
  "location-purchasing-yard.png": {
    candidates: 3,
    prompt:
      "An open-air scrap metal and recovered-material purchasing yard: organized waist-high piles of sorted metal scrap (rebar, pipe offcuts, sheet metal) arranged in distinct sections, a truck-scale weighbridge platform in the mid-ground with a small weighing station booth beside it displaying a rectangular signage board, a loader/crane grappling scrap in the background, chain-link fencing with corrugated metal gate, packed-earth and gravel ground surface with visible tire tracks, a stack of empty RORO bins along one fence line. " +
      TEXT_INSTRUCTION +
      " " +
      QUALITY_SUFFIX,
  },
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateOne(prompt: string): Promise<Buffer | null> {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.85,
    } as Record<string, unknown>,
  })
  const parts = result.response.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p: any) => p.inlineData)
  if (imagePart?.inlineData?.data) {
    return Buffer.from(imagePart.inlineData.data, "base64")
  }
  return null
}

async function generateAll() {
  const entries = Object.entries(prompts)
  const totalCandidates = entries.reduce((sum, [, v]) => sum + v.candidates, 0)
  console.log(`Generating ${entries.length} locations, ${totalCandidates} total candidate images...\n`)

  let succeeded = 0
  let failed = 0

  for (const [filename, { prompt, candidates }] of entries) {
    const base = filename.replace(/\.png$/, "")
    let anySuccess = false

    for (let candidate = 1; candidate <= candidates; candidate++) {
      try {
        const buffer = await generateOne(prompt)
        if (buffer) {
          const candidateFilename = `${base}-candidate${candidate}.png`
          fs.writeFileSync(path.join(outputDir, candidateFilename), buffer)
          console.log(`✓ Saved ${candidateFilename}`)
          anySuccess = true
        } else {
          console.warn(
            `✗ No image returned for ${filename} candidate ${candidate} — likely safety filter or empty response.`
          )
        }
      } catch (err: any) {
        console.error(
          `✗ Error generating ${filename} candidate ${candidate}:`,
          err.message ?? err
        )
      }
      await delay(1500)
    }

    if (anySuccess) succeeded++
    else failed++
  }

  console.log(`\nDone. ${succeeded} locations produced at least one candidate, ${failed} fully failed.`)
  console.log(
    "\nNext step — this is important with text-bearing images: open " +
    "public/images/ and check EACH candidate closely for the 'MT SMART' " +
    "text specifically — zoom in if needed. AI-rendered text can look " +
    "right at a glance but have a subtly wrong letter or warped edge. " +
    "Pick the cleanest one, rename it to the final filename (e.g. " +
    "location-hq-candidate1.png → location-hq.png), and delete the rest. " +
    "If NONE of the candidates for a location have clean, correct text " +
    "after this run, re-run just that location, or fall back to " +
    "generating the scene without text and compositing your real logo " +
    "onto the signage board afterward in an image editor."
  )
}

generateAll()