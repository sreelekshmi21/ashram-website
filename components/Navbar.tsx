"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, languages } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const getHref = (href: string) => {
    if (href.startsWith("#")) {
      return pathname === "/" ? href : `/${href}`;
    }
    return href;
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const selectedLang = languages.find((l) => l.code === currentLang);

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass shadow-lg shadow-black/5 border-b border-gold-light/30"
            : "bg-transparent"
        }`}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Santhigiri Ashram — Home"
          >
            <span className="text-2xl lg:text-3xl" aria-hidden="true">🙏</span>
            <span
              className={`font-heading text-lg lg:text-xl font-bold tracking-wide transition-colors duration-300 ${
                isScrolled ? "text-forest-dark" : "text-white"
              }`}
            >
              Santhigiri
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1" role="menubar">
            {navItems.map((item) => (
              <li key={item.href} role="none">
                <Link
                  href={getHref(item.href)}
                  role="menuitem"
                  className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300 rounded-lg hover:bg-saffron/10 group ${
                    isScrolled
                      ? "text-forest-dark hover:text-saffron"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-saffron rounded-full transition-all duration-300 group-hover:w-4/5" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side: search + lang + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              aria-label="Search"
              className={`p-2 rounded-lg transition-colors duration-300 hover:bg-saffron/10 ${
                isScrolled ? "text-forest-dark" : "text-white"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Language selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                onBlur={() => setTimeout(() => setIsLangOpen(false), 150)}
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                aria-label="Select language"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  isScrolled
                    ? "text-forest-dark border-gold-light/50 hover:border-saffron"
                    : "text-white border-white/30 hover:border-white/60"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {selectedLang?.label}
                <svg className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLangOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-gold-light/30 overflow-hidden animate-fade-in"
                >
                  {languages.map((lang) => (
                    <li key={lang.code} role="option" aria-selected={lang.code === currentLang}>
                      <button
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-cream ${
                          lang.code === currentLang
                            ? "text-saffron font-semibold bg-cream"
                            : "text-forest-dark"
                        }`}
                      >
                        {lang.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                isScrolled ? "text-forest-dark" : "text-white"
              }`}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                    isScrolled ? "bg-forest-dark" : "bg-white"
                  } ${isMobileOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                    isScrolled ? "bg-forest-dark" : "bg-white"
                  } ${isMobileOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                    isScrolled ? "bg-forest-dark" : "bg-white"
                  } ${isMobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-forest-dark/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-500 ease-out ${
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 pt-20">
            {/* Nav links */}
            <nav aria-label="Mobile navigation">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={getHref(item.href)}
                      onClick={() => setIsMobileOpen(false)}
                      className="block px-4 py-3 text-forest-dark font-medium rounded-lg hover:bg-cream hover:text-saffron transition-colors duration-200"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile language selector */}
            <div className="mt-8 pt-6 border-t border-gold-light/30">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-warm-gray-light mb-3">
                Language
              </p>
              <div className="flex gap-2 px-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      lang.code === currentLang
                        ? "bg-saffron text-white border-saffron"
                        : "text-forest-dark border-gold-light/50 hover:border-saffron"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
