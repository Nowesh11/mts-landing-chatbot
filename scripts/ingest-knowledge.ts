// scripts/ingest-knowledge.ts
// Run with: npx tsx scripts/ingest-knowledge.ts
//
// Uses Pinecone's INTEGRATED EMBEDDING — plain text goes in, Pinecone embeds
// it internally using its own hosted model. No Gemini embedding call at all,
// which routes around the currently-broken Gemini embedContent endpoint.
//
// Requires: PINECONE_API_KEY and PINECONE_INDEX_NAME in .env.local
// (GEMINI_API_KEY is no longer needed for this script)

import { Pinecone } from "@pinecone-database/pinecone"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const pineconeKey = process.env.PINECONE_API_KEY
const indexName = process.env.PINECONE_INDEX_NAME

if (!pineconeKey || !indexName) {
  console.error("Missing PINECONE_API_KEY or PINECONE_INDEX_NAME in .env.local")
  process.exit(1)
}

const pinecone = new Pinecone({ apiKey: pineconeKey })
const index = pinecone.index(indexName)

// Each entry is one retrievable chunk. Field name confirmed from the
// Pinecone console's field map configuration: "text".
const knowledgeBase: { id: string; text: string }[] = [
  {
    id: "about-overview",
    text: "MT Smart Industries Sdn Bhd provides practical, results-driven solutions in integrated waste and resource management for the industrial and construction sectors. The company transforms waste streams into recoverable value through efficient handling, dismantling, and recycling processes, helping businesses operate more sustainably while improving cost efficiency and resource utilisation.",
  },
  {
    id: "about-vision-mission",
    text: "MT Smart Industries' vision is to be a leading one-stop provider of integrated waste and resource management solutions, enabling sustainable and efficient industrial operations across Malaysia. Their mission is to deliver efficient and reliable waste management, dismantling, and resource recovery solutions that support operational performance, regulatory compliance, and environmental sustainability for clients.",
  },
  {
    id: "core-values",
    text: "MT Smart Industries' core values are: Environmental Responsibility (commitment to responsible waste management and reducing environmental impact), Integrity & Accountability (operating with transparency, professionalism, and strong ethical standards), Operational Excellence (delivering efficient, reliable, and structured solutions tailored to client needs), and Sustainability Commitment (supporting circular economy practices and promoting long-term sustainable operations).",
  },
  {
    id: "service-industrial-waste",
    text: "Industrial Waste Management: MT Smart Industries provides structured management of industrial waste streams, including segregation, handling, recovery and ESG-related documentation. This includes consultation on waste segregation and handling practices, and ESG reporting and compliance support for regulatory requirements and internal sustainability tracking.",
  },
  {
    id: "service-dismantling",
    text: "Controlled Dismantling & Demolition: Safe dismantling of industrial machinery, structures and end-of-life assets, with consideration for site safety, operational continuity and material recovery. Includes end-of-life (EOL) asset management and safe execution in live operational environments with minimal disruption to ongoing operations.",
  },
  {
    id: "service-construction-waste",
    text: "Construction Waste Management: End-to-end site waste management covering collection, segregation, recovery, reporting and responsible disposal, from initial site setup to final clearance, with client-aligned strategies tailored to each project's requirements.",
  },
  {
    id: "service-material-recovery",
    text: "Material Recovery & Resource Management: MT Smart Industries purchases various recyclable materials including ferrous and non-ferrous metals and plastics, with high-volume purchasing capability and strong financial capacity for competitive pricing and prompt payments.",
  },
  {
    id: "service-roro-bins",
    text: "RORO Bin Solutions: Flexible waste containment and collection solutions for industrial and construction environments.",
  },
  {
    id: "service-food-waste",
    text: "Food Waste Management: MT Smart Industries helps organisations manage food waste through a structured collection and recovery programme, transforming food waste into organic fertiliser instead of landfill disposal. This reduces methane emissions (food loss and waste contributes an estimated 8-10% of global greenhouse gas emissions), keeps food waste out of landfill, strengthens ESG performance, and recovers value from the waste stream. The process follows: Assessment, Segregation, Collection, Processing, Fertiliser, Resource Recovery.",
  },
  {
    id: "service-energy-audit",
    text: "Energy Management & Audit: MT Smart Industries helps businesses identify where energy is being consumed, uncover inefficiencies, and develop practical opportunities to reduce energy use and environmental impact. Assessment areas include Energy Consumption, Energy Efficiency, Energy Performance, and Carbon Reduction. The process follows: Assess, Analyse, Identify, Improve, Monitor. The goal is genuine operational improvement, not just an audit report.",
  },
  {
    id: "sector-solutions",
    text: "MT Smart Industries serves multiple sectors: Industrial & Manufacturing (industrial waste, EOL machinery, dismantling, resource recovery), Construction (site waste, RORO bins, segregation, recovery), Food & Hospitality (food waste, organic waste management, resource recovery), and Commercial & Facilities (general waste, waste segregation, RORO solutions, sustainability support).",
  },
  {
    id: "why-mt-smart",
    text: "MT Smart Industries has over 20+ years of experience, operating since 2003. They maintain strong operational capability (RORO bins, transport, dismantling equipment and site resources) and financial capacity to support projects of varying scale. Their operations are aligned with ESG and circular economy principles.",
  },
  {
    id: "company-journey",
    text: "MT Smart Industries Sdn Bhd builds on the experience of MT Smart Trading, a licensed scrap and waste management business established in 2003. Over the years the company developed capabilities in scrap recovery, waste handling, and industrial operations across construction and industrial sectors, later expanding into industrial waste management, demolition and dismantling, and end-to-end site waste management. The company progressed towards ISO 9001 and CIDB G5 certification, reinforcing quality, compliance, and structured processes.",
  },
  {
    id: "certifications-compliance",
    text: "MT Smart Industries holds certifications and licenses including ISO 9001 (Quality Management System), CIDB G-5, a business license (Lesen Berniaga Barang-Barang Lusuh) from the Royal Malaysia Police, registration with Majlis Bandaraya Seberang Perai, and registration with Kementerian Kewangan Malaysia (Ministry of Finance Malaysia).",
  },
  {
    id: "contact-info",
    text: "MT Smart Industries Sdn Bhd contact information: Phone 016-5417743, Email naveshsaravanan@mtsmart-industries.com, Website www.mtsmart-industries.com. Headquarters: 37, Lrg Macang Indah 3, Tmn P'trian Macang Indah, 14000 Bukit Mertajam, Pulau Pinang. Segregation & Processing Facility: H.S(M)663, PT Lot 1540, Mukim 16, 14000 Bukit Mertajam, Pulau Pinang. Material Purchasing Yard: Lot 71, P.T, No 1718, Mukim, Taman Kemuning, 09000 Kulim, Kedah. For business enquiries and quotations, contact via phone, email, or WhatsApp.",
  },
]

async function ingest() {
  console.log(`Upserting ${knowledgeBase.length} records with Pinecone integrated embedding...\n`)

  const records = knowledgeBase.map((entry) => ({
    id: entry.id,
    text: entry.text, // Pinecone embeds this field automatically server-side
  }))

  try {
    // CORRECT format per Pinecone's official docs: wrapped in { records },
    // called through a namespace object, with the array passed as-is inside.
    const namespace = index.namespace("default")
    await namespace.upsertRecords({ records })
    console.log(`✓ Upserted ${records.length} records successfully.`)
  } catch (err: any) {
    console.error("✗ Error upserting records:", err.message ?? err)
  }

  console.log("\nDone.")
}

ingest()