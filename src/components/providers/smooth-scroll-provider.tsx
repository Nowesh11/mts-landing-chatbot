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
  // Every pinned ScrollTrigger section measures the DOM at the moment it
  // initializes. If web fonts or images are still settling — which happens
  // far more often in production than in a warm local dev cache — those
  // measurements are wrong and pin-spacers end up too short, causing later
  // sections to scroll into view before the current pinned section has
  // finished (visible as sections overlapping). Re-measuring after fonts,
  // the full page load, and a short trailing delay corrects this
  // regardless of which section's images/fonts were the actual culprit.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    const timeout = setTimeout(refresh, 500);

    return () => {
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
      lenis.raf(time);
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
