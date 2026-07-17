"use client";

import { useEffect } from "react";

/**
 * Hook that observes elements with .reveal, .reveal-left, .reveal-right
 * and adds .revealed class when they enter the viewport.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
