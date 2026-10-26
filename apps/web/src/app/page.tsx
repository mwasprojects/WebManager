"use client";

import { FormEvent, useState } from "react";

type AuthMode = "signin" | "signup";

export default function HomePage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setNotice("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "The sign-in interface is ready for the next development step, but authentication is not connected yet. No email was sent and no account was created."
    );
  }

  return (
    <main className="auth-shell">
      <section className="intro-panel" aria-label="About WebManager">
        <a className="brand" href="/" aria-label="WebManager home">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>WebManager</span>
        </a>

        <div className="intro-copy">
          <span className="eyebrow">ONE PLATFORM. MANY POSSIBILITIES.</span>
          <h1>Everything useful, in one place.</h1>
          <p>
            A home for the tools you need, from everyday utilities to
            productivity and developer apps.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true">✳</span>
              <div>
                <strong>One account</strong>
                <span>Move between your approved WebManager apps.</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true">⌁</span>
              <div>
                <strong>Passwordless by design</strong>
                <span>Use a one-time email code instead of remembering a password.</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true">◈</span>
              <div>
                <strong>Access with care</strong>
                <span>Your account permissions determine which portals you can use.</span>
              </div>
            </div>
          </div>
        </div>

        <p className="panel-footnote">A clearer way to get things done.</p>
      </section>

      <section className="form-panel" aria-label="Account access">
        <div className="mobile-brand">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>WebManager</span>
        </div>

        <div className="auth-card">
          <div className="card-heading">
            <span className="eyebrow">YOUR WORKSPACE STARTS HERE</span>
            <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
            <p>
              {mode === "signin"
                ? "Enter your email to continue to WebManager."
                : "Get started with your email address. No password needed."}
            </p>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Account action">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={mode === "signin" ? "mode-tab active" : "mode-tab"}
              onClick={() => changeMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={mode === "signup" ? "mode-tab active" : "mode-tab"}
              onClick={() => changeMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className="field">
                <span>Your name</span>
                <input
                  autoComplete="name"
                  name="name"
                  type="text"
                  placeholder="How should we call you?"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}

            <label className="field">
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <button className="primary-button" type="submit">
              {mode === "signin" ? "Continue with email" : "Create account"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          {notice && (
            <div className="prototype-notice" role="status">
              <strong>Preview only</strong>
              <p>{notice}</p>
            </div>
          )}

          <div className="security-note">
            <span className="lock-icon" aria-hidden="true">▣</span>
            <p>
              We plan to use short-lived email codes and secure sessions.
              Your portal access will depend on your account permissions.
            </p>
          </div>

          <p className="terms-note">
            By continuing, you agree to use WebManager responsibly and follow
            the platform’s terms and privacy policy when they are published.
          </p>
        </div>

        <footer className="form-footer">
          <span>© {new Date().getFullYear()} WebManager</span>
          <span className="status-pill"><span /> UI preview</span>
        </footer>
      </section>
    </main>
  );
}
