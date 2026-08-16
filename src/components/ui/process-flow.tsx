"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prepareShapeForDraw } from "@/lib/scroll-draw";

gsap.registerPlugin(ScrollTrigger);

type Size = "lg" | "sm";

const SIZE_CONFIG: Record<
  Size,
  {
    badgeClass: string;
    badgeTextClass: string;
    labelClass: string;
    rowClass: string;
    lineOffsetBelow: number;
    lineOffsetSide: number;
    glowStdDeviation: string;
    glowStrokeWidth: number;
    lineStrokeWidth: number;
  }
> = {
  lg: {
    badgeClass: "h-9 w-9",
    badgeTextClass: "text-xs",
    labelClass: "text-4xl font-semibold sm:text-5xl lg:text-5xl xl:text-6xl",
    rowClass:
      "flex-col gap-12 sm:gap-16 lg:flex-row lg:items-center lg:justify-between lg:gap-4 xl:gap-8",
    lineOffsetBelow: 20,
    lineOffsetSide: 4,
    glowStdDeviation: "5",
    glowStrokeWidth: 7,
    lineStrokeWidth: 2,
  },
  sm: {
    badgeClass: "h-6 w-6",
    badgeTextClass: "text-[9px]",
    labelClass: "text-xs font-medium sm:text-sm",
    rowClass: "flex-row flex-wrap justify-between gap-x-3 gap-y-8",
    lineOffsetBelow: 10,
    lineOffsetSide: 3,
    glowStdDeviation: "3",
    glowStrokeWidth: 4,
    lineStrokeWidth: 1.25,
  },
};

/**
 * The Big Statement signature mechanic — a glowing lime line draws beneath a
 * row of stage labels, each lighting up from slate to lime with a glow
 * bloom exactly as the line reaches it. Shared by the full-scale pinned
 * hero moment (size="lg", pin), smaller inline instances embedded in
 * content panels (size="sm", not pinned — the row's own scroll position
 * through the viewport drives the same scrub mechanic instead), and
 * year-based milestone timelines (size="lg", pin, with `descriptions` and
 * optionally `renderExtra` for a per-milestone detail like credential
 * badges — see Our Journey).
 */
export function ProcessFlow({
  stages,
  descriptions,
  renderExtra,
  size = "sm",
  pin = false,
  pinTargetRef,
  gradientId,
}: {
  stages: string[];
  /** Paragraph copy per stage. When provided, switches labels to a smaller
   * milestone-card treatment (left-aligned title + body) and measures the
   * connecting line off each card's full block rather than just the title,
   * so the line clears the body copy instead of cutting through it. */
  descriptions?: string[];
  /** Optional extra content rendered beneath a stage's description (e.g.
   * credential badges), fading/scaling in with that stage's activation. */
  renderExtra?: (index: number) => React.ReactNode;
  size?: Size;
  pin?: boolean;
  pinTargetRef?: RefObject<HTMLElement | null>;
  gradientId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const stageRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const badgeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);
  const extraRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isMilestone = Boolean(descriptions);

  const cfg = SIZE_CONFIG[size];
  const filterId = `${gradientId}-glow`;

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const stageEls = stageRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null
    );
    const badges = badgeRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );
    const blocks = blockRefs.current;
    const extras = extraRefs.current;
    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const glowPath = glowPathRef.current;
    if (!container || !svg || !path || !glowPath || stageEls.length < 2) {
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const lime = styles.getPropertyValue("--color-lime").trim() || "#C6D92E";
    const slate = styles.getPropertyValue("--color-slate").trim() || "#7E93AA";

    const activeTextShadow =
      "0 0 22px rgba(198, 217, 46, 0.9), 0 0 44px rgba(198, 217, 46, 0.45)";
    const restingTextShadow = "0 0 12px rgba(198, 217, 46, 0.35)";
    const idleTextShadow = "0 0 0 rgba(198, 217, 46, 0)";

    if (prefersReducedMotion) {
      gsap.set([path, glowPath], { strokeDashoffset: 0 });
      gsap.set(stageEls, { color: lime, textShadow: restingTextShadow });
      gsap.set(badges, {
        borderColor: "rgba(198, 217, 46, 0.7)",
        backgroundColor: "rgba(198, 217, 46, 0.12)",
        boxShadow: "0 0 18px rgba(198, 217, 46, 0.35)",
      });
      extras.forEach((extra) => {
        if (extra) gsap.set(extra, { opacity: 1, scale: 1 });
      });
      return;
    }

    let ctx: gsap.Context | undefined;
    let raf = 0;
    let cancelled = false;

    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

    const measurePoints = (desktop: boolean) => {
      const rect = container.getBoundingClientRect();
      return stageEls.map((stageEl, i) => {
        // Milestones measure off their full card (title + description +
        // any extra content like credential badges) so the line clears
        // the whole block, not just the title — a fixed offset below the
        // title alone would cut through variable-length body copy.
        const el = (isMilestone && blocks[i]) || stageEl;
        const r = el.getBoundingClientRect();
        if (size === "lg" && !desktop) {
          // Mobile vertical stack (large pinned version only): connector
          // runs down the side of the stack, not through the labels.
          return {
            x: cfg.lineOffsetSide,
            y: r.top - rect.top + r.height / 2,
          };
        }
        // Underline sitting below the label's baseline, never through it.
        return {
          x: r.left - rect.left + r.width / 2,
          y: r.bottom - rect.top + (isMilestone ? 16 : cfg.lineOffsetBelow),
        };
      });
    };

    const build = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const points = measurePoints(isDesktop());
      const d = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");
      path.setAttribute("d", d);
      glowPath.setAttribute("d", d);
      prepareShapeForDraw(path);
      prepareShapeForDraw(glowPath);

      if (gradientRef.current && points.length > 1) {
        const first = points[0];
        const last = points[points.length - 1];
        gradientRef.current.setAttribute("x1", `${first.x}`);
        gradientRef.current.setAttribute("y1", `${first.y}`);
        gradientRef.current.setAttribute("x2", `${last.x}`);
        gradientRef.current.setAttribute("y2", `${last.y}`);
      }

      gsap.set(stageEls, { color: slate, scale: 1, textShadow: idleTextShadow });
      gsap.set(badges, {
        borderColor: "rgba(198, 217, 46, 0.3)",
        backgroundColor: "rgba(198, 217, 46, 0)",
        boxShadow: "0 0 0 rgba(198, 217, 46, 0)",
      });
      extras.forEach((extra) => {
        if (extra) gsap.set(extra, { opacity: 0, scale: 0.9 });
      });

      ctx?.revert();
      ctx = gsap.context(() => {
        const trigger = pin ? pinTargetRef?.current ?? container : container;

        const tl = gsap.timeline({
          scrollTrigger: pin
            ? {
                trigger,
                start: "top top",
                end: () => `+=${Math.max(window.innerHeight * 1.4, 900)}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              }
            : {
                trigger,
                start: "top 85%",
                end: "bottom 55%",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
        });

        tl.to([path, glowPath], { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);

        stageEls.forEach((el, i) => {
          const t = i / (stageEls.length - 1);
          const badge = badges[i];

          tl.to(
            el,
            {
              color: lime,
              scale: 1.05,
              textShadow: activeTextShadow,
              duration: 0.05,
              ease: "power2.out",
            },
            t
          ).to(
            el,
            { scale: 1, textShadow: restingTextShadow, duration: 0.06, ease: "power2.in" },
            t + 0.05
          );

          if (badge) {
            tl.to(
              badge,
              {
                borderColor: "rgba(198, 217, 46, 0.9)",
                backgroundColor: "rgba(198, 217, 46, 0.14)",
                boxShadow: "0 0 20px rgba(198, 217, 46, 0.45)",
                duration: 0.06,
                ease: "power2.out",
              },
              t
            );
          }

          const extra = extras[i];
          if (extra) {
            tl.to(
              extra,
              { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out" },
              t + 0.02
            );
          }
        });
      }, container);
    };

    // When `pin` is used with `pinTargetRef`, that ref points at a DOM node
    // owned by an ANCESTOR component (e.g. the section wrapping this one).
    // React attaches refs and fires layout effects together, bottom-up, one
    // fiber at a time — so on first mount this component's own
    // useLayoutEffect always runs before the ancestor's ref gets attached,
    // meaning `pinTargetRef.current` is reliably still null the first time
    // build() would run here (confirmed via logging: it was null on every
    // mount, for every `pin` usage). Deferring the initial build with a
    // microtask lets the full commit — including the ancestor's ref —
    // finish first, so the pin correctly targets the intended
    // section-level element instead of silently falling back to this
    // component's own inner container. A microtask is used rather than
    // requestAnimationFrame so this isn't tied to a paint (and doesn't
    // stall on a backgrounded/inactive tab, where rAF can be throttled
    // indefinitely) — it still runs strictly after the synchronous commit,
    // which is all the guarantee this needs.
    queueMicrotask(() => {
      if (!cancelled) build();
    });

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      ctx?.revert();
    };
  }, [stages, isMilestone, size, pin, pinTargetRef, cfg.lineOffsetBelow, cfg.lineOffsetSide]);

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full ${cfg.rowClass} ${
        isMilestone ? "lg:items-start" : ""
      }`}
    >
      <svg
        ref={svgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient ref={gradientRef} id={gradientId} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="1" />
          </linearGradient>
          <filter id={filterId} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation={cfg.glowStdDeviation} result="blur" />
          </filter>
        </defs>

        <path
          ref={glowPathRef}
          fill="none"
          style={{ stroke: `url(#${gradientId})`, filter: `url(#${filterId})` }}
          strokeWidth={cfg.glowStrokeWidth}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          ref={pathRef}
          fill="none"
          style={{
            stroke: `url(#${gradientId})`,
            filter: "drop-shadow(0 0 6px rgba(198, 217, 46, 0.55))",
          }}
          strokeWidth={cfg.lineStrokeWidth}
          strokeLinecap="round"
        />
      </svg>

      {stages.map((stage, i) => (
        <div
          key={stage}
          ref={(el) => {
            blockRefs.current[i] = el;
          }}
          className={`relative z-10 flex flex-col items-start gap-3 ${
            isMilestone
              ? "text-left lg:max-w-[240px]"
              : size === "lg"
                ? "lg:items-center lg:text-center"
                : "items-center text-center"
          }`}
          style={size === "sm" ? { minWidth: 64 } : undefined}
        >
          <div
            ref={(el) => {
              badgeRefs.current[i] = el;
            }}
            className={`flex items-center justify-center rounded-full border transition-colors ${cfg.badgeClass}`}
            style={{
              borderColor: "rgba(198, 217, 46, 0.3)",
              backgroundColor: "rgba(198, 217, 46, 0)",
            }}
          >
            <span className={`font-mono tracking-[0.1em] text-slate ${cfg.badgeTextClass}`}>
              0{i + 1}
            </span>
          </div>
          <span
            ref={(el) => {
              stageRefs.current[i] = el;
            }}
            style={{ color: "var(--color-slate)" }}
            className={`inline-block font-display ${
              isMilestone
                ? "text-2xl font-semibold sm:text-3xl lg:text-3xl xl:text-4xl"
                : cfg.labelClass
            }`}
          >
            {stage}
          </span>

          {isMilestone && descriptions?.[i] && (
            <p className="text-sm leading-relaxed text-slate">
              {descriptions[i]}
            </p>
          )}

          {isMilestone && renderExtra && (
            <div
              ref={(el) => {
                extraRefs.current[i] = el;
              }}
            >
              {renderExtra(i)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
