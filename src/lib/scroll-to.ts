export function scrollToId(id: string) {
  const target = document.querySelector(id);
  if (!target) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(target as HTMLElement, { duration: 1.4 });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}
