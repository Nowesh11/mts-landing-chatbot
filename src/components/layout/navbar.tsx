"use client";

import { useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { scrollToId } from "@/lib/scroll-to";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Solutions", href: "#solutions" },
  { label: "Sector Solutions", href: "#sector-solutions" },
  { label: "Why Us", href: "#why-us" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

function NavLink({
  label,
  href,
  active,
  onHover,
  onLeave,
}: {
  label: string;
  href: string;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(href);
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative py-1 text-sm text-offwhite/80 transition-colors hover:text-offwhite"
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-lime"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
    </a>
  );
}

export function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 220], [0, 1]);
  const blur = useTransform(scrollY, [0, 220], [0, 12]);
  const borderOpacity = useTransform(scrollY, [0, 220], [0, 0.12]);
  const backdropFilter = useTransform(blur, (b) => `blur(${b}px)`);
  const backgroundColor = useTransform(
    bgOpacity,
    (o) => `rgba(11, 31, 58, ${o})`
  );
  const borderColor = useTransform(
    borderOpacity,
    (o) => `rgba(126, 147, 170, ${o})`
  );

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[120px] bg-gradient-to-b from-navy/60 to-transparent"
      />

      <motion.header
        style={{ backgroundColor, backdropFilter, borderColor }}
        className="fixed inset-x-0 top-0 z-50 border-b"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("#home");
            }}
            className="flex items-center"
          >
            <Image
              src="/images/MTS_LOGO_white.png"
              alt="MTS Industries"
              width={138}
              height={48}
              className="h-12 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
              priority
            />
          </a>

          <div
            className="hidden items-center gap-8 lg:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {LINKS.map((link) => (
              <NavLink
                key={link.href}
                label={link.label}
                href={link.href}
                active={hovered === link.href}
                onHover={() => setHovered(link.href)}
                onLeave={() => {}}
              />
            ))}
          </div>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("#contact");
            }}
            className="hidden rounded-full border border-slate/40 px-5 py-2 text-sm text-offwhite transition-colors hover:border-lime hover:text-lime lg:inline-block"
          >
            Get in Touch
          </a>

          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(true)}
            className="text-offwhite lg:hidden"
          >
            <Menu size={26} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-navy lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <Image
                src="/images/MTS_LOGO_white.png"
                alt="MTS Industries"
                width={126}
                height={44}
                className="h-11 w-auto object-contain"
              />
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="text-offwhite"
              >
                <X size={26} />
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="flex flex-1 flex-col justify-center gap-6 px-8"
            >
              {LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    scrollToId(link.href);
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-3xl text-offwhite"
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
