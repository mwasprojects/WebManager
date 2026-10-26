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
      "This is a UI preview. Email delivery and account creation are not connected yet, so nothing was sent or saved."
    );
  }

  const isSignup = mode === "signup";

  return (
    <main className={`entry-page ${isSignup ? "entry-page--signup" : "entry-page--signin"}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="WebManager home">
          <span className="brand-symbol" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="brand-word">webmanager<span className="brand-period">.</span></span>
        </a>
        <span className="topbar-note"><span className="topbar-dot" /> One connected workspace</span>
      </header>

      <div className="entry-layout">
        <section className="story-panel" aria-label="About WebManager">
          <div className="story-orbit" aria-hidden="true">
            <div className="orbit orbit--outer" />
            <div className="orbit orbit--middle" />
            <div className="orbit orbit--inner" />
            <div className="orbit-core"><span className="core-glyph">w.</span></div>
            <span className="orbit-node orbit-node--one" />
            <span className="orbit-node orbit-node--two" />
            <span className="orbit-node orbit-node--three" />
            <span className="orbit-node orbit-node--four" />
            <span className="orbit-spark orbit-spark--one">✳</span>
            <span className="orbit-spark orbit-spark--two">✦</span>
          </div>

          <div className="story-copy">
            <p className="overline"><span className="overline-line" /> YOUR SPACE, IN SYNC</p>
            <h1>{isSignup ? <>Make room for<br /><em>what’s next.</em></> : <>Your digital life.<br /><em>Less scattered.</em></>}</h1>
            <p className="story-description">
              {isSignup
                ? "Bring your tools, projects and everyday work into one thoughtfully connected space."
                : "A calmer home for the tools you use, the things you build and the work that moves you forward."}
            </p>
          </div>

          <div className="story-bottom">
            <div className="mini-avatars" aria-hidden="true"><span>W</span><span>✳</span><span>↗</span></div>
            <p><strong>One account.</strong> A world of possibilities.</p>
            <span className="story-index">{isSignup ? "02" : "01"} <i>/</i> 02</span>
          </div>
        </section>

        <section className="auth-panel" aria-label={isSignup ? "Create a WebManager account" : "Sign in to WebManager"}>
          <div className="auth-card">
            <div className="mobile-intro">
              <span className="mobile-kicker">{isSignup ? "A FRESH START" : "GOOD TO HAVE YOU BACK"}</span>
              <h1>{isSignup ? <>Make room for<br /><em>what’s next.</em></> : <>Your digital life.<br /><em>Less scattered.</em></>}</h1>
            </div>

            <div className="auth-heading">
              <span className="auth-step">{isSignup ? "LET’S GET YOU SET UP" : "PICK UP WHERE YOU LEFT OFF"}</span>
              <h2>{isSignup ? "Create your space" : "Welcome back."}</h2>
              <p>{isSignup ? "Start with the basics. You can shape your workspace as you go." : "Enter your email and we’ll help you get back in."}</p>
            </div>

            <div className="auth-switch" aria-label="Choose account action">
              <button type="button" className={!isSignup ? "switch-option is-active" : "switch-option"} aria-pressed={!isSignup} onClick={() => changeMode("signin")}>Sign in <span>↗</span></button>
              <button type="button" className={isSignup ? "switch-option is-active" : "switch-option"} aria-pressed={isSignup} onClick={() => changeMode("signup")}>Create account <span>＋</span></button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="input-group">
                  <span>Your name</span>
                  <div className="input-wrap">
                    <span className="input-icon" aria-hidden="true">✳</span>
                    <input autoComplete="name" name="name" type="text" placeholder="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} required />
                  </div>
                </label>
              )}

              <label className="input-group">
                <span>Email address</span>
                <div className="input-wrap">
                  <span className="input-icon input-icon--mail" aria-hidden="true">＠</span>
                  <input autoComplete="email" name="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
              </label>

              {isSignup && <p className="signup-hint"><span aria-hidden="true">✦</span> No password to remember. We’ll use a one-time email code when authentication is connected.</p>}

              <button className="submit-button" type="submit">
                <span>{isSignup ? "Create my account" : "Continue with email"}</span>
                <span className="submit-arrow" aria-hidden="true">↗</span>
              </button>
            </form>

            {notice && <div className="preview-notice" role="status"><strong>Preview mode</strong><span>{notice}</span></div>}

            <div className="privacy-note">
              <span className="privacy-mark" aria-hidden="true">◇</span>
              <p><strong>Your account, your boundaries.</strong><br />Portal access will be based on your permissions—not just the page you visit.</p>
            </div>

            <p className="legal-note">By continuing, you agree to use WebManager responsibly. Terms and privacy details will be published before launch.</p>
          </div>

          <footer className="auth-footer">
            <span>© {new Date().getFullYear()} WebManager</span>
            <span className="preview-status"><i /> Design preview</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
