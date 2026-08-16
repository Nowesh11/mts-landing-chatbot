"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const IMAGE_SRC = "/images/resource-food-waste.png";

/**
 * A full-bleed, scroll-scrubbed clarity reveal: a blurred layer of the image
 * sits underneath a sharp layer, and a single scroll-driven value controls
 * both the sharp layer's clip-path and the divider line's position — so the
 * two can never drift out of sync. Purely automatic: no drag handle, no
 * pointer interaction. The scroll position IS the interaction.
 */
export function ClarityRevealSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const sharpRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const sharp = sharpRef.current;
    const line = lineRef.current;
    const pin = pinRef.current;
    if (!sharp || !line || !pin) return;

    if (prefersReducedMotion) {
      sharp.style.clipPath = "inset(0 0% 0 0)";
      line.style.left = "100%";
      return;
    }

    const proxy = { progress: 0 };

    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        progress: 100,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${Math.max(window.innerHeight * 1.2, 800)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = proxy.progress;
          // Single source of truth: both the reveal and the line read the
          // same value on the same tick, so they cannot drift apart.
          sharp.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
          line.style.left = `${p}%`;
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clarity"
      className="relative overflow-hidden bg-navy"
    >
      <div
        ref={pinRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      >
        {/* Blurred base layer — always fully visible underneath */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={IMAGE_SRC}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "blur(11px)", transform: "scale(1.06)" }}
          />
          <div className="absolute inset-0 bg-navy/35" />
        </div>

        {/* Sharp layer — clipped to reveal from the left as scroll advances */}
        <div
          ref={sharpRef}
          className="absolute inset-0"
          style={{ clipPath: "inset(0 100% 0 0)" }}
          aria-hidden
        >
          <Image
            src={IMAGE_SRC}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Divider line — reads the exact same scroll value as the clip-path */}
        <div
          ref={lineRef}
          aria-hidden
          className="pointer-events-none absolute top-0 z-10 h-full w-[2px] -translate-x-1/2 bg-lime"
          style={{
            left: "0%",
            filter:
              "drop-shadow(0 0 10px rgba(198, 217, 46, 0.8)) drop-shadow(0 0 26px rgba(198, 217, 46, 0.4))",
          }}
        />

        {/* Vignette scrim behind the overlay text, independent of what's underneath */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse 720px 320px at 50% 50%, rgba(11, 31, 58, 0.78), transparent 70%)",
          }}
        />

        <div className="relative z-20 mx-auto max-w-3xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-2xl font-medium leading-snug text-offwhite drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-3xl lg:text-4xl"
          >
            What looks like waste is really a resource waiting to be
            recovered.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
