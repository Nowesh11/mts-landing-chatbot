"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DRAWABLE_SELECTOR = "path, line, polyline, polygon, circle, rect, ellipse";

/** Sets stroke-dasharray/dashoffset to each shape's own length so it starts fully hidden. */
export function prepareShapeForDraw(shape: SVGGeometryElement) {
  const length = shape.getTotalLength();
  shape.style.strokeDasharray = `${length}`;
  shape.style.strokeDashoffset = `${length}`;
  return length;
}

function prepareIconShapes(svg: SVGSVGElement) {
  const shapes = Array.from(
    svg.querySelectorAll<SVGGeometryElement>(DRAWABLE_SELECTOR)
  );
  shapes.forEach(prepareShapeForDraw);
  return shapes;
}

/**
 * Draws every stroke shape inside an <svg> in once, staggered, the first time
 * `trigger` enters the viewport. Used for icon reveals (ESG tiles etc).
 * Returns a cleanup function.
 */
export function drawIconOnce(
  svg: SVGSVGElement,
  trigger: Element,
  options: { delay?: number; duration?: number; stagger?: number; start?: string } = {}
) {
  const shapes = prepareIconShapes(svg);
  if (!shapes.length) return () => {};

  const tween = gsap.to(shapes, {
    strokeDashoffset: 0,
    duration: options.duration ?? 0.9,
    ease: "power2.out",
    stagger: options.stagger ?? 0.05,
    delay: options.delay ?? 0,
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 82%",
      once: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
