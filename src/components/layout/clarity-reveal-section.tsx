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

    // Previously, gating only hid the visual OUTPUT (autoAlpha) while GSAP
    // kept calculating scrub progress underneath — so by the time the gate
    // allowed visibility, the scrub had already silently advanced to
    // wherever the user had scrolled to, and it "snapped" to that value
    // instead of animating smoothly from the start. The real fix is to
    // stop the ScrollTrigger INSTANCE itself from doing anything — no pin,
    // no scrub calculation, no callbacks — until the previous section has
    // genuinely cleared. It starts disabled and is only enabled once, the
    // moment that's confirmed true.
    const previousSection = document.getElementById("solutions");
    const isPreviousSectionCleared = () => {
      if (!previousSection) return true;
      // Must have scrolled almost entirely past — bottom edge at or above
      // a small tolerance near the TOP of the viewport, not the bottom.
      // (Previous version compared against window.innerHeight + 40, which
      // is satisfied while the previous section is still ~90% on screen —
      // that was the actual cause of the premature-activation bug.)
      return previousSection.getBoundingClientRect().bottom <= 40;
    };

    let hasEnabled = !previousSection;
    let rafId = 0;
    const pollUntilCleared = (
      st: ScrollTrigger,
      onEnabled: () => void
    ) => {
      const check = () => {
        if (hasEnabled) return;
        if (isPreviousSectionCleared()) {
          hasEnabled = true;
          st.enable();
          onEnabled();
          return;
        }
        // requestAnimationFrame rather than a scroll listener so this
        // can't miss a fast flick scroll that jumps straight past the
        // clearance point between two scroll events.
        rafId = requestAnimationFrame(check);
      };
      check();
    };

    const ctx = gsap.context(() => {
      // Invisible until this section's own pin genuinely activates — a hard
      // gate so it can never be simultaneously visible with the section
      // before/after it, regardless of any pin-timing imprecision.
      gsap.set(pin, { autoAlpha: 0, zIndex: 0 });

      const tween = gsap.to(proxy, {
        progress: 100,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          // Widened from 1.2x to 1.8x viewport height — console evidence
          // showed the underlying scrub state was always correct/synced,
          // but the previous distance (973px in the tested case) could be
          // covered fast enough during normal scrolling to feel like
          // snapping rather than a gradual reveal.
          end: () => `+=${Math.max(window.innerHeight * 1.8, 1200)}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onEnter: () =>
            gsap.to(pin, {
              autoAlpha: 1,
              zIndex: 20,
              duration: 0.35,
              ease: "power2.out",
            }),
          onEnterBack: () =>
            gsap.to(pin, {
              autoAlpha: 1,
              zIndex: 20,
              duration: 0.35,
              ease: "power2.out",
            }),
          // Once the pin has fully released (either direction), reset the
          // reveal to its rest state — otherwise the sharp layer/divider
          // line are left frozen mid-reveal at whatever progress they had
          // on the last scroll tick, and that stale state can visually
          // intrude into whatever section follows once this one is back
          // in normal (unpinned) document flow.
          onLeave: () => {
            sharp.style.clipPath = "inset(0 100% 0 0)";
            line.style.left = "0%";
          },
          onLeaveBack: () => {
            sharp.style.clipPath = "inset(0 100% 0 0)";
            line.style.left = "0%";
          },
        },
        onUpdate: () => {
          const p = proxy.progress;
          // Single source of truth: both the reveal and the line read the
          // same value on the same tick, so they cannot drift apart.
          sharp.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
          line.style.left = `${p}%`;
        },
      });

      const st = tween.scrollTrigger!;
      if (!hasEnabled) {
        // Disable synchronously, before the browser has any chance to
        // paint or scroll further — GSAP will not pin, scrub, or fire any
        // callback on this instance at all while disabled, so proxy.progress
        // stays frozen at 0 no matter how far the user scrolls in the
        // meantime.
        st.disable();
        pollUntilCleared(st, () => {
          // st.enable() resumes the trigger using whatever start/end it
          // calculated at creation time (while still effectively
          // disabled) — refresh re-measures against the current layout.
          st.refresh();
          // Same fix applied to ProcessFlow/Journey: resize Lenis right
          // when this pin's true final height becomes known, since
          // SmoothScrollProvider's time-based refreshes may fire before
          // this gate ever opens.
          // Deferred by one frame — calling synchronously could read the
          // DOM before the browser applies the pin's new layout,
          // computing a temporarily wrong page height and forcibly
          // resetting scroll to top (the actual cause of that regression).
          requestAnimationFrame(() => window.__lenis?.resize());
          // Neither enable() nor refresh() is guaranteed to retroactively
          // fire the tween's onUpdate callback for the "jump" to the
          // current scroll-derived progress — confirmed via console:
          // GSAP's own st.progress correctly read 1 (fully complete) but
          // the visual clip-path/line never moved from their fully-
          // hidden initial values, because onUpdate simply never ran.
          // Re-assigning the tween's progress to itself forces GSAP to
          // treat it as a genuine change and fire onUpdate, syncing the
          // DOM styles with the already-correct internal progress value.
          tween.progress(tween.progress());
        });
      }
    }, sectionRef);

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clarity"
      className="relative overflow-hidden bg-navy"
    >
      <div
        ref={pinRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-navy"
      >
        {/* Blurred base layer — always fully visible underneath */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={IMAGE_SRC}
            alt=""
            fill
            loading="lazy"
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
            loading="lazy"
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