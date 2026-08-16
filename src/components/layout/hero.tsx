"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ChevronDown } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

gsap.registerPlugin(SplitText);

const HEADLINE = "Smarter Waste Management. Better Resource Utilisation.";

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!headlineRef.current) return;

    if (prefersReducedMotion) {
      gsap.set(headlineRef.current, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const split = new SplitText(headlineRef.current, { type: "words" });

      gsap.set(headlineRef.current, { opacity: 1 });
      gsap.from(split.words, {
        yPercent: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.06,
        ease: "power4.out",
        delay: 0.3,
      });

      return () => split.revert();
    }, headlineRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-navy"
    >
      <div className="absolute inset-0">
        <div className="hero-kenburns absolute inset-0">
          <Image
            src="/images/hero.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 lg:px-10">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            Integrated Waste &amp; Resource Management
          </motion.p>

          <h1
            ref={headlineRef}
            style={{ opacity: 0 }}
            className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-offwhite sm:text-5xl lg:text-6xl"
          >
            {HEADLINE}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate sm:text-lg"
          >
            Practical solutions that help businesses manage waste
            responsibly, recover valuable resources and build more
            sustainable operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <MagneticButton
              href="#solutions"
              className="inline-flex items-center justify-center rounded-full bg-lime px-7 py-3.5 text-sm font-medium text-navy transition-transform"
            >
              Explore Our Solutions
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-slate/50 px-7 py-3.5 text-sm font-medium text-offwhite transition-colors hover:border-offwhite"
            >
              Talk to Us
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-slate"
      >
        <ChevronDown size={22} />
      </motion.div>

      <style jsx>{`
        .hero-kenburns {
          animation: kenburns 20s ease-in-out infinite alternate;
        }
        @keyframes kenburns {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.08);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
