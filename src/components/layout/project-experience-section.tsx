"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";

type Category = {
  name: string;
  description: string;
  images: string[];
};

const CATEGORIES: Category[] = [
  {
    name: "Industrial Machinery Controlled Dismantling",
    description:
      "Safe, structured dismantling of heavy machinery and industrial assets.",
    images: [
      "/images/experience-dismantling-1.png",
      "/images/experience-dismantling-2.png",
      "/images/experience-dismantling-3.png",
    ],
  },
  {
    name: "End-to-End Construction Waste Management",
    description:
      "Site waste collection, segregation and recovery from start to finish.",
    images: [
      "/images/experience-construction-1.png",
      "/images/experience-construction-2.png",
      "/images/experience-construction-3.png",
    ],
  },
  {
    name: "Factory Dismantling & Site Clearance",
    description:
      "Full-scale facility dismantling and site clearance, done responsibly.",
    images: [
      "/images/experience-factory-1.png",
      "/images/experience-factory-2.png",
      "/images/experience-factory-3.png",
    ],
  },
];

const AUTO_ADVANCE_MS = 5000;
const RING_RADIUS = 13;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ ringRef }: { ringRef: React.RefObject<SVGCircleElement | null> }) {
  return (
    <svg
      aria-hidden
      width={32}
      height={32}
      viewBox="0 0 32 32"
      className="pointer-events-none absolute -right-2 -top-2 z-10 -rotate-90"
    >
      <circle
        cx={16}
        cy={16}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(198, 217, 46, 0.2)"
        strokeWidth={2}
      />
      <circle
        ref={ringRef}
        cx={16}
        cy={16}
        r={RING_RADIUS}
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE}
        style={{ filter: "drop-shadow(0 0 3px rgba(198, 217, 46, 0.6))" }}
      />
    </svg>
  );
}

export function ProjectExperienceSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  const category = CATEGORIES[activeCategory];

  const goToImage = (index: number) => {
    setActiveImage(((index % category.images.length) + category.images.length) % category.images.length);
  };

  const selectCategory = (index: number) => {
    setActiveCategory(index);
    setActiveImage(0);
  };

  useEffect(() => {
    elapsedRef.current = 0;
    lastTickRef.current = null;
    let raf = 0;

    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!pausedRef.current) {
        elapsedRef.current += delta;
      }

      const ratio = Math.min(elapsedRef.current / AUTO_ADVANCE_MS, 1);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = `${
          RING_CIRCUMFERENCE * (1 - ratio)
        }`;
      }

      if (ratio >= 1) {
        goToImage(activeImage + 1);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeImage]);

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    pausedRef.current = false;
    if (info.offset.x < -40) {
      goToImage(activeImage + 1);
    } else if (info.offset.x > 40) {
      goToImage(activeImage - 1);
    }
  };

  return (
    <section
      id="project-experience"
      className="relative overflow-hidden bg-navy py-24 lg:py-32"
    >
      {/* Ambient background depth, consistent with earlier sections */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[540px] w-[540px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[540px] w-[540px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Faint blueprint grid texture */}
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
            Our Project Experience
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Proof in the Work Itself
          </motion.h2>
        </div>

        {/* Category tabs */}
        <div className="mt-14 flex flex-wrap gap-x-10 gap-y-6 border-b border-lime/10">
          {CATEGORIES.map((cat, i) => {
            const isActive = i === activeCategory;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => selectCategory(i)}
                className="relative flex max-w-xs flex-col gap-2 pb-4 text-left"
              >
                <span className="font-mono text-xs tracking-[0.1em] text-slate">
                  0{i + 1}
                </span>
                <span
                  className={`font-display text-base font-medium transition-colors duration-300 sm:text-lg ${
                    isActive ? "text-offwhite" : "text-slate hover:text-offwhite/70"
                  }`}
                >
                  {cat.name}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="project-experience-tab-underline"
                    className="absolute -bottom-px left-0 right-0 h-[2px] bg-lime"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main viewer */}
        <div
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          className="relative mt-10 h-[60vh] w-full overflow-hidden rounded-2xl border border-lime/10 lg:h-[70vh]"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={`${activeCategory}-${activeImage}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.02 }}
                animate={{ scale: 1.12 }}
                transition={{
                  duration: AUTO_ADVANCE_MS / 1000 + 3,
                  ease: "linear",
                }}
              >
                <Image
                  src={category.images[activeImage]}
                  alt={category.name}
                  fill
                  priority={activeCategory === 0 && activeImage === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent"
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption — deliberately static/slow relative to the zooming image behind it */}
          <motion.div
            key={`caption-${activeCategory}-${activeImage}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="absolute bottom-0 left-0 z-10 max-w-lg p-6 lg:p-10"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
              0{activeCategory + 1} · {activeImage + 1}/{category.images.length}
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-offwhite lg:text-3xl">
              {category.name}
            </h3>
            <p className="mt-2 text-sm text-offwhite/75 lg:text-base">
              {category.description}
            </p>
          </motion.div>
        </div>

        {/* Thumbnail rail */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          dragSnapToOrigin
          onDragStart={() => {
            pausedRef.current = true;
          }}
          onDragEnd={handleDragEnd}
          className="mt-6 flex cursor-grab gap-4 active:cursor-grabbing"
        >
          {category.images.map((src, i) => {
            const isActive = i === activeImage;
            return (
              <div
                key={src}
                onClick={() => goToImage(i)}
                className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border transition-colors duration-300 sm:h-24 sm:w-40"
                style={{
                  borderColor: isActive
                    ? "rgba(198, 217, 46, 0.8)"
                    : "rgba(198, 217, 46, 0.12)",
                  boxShadow: isActive
                    ? "0 0 18px rgba(198, 217, 46, 0.35)"
                    : "none",
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="160px"
                  className="pointer-events-none object-cover transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0.45 }}
                  draggable={false}
                />
                {isActive && <ProgressRing ringRef={ringRef} />}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
