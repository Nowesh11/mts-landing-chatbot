"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Landmark, Recycle, Truck, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";

gsap.registerPlugin(ScrollTrigger);

type Credential = {
  icon: LucideIcon;
  title: string;
  description: string;
  isYears?: boolean;
};

const CREDENTIALS: Credential[] = [
  {
    icon: Award,
    title: "20+ Years of Experience",
    description: "Operating since 2003.",
    isYears: true,
  },
  {
    icon: Truck,
    title: "Operational Capability",
    description:
      "RORO bins, transport, dismantling equipment and site resources.",
  },
  {
    icon: Landmark,
    title: "Financial Capacity",
    description: "Capability to support projects of varying scale.",
  },
  {
    icon: Recycle,
    title: "ESG & Circular Economy Focus",
    description:
      "Waste solutions designed around responsible recovery and resource utilisation.",
  },
];

const CARD_WIDTH = 380;
const CARD_GAP = 32;
const FOCUS_WINDOW = CARD_WIDTH * 1.3;

function CardChrome({
  credential,
  index,
  yearsNumberRef,
}: {
  credential: Credential;
  index: number;
  yearsNumberRef?: (el: HTMLSpanElement | null) => void;
}) {
  const Icon = credential.icon;
  return (
    <>
      <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-lime/30">
        <span className="font-mono text-xs tracking-[0.1em] text-slate">
          0{index + 1}
        </span>
      </div>

      <div className="relative flex h-14 w-14 items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-60 blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(198, 217, 46, 0.4), transparent 70%)",
          }}
        />
        <Icon size={30} strokeWidth={1.75} className="relative text-lime" />
      </div>

      {credential.isYears ? (
        <div className="mt-6 flex items-baseline gap-1">
          <span
            ref={yearsNumberRef}
            className="font-display text-6xl font-semibold text-lime"
          >
            0
          </span>
          <span className="font-display text-6xl font-semibold text-lime">+</span>
        </div>
      ) : null}

      <h3
        className={`font-display font-semibold text-offwhite ${
          credential.isYears ? "mt-2 text-lg" : "mt-6 text-xl"
        }`}
      >
        {credential.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate">
        {credential.description}
      </p>
    </>
  );
}

export function WhyMtSmartSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const yearsNumberRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const track = trackRef.current;
      const pin = pinRef.current;
      const cards = cardRefs.current.filter(
        (el): el is HTMLDivElement => el !== null
      );
      if (!track || !pin || cards.length < 2) return;

      const scrollDistance = () =>
        Math.max(track.scrollWidth - window.innerWidth, 1);

      const updateCards = () => {
        const viewportCenter = window.innerWidth / 2;
        cards.forEach((card, i) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(cardCenter - viewportCenter);
          const progress = Math.max(0, 1 - dist / FOCUS_WINDOW);

          const scale = 0.85 + 0.15 * progress;
          const opacity = 0.5 + 0.5 * progress;
          card.style.transform = `scale(${scale})`;
          card.style.opacity = `${opacity}`;
          card.style.borderColor = `rgba(198, 217, 46, ${0.1 + 0.3 * progress})`;
          card.style.boxShadow = `0 0 ${28 * progress}px rgba(198, 217, 46, ${
            0.3 * progress
          }), 0 0 ${8 * progress}px rgba(198, 217, 46, ${0.4 * progress})`;

          if (CREDENTIALS[i]?.isYears && yearsNumberRef.current) {
            // Snap to the full value once the card is reasonably focused,
            // rather than tracking raw distance forever — the card never
            // sits at a mathematically perfect progress of 1, so without
            // this the count could stall short of (or briefly dip below)
            // its target depending on exact scroll position.
            const displayProgress = progress > 0.85 ? 1 : progress;
            yearsNumberRef.current.textContent = `${Math.round(displayProgress * 20)}`;
          }
        });
      };

      const tween = gsap.to(track, {
        x: () => -scrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${scrollDistance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: updateCards,
          onRefresh: updateCards,
        },
      });

      updateCards();

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    if (prefersReducedMotion) {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        card.style.transform = "scale(1)";
        card.style.opacity = "1";
        card.style.borderColor = "rgba(198, 217, 46, 0.4)";
        card.style.boxShadow = "0 0 20px rgba(198, 217, 46, 0.2)";
        if (CREDENTIALS[i]?.isYears && yearsNumberRef.current) {
          yearsNumberRef.current.textContent = "20";
        }
      });
    }

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-us"
      className="relative overflow-hidden bg-navy"
    >
      {/* Ambient background depth, consistent with ESG / Big Statement */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[540px] w-[540px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[540px] w-[540px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
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

      {/* Desktop: pinned horizontal scroll-through */}
      <div ref={pinRef} className="relative hidden lg:block">
        <div className="relative z-10 flex h-screen flex-col justify-center gap-14 overflow-hidden px-6 py-16 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl lg:text-5xl"
            >
              Built on Experience. Equipped for Industry.
            </motion.h2>
          </div>

          <div
            ref={trackRef}
            className="flex items-center"
            style={{
              gap: CARD_GAP,
              paddingLeft: "calc(50vw - 190px)",
              paddingRight: "calc(50vw - 190px)",
              width: "max-content",
            }}
          >
            {CREDENTIALS.map((credential, i) => (
              <div
                key={credential.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="relative flex-shrink-0 rounded-2xl border bg-surface p-8"
                style={{
                  width: CARD_WIDTH,
                  minHeight: 340,
                  borderColor: "rgba(198, 217, 46, 0.1)",
                  transform: "scale(0.85)",
                  opacity: 0.5,
                  boxShadow: "0 0 0 rgba(198, 217, 46, 0)",
                }}
              >
                <CardChrome
                  credential={credential}
                  index={i}
                  yearsNumberRef={
                    credential.isYears
                      ? (el) => {
                          yearsNumberRef.current = el;
                        }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / tablet: simple vertical stack */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 py-24 lg:hidden">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-offwhite sm:text-4xl"
        >
          Built on Experience. Equipped for Industry.
        </motion.h2>

        <div className="mt-12 flex flex-col gap-5">
          {CREDENTIALS.map((credential, i) => {
            const Icon = credential.icon;
            return (
              <motion.div
                key={credential.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="relative rounded-2xl border border-lime/20 bg-surface p-6"
              >
                <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-lime/30">
                  <span className="font-mono text-xs tracking-[0.1em] text-slate">
                    0{i + 1}
                  </span>
                </div>

                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-60 blur-xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(198, 217, 46, 0.4), transparent 70%)",
                    }}
                  />
                  <Icon size={30} strokeWidth={1.75} className="relative text-lime" />
                </div>

                {credential.isYears ? (
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-6xl font-semibold text-lime">
                      <AnimatedNumber target={20} />
                    </span>
                    <span className="font-display text-6xl font-semibold text-lime">
                      +
                    </span>
                  </div>
                ) : null}

                <h3
                  className={`font-display font-semibold text-offwhite ${
                    credential.isYears ? "mt-2 text-lg" : "mt-6 text-xl"
                  }`}
                >
                  {credential.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {credential.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
