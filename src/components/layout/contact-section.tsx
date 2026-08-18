"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  Globe,
  Check,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { CredentialBadges } from "@/components/ui/credential-badge";

type Location = {
  label: string;
  addressShort: string;
  address: string;
  image: string;
};

const LOCATIONS: Location[] = [
  {
    label: "Headquarters",
    addressShort: "Bukit Mertajam, Pulau Pinang",
    address:
      "37, Lrg Macang Indah 3, Tmn P'trian Macang Indah, 14000 Bukit Mertajam, Pulau Pinang",
    image: "/images/location-hq-candidate3.png",
  },
  {
    label: "Segregation & Processing Facility",
    addressShort: "Bukit Mertajam, Pulau Pinang",
    address:
      "H.S(M)663, PT Lot 1540, Mukim 16, 14000 Bukit Mertajam, Pulau Pinang",
    image: "/images/location-processing-facility-candidate3.png",
  },
  {
    label: "Material Purchasing Yard",
    addressShort: "Kulim, Kedah",
    address: "Lot 71, P.T, No 1718, Mukim, Taman Kemuning, 09000 Kulim, Kedah",
    image: "/images/location-purchasing-yard-candidate3.png",
  },
];

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// Scattered rotation/overlap only applies from `sm` up — defaults to false
// so the server-rendered markup matches the client's first paint, then
// updates once mounted (mirrors the SSR-safety pattern used elsewhere).
function useIsScattered() {
  const [isScattered, setIsScattered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = () => setIsScattered(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isScattered;
}

// Fixed per-tile resting rotation/offset — deliberately not randomized on
// every render, so the "scattered on a desk" composition stays stable
// between renders instead of jittering.
const REST = [
  { rotate: -3.5, translateY: 0 },
  { rotate: 2.5, translateY: 36 },
  { rotate: -2, translateY: -18 },
];

const TRUST_BADGES = [
  "Majlis Bandaraya Seberang Perai",
  "ISO 9001 Quality Management System",
  "CIDB G-5",
  "Kementerian Kewangan Malaysia",
];

type Contact = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const CONTACTS: Contact[] = [
  { icon: Phone, label: "Phone", value: "016-5417743" },
  { icon: Mail, label: "Email", value: "naveshsaravanan@mtsmart-industries.com" },
  { icon: Globe, label: "Website", value: "https://mt-smart.com" },
];

function GalleryTile({
  location,
  index,
  active,
  dimmed,
  scattered,
  onActivate,
  onDeactivate,
}: {
  location: Location;
  index: number;
  active: boolean;
  dimmed: boolean;
  scattered: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const rest = scattered ? REST[index] : { rotate: 0, translateY: 0 };

  // Plain CSS-transitioned inline transform — no JS animation loop (no
  // useSpring/rAF dependency), just a React-driven style string with a
  // `transition-transform` class doing the easing on the GPU.
  const rotate = active ? 0 : rest.rotate;
  const y = active ? rest.translateY - 6 : rest.translateY;
  const scale = active ? 1.05 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={scattered && index > 0 ? "sm:-ml-8" : ""}
    >
      <a
        href={mapsUrl(location.address)}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        style={{
          transform: `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
          zIndex: active ? 30 : 10 + index,
        }}
        className={`group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl transition-[transform,opacity] duration-500 ease-out ${
          dimmed ? "opacity-55" : "opacity-100"
        }`}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl transition-shadow duration-400 ${
            active
              ? "shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_0_2px_rgba(198,217,46,0.6),0_0_40px_rgba(198,217,46,0.25)]"
              : "shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(198,217,46,0.08)]"
          }`}
        >
          <Image
            src={location.image}
            alt={location.label}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 40vw, 90vw"
            className={`object-cover transition-[filter] duration-500 ${
              active ? "grayscale-0 brightness-100" : "grayscale-[0.35] brightness-75"
            }`}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/10 to-transparent"
          />

          <div
            className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-300 ${
              active ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
            }`}
          >
            <h3 className="font-display text-lg font-semibold text-offwhite">
              {location.label}
            </h3>
            <p className="mt-1 text-xs text-offwhite/70">{location.addressShort}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-lime">
              Get Directions
              <ArrowUpRight size={14} strokeWidth={2} />
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

function ContactChip({ contact }: { contact: Contact }) {
  const [copied, setCopied] = useState(false);
  const Icon = contact.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can fail silently (e.g. insecure context); no
      // recovery action needed since the value stays visible for manual copy.
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2.5 rounded-full border border-lime/30 px-5 py-2.5 text-sm text-offwhite transition-colors hover:border-lime hover:text-lime"
      >
        <Icon size={16} strokeWidth={1.75} className="text-lime" />
        {contact.value}
      </button>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-lime/40 bg-navy px-3 py-1 text-xs font-medium text-lime"
          >
            <Check size={12} strokeWidth={2.5} />
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const scattered = useIsScattered();

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-forest py-24 lg:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -left-32 h-[560px] w-[560px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-offwhite) 1px, transparent 1px), linear-gradient(to bottom, var(--color-offwhite) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            Contact
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Get In Touch
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base leading-relaxed text-slate sm:text-lg"
          >
            Reach out to discuss your waste and resource management needs.
          </motion.p>
        </div>

        <div
          className="mt-14 flex flex-col gap-10 pb-6 pt-4 sm:flex-row sm:items-center sm:gap-0 sm:pb-16 sm:pt-10 lg:px-10"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {LOCATIONS.map((location, i) => (
            <div key={location.label} className="w-full sm:w-1/3">
              <GalleryTile
                location={location}
                index={i}
                scattered={scattered}
                active={activeIndex === i}
                dimmed={activeIndex !== null && activeIndex !== i}
                onActivate={() => setActiveIndex(i)}
                onDeactivate={() => setActiveIndex(null)}
              />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-14 flex flex-wrap gap-4"
        >
          {CONTACTS.map((contact) => (
            <ContactChip key={contact.label} contact={contact} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-16 border-t border-lime/10 pt-10"
        >
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-slate uppercase">
            Licensed & Compliant
          </p>
          <CredentialBadges labels={TRUST_BADGES} />
        </motion.div>
      </div>
    </section>
  );
}
