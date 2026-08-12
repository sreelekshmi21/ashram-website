"use client";

import { useState } from "react";
import { venueDetails } from "@/lib/mahamahotsavData";

export default function VenueContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Pilgrim Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;
    setSubmitted(true);
  };

  return (
    <section id="venue-contact" className="section-padding bg-ivory relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Pilgrim Information
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Venue, Travel &amp; Contact
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Plan your visit to Santhigiri Ashram, Pothencode. Find transportation options, accommodation guidance, and direct support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Side: Venue & Travel info */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Venue Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gold-light/20">
              <h3 className="font-heading text-2xl font-bold text-forest-dark mb-4 flex items-center gap-2">
                <span>📍</span>
                <span>Ashram Campus Location</span>
              </h3>
              
              <p className="text-forest-dark font-semibold text-lg mb-1">
                {venueDetails.locationName}
              </p>
              <p className="text-warm-gray text-sm mb-6">
                {venueDetails.city}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gold-light/20 pt-6">
                <div className="bg-cream/40 p-4 rounded-2xl border border-gold-light/30">
                  <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider block mb-1">
                    ☎️ Centenary Helpline
                  </span>
                  <p className="font-bold text-forest-dark text-base">
                    {venueDetails.helplinePhone}
                  </p>
                </div>

                <div className="bg-cream/40 p-4 rounded-2xl border border-gold-light/30">
                  <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider block mb-1">
                    ✉️ Official Email
                  </span>
                  <p className="font-bold text-forest-dark text-sm truncate">
                    {venueDetails.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Travel Guide */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gold-light/20">
              <h3 className="font-heading text-2xl font-bold text-forest-dark mb-4 flex items-center gap-2">
                <span>🚆</span>
                <span>How to Reach Us</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 p-3 bg-ivory rounded-xl">
                  <span className="text-xl">🚂</span>
                  <div>
                    <strong className="text-forest-dark block">By Train</strong>
                    <span className="text-warm-gray">{venueDetails.nearestRailway}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-ivory rounded-xl">
                  <span className="text-xl">✈️</span>
                  <div>
                    <strong className="text-forest-dark block">By Flight</strong>
                    <span className="text-warm-gray">{venueDetails.nearestAirport}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-ivory rounded-xl">
                  <span className="text-xl">🚌</span>
                  <div>
                    <strong className="text-forest-dark block">By Bus</strong>
                    <span className="text-warm-gray">{venueDetails.nearestBusStand}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Inquiry Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gold-light/20 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-2xl font-bold text-forest-dark mb-2">
                  Pilgrim &amp; Press Inquiry
                </h3>
                <p className="text-warm-gray text-xs mb-6 leading-relaxed">
                  Have questions about accommodation, bulk pilgrim passes, or volunteering? Send us a message below.
                </p>

                {submitted ? (
                  <div className="bg-cream rounded-2xl p-6 text-center border border-gold-light/30 animate-fade-in">
                    <span className="text-4xl block mb-2">🌸</span>
                    <h4 className="font-bold text-forest-dark text-lg mb-1">Inquiry Received</h4>
                    <p className="text-warm-gray text-xs mb-4">
                      Thank you for reaching out. Our Mahamahotsav helpdesk team will contact you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs text-saffron font-bold underline"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-forest-dark mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="Your Name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gold-light/40 text-sm text-forest-dark bg-cream/20 focus:outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest-dark mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gold-light/40 text-sm text-forest-dark bg-cream/20 focus:outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest-dark mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gold-light/40 text-sm text-forest-dark bg-cream/20 focus:outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest-dark mb-1">
                        Inquiry Details *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Write your query regarding accommodation, pass, or volunteering..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gold-light/40 text-sm text-forest-dark bg-cream/20 focus:outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 gradient-saffron text-white font-bold text-sm rounded-full shadow-lg shadow-saffron/20 hover:shadow-xl transition-all duration-300"
                    >
                      Submit Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
