"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setFieldErrors({});

      // Client-side validation
      const errors: Record<string, string> = {};
      if (!email.trim()) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.email = "Enter a valid email address";
      if (!password) errors.password = "Password is required";
      else if (password.length < 8)
        errors.password = "Password must be at least 8 characters";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, rememberMe }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.fieldErrors) {
            setFieldErrors(data.fieldErrors);
          } else {
            setError(data.error || "Login failed. Please try again.");
          }
          return;
        }

        // Successful login — redirect
        router.push(redirectTo);
        router.refresh();
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, rememberMe, redirectTo, router]
  );

  return (
    <div className="admin-login-page">
      {/* Background decorations */}
      <div className="admin-login-bg-pattern" />
      <div className="admin-login-bg-glow admin-login-bg-glow--top" />
      <div className="admin-login-bg-glow admin-login-bg-glow--bottom" />

      <div className="admin-login-container">
        {/* Branding */}
        <div className="admin-login-brand">
          <div className="admin-login-logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="23" stroke="#C9A84C" strokeWidth="2" />
              <path
                d="M24 8C24 8 18 16 18 22C18 25.3 20.7 28 24 28C27.3 28 30 25.3 30 22C30 16 24 8 24 8Z"
                fill="#E8751A"
                opacity="0.9"
              />
              <path
                d="M24 14C24 14 21 19 21 22.5C21 24.2 22.3 25.5 24 25.5C25.7 25.5 27 24.2 27 22.5C27 19 24 14 24 14Z"
                fill="#F5A623"
              />
              <path
                d="M14 30C16 28 19.5 27 24 27C28.5 27 32 28 34 30"
                stroke="#2D5A3D"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 34C13 31 18 29 24 29C30 29 35 31 38 34"
                stroke="#3D7A53"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M7 38C11 34 17 31 24 31C31 31 37 34 41 38"
                stroke="#3D7A53"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.3"
              />
            </svg>
          </div>
          <h1 className="admin-login-title">Santhigiri Ashram</h1>
          <p className="admin-login-subtitle">Administration Portal</p>
        </div>

        {/* Login Card */}
        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <h2 className="admin-login-card-title">Welcome Back</h2>
            <p className="admin-login-card-desc">
              Sign in to access the admin panel
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="admin-login-error" role="alert">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="14" r="0.75" fill="currentColor" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className="admin-login-field">
              <label htmlFor="admin-email" className="admin-login-label">
                Email Address
              </label>
              <div className={`admin-login-input-wrap ${fieldErrors.email ? "admin-login-input-wrap--error" : ""}`}>
                <svg
                  className="admin-login-input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="4"
                    width="16"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2 6L10 11L18 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  placeholder="admin@santhigiriashram.org"
                  autoComplete="email"
                  disabled={isLoading}
                  className="admin-login-input"
                />
              </div>
              {fieldErrors.email && (
                <p className="admin-login-field-error">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="admin-login-field">
              <label htmlFor="admin-password" className="admin-login-label">
                Password
              </label>
              <div className={`admin-login-input-wrap ${fieldErrors.password ? "admin-login-input-wrap--error" : ""}`}>
                <svg
                  className="admin-login-input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 9V6C7 4.34 8.34 3 10 3C11.66 3 13 4.34 13 6V9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="13.5" r="1" fill="currentColor" />
                </svg>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="admin-login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-login-toggle-pw"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3L17 17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.36 8.36C7.87 8.85 7.57 9.53 7.57 10.28C7.57 11.63 8.65 12.72 10 12.72C10.75 12.72 11.43 12.41 11.92 11.92"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5.5 5.72C3.8 7.08 2.5 9 2 10.28C3.27 13.84 6.37 16.28 10 16.28C11.55 16.28 13 15.82 14.25 15.02"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16.77 12.64C17.53 11.52 18 10.28 18 10.28C16.73 6.72 13.63 4.28 10 4.28C9.47 4.28 8.95 4.33 8.45 4.42"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="admin-login-field-error">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="admin-login-remember">
              <label className="admin-login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="admin-login-checkbox"
                />
                <span className="admin-login-checkbox-custom" />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="admin-login-submit"
            >
              {isLoading ? (
                <span className="admin-login-spinner-wrap">
                  <span className="admin-login-spinner" />
                  <span>Signing in…</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="admin-login-footer">
          © {new Date().getFullYear()} Santhigiri Ashram. All rights reserved.
        </p>
      </div>

      {/* Scoped styles */}
      <style>{`
        /* ===== Admin Login — Scoped Styles ===== */

        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #0F2318 0%, #1A3A25 30%, #1E4530 60%, #162D20 100%);
          font-family: var(--font-body);
          padding: 1.5rem;
        }

        /* Background decorations */
        .admin-login-bg-pattern {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(232, 117, 26, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(201, 168, 76, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(45, 90, 61, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .admin-login-bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.4;
        }

        .admin-login-bg-glow--top {
          top: -200px;
          right: -100px;
          background: radial-gradient(circle, rgba(232, 117, 26, 0.15) 0%, transparent 70%);
        }

        .admin-login-bg-glow--bottom {
          bottom: -200px;
          left: -100px;
          background: radial-gradient(circle, rgba(201, 168, 76, 0.1) 0%, transparent 70%);
        }

        /* Container */
        .admin-login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          animation: adminFadeInUp 0.6s ease-out;
        }

        @keyframes adminFadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Branding */
        .admin-login-brand {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(201, 168, 76, 0.2);
          margin-bottom: 1rem;
          backdrop-filter: blur(8px);
        }

        .admin-login-title {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 700;
          color: #F0E6C8;
          margin: 0 0 0.25rem;
          letter-spacing: -0.01em;
        }

        .admin-login-subtitle {
          font-size: 0.875rem;
          color: rgba(240, 230, 200, 0.5);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 500;
        }

        /* Card */
        .admin-login-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
        }

        .admin-login-card-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .admin-login-card-title {
          font-family: var(--font-heading);
          font-size: 1.375rem;
          font-weight: 600;
          color: #F0F7F2;
          margin: 0 0 0.375rem;
        }

        .admin-login-card-desc {
          font-size: 0.875rem;
          color: rgba(240, 247, 242, 0.5);
          margin: 0;
        }

        /* Error alert */
        .admin-login-error {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.25);
          color: #FCA5A5;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          animation: adminShake 0.4s ease-in-out;
        }

        @keyframes adminShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        /* Fields */
        .admin-login-field {
          margin-bottom: 1.25rem;
        }

        .admin-login-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgba(240, 247, 242, 0.7);
          margin-bottom: 0.5rem;
          letter-spacing: 0.01em;
        }

        .admin-login-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0 1rem;
          height: 48px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .admin-login-input-wrap:focus-within {
          border-color: rgba(201, 168, 76, 0.5);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1);
          background: rgba(255, 255, 255, 0.07);
        }

        .admin-login-input-wrap--error {
          border-color: rgba(220, 38, 38, 0.5);
        }

        .admin-login-input-wrap--error:focus-within {
          border-color: rgba(220, 38, 38, 0.6);
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .admin-login-input-icon {
          flex-shrink: 0;
          color: rgba(240, 247, 242, 0.35);
        }

        .admin-login-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #F0F7F2;
          font-size: 0.9375rem;
          font-family: var(--font-body);
          line-height: 1;
        }

        .admin-login-input::placeholder {
          color: rgba(240, 247, 242, 0.25);
        }

        .admin-login-input:-webkit-autofill,
        .admin-login-input:-webkit-autofill:hover,
        .admin-login-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #F0F7F2;
          -webkit-box-shadow: 0 0 0 1000px rgba(26, 58, 37, 0.98) inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        .admin-login-toggle-pw {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(240, 247, 242, 0.35);
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .admin-login-toggle-pw:hover {
          color: rgba(240, 247, 242, 0.7);
        }

        .admin-login-field-error {
          font-size: 0.8125rem;
          color: #FCA5A5;
          margin: 0.375rem 0 0;
        }

        /* Remember me */
        .admin-login-remember {
          margin-bottom: 1.5rem;
        }

        .admin-login-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: rgba(240, 247, 242, 0.55);
          user-select: none;
        }

        .admin-login-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .admin-login-checkbox-custom {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
          position: relative;
          transition: border-color 0.2s, background 0.2s;
        }

        .admin-login-checkbox:checked + .admin-login-checkbox-custom {
          background: #C9A84C;
          border-color: #C9A84C;
        }

        .admin-login-checkbox:checked + .admin-login-checkbox-custom::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 5px;
          width: 5px;
          height: 9px;
          border: solid #1A3A25;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .admin-login-checkbox:focus-visible + .admin-login-checkbox-custom {
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.2);
        }

        /* Submit button */
        .admin-login-submit {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #C9A84C 0%, #E8751A 100%);
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }

        .admin-login-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(201, 168, 76, 0.25);
        }

        .admin-login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .admin-login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-login-spinner-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .admin-login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: adminSpin 0.6s linear infinite;
        }

        @keyframes adminSpin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .admin-login-footer {
          text-align: center;
          font-size: 0.75rem;
          color: rgba(240, 247, 242, 0.25);
          margin-top: 2rem;
        }

        /* ===== Responsive ===== */
        @media (max-width: 480px) {
          .admin-login-page {
            padding: 1rem;
            align-items: flex-start;
            padding-top: 3rem;
          }

          .admin-login-card {
            padding: 1.5rem;
          }

          .admin-login-title {
            font-size: 1.5rem;
          }

          .admin-login-logo {
            width: 60px;
            height: 60px;
          }

          .admin-login-logo svg {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
}
