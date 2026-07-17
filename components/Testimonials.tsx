"use client";

import { useState, useEffect, useCallback } from "react";
import { testimonials } from "@/lib/constants";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section className="section-padding bg-ivory relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 bg-forest/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Voices of Devotion
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark">
            What Devotees Say
          </h2>
        </div>

        {/* Testimonial card */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gold-light/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />

            {/* Quote mark */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8">
              <svg
                className="w-12 h-12 text-saffron/15"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full gradient-saffron flex items-center justify-center text-white text-xl font-heading font-bold mx-auto mb-6 shadow-lg shadow-saffron/20">
                {testimonials[current].avatar}
              </div>

              {/* Quote */}
              <blockquote>
                <p className="font-heading text-xl md:text-2xl text-forest-dark italic leading-relaxed mb-8 max-w-2xl mx-auto transition-opacity duration-500">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>
              </blockquote>

              {/* Author */}
              <div>
                <p className="font-heading text-lg font-bold text-forest-dark">
                  {testimonials[current].name}
                </p>
                <p className="text-sm text-warm-gray mt-1">
                  {testimonials[current].role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Prev button */}
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full border border-gold-light/30 flex items-center justify-center text-warm-gray hover:text-saffron hover:border-saffron transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-saffron"
                      : "w-2.5 bg-gold-light hover:bg-gold"
                  }`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full border border-gold-light/30 flex items-center justify-center text-warm-gray hover:text-saffron hover:border-saffron transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
