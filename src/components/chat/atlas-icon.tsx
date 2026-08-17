// A coded compass-needle mark — not a generated image — echoing the site's
// icon language (lime glyph on a navy-surface circle) while reading
// distinctly as "navigation/guidance," fitting Atlas's role as a guide
// through the site's content.
export function AtlasIcon({ size = 36 }: { size?: number }) {
  const glyphSize = Math.round(size * 0.56);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full bg-surface"
      style={{ width: size, height: size }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-50 blur-md"
        style={{
          background:
            "radial-gradient(circle, rgba(198, 217, 46, 0.35), transparent 70%)",
        }}
      />
      <svg
        width={glyphSize}
        height={glyphSize}
        viewBox="0 0 24 24"
        fill="none"
        className="relative"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" stroke="#C6D92E" strokeWidth="1.3" opacity="0.4" />
        <path d="M12 4.2 L14.4 12 L12 19.8 L9.6 12 Z" fill="#C6D92E" />
        <circle cx="12" cy="12" r="1.4" fill="#0B1F3A" />
      </svg>
    </div>
  );
}
