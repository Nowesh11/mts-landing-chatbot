// Global type declarations for window properties set by app code.
//


export {};

declare global {
  interface Window {
    __lenis?: import("lenis").default;
    __openChat?: () => void;
  }
}