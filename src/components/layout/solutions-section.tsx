"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Service = {
  title: string;
  description: string;
  image: string;
  featured?: boolean;
  spanClass: string;
  titleClass: string;
};

const SERVICES: Service[] = [
  {
    title: "Industrial Waste Management",
    description:
      "Structured management of industrial waste streams, including segregation, handling, recovery and ESG-related documentation.",
    image: "/images/waste.jpeg",
    featured: true,
    spanClass: "lg:col-span-2 lg:row-span-2",
    titleClass: "text-2xl lg:text-3xl",
  },
  {
    title: "Controlled Dismantling & Demolition",
    description:
      "Safe dismantling of industrial machinery, structures and end-of-life assets with consideration for site safety, operational continuity and material recovery.",
    image: "/images/service-industrial-waste.jpeg",
    spanClass: "lg:row-span-2",
    titleClass: "text-xl",
  },
  {
    title: "Construction Waste Management",
    description:
      "End-to-end site waste management covering collection, segregation, recovery, reporting and responsible disposal.",
    image: "/images/service-construction.png",
    spanClass: "",
    titleClass: "text-xl",
  },
  {
    title: "Material Recovery & Resource Management",
    description:
      "Recovery and purchasing of recyclable materials, including ferrous and non-ferrous metals and plastics, helping businesses redirect materials back into productive use.",
    image: "/images/service-material-recovery.png",
    spanClass: "",
    titleClass: "text-xl",
  },
  {
    title: "RORO Bin Solutions",
    description:
      "Flexible waste containment and collection solutions for industrial and construction environments.",
    image: "/images/service-roro.png",
    spanClass: "lg:col-span-4",
    titleClass: "text-xl",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const revealTransition = { type: "spring" as const, stiffness: 260, damping: 28 };

function ServiceTile({ service, index }: { service: Service; index: number }) {
  const [active, setActive] = useState(false);
  const state = active ? "hover" : "rest";

  return (
    <motion.div
      variants={tileVariants}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-lime/10 transition-colors duration-500 ease-out hover:border-lime/30 lg:aspect-auto lg:h-full ${service.spanClass}`}
    >
      {/* Image — the card itself, not a thumbnail */}
      <motion.div
        animate={state}
        initial="rest"
        variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
        transition={revealTransition}
        className="absolute inset-0"
      >
        <Image
          src={service.image}
          alt={service.title}
          fill
          priority={service.featured}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Persistent light scrim — keeps the title legible with no interaction */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent"
      />

      {/* Stronger scrim that blooms in on hover/tap to host the description */}
      <motion.div
        aria-hidden
        animate={state}
        initial="rest"
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-navy via-navy/75 to-transparent"
      />

      {/* Index badge — same circular lime-outline treatment as Big Statement / ESG */}
      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-lime/40 bg-navy/70 shadow-[0_0_0_1px_rgba(11,31,58,0.4)] transition-colors duration-500 ease-out group-hover:border-lime/80 group-hover:bg-lime/20">
        <span className="font-mono text-xs tracking-[0.1em] text-offwhite/80 transition-colors duration-500 ease-out group-hover:text-lime">
          0{index + 1}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
        <motion.h3
          animate={state}
          initial="rest"
          variants={{ rest: { y: 0 }, hover: { y: -4 } }}
          transition={revealTransition}
          className={`font-display font-semibold text-offwhite ${service.titleClass}`}
        >
          {service.title}
        </motion.h3>

        <motion.p
          animate={state}
          initial="rest"
          variants={{
            rest: { opacity: 0, y: 16 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={revealTransition}
          className="mt-2 max-w-md text-sm leading-relaxed text-offwhite/80"
        >
          {service.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

export function SolutionsSection() {
  return (
    <section
      id="solutions"
      className="relative overflow-hidden bg-navy py-24 lg:py-32"
    >
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
            What We Do
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Our Solutions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base leading-relaxed text-slate sm:text-lg"
          >
            Structured, end-to-end waste and resource management across
            every stage of your operation.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[280px_280px_200px] lg:gap-5"
        >
          {SERVICES.map((service, i) => (
            <ServiceTile key={service.title} service={service} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
