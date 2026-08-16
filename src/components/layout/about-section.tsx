"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Leaf,
  ShieldCheck,
  Gauge,
  Recycle,
  type LucideIcon,
} from "lucide-react";
import { useDecodeText } from "@/hooks/use-decode-text";

function useReducedMotion() {
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}

/** Thin corner-bracket marks — a technical/HUD framing signature, not a full border box. */
function HudCorners() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -left-px h-5 w-5 border-l border-t border-lime/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -right-px h-5 w-5 border-r border-t border-lime/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -left-px h-5 w-5 border-b border-l border-lime/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -right-px h-5 w-5 border-b border-r border-lime/40"
      />
    </>
  );
}

function PullQuote({
  eyebrow,
  text,
  delay = 0,
}: {
  eyebrow: string;
  text: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();
  const decoded = useDecodeText(text, inView && !reducedMotion, 1300);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className="relative overflow-hidden rounded-sm border border-lime/10 bg-offwhite/[0.02] p-8 lg:p-10"
    >
      <HudCorners />

      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 left-3 select-none font-display text-[130px] leading-none text-lime/[0.07] lg:-top-8 lg:text-[170px]"
      >
        &ldquo;
      </span>

      <p className="relative mb-5 font-mono text-xs tracking-[0.25em] text-lime uppercase">
        {eyebrow}
      </p>
      <p className="relative font-mono text-base leading-relaxed text-offwhite/90 sm:text-lg lg:text-xl">
        {reducedMotion ? text : decoded}
      </p>
    </motion.div>
  );
}

type CoreValue = {
  icon: LucideIcon;
  label: string;
  description: string;
};

const CORE_VALUES: CoreValue[] = [
  {
    icon: Leaf,
    label: "Environmental Responsibility",
    description:
      "We are committed to responsible waste management and reducing environmental impact.",
  },
  {
    icon: ShieldCheck,
    label: "Integrity & Accountability",
    description:
      "We operate with transparency, professionalism, and strong ethical standards.",
  },
  {
    icon: Gauge,
    label: "Operational Excellence",
    description:
      "We deliver efficient, reliable, and structured solutions tailored to client needs.",
  },
  {
    icon: Recycle,
    label: "Sustainability Commitment",
    description:
      "We support circular economy practices and promote long-term sustainable operations.",
  },
];

// Points the curved path travels through, in the SVG's 1000x260 viewBox.
// Node positions are derived from the same points so the icons always sit
// exactly on the line, regardless of container size (percentage-mapped).
const CURVE_POINTS = [
  { x: 70, y: 190 },
  { x: 355, y: 55 },
  { x: 645, y: 205 },
  { x: 930, y: 70 },
];

const CURVE_PATH =
  "M70,190 C210,70 250,20 355,55 C470,90 510,175 645,205 C770,232 800,95 930,70";

const VIEW_W = 1000;
const VIEW_H = 260;

function CurveNode({
  value,
  index,
  active,
  onActivate,
  onDeactivate,
}: {
  value: CoreValue;
  index: number;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const Icon = value.icon;
  const point = CURVE_POINTS[index];
  const tooltipBelow = point.y < VIEW_H / 2;

  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: `${(point.x / VIEW_W) * 100}%`,
        top: `${(point.y / VIEW_H) * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.button
        type="button"
        onClick={() => (active ? onDeactivate() : onActivate())}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3 + index * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5,
        }}
        className="relative flex items-center justify-center focus:outline-none"
      >
        <motion.div
          animate={{ scale: active ? 1.15 : 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-lime/30 bg-navy lg:h-16 lg:w-16"
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-50 blur-xl transition-opacity duration-500"
            style={{
              opacity: active ? 0.9 : 0.4,
              background:
                "radial-gradient(circle, rgba(198, 217, 46, 0.4), transparent 70%)",
            }}
          />
          <Icon size={22} strokeWidth={1.75} className="relative text-lime" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: active ? 1 : 0,
            y: active ? 0 : tooltipBelow ? 8 : -8,
            scale: active ? 1 : 0.95,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-none absolute z-20 w-52 rounded-xl border border-lime/20 bg-surface p-4 text-left shadow-lg ${
            tooltipBelow ? "top-full mt-3" : "bottom-full mb-3"
          } left-1/2 -translate-x-1/2`}
        >
          <h4 className="font-display text-sm font-semibold text-offwhite">
            {value.label}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-slate">
            {value.description}
          </p>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

function CoreValuesCurve() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="mt-16">
      {/* Small / narrow mobile: simple vertical stack — safest layout at
          widths too narrow for a legible curved path. */}
      <div className="flex flex-col gap-4 sm:hidden">
        {CORE_VALUES.map((value, i) => {
          const Icon = value.icon;
          const active = activeIndex === i;
          return (
            <button
              key={value.label}
              type="button"
              onClick={() => setActiveIndex(active ? null : i)}
              className="rounded-sm border border-lime/10 bg-offwhite/[0.02] p-5 text-left transition-colors duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lime/30">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-50 blur-lg"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(198, 217, 46, 0.4), transparent 70%)",
                    }}
                  />
                  <Icon size={20} strokeWidth={1.75} className="relative text-lime" />
                </div>
                <h4 className="font-display text-sm font-semibold text-offwhite">
                  {value.label}
                </h4>
              </div>
              <motion.div
                initial={false}
                animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-xs leading-relaxed text-slate">
                  {value.description}
                </p>
              </motion.div>
            </button>
          );
        })}
      </div>

      {/* sm and up: curved scroll-reveal path — icons sit directly on an
          SVG line rather than a fixed radial footprint, so it lays out
          naturally in-document instead of relying on breakpoint-fragile
          absolute positioning. */}
      <div
        className="relative hidden w-full sm:block"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          fill="none"
        >
          <motion.path
            d={CURVE_PATH}
            stroke="var(--color-lime)"
            strokeWidth={2}
            strokeOpacity={0.35}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {CORE_VALUES.map((value, i) => (
          <CurveNode
            key={value.label}
            value={value}
            index={i}
            active={activeIndex === i}
            onActivate={() => setActiveIndex(i)}
            onDeactivate={() => setActiveIndex(null)}
          />
        ))}
      </div>
    </div>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-navy py-24 lg:py-32"
    >
      {/* Ambient background depth, consistent with ESG / Sector Solutions */}
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

      {/* Faint blueprint grid texture, matching ESG / Sector Solutions */}
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
        <div className="relative max-w-2xl overflow-hidden rounded-sm border border-lime/10 bg-offwhite/[0.015] p-6 sm:p-8">
          <HudCorners />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            About Us
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Delivering Sustainable Solutions Through Integrated Waste &
            Resource Management
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base leading-relaxed text-slate sm:text-lg"
          >
            MT Smart Industries Sdn Bhd provides practical, results-driven
            solutions in integrated waste and resource management for the
            industrial and construction sectors. Our approach focuses on
            transforming waste streams into recoverable value through
            efficient handling, dismantling, and recycling processes. Guided
            by Environmental, Social and Governance (ESG) principles, we
            support responsible waste management practices, regulatory
            compliance, and structured operational performance.
          </motion.p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PullQuote eyebrow="Vision" text="To be a leading one-stop provider of integrated waste and resource management solutions, enabling sustainable and efficient industrial operations across Malaysia." />
          <PullQuote
            eyebrow="Mission"
            text="To deliver efficient and reliable waste management, dismantling, and resource recovery solutions that support operational performance, regulatory compliance, and environmental sustainability for our clients."
            delay={0.1}
          />
        </div>

        <div className="mt-20 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            Core Values
          </motion.p>
        </div>

        <CoreValuesCurve />
      </div>
    </section>
  );
}
