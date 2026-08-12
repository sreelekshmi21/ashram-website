"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/lib/animations";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  registrationFee: string | number;
  category?: string | null;
  gradient?: string | null;
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All" },
  { id: "MONTHLY", label: "Monthly" },
  { id: "YEARLY", label: "Yearly" },
  { id: "SPECIAL", label: "Special" },
];

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Trigger scroll reveal observer whenever events or loading state changes
  useScrollReveal();

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      } catch (error) {
        console.error("Failed to load events from API:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents =
    activeCategory === "ALL"
      ? events
      : events.filter(
          (event) =>
            (event.category || "SPECIAL").toUpperCase() === activeCategory
        );

  const getCategoryLabel = (catId: string) => {
    const tab = CATEGORY_TABS.find((t) => t.id === catId);
    return tab ? tab.label : catId;
  };

  return (
    <section id="events" className="section-padding gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-10 reveal revealed">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Mark Your Calendar
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Upcoming Events
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Join us in our upcoming celebrations, retreats, and community gatherings.
          </p>
        </div>

        {/* Filter Tabs - Responsive on mobile with touch-friendly scroll */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-12 overflow-x-auto pb-3 pt-1 px-2 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-saffron text-white shadow-md shadow-saffron/20 scale-105"
                    : "bg-white/80 hover:bg-white text-forest-dark border border-gold-light/30 hover:border-saffron/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white/60 rounded-2xl border border-gold-light/20 max-w-xl mx-auto">
            <p className="text-warm-gray text-lg animate-pulse">
              Loading upcoming events...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white/60 rounded-2xl border border-gold-light/20 max-w-xl mx-auto">
            <p className="text-warm-gray text-lg">
              {activeCategory === "ALL"
                ? "No upcoming events at the moment. Please check back soon!"
                : `No ${getCategoryLabel(
                    activeCategory
                  )} events scheduled at the moment. Please check back soon!`}
            </p>
          </div>
        ) : (
          /* Events grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const startDate = new Date(event.startDate);
              const day = String(startDate.getDate()).padStart(2, "0");
              const month = startDate.toLocaleString("en-US", { month: "short" });
              const fee = Number(event.registrationFee);
              const gradient = event.gradient || "from-saffron to-saffron-light";
              const categoryName = getCategoryLabel(
                (event.category || "SPECIAL").toUpperCase()
              );

              return (
                <article
                  key={event.id}
                  className="reveal revealed group bg-white rounded-2xl overflow-hidden shadow-md shadow-black/5 card-hover border border-gold-light/10 animate-fade-in-up flex flex-col justify-between"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    {/* Event image header */}
                    <div className={`relative h-48 bg-gradient-to-br ${gradient}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl opacity-30">📅</span>
                      </div>

                      {/* Date badge */}
                      <div className="absolute top-4 left-4 bg-white rounded-xl p-2.5 shadow-lg text-center min-w-[60px]">
                        <p className="text-2xl font-heading font-bold text-saffron leading-none">
                          {day}
                        </p>
                        <p className="text-xs font-semibold text-forest-dark uppercase tracking-wider mt-1">
                          {month}
                        </p>
                      </div>

                      {/* Category Badge & Fee badge */}
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-md">
                          <p className="text-xs font-bold text-forest-dark">
                            {fee > 0 ? `₹${fee.toLocaleString("en-IN")}` : "Free"}
                          </p>
                        </div>
                        <div className="bg-forest-dark/80 backdrop-blur-sm rounded-md px-2.5 py-0.5 shadow-sm">
                          <p className="text-[10px] font-semibold text-gold-light uppercase tracking-wider">
                            {categoryName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Event details */}
                    <div className="p-6">
                      <h3 className="font-heading text-xl font-bold text-forest-dark mb-3 group-hover:text-saffron transition-colors duration-300">
                        {event.title}
                      </h3>
                      <p className="text-warm-gray text-sm leading-relaxed mb-5">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-0">
                    <Link
                      href={`/register/${event.slug}`}
                      className="inline-flex items-center gap-2 text-saffron font-semibold text-sm hover:text-saffron-dark transition-colors group/btn"
                    >
                      Register Now
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
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
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
