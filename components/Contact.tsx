"use client";

import { useState } from "react";
import { contactInfo } from "@/lib/constants";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="section-padding bg-ivory relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Get in Touch
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Contact Us
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            We would love to hear from you. Reach out for inquiries, visit
            arrangements, or spiritual guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact info + Map */}
          <div className="reveal-left">
            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden mb-8 shadow-lg border border-gold-light/20">
              <div
                className="aspect-video bg-gradient-to-br from-forest to-forest-light flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-white/70 text-sm">Interactive Map</p>
                  <a
                    href={contactInfo.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white text-sm font-medium mt-2 hover:text-gold-light transition-colors"
                  >
                    Open in Google Maps
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-5">
              {/* Address */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-xl bg-cream border border-gold-light/20 flex items-center justify-center shrink-0 group-hover:gradient-saffron group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5 text-saffron group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-forest-dark mb-1">Address</h4>
                  <p className="text-warm-gray text-sm leading-relaxed">{contactInfo.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-xl bg-cream border border-gold-light/20 flex items-center justify-center shrink-0 group-hover:gradient-saffron group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5 text-saffron group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-forest-dark mb-1">Phone</h4>
                  <a href={`tel:${contactInfo.phone}`} className="text-warm-gray text-sm hover:text-saffron transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-xl bg-cream border border-gold-light/20 flex items-center justify-center shrink-0 group-hover:gradient-saffron group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5 text-saffron group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-forest-dark mb-1">Email</h4>
                  <a href={`mailto:${contactInfo.email}`} className="text-warm-gray text-sm hover:text-saffron transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="reveal-right">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gold-light/20"
            >
              <h3 className="font-heading text-2xl font-bold text-forest-dark mb-6">
                Send us a Message
              </h3>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-forest-dark mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/50 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-forest-dark mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/50 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-300"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-semibold text-forest-dark mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/50 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-300"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-semibold text-forest-dark mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/50 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-300 resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group inline-flex items-center justify-center gap-2 px-8 py-3.5 gradient-saffron text-white font-semibold rounded-xl shadow-lg shadow-saffron/20 hover:shadow-xl hover:shadow-saffron/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          fill="currentColor"
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : submitted ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Message Sent!
                    </>
                  ) : (
                    <>
                      Send Message
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
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
