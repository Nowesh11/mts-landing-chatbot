"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Building2,
  ChevronDown,
  Factory,
  HardHat,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

type Sector = {
  name: string;
  image: string;
  icon: LucideIcon;
  description: string;
  tags: string[];
};

const SECTORS: Sector[] = [
  {
    name: "Industrial & Manufacturing",
    image: "/images/service-dismantling.png",
    icon: Factory,
    description:
      "Structured waste management, dismantling and resource recovery for industrial and manufacturing operations.",
    tags: ["Industrial waste", "EOL machinery", "Dismantling", "Resource recovery"],
  },
  {
    name: "Construction",
    image: "/images/service-construction.png",
    icon: HardHat,
    description:
      "End-to-end site waste management, from setup to final clearance, tailored to your project.",
    tags: ["Site waste", "RORO bins", "Segregation", "Recovery"],
  },
  {
    name: "Food & Hospitality",
    image: "/images/resource-food-waste.png",
    icon: UtensilsCrossed,
    description:
      "Structured food waste collection and recovery programmes that reduce landfill impact.",
    tags: ["Food waste", "Organic waste management", "Resource recovery"],
  },
  {
    name: "Commercial & Facilities",
    image: "/images/service-roro.png",
    icon: Building2,
    description:
      "Flexible waste segregation and RORO solutions built for commercial and facility environments.",
    tags: ["General waste", "Waste segregation", "RORO solutions", "Sustainability support"],
  },
];

const tagVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.1 + i * 0.05 },
  }),
};

function Badge({ index }: { index: number }) {
  return (
    <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-lime/40 bg-navy/70">
      <span className="font-mono text-xs tracking-[0.1em] text-offwhite/80">
        0{index + 1}
      </span>
    </div>
  );
}

function DesktopPanel({
  sector,
  index,
  isActive,
  onEnter,
}: {
  sector: Sector;
  index: number;
  isActive: boolean;
  onEnter: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const Icon = sector.icon;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, { stiffness: 150, damping: 20, mass: 0.5 });
  const rotateY = useSpring(rawY, { stiffness: 150, damping: 20, mass: 0.5 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isActive || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(py * -6);
    rawY.set(px * 6);
  };

  const resetTilt = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={panelRef}
      layout
      onMouseEnter={onEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      transition={{ type: "spring", stiffness: 220, damping: 30 }}
      style={{ perspective: 900 }}
      className={`group relative h-[540px] min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-lime/10 transition-colors duration-500 hover:border-lime/30 ${
        isActive ? "flex-[4]" : "flex-1"
      }`}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ scale: isActive ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={sector.image}
            alt={sector.name}
            fill
            sizes="(min-width: 1024px) 25vw, 100vw"
            className="object-cover transition-[filter] duration-700 ease-out"
            style={{ filter: isActive ? "brightness(1)" : "brightness(0.42)" }}
          />
        </motion.div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-navy/20"
        />

        <Badge index={index} />

        <div className="absolute left-5 top-5 z-10">
          <Icon size={22} strokeWidth={1.75} className="text-lime" />
        </div>

        {/* Collapsed: vertical label reading bottom-to-top along the edge */}
        <AnimatePresence>
          {!isActive && (
            <motion.div
              key="vertical"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center pb-6"
            >
              <span
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                className="whitespace-nowrap font-display text-lg font-semibold tracking-wide text-offwhite"
              >
                {sector.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded (hover): name, short description, tags — no button */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: isActive ? 0.15 : 0 }}
              className="absolute inset-x-0 bottom-0 z-10 p-6 lg:p-8"
            >
              <h3 className="font-display text-2xl font-semibold text-offwhite lg:text-3xl">
                {sector.name}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-offwhite/80">
                {sector.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {sector.tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    custom={i}
                    variants={tagVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-full border border-lime/20 px-3 py-1 text-xs font-medium text-offwhite/80"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function MobileAccordionItem({
  sector,
  index,
  isOpen,
  onToggle,
}: {
  sector: Sector;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = sector.icon;

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-2xl border border-lime/10 bg-offwhite/[0.02]"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime/30">
            <span className="font-mono text-xs tracking-[0.1em] text-slate">
              0{index + 1}
            </span>
          </span>
          <Icon size={20} strokeWidth={1.75} className="text-lime" />
          <span className="font-display text-base font-semibold text-offwhite">
            {sector.name}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative mx-5 mb-5 h-48 overflow-hidden rounded-xl">
              <Image
                src={sector.image}
                alt={sector.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            </div>
            <p className="px-5 pb-4 text-sm leading-relaxed text-offwhite/80">
              {sector.description}
            </p>
            <div className="flex flex-wrap gap-2 px-5 pb-5">
              {sector.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-lime/20 px-3 py-1 text-xs font-medium text-offwhite/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SectorSolutionsSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [openMobileIndex, setOpenMobileIndex] = useState<number | null>(0);

  return (
    <section
      id="sector-solutions"
      className="relative overflow-hidden bg-navy py-24 lg:py-32"
    >
      {/* Ambient background depth, consistent with ESG / Big Statement */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 h-[540px] w-[540px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full opacity-[0.09]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Faint blueprint grid texture, matching ESG / Big Statement */}
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
            Sector Solutions
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Solutions Designed Around Your Industry
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base leading-relaxed text-slate sm:text-lg"
          >
            Whatever your industry, we have a structured approach to
            managing your waste and resource needs.
          </motion.p>
        </div>

        {/* Desktop: expanding panel row */}
        <div
          onMouseLeave={() => setActiveIndex(null)}
          className="mt-16 hidden gap-3 lg:flex"
        >
          {SECTORS.map((sector, i) => (
            <DesktopPanel
              key={sector.name}
              sector={sector}
              index={i}
              isActive={activeIndex === i}
              onEnter={() => setActiveIndex(i)}
            />
          ))}
        </div>

        {/* Mobile / tablet: vertical accordion */}
        <div className="mt-16 flex flex-col gap-4 lg:hidden">
          {SECTORS.map((sector, i) => (
            <MobileAccordionItem
              key={sector.name}
              sector={sector}
              index={i}
              isOpen={openMobileIndex === i}
              onToggle={() =>
                setOpenMobileIndex(openMobileIndex === i ? null : i)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}