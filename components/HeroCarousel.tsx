"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { heroSlides } from "@/lib/homeCarousel";

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = heroSlides.length;

  // Navigate to a specific slide
  const goTo = useCallback(
    (index: number, dir?: number) => {
      setDirection(dir ?? (index > current ? 1 : -1));
      setCurrent((index + total) % total);
    },
    [current, total]
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(next, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, next]);

  const slide = heroSlides[current];

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  // Content stagger animation
  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0, 0, 0.2, 1] as const },
    }),
  };

  return (
    <section
      id="home"
      className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero image carousel"
      role="region"
    >
      {/* ===== Slides ===== */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* ===== Content overlay ===== */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto max-w-7xl w-full px-6 sm:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="max-w-2xl"
            >
              {/* Decorative accent */}
              <motion.div
                custom={0}
                variants={contentVariants}
                className="flex items-center gap-3 mb-5"
              >
                <span className="h-px w-10 bg-gradient-to-r from-gold-light/80 to-transparent" />
                <span className="text-gold-light text-xs sm:text-sm tracking-[0.25em] uppercase font-medium">
                  Santhigiri Ashram
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                custom={0.15}
                variants={contentVariants}
                className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white leading-[1.15] mb-5"
              >
                {slide.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                custom={0.3}
                variants={contentVariants}
                className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-xl"
              >
                {slide.subtitle}
              </motion.p>

              {/* CTA button */}
              <motion.div custom={0.45} variants={contentVariants}>
                <Link
                  href={slide.buttonLink}
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 gradient-saffron text-white font-semibold rounded-full shadow-lg shadow-saffron/30 hover:shadow-xl hover:shadow-saffron/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {slide.buttonText}
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Navigation Arrows ===== */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ===== Navigation Dots ===== */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`relative rounded-full transition-all duration-500 cursor-pointer ${
              i === current
                ? "w-9 h-3 bg-gradient-to-r from-saffron to-saffron-light"
                : "w-3 h-3 bg-white/40 hover:bg-white/70"
            }`}
          >
            {/* Autoplay progress indicator on active dot */}
            {i === current && !isPaused && (
              <motion.span
                className="absolute inset-0 rounded-full bg-white/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5, ease: "linear" }}
                style={{ originX: 0 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ===== Pause indicator ===== */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white/70 text-xs"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Paused
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Slide counter ===== */}
      <div className="absolute bottom-6 sm:bottom-8 right-5 sm:right-8 z-20 text-white/50 text-xs font-mono tracking-wider">
        <span className="text-white font-semibold">{String(current + 1).padStart(2, "0")}</span>
        <span className="mx-1">/</span>
        <span>{String(total).padStart(2, "0")}</span>
      </div>

      {/* ===== Scroll indicator ===== */}
      <div className="absolute bottom-6 sm:bottom-8 left-5 sm:left-8 z-20 hidden md:flex flex-col items-center gap-2 text-white/40">
        <a
          href="#about"
          aria-label="Scroll down"
          className="flex flex-col items-center gap-1.5 hover:text-white/70 transition-colors"
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-1 bg-white/60 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </a>
      </div>
    </section>
  );
}
