/**
 * Atlas knowledge base ingestion — v2.
 *
 * Replaces the original 15 long paragraph-style chunks with ~120 short,
 * Q&A-style records. Each record is written as "Q: ... A: ..." so the
 * text embedding captures both how a user might phrase a question AND a
 * short, direct answer — this makes retrieval match natural user
 * questions well, and gives the generation step a short answer to work
 * from instead of a long paragraph it has to summarize on the fly.
 *
 * NOTE: short retrieved chunks alone don't guarantee short final replies —
 * your /api/chat/route.ts system prompt also needs to instruct Gemini to
 * answer briefly. This script only fixes the knowledge base half.
 *
 * Run with: npx tsx scripts/ingest-knowledge.ts
 * (or: npx ts-node scripts/ingest-knowledge.ts, matching whatever you used
 * for the original ingestion script)
 */

import { config as loadEnv } from "dotenv";
import path from "path";

// Standalone scripts run via tsx/node do NOT get Next.js's automatic
// .env.local loading — that only happens for the Next.js app itself.
// Load it explicitly here, pointed at the project root's .env.local.
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

import { Pinecone } from "@pinecone-database/pinecone";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "mtsmart-knowledge";

if (!PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY in environment");
}

const WHATSAPP_URL = "https://wa.me/60165417743";
const PHONE = "016-5417743";
const EMAIL = "naveshsaravanan@mtsmart-industries.com";
const WEBSITE = "www.mtsmart-industries.com";

type Category =
  | "about"
  | "vision-mission"
  | "core-values"
  | "value-to-business"
  | "service-industrial-waste"
  | "service-dismantling"
  | "service-material-recovery"
  | "service-construction"
  | "project-experience"
  | "compliance"
  | "journey"
  | "contact"
  | "general";

type Record = { id: string; text: string; category: Category };

let counter = 0;
function r(category: Category, question: string, answer: string): Record {
  counter += 1;
  return {
    id: `${category}-${counter}`,
    text: `Q: ${question}\nA: ${answer}`,
    category,
  };
}

const RECORDS: Record[] = [
  // ── About / Company Overview ──────────────────────────────────────
  r("about", "What does MT Smart Industries do?",
    "MT Smart Industries provides integrated waste and resource management solutions for industrial and construction sectors in Malaysia — turning waste into recoverable value through handling, dismantling, and recycling."),
  r("about", "Who is MT Smart Industries?",
    "MT Smart Industries Sdn Bhd is a Malaysian company delivering practical, results-driven waste and resource management solutions, backed by 20+ years of industry experience since 2003."),
  r("about", "What industries does MT Smart Industries serve?",
    "We primarily serve the industrial and construction sectors, helping businesses manage waste responsibly and recover value from their waste streams."),
  r("about", "What is MT Smart Industries' main focus?",
    "Transforming waste streams into recoverable value through efficient handling, dismantling, and recycling — helping businesses operate more sustainably while improving cost efficiency."),
  r("about", "Does MT Smart Industries follow ESG principles?",
    "Yes — we're guided by Environmental, Social and Governance (ESG) principles, supporting responsible waste management, regulatory compliance, and structured operational performance."),
  r("about", "What is circular economy at MT Smart Industries?",
    "We promote circular economy practices by redirecting recoverable materials back into the supply chain, reducing environmental impact and landfill dependency."),
  r("about", "How experienced is MT Smart Industries?",
    "Over 20+ years of industry experience, operating since 2003."),
  r("about", "Where is MT Smart Industries based?",
    "We're based in Bukit Mertajam, Pulau Pinang (Penang), Malaysia."),
  r("about", "What makes MT Smart Industries different?",
    "Structured, scalable solutions backed by 20+ years of experience, strong financial capacity, ESG alignment, and well-equipped operations — tailored to each client's needs."),

  // ── Vision & Mission ───────────────────────────────────────────────
  r("vision-mission", "What is MT Smart Industries' vision?",
    "To be a leading one-stop provider of integrated waste and resource management solutions, enabling sustainable and efficient industrial operations across Malaysia."),
  r("vision-mission", "What is MT Smart Industries' mission?",
    "To deliver efficient and reliable waste management, dismantling, and resource recovery solutions that support operational performance, regulatory compliance, and environmental sustainability for our clients."),
  r("vision-mission", "What are MT Smart Industries' goals?",
    "To become the leading one-stop provider for integrated waste and resource management in Malaysia, while helping clients stay compliant and sustainable."),

  // ── Core Values ────────────────────────────────────────────────────
  r("core-values", "What are MT Smart Industries' core values?",
    "Four core values: Environmental Responsibility, Integrity & Accountability, Operational Excellence, and Sustainability Commitment."),
  r("core-values", "What is MT Smart Industries' environmental responsibility?",
    "We're committed to responsible waste management and reducing environmental impact in everything we do."),
  r("core-values", "What is MT Smart Industries' approach to integrity?",
    "We operate with transparency, professionalism, and strong ethical standards."),
  r("core-values", "How does MT Smart Industries ensure operational excellence?",
    "We deliver efficient, reliable, and structured solutions tailored to each client's needs."),
  r("core-values", "What is MT Smart Industries' sustainability commitment?",
    "We support circular economy practices and promote long-term sustainable operations."),

  // ── Value to Business ──────────────────────────────────────────────
  r("value-to-business", "Why should I choose MT Smart Industries?",
    "Four reasons: 20+ years of proven experience, strong financial and operational capacity, an ESG and circular economy focus, and well-equipped operations for industrial work."),
  r("value-to-business", "How experienced is your team?",
    "Backed by over 20+ years of operational experience since 2003, bringing practical knowledge and reliability to every project."),
  r("value-to-business", "Can MT Smart Industries handle large projects?",
    "Yes — we maintain the financial and operational capacity to support projects of varying scale, ensuring consistent delivery and resource availability."),
  r("value-to-business", "What equipment does MT Smart Industries have?",
    "RORO bins, transport vehicles, dismantling tools, and site machinery — enabling efficient waste management, demolition, and recovery work."),
  r("value-to-business", "Is MT Smart Industries financially stable?",
    "Yes — we have strong financial and operational capacity, letting us support projects of varying scale reliably."),

  // ── Services: Industrial Waste Management ─────────────────────────
  r("service-industrial-waste", "What is Industrial Waste Management at MT Smart Industries?",
    "Structured industrial waste management services — helping businesses handle waste streams efficiently while maintaining operational performance and regulatory compliance."),
  r("service-industrial-waste", "Do you help with waste segregation?",
    "Yes — we advise clients on effective waste segregation and handling at source, improving recovery rates and reducing contamination."),
  r("service-industrial-waste", "Can you help with ESG reporting?",
    "Yes — we provide proper documentation and reporting to support ESG requirements, regulatory compliance, and sustainability tracking."),
  r("service-industrial-waste", "What does industrial waste consultation include?",
    "Advice on waste segregation and handling practices at source, plus identifying recoverable materials to support circular economy practices."),

  // ── Services: Controlled Dismantling & Demolition ─────────────────
  r("service-dismantling", "What is Controlled Dismantling & Demolition?",
    "Specialised dismantling and demolition services for industrial facilities, machinery, and plant environments, with minimal disruption to ongoing operations."),
  r("service-dismantling", "Can you dismantle machinery while a facility is still operating?",
    "Yes — we prioritise safety when working within active production sites, using controlled processes to minimise interference with ongoing operations."),
  r("service-dismantling", "Do you handle end-of-life equipment?",
    "Yes — we manage safe decommissioning of machinery and equipment at end-of-life, focusing on proper dismantling, material recovery, and responsible disposal."),
  r("service-dismantling", "Is dismantling safe with MT Smart Industries?",
    "Yes — safety is our priority, especially in live operational environments, with controlled processes and risk mitigation throughout."),

  // ── Services: Material Recovery ────────────────────────────────────
  r("service-material-recovery", "What materials does MT Smart Industries recover?",
    "A wide range of recyclable materials, including ferrous and non-ferrous metals and plastics."),
  r("service-material-recovery", "Do you buy scrap materials?",
    "Yes — we purchase various recyclable materials including ferrous and non-ferrous metals and plastics from industrial and construction sites."),
  r("service-material-recovery", "Can you handle large volumes of scrap?",
    "Yes — we're capable of handling large volumes from industrial and construction sites, with consistent demand and reliable off-take."),
  r("service-material-recovery", "Do you pay promptly for materials?",
    "Yes — backed by strong financial capacity, we offer competitive pricing and prompt payments for materials purchased."),
  r("service-material-recovery", "Is MT Smart Industries reliable for material purchasing?",
    "Yes — our strong financial capability means confident, stable transactions for your material disposal and recovery needs."),

  // ── Services: Construction Waste Management ───────────────────────
  r("service-construction", "What is Construction Waste Management at MT Smart Industries?",
    "End-to-end construction waste management, from initial site setup to final clearance, with seamless coordination throughout the project."),
  r("service-construction", "How is construction waste segregated?",
    "Waste is systematically sorted and managed at source, improving recovery rates, reducing contamination, and boosting site efficiency."),
  r("service-construction", "Are construction waste solutions customised?",
    "Yes — our approach is tailored to each project's requirements, aligning with client objectives, workflows, and site conditions."),
  r("service-construction", "Do you manage construction waste from start to finish?",
    "Yes — we provide comprehensive services from initial site setup through to final clearance."),

  // ── Project Experience ─────────────────────────────────────────────
  r("project-experience", "What kind of projects has MT Smart Industries done?",
    "Industrial machinery controlled dismantling, end-to-end construction waste management, and factory dismantling & site clearance."),
  r("project-experience", "Do you have experience with factory dismantling?",
    "Yes — factory dismantling and site clearance is one of our core project experience areas."),
  r("project-experience", "Have you dismantled industrial machinery before?",
    "Yes — controlled dismantling of industrial machinery is one of our specialised project areas."),

  // ── Compliance & Licensing ──────────────────────────────────────────
  r("compliance", "Is MT Smart Industries certified?",
    "Yes — we hold ISO 9001 (Quality Management System) and CIDB G-5 certification."),
  r("compliance", "Is MT Smart Industries licensed?",
    "Yes — licensed by Majlis Bandaraya Seberang Perai (Lesen Berniaga Barang-Barang Lusuh) and registered with Kementerian Kewangan Malaysia."),
  r("compliance", "What is CIDB G5?",
    "CIDB G5 is a construction industry certification we hold, reinforcing our commitment to quality, compliance, and structured processes."),
  r("compliance", "Does MT Smart Industries have ISO 9001?",
    "Yes — we hold ISO 9001 Quality Management System certification."),
  r("compliance", "Who regulates MT Smart Industries?",
    "We're licensed under Majlis Bandaraya Seberang Perai and registered with Kementerian Kewangan Malaysia, alongside our ISO 9001 and CIDB G5 certifications."),

  // ── Journey / History ────────────────────────────────────────────────
  r("journey", "When was MT Smart Industries founded?",
    "Our roots go back to 2003, when MT Smart Trading was established as a licensed scrap and waste management business."),
  r("journey", "What is the history of MT Smart Industries?",
    "MT Smart Industries builds on MT Smart Trading (founded 2003) — expanding over the years from scrap recovery into industrial waste management, dismantling, and end-to-end site waste solutions."),
  r("journey", "How did MT Smart Industries grow?",
    "We developed strong capabilities in scrap recovery, waste handling, and industrial operations, then expanded into industrial waste management, demolition, dismantling, and full site waste solutions as demand grew."),
  r("journey", "What certifications did MT Smart Industries work towards?",
    "ISO 9001 and CIDB G5 — reinforcing our commitment to quality, compliance, and structured processes as we grew."),
  r("journey", "What is MT Smart Industries' focus today?",
    "Supporting businesses in operational efficiency, responsible waste handling, and the advance toward sustainable, zero-waste operations."),

  // ── Contact ──────────────────────────────────────────────────────────
  r("contact", "How can I contact MT Smart Industries?",
    `You can reach us by phone at ${PHONE}, email at ${EMAIL}, or WhatsApp at ${WHATSAPP_URL}.`),
  r("contact", "What is MT Smart Industries' WhatsApp number?",
    `You can WhatsApp us directly here: ${WHATSAPP_URL} (${PHONE}).`),
  r("contact", "Can I WhatsApp MT Smart Industries?",
    `Yes! Chat with us on WhatsApp: ${WHATSAPP_URL}`),
  r("contact", "What is MT Smart Industries' phone number?",
    `${PHONE}`),
  r("contact", "What is MT Smart Industries' email address?",
    `${EMAIL}`),
  r("contact", "What is MT Smart Industries' website?",
    `${WEBSITE}`),
  r("contact", "Where is MT Smart Industries' headquarters?",
    "37, Lrg Macang Indah 3, Tmn P'trian Macang Indah, 14000 Bukit Mertajam, Pulau Pinang."),
  r("contact", "Where is your segregation and processing facility?",
    "H.S(M)663, PT Lot 1540, Mukim 16, 14000 Bukit Mertajam, Pulau Pinang."),
  r("contact", "Where is your material purchasing yard?",
    "Lot 71, P.T, No 1718, Mukim, Taman Kemuning, 09000 Kulim, Kedah."),
  r("contact", "How do I get a quotation?",
    `For business enquiries and quotations, WhatsApp us at ${WHATSAPP_URL} or email ${EMAIL}.`),
  r("contact", "I want to enquire about your services, how do I reach you?",
    `The fastest way is WhatsApp: ${WHATSAPP_URL}. You can also call ${PHONE} or email ${EMAIL}.`),

  // ── General / conversational ────────────────────────────────────────
  r("general", "What can you help me with?",
    "I can answer questions about MT Smart Industries' services, company background, certifications, and how to get in touch — just ask!"),
  r("general", "Who are you?",
    "I'm Atlas, MT Smart Industries' assistant — happy to help with questions about our waste and resource management services."),
  r("general", "What solutions do you offer?",
    "Four main solutions: Industrial Waste Management, Controlled Dismantling & Demolition, Material Recovery, and Construction Waste Management. Want details on any of these?"),
  r("general", "Do you offer free consultations?",
    `Reach out via WhatsApp (${WHATSAPP_URL}) or email (${EMAIL}) to discuss your needs and get a quotation.`),

  // ── Additional short-answer variations (broader phrasing coverage) ──
  r("about", "Is MT Smart Industries a Malaysian company?",
    "Yes — MT Smart Industries Sdn Bhd is based in Bukit Mertajam, Pulau Pinang, Malaysia."),
  r("about", "What sectors do you specialise in?",
    "Industrial and construction sectors."),
  r("about", "Do you help with cost efficiency?",
    "Yes — recovering value from waste helps businesses operate more sustainably while improving cost efficiency."),
  r("about", "Does MT Smart Industries support regulatory compliance?",
    "Yes — we support responsible waste management, regulatory compliance, and structured operational performance."),
  r("about", "What does resource recovery mean at MT Smart Industries?",
    "Identifying recoverable materials in waste streams and redirecting them into recycling channels instead of landfill."),

  r("vision-mission", "What kind of company do you want to become?",
    "The leading one-stop provider of integrated waste and resource management solutions across Malaysia."),
  r("vision-mission", "Does your mission include sustainability?",
    "Yes — environmental sustainability is a core part of our mission, alongside operational performance and regulatory compliance."),

  r("core-values", "Does MT Smart Industries care about the environment?",
    "Yes — environmental responsibility is one of our four core values."),
  r("core-values", "Is MT Smart Industries transparent in its dealings?",
    "Yes — integrity, transparency, and professionalism are core to how we operate."),
  r("core-values", "How do you ensure reliable service?",
    "Through operational excellence — delivering efficient, reliable, structured solutions tailored to each client."),

  r("value-to-business", "How long has MT Smart Industries been operating?",
    "Since 2003 — over 20+ years of operational experience."),
  r("value-to-business", "Do you have RORO bins?",
    "Yes — RORO bins are part of our equipment fleet, along with transport vehicles, dismantling tools, and site machinery."),
  r("value-to-business", "Can you support both small and large projects?",
    "Yes — our financial and operational capacity supports projects of varying scale."),
  r("value-to-business", "Is your team well equipped?",
    "Yes — we operate a range of essential equipment including RORO bins, transport vehicles, dismantling tools, and site machinery."),

  r("service-industrial-waste", "Do you handle waste at the source?",
    "Yes — we advise on segregation and handling practices right at the source, before waste even leaves the site."),
  r("service-industrial-waste", "Can you help my business become more sustainable?",
    "Yes — through waste segregation advice, ESG reporting support, and structured industrial waste management."),
  r("service-industrial-waste", "What is included in ESG reporting support?",
    "Proper documentation and reporting to support ESG requirements, regulatory compliance, and sustainability tracking."),

  r("service-dismantling", "What kind of facilities do you dismantle?",
    "Industrial facilities, machinery, and plant environments."),
  r("service-dismantling", "Do you dismantle machinery at end of life?",
    "Yes — we handle safe decommissioning and dismantling of machinery and equipment at end-of-life."),
  r("service-dismantling", "How do you minimise disruption during dismantling?",
    "Through controlled processes and careful planning, especially within active, live operational environments."),

  r("service-material-recovery", "Do you buy ferrous metals?",
    "Yes — we purchase both ferrous and non-ferrous metals, along with plastics."),
  r("service-material-recovery", "Do you buy plastics?",
    "Yes — plastics are among the recyclable materials we purchase."),
  r("service-material-recovery", "Can you collect from construction sites?",
    "Yes — we handle large volumes of materials from both industrial and construction sites."),
  r("service-material-recovery", "How fast do you pay for materials?",
    "We offer prompt payments, backed by strong financial capability."),

  r("service-construction", "Do you handle site clearance?",
    "Yes — from initial site setup to final clearance, we manage the full construction waste lifecycle."),
  r("service-construction", "Is your construction waste service coordinated with the client?",
    "Yes — our approach is tailored to each project's requirements and aligned with client workflows."),

  r("project-experience", "Can you show examples of your work?",
    "Our project experience includes industrial machinery controlled dismantling, end-to-end construction waste management, and factory dismantling & site clearance."),

  r("compliance", "Are you registered with the Ministry of Finance Malaysia?",
    "Yes — we're registered with Kementerian Kewangan Malaysia."),
  r("compliance", "Do you have a business license?",
    "Yes — licensed under Majlis Bandaraya Seberang Perai for handling recyclable/scrap materials."),

  r("journey", "What was MT Smart Trading?",
    "The licensed scrap and waste management business (established 2003) that MT Smart Industries builds on."),
  r("journey", "How did your services expand over time?",
    "From scrap recovery and waste handling into industrial waste management, demolition, dismantling, and end-to-end site waste solutions."),

  r("contact", "Is there a phone number I can call?",
    `Yes — ${PHONE}.`),
  r("contact", "How do I email MT Smart Industries?",
    `Email us at ${EMAIL}.`),
  r("contact", "What's the fastest way to reach MT Smart Industries?",
    `WhatsApp is fastest: ${WHATSAPP_URL}`),
  r("contact", "Can I visit your office?",
    "Our headquarters is at 37, Lrg Macang Indah 3, Tmn P'trian Macang Indah, 14000 Bukit Mertajam, Pulau Pinang."),
  r("contact", "Do you have a location in Kedah?",
    "Yes — our Material Purchasing Yard is in Kulim, Kedah (Lot 71, P.T, No 1718, Mukim, Taman Kemuning, 09000 Kulim)."),
  r("contact", "I want to sell scrap materials, who do I contact?",
    `WhatsApp us at ${WHATSAPP_URL} — we purchase ferrous, non-ferrous metals, and plastics.`),
  r("contact", "I need a quotation for construction waste management",
    `WhatsApp ${WHATSAPP_URL} or email ${EMAIL} with your project details for a quotation.`),

  r("general", "Can you tell me about your dismantling services?",
    "We offer Controlled Dismantling & Demolition — safe, structured dismantling of industrial machinery and facilities, even in live operational environments."),
  r("general", "Can you tell me about your construction services?",
    "We offer end-to-end Construction Waste Management, from site setup to final clearance."),
  r("general", "Can you tell me about material recovery?",
    "We purchase recyclable materials like ferrous/non-ferrous metals and plastics, with reliable, prompt payment."),
  r("general", "How do I get started working with MT Smart Industries?",
    `Reach out on WhatsApp (${WHATSAPP_URL}) with your requirements, and we'll take it from there.`),
];

async function main() {
  console.log(`Prepared ${RECORDS.length} records.`);

  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX_NAME);

  // Matches the original ingestion pattern: integrated embedding, field
  // "text", records upserted to the "default" namespace.
  const CHUNK_SIZE = 90; // stay safely under Pinecone's per-request limits
  for (let i = 0; i < RECORDS.length; i += CHUNK_SIZE) {
    const chunk = RECORDS.slice(i, i + CHUNK_SIZE).map((rec) => ({
      _id: rec.id,
      text: rec.text,
      category: rec.category,
    }));
    await index.namespace("default").upsertRecords({ records: chunk });
    console.log(`✓ Upserted records ${i + 1}–${i + chunk.length}`);
  }

  console.log(`✓ Done — ${RECORDS.length} records upserted successfully.`);
  console.log(
    "NOTE: this REPLACES retrieval results going forward, but does not delete the old 15 chunks automatically. If you want ONLY these new short records, delete the old ones in the Pinecone console or via index.namespace('default').deleteAll() before running this script."
  );
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});