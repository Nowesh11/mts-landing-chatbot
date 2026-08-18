"use client";

import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUp, Mail, Phone } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { scrollToId } from "@/lib/scroll-to";

const WHATSAPP_URL = "https://wa.me/60165417743";
const PHONE_TEL = "tel:+60165417743";
const EMAIL_MAILTO = "mailto:naveshsaravanan@mtsmart-industries.com";
const LINKEDIN_URL = "https://www.linkedin.com/company/mt-smart-industries/";

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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

// --- Zone 1: kinetic wordmark ------------------------------------------

// Offwhite → lime, interpolated per letter by cursor proximity.
function mixColor(t: number) {
  const off = [244, 246, 245];
  const lime = [198, 217, 46];
  const r = Math.round(off[0] + (lime[0] - off[0]) * t);
  const g = Math.round(off[1] + (lime[1] - off[1]) * t);
  const b = Math.round(off[2] + (lime[2] - off[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function KineticWordmark() {
  const text = "MT SMART INDUSTRIES";
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const mx = e.clientX;
    const my = e.clientY;
    letterRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(mx - cx, my - cy);
      const proximity = Math.max(0, 1 - dist / 180);
      el.style.transform = `translateY(${-14 * proximity}px) scale(${1 + 0.22 * proximity})`;
      el.style.color = mixColor(proximity);
    });
  };

  const handleLeave = () => {
    letterRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "translateY(0px) scale(1)";
      el.style.color = "";
    });
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="select-none"
    >
      <div className="flex items-center gap-3 sm:gap-5">
        <Image
          src="/images/MTS_LOGO_white.png"
          alt="MT Smart Industries"
          width={365}
          height={127}
          className="hidden w-auto shrink-0 opacity-90 sm:block"
          style={{ height: "clamp(0.9rem, 4.2vw, 4.4rem)" }}
        />

        <h2
          className="whitespace-nowrap break-keep bg-gradient-to-r from-offwhite via-offwhite to-slate bg-clip-text font-display font-bold leading-none tracking-tight text-transparent"
          style={{ fontSize: "clamp(1.5rem, 6vw, 7rem)" }}
        >
          {text.split("").map((ch, i) =>
            ch === " " ? (
              <span key={i} aria-hidden className="inline-block w-[0.28em]">
                {" "}
              </span>
            ) : (
              <span
                key={i}
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className="inline-block transition-[transform,color] duration-200 ease-out"
              >
                {ch}
              </span>
            )
          )}
        </h2>
      </div>
    </div>
  );
}

// --- Zone 2: link columns -------------------------------------------------

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const SITEMAP_LINKS: FooterLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Solutions", href: "#solutions" },
  { label: "Sector Solutions", href: "#sector-solutions" },
  { label: "Why Us", href: "#why-us" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

const SOLUTIONS_LINKS: FooterLink[] = [
  { label: "Industrial Waste Management", href: "#solutions" },
  { label: "Controlled Dismantling & Demolition", href: "#solutions" },
  { label: "Construction Waste Management", href: "#solutions" },
  { label: "Material Recovery & Resource Management", href: "#solutions" },
  { label: "RORO Bin Solutions", href: "#solutions" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Why MT Smart", href: "#why-us" },
];

function FooterLinkItem({
  link,
  columnKey,
}: {
  link: FooterLink;
  columnKey: string;
}) {
  const [hovered, setHovered] = useState(false);

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative inline-block py-0.5 text-sm text-offwhite/80 transition-colors hover:text-offwhite"
      >
        {link.label}
        {hovered && (
          <motion.span
            layoutId={`footer-underline-${columnKey}`}
            className="absolute -bottom-0.5 left-0 right-0 h-px bg-lime"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
      </a>
    );
  }

  return (
    <a
      href={link.href}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(link.href);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-block py-0.5 text-sm text-offwhite/80 transition-colors hover:text-offwhite"
    >
      {link.label}
      {hovered && (
        <motion.span
          layoutId={`footer-underline-${columnKey}`}
          className="absolute -bottom-0.5 left-0 right-0 h-px bg-lime"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
    </a>
  );
}

function FooterColumn({
  title,
  links,
  columnKey,
}: {
  title: string;
  links: FooterLink[];
  columnKey: string;
}) {
  return (
    <div className="sm:border-l sm:border-lime/10 sm:pl-8 sm:first:border-l-0 sm:first:pl-0">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-slate">
        {title}
      </p>
      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLinkItem link={link} columnKey={columnKey} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const handleBackToTop = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId("#home");
  };

  return (
    <footer className="relative overflow-hidden border-t border-lime/10 bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-20 h-[480px] w-[480px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime) 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-offwhite) 1px, transparent 1px), linear-gradient(to bottom, var(--color-offwhite) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 lg:px-10">
        <KineticWordmark />
      </div>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <FooterColumn title="Sitemap" links={SITEMAP_LINKS} columnKey="sitemap" />
          <FooterColumn title="Solutions" links={SOLUTIONS_LINKS} columnKey="solutions" />
          <FooterColumn title="Company" links={COMPANY_LINKS} columnKey="company" />
          <div className="sm:border-l sm:border-lime/10 sm:pl-8">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-slate">
              Connect
            </p>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-offwhite/80 transition-colors hover:text-lime"
                >
                  <WhatsAppIcon className="h-4 w-4 text-lime" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-offwhite/80 transition-colors hover:text-lime"
                >
                  <LinkedInIcon className="h-4 w-4 text-lime" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={EMAIL_MAILTO}
                  className="inline-flex items-center gap-2 text-sm text-offwhite/80 transition-colors hover:text-lime"
                >
                  <Mail size={14} strokeWidth={1.75} className="text-lime" />
                  Email
                </a>
              </li>
              <li>
                <a
                  href={PHONE_TEL}
                  className="inline-flex items-center gap-2 text-sm text-offwhite/80 transition-colors hover:text-lime"
                >
                  <Phone size={14} strokeWidth={1.75} className="text-lime" />
                  Phone
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-7xl border-t border-lime/10 px-6 py-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-xs text-slate">
            © 2026 MT Smart Industries Sdn Bhd. All rights reserved.
          </p>

          <MagneticButton
            href="#home"
            onClick={handleBackToTop}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-lime/30 text-lime transition-colors hover:border-lime hover:bg-lime/10"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </MagneticButton>
        </div>
      </div>
    </footer>
  );
}