"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Mail, Phone } from "lucide-react";

gsap.registerPlugin(SplitText, ScrollTrigger);

const HEADLINE =
  "Let's Build a Better Waste Management Strategy for Your Business.";

// 016-5417743 → drop the leading trunk 0, prepend the Malaysia country code 60.
const WHATSAPP_URL = "https://wa.me/60165417743";

// Consultation now calls directly: +60 12-568 4703 → tel: needs a leading
// + and digits only, no spaces or dashes.
const CONSULTATION_TEL = "tel:+60125684703";

const QUOTATION_EMAIL_MAILTO =
  "mailto:naveshsaravanan@mtsmart-industries.com?subject=Request%20a%20Quotation";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39c1.45.79 3.08 1.21 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.83 14.02c-.24.68-1.4 1.31-1.93 1.39-.49.08-1.1.11-1.78-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.11-4.85-4.3-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09.99-2.37.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}

export function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [active, setActive] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const maskImage = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, transparent 0%, black 65%)`;

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
        scrollTrigger: {
          trigger: headlineRef.current,
          start: "top 85%",
        },
      });

      return () => split.revert();
    }, headlineRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <section
      id="cta"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="relative overflow-hidden bg-navy"
    >
      {/* Full-bleed background — heavily darkened by default, with a
          cursor-tracked circular cutout that lets the true image show
          through like a torch moving across the frame. */}
      <div className="absolute inset-0">
        <Image
          src="/images/final-cta.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />

        <motion.div
          aria-hidden
          className="absolute inset-0 bg-navy/85"
          style={
            active
              ? { maskImage, WebkitMaskImage: maskImage }
              : undefined
          }
        />

        {/* Constant baseline darken so the spotlight never fully washes
            the image out, and touch devices (no cursor) still read as a
            deliberately dim, moody backdrop rather than a broken half-effect. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/20" />
      </div>

      {/* Filmic grain texture — kept just visible, not merely present in
          code, per the low-opacity-invisible failure mode to avoid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[75vh] w-full max-w-4xl flex-col items-center justify-center px-6 py-24 text-center lg:px-10">
        <h2
          ref={headlineRef}
          style={{ opacity: 0 }}
          className="font-display text-4xl font-medium leading-[1.12] tracking-tight text-offwhite sm:text-5xl lg:text-6xl"
        >
          {HEADLINE}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-slate sm:text-lg"
        >
          Whether you are looking to improve waste handling, reduce landfill
          dependency, recover resources, manage food waste or safely
          dismantle end-of-life assets, our team can work with you to
          develop a practical solution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton
            href={CONSULTATION_TEL}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-7 py-3.5 text-sm font-medium text-navy transition-transform"
          >
            <Phone size={14} strokeWidth={1.75} className="text-navy" />
            Contact Us
          </MagneticButton>

          <MagneticButton
            href={QUOTATION_EMAIL_MAILTO}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate/50 px-7 py-3.5 text-sm font-medium text-offwhite transition-colors hover:border-offwhite"
          >
            <Mail size={14} strokeWidth={1.75} className="text-offwhite" />
            Request a Quotation
          </MagneticButton>

          <MagneticButton
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-lime/40 px-7 py-3.5 text-sm font-medium text-offwhite transition-colors hover:border-lime"
          >
            <WhatsAppIcon className="h-4 w-4 text-lime" />
            WhatsApp Us
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}