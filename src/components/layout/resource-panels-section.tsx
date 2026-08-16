"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Activity,
  Gauge,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Trash2,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ProcessFlow } from "@/components/ui/process-flow";

const FOOD_WASTE_REASONS: { icon: LucideIcon; label: string }[] = [
  { icon: Wind, label: "Reduce Carbon & GHG Impact" },
  { icon: Trash2, label: "Keep Food Waste Out of Landfill" },
  { icon: Sprout, label: "Turn Waste Into Fertiliser" },
  { icon: ShieldCheck, label: "Strengthen ESG Performance" },
  { icon: RefreshCw, label: "Recover Value From Your Waste Stream" },
];

const ENERGY_ASSESS: { icon: LucideIcon; label: string }[] = [
  { icon: Zap, label: "Energy Consumption" },
  { icon: Gauge, label: "Energy Efficiency" },
  { icon: Activity, label: "Energy Performance" },
  { icon: Leaf, label: "Carbon Reduction" },
];

const FOOD_WASTE_STAGES = [
  "Assessment",
  "Segregation",
  "Collection",
  "Processing",
  "Fertiliser",
  "Resource Recovery",
];

const ENERGY_STAGES = ["Assess", "Analyse", "Identify", "Improve", "Monitor"];

function IconList({ items }: { items: { icon: LucideIcon; label: string }[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(({ icon: Icon, label }, i) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
          className="flex items-center gap-3"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime/30 bg-lime/5">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full opacity-60 blur-md"
              style={{
                background:
                  "radial-gradient(circle, rgba(198, 217, 46, 0.45), transparent 70%)",
              }}
            />
            <Icon size={18} strokeWidth={1.75} className="relative text-lime" />
          </span>
          <span className="text-sm font-medium text-offwhite/90">{label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function PanelMedia({
  primary,
  detail,
  reverse,
}: {
  primary: string;
  detail: string;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-lime/10">
        <Image
          src={primary}
          alt=""
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div
        className={`absolute -bottom-8 hidden h-36 w-48 overflow-hidden rounded-xl border border-lime/25 sm:block ${
          reverse ? "-left-8" : "-right-8"
        }`}
        style={{
          boxShadow:
            "0 0 0 4px rgba(11, 31, 58, 0.9), 0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 0 32px rgba(198, 217, 46, 0.18)",
        }}
      >
        <Image src={detail} alt="" fill sizes="200px" className="object-cover" />
      </div>
    </motion.div>
  );
}

function FoodWastePanel() {
  return (
    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12">
      <PanelMedia
        primary="/images/resource-food-waste.png"
        detail="/images/resource-food-waste-detail.png"
      />

      <div>
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="font-display text-2xl font-medium leading-[1.2] tracking-tight text-offwhite sm:text-3xl lg:text-4xl"
        >
          From Food Waste to Fertiliser. From Waste Management to Carbon
          Reduction.
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-sm leading-relaxed text-slate sm:text-base"
        >
          Food waste is not just a disposal issue. When organic waste is sent
          to landfill, it decomposes under oxygen-free conditions and
          generates methane, a powerful greenhouse gas. Diverting food waste
          from landfill can therefore play an important role in reducing
          methane emissions and improving an organisation&apos;s
          environmental performance. At MT Smart Industries, we help
          organisations manage their food waste through a structured
          collection and recovery programme — transforming food waste into
          organic fertiliser instead of allowing valuable nutrients to end
          up in landfill.
        </motion.p>

        <div className="mt-8">
          <IconList items={FOOD_WASTE_REASONS} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 border-t border-lime/10 pt-8"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold text-lime sm:text-6xl">
              8–<AnimatedNumber target={10} />%
            </span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-slate">
            of global greenhouse gas emissions come from food loss and waste
          </p>
        </motion.div>

        <div className="mt-10">
          <ProcessFlow
            stages={FOOD_WASTE_STAGES}
            size="sm"
            gradientId="food-waste-flow-gradient"
          />
        </div>
      </div>
    </div>
  );
}

function EnergyPanel() {
  return (
    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12">
      <div className="lg:order-1">
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="font-display text-2xl font-medium leading-[1.2] tracking-tight text-offwhite sm:text-3xl lg:text-4xl"
        >
          Understand Your Energy. Improve Your Efficiency.
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-sm leading-relaxed text-slate sm:text-base"
        >
          Energy consumption is one of the biggest operational costs and
          sources of carbon emissions for many organisations. Our energy
          management and audit services help businesses identify where
          energy is being consumed, uncover inefficiencies, and develop
          practical opportunities to reduce energy use and environmental
          impact.
        </motion.p>

        <div className="mt-8">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-slate">
            What We Assess
          </p>
          <IconList items={ENERGY_ASSESS} />
        </div>

        <div className="mt-10">
          <ProcessFlow
            stages={ENERGY_STAGES}
            size="sm"
            gradientId="energy-flow-gradient"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-slate/70"
        >
          Energy Efficiency • Cost Reduction • Carbon Reduction • ESG
        </motion.p>
      </div>

      <div className="lg:order-2">
        <PanelMedia
          primary="/images/resource-energy-audit.png"
          detail="/images/resource-energy-audit-detail.png"
          reverse
        />
      </div>
    </div>
  );
}

export function ResourcePanelsSection() {
  return (
    <section
      id="resource-solutions"
      className="relative overflow-hidden bg-navy py-24 lg:py-32"
    >
      {/* Ambient background depth, consistent with ESG / Big Statement */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[540px] w-[540px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-[55%] h-[600px] w-[600px] rounded-full opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(130px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(110px)",
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
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center font-mono text-xs uppercase tracking-[0.2em] text-slate"
        >
          Waste → Resources. Food Waste → Fertiliser. Energy → Efficiency.
          Dismantling → Material Recovery.
        </motion.p>

        <div className="mt-20 flex flex-col gap-28 lg:gap-36">
          <FoodWastePanel />
          <EnergyPanel />
        </div>
      </div>
    </section>
  );
}
