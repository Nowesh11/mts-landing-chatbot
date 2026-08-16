"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { RefreshCw, Recycle, ShieldCheck, Wind, type LucideIcon } from "lucide-react";
import { drawIconOnce } from "@/lib/scroll-draw";

type Tile = {
  icon: LucideIcon;
  label: string;
  description: string;
  featured?: boolean;
  tall?: boolean;
  spanClass: string;
  iconBoxClass: string;
  iconSize: number;
};

const TILES: Tile[] = [
  {
    icon: ShieldCheck,
    label: "ESG",
    description:
      "Responsible environmental practices, structured waste management and supporting documentation.",
    featured: true,
    spanClass: "sm:col-span-2 lg:col-span-2 lg:row-span-2",
    iconBoxClass: "h-20 w-20",
    iconSize: 50,
  },
  {
    icon: Recycle,
    label: "Zero Waste",
    description:
      "Maximising recovery and reducing unnecessary disposal through better segregation and resource utilisation.",
    tall: true,
    spanClass: "lg:row-span-2",
    iconBoxClass: "h-16 w-16",
    iconSize: 38,
  },
  {
    icon: Wind,
    label: "Lower Carbon Impact",
    description:
      "Supporting businesses in reducing landfill dependency, unnecessary waste movement and resource loss.",
    spanClass: "",
    iconBoxClass: "h-14 w-14",
    iconSize: 32,
  },
  {
    icon: RefreshCw,
    label: "Circular Economy",
    description:
      "Keeping recoverable materials in productive use through recovery, recycling and responsible resource management.",
    spanClass: "",
    iconBoxClass: "h-14 w-14",
    iconSize: 32,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function EsgTile({ tile, index }: { tile: Tile; index: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const Icon = tile.icon;

  useEffect(() => {
    if (!wrapperRef.current || !svgRef.current) return;
    const cleanup = drawIconOnce(svgRef.current, wrapperRef.current, {
      delay: 0.15,
    });
    return cleanup;
  }, []);

  return (
    <motion.div
      ref={wrapperRef}
      variants={tileVariants}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-lime/10 bg-offwhite/[0.02] p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-lime/30 ${
        tile.featured ? "justify-center gap-10 lg:p-10" : "justify-center gap-6 lg:p-8"
      } ${tile.spanClass}`}
    >
      {/* Per-tile hover glow — soft radial bloom, not a hard shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 15%, rgba(198, 217, 46, 0.14), transparent 70%)",
        }}
      />

      {/* Oversized watermark icon — fills the taller tiles' extra room intentionally */}
      {(tile.featured || tile.tall) && (
        <Icon
          aria-hidden
          size={tile.featured ? 280 : 190}
          strokeWidth={1}
          className={`pointer-events-none absolute text-lime ${
            tile.featured ? "-bottom-14 -right-14 opacity-[0.06]" : "-bottom-10 -right-10 opacity-[0.05]"
          }`}
        />
      )}

      <div className="relative flex items-start justify-between">
        <div
          className={`relative flex items-center justify-center ${tile.iconBoxClass}`}
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-50 blur-xl transition-opacity duration-500 ease-out group-hover:opacity-90"
            style={{
              background:
                "radial-gradient(circle, rgba(198, 217, 46, 0.4), transparent 70%)",
            }}
          />
          <Icon
            ref={svgRef}
            size={tile.iconSize}
            strokeWidth={1.75}
            className="relative text-lime"
          />
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime/30 transition-colors duration-500 ease-out group-hover:border-lime/70 group-hover:bg-lime/10">
          <span className="font-mono text-xs tracking-[0.1em] text-slate transition-colors duration-500 ease-out group-hover:text-lime">
            0{index + 1}
          </span>
        </div>
      </div>

      <div className="relative">
        <h3
          className={`font-display font-semibold text-offwhite ${
            tile.featured
              ? "text-5xl lg:text-6xl"
              : tile.tall
                ? "text-3xl"
                : "text-2xl"
          }`}
        >
          {tile.label}
        </h3>
        <p
          className={`mt-4 leading-relaxed text-slate ${
            tile.featured ? "max-w-md text-base sm:text-lg" : "text-sm"
          }`}
        >
          {tile.description}
        </p>
      </div>
    </motion.div>
  );
}

export function EsgSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const springX = useSpring(spotX, { stiffness: 200, damping: 30, mass: 0.4 });
  const springY = useSpring(spotY, { stiffness: 200, damping: 30, mass: 0.4 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
  };

  return (
    <section
      id="sustainability"
      className="relative overflow-hidden bg-forest py-24 lg:py-32"
    >
      {/* Ambient background depth, carried over from Big Statement */}
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

      {/* Faint blueprint grid texture, matching Big Statement */}
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
            Sustainability
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Building a More Sustainable Approach to Waste
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base leading-relaxed text-slate sm:text-lg"
          >
            Waste management is no longer only about collection and
            disposal. Businesses are increasingly expected to manage
            resources responsibly, reduce environmental impact and
            demonstrate measurable sustainability practices.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4 text-sm font-medium tracking-wide text-offwhite/80"
          >
            MT Smart Industries supports businesses through practical
            solutions aligned with:
          </motion.p>
        </div>

        <motion.div
          ref={gridRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-auto lg:gap-5"
          style={
            {
              "--spotlight-x": springX,
              "--spotlight-y": springY,
            } as unknown as CSSProperties
          }
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: active ? 1 : 0,
              background:
                "radial-gradient(560px circle at var(--spotlight-x) var(--spotlight-y), rgba(198, 217, 46, 0.12), transparent 60%)",
            }}
          />
          {TILES.map((tile, i) => (
            <EsgTile key={tile.label} tile={tile} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
