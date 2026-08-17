"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProcessFlow } from "@/components/ui/process-flow";

gsap.registerPlugin(ScrollTrigger);

const STAGES = ["Generate", "Segregate", "Recover", "Recycle", "Reuse"];

const PARTICLES = [
  { left: "8%", top: "18%", size: 3, duration: 14, delay: 0 },
  { left: "18%", top: "72%", size: 2, duration: 18, delay: 2 },
  { left: "28%", top: "35%", size: 4, duration: 16, delay: 1 },
  { left: "40%", top: "82%", size: 2, duration: 20, delay: 3 },
  { left: "52%", top: "12%", size: 3, duration: 15, delay: 0.5 },
  { left: "63%", top: "60%", size: 2, duration: 19, delay: 4 },
  { left: "74%", top: "28%", size: 3, duration: 17, delay: 2.5 },
  { left: "83%", top: "78%", size: 2, duration: 22, delay: 1.5 },
  { left: "91%", top: "45%", size: 4, duration: 16, delay: 3.5 },
  { left: "35%", top: "55%", size: 2, duration: 21, delay: 0.8 },
];

export function ProcessFlowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const orbs = orbRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );
    if (prefersReducedMotion || !pinRef.current || !orbs.length) return;

    let ctx: gsap.Context | undefined;

    const build = () => {
      gsap.set(orbs, { x: 0, y: 0 });
      ctx?.revert();
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 1.4, 900)}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Slow ambient parallax drift, riding the same scrubbed scroll
        // range as the pinned line-draw (kept separate since orbs are a
        // section-level detail, not part of the shared ProcessFlow piece).
        const orbDrift: Array<[number, number]> = [
          [60, -40],
          [-50, 50],
          [40, 30],
        ];
        orbs.forEach((orb, i) => {
          const [dx, dy] = orbDrift[i % orbDrift.length];
          tl.to(orb, { x: dx, y: dy, ease: "none", duration: 1 }, 0);
        });
      }, sectionRef);
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative overflow-hidden bg-navy"
    >
      {/* Ambient background depth */}
      <div
        ref={(el) => {
          orbRefs.current[0] = el;
        }}
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />
      <div
        ref={(el) => {
          orbRefs.current[1] = el;
        }}
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-32 h-[620px] w-[620px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-surface) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        ref={(el) => {
          orbRefs.current[2] = el;
        }}
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-0 h-[480px] w-[480px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(100px)",
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

      {/* Slow-drifting ambient particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-lime"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: 0.2,
              animation: `process-particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        ref={pinRef}
        className="relative flex min-h-screen flex-col justify-center gap-14 bg-navy px-6 py-16 lg:gap-16 lg:px-10"
      >
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            The Process
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="max-w-3xl font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            From Waste Management to Resource Management
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate sm:text-lg"
          >
            We help businesses move beyond conventional disposal by
            identifying opportunities to reduce waste, recover resources and
            improve the overall efficiency of their waste streams.
          </motion.p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <ProcessFlow
            stages={STAGES}
            size="lg"
            pin
            pinTargetRef={pinRef}
            gradientId="process-flow-lg-gradient"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes process-particle-drift {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          15% {
            opacity: 0.25;
          }
          50% {
            transform: translate3d(14px, -22px, 0);
            opacity: 0.35;
          }
          85% {
            opacity: 0.2;
          }
          100% {
            transform: translate3d(-10px, 10px, 0);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          span[style*="process-particle-drift"] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}