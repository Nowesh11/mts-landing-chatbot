"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProcessFlow } from "@/components/ui/process-flow";
import { CredentialBadges } from "@/components/ui/credential-badge";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  "2003",
  "Capability Expansion",
  "Service Expansion",
  "Certified Standards",
  "Today",
];

const DESCRIPTIONS = [
  "MT Smart Trading founded — a licensed scrap and waste management business.",
  "Developed strong capabilities in scrap recovery, waste handling and industrial operations, supporting clients across construction and industrial sectors.",
  "Expanded into industrial waste management, demolition and dismantling, and end-to-end site waste management solutions.",
  "Progressed towards ISO 9001 and CIDB G5 certification, reinforcing our commitment to quality, compliance and structured processes.",
  "MT Smart Industries Sdn Bhd — supporting businesses in operational efficiency, responsible waste handling and the advance toward sustainable, zero-waste operations.",
];

const CERTS = ["ISO 9001", "CIDB G5"];

export function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !pinRef.current || !bgRef.current) return;

    // Same pattern as WhyMtSmartSection: the pin/parallax only applies on
    // desktop, matched via gsap.matchMedia rather than running
    // unconditionally. Previously this ran on every screen size — on
    // mobile, a min-h-screen PINNED section crammed with 5 milestones'
    // worth of text has no way to be scrolled through if it overflows the
    // viewport height, since normal scroll is hijacked for the pin's
    // duration. The mobile-only JSX below (a plain, non-pinned vertical
    // list) is the actual fix; this just needs to stop trying to pin/
    // parallax an element that's `hidden` below `lg` in the first place.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      let ctx: gsap.Context | undefined;

      const build = () => {
        // Scale must be set through GSAP too, not left as a plain CSS
        // style — GSAP owns the whole `transform` property once it
        // animates any transform value on an element, and overwrites
        // styles it doesn't know about (which silently wiped out a
        // CSS-only scale(1.12) here).
        gsap.set(bgRef.current, { yPercent: -4, scale: 1.12 });
        ctx?.revert();
        ctx = gsap.context(() => {
          // Same trigger/start/end as ProcessFlow's own pinned
          // ScrollTrigger below, so the background drift stays in
          // lockstep with the milestone reveal it sits behind — a
          // distinct instance since the background is a section-level
          // detail, not part of the shared timeline component.
          gsap.to(bgRef.current, {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 1.4, 900)}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
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
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative overflow-hidden bg-navy"
    >
      {/* Desktop: pinned horizontal milestone timeline with parallax
          background. NOTE: this effect only handles the background
          image's parallax drift. The actual pin (position:fixed,
          visibility gating, and the clearance check against Project
          Experience) is owned entirely by the <ProcessFlow> component
          below via its gateAgainstSectionId prop — that component
          creates its own separate ScrollTrigger targeting this same
          pinRef element. This effect must NOT also set autoAlpha/zIndex
          on pinRef; two independent systems fighting over the same
          element's visibility was the actual cause of the
          Project-Experience/Journey clash, even after this effect's own
          gate was "fixed" — ProcessFlow's ungated pin kept overriding it. */}
      <div
        ref={pinRef}
        className="relative hidden min-h-screen flex-col justify-center gap-14 overflow-hidden bg-navy px-6 py-16 lg:flex lg:gap-16 lg:px-10"
      >
        {/* Background image lives INSIDE the pinned element — anything
            outside it would scroll away almost immediately once the pin
            engages, since only the pinned element itself stays fixed. */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div ref={bgRef} className="absolute inset-0" style={{ transform: "scale(1.12)" }}>
            <Image
              src="/images/journey.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/75 via-navy/15 to-navy/60" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            Since 2003
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="max-w-3xl font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
          >
            Our Journey
          </motion.h2>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <ProcessFlow
            stages={MILESTONES}
            descriptions={DESCRIPTIONS}
            renderExtraAction={(i: number) => (i === 3 ? <CredentialBadges labels={CERTS} /> : null)}
            size="lg"
            pin
            pinTargetRef={pinRef}
            gradientId="journey-flow-gradient"
            gateAgainstSectionId="project-experience"
          />
        </div>
      </div>

      {/* Mobile / tablet: plain, non-pinned vertical timeline — same
          pattern as WhyMtSmartSection's mobile fallback. No pin, no
          scroll-hijacking, so it works correctly regardless of how tall
          the milestone list ends up being on a narrow viewport. Reuses
          the same background image, statically (no parallax), so mobile
          still feels visually connected to the desktop version. */}
      <div className="relative overflow-hidden bg-navy px-6 py-24 lg:hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src="/images/journey.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/90 to-navy/70" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-mono text-xs tracking-[0.25em] text-lime uppercase"
          >
            Since 2003
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl"
          >
            Our Journey
          </motion.h2>

          <div className="mt-12 flex flex-col gap-6">
            {MILESTONES.map((milestone, i) => (
              <motion.div
                key={milestone}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="relative rounded-2xl border border-lime/20 bg-navy/60 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime/30">
                    <span className="font-mono text-xs tracking-[0.1em] text-slate">
                      0{i + 1}
                    </span>
                  </span>
                  <h3 className="font-display text-xl font-semibold text-lime">
                    {milestone}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-offwhite/85">
                  {DESCRIPTIONS[i]}
                </p>
                {i === 3 && (
                  <div className="mt-4">
                    <CredentialBadges labels={CERTS} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}