"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
 
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    const raf = requestAnimationFrame(refresh);
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    const timeout = setTimeout(refresh, 1000);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", refresh);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis off a dedicated native rAF loop rather than gsap.ticker.
    // The gsap.ticker-driven callback (the pattern in Lenis/GSAP's own
    // integration docs) turned out not to reliably keep lenis.raf()
    // advancing in this app — confirmed by calling lenis.scrollTo()
    // programmatically and finding animatedScroll never moved until
    // lenis.raf() was invoked manually. A plain rAF loop has no such
    // dependency on GSAP's internal ticker state.
    let rafId = 0;
    const raf = (time: number) => {
      // If ANYTHING throws inside lenis.raf() — including indirectly, via
      // the ScrollTrigger.update listener registered above, which in turn
      // touches every ScrollTrigger instance on the page (and this page
      // has several: Clarity Reveal, Why MT Smart, Journey, Big Statement,
      // both Resource Panels rows) — an uncaught exception here would
      // stop execution before reaching requestAnimationFrame(raf) below,
      // permanently halting this loop. That would explain wheel-scroll
      // going dead further down the page (Lenis no longer processing any
      // input) while native scrollbar-drag keeps working (it bypasses
      // Lenis's JS loop entirely). Wrapping in try/catch makes this loop
      // self-healing: one bad frame gets logged and skipped rather than
      // permanently killing scroll for the rest of the session.
      try {
        lenis.raf(time);
      } catch (err) {
        console.error(
          "[SmoothScrollProvider] lenis.raf() threw — recovering, scroll should keep working:",
          err
        );
      }
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    gsap.ticker.lagSmoothing(0);

    // Exposed so other components can trigger smooth scrolls (e.g. an
    // "Explore" link jumping to another section) through the same Lenis
    // instance, instead of a native jump that would fight it.
    window.__lenis = lenis;

    return () => {
      window.__lenis = undefined;
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}