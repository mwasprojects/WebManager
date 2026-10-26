"use client";

import { FormEvent, useEffect, useState } from "react";

type Portal = "user" | "developer" | "admin";
type AuthMode = "signin" | "signup";
type Stage = "email" | "code";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const PORTAL = (process.env.NEXT_PUBLIC_PORTAL_KIND ?? "user") as Portal;

export default function HomePage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [stage, setStage] = useState<Stage>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const isSignup = mode === "signup";
  const portalLabel = PORTAL === "admin" ? "Administrator" : PORTAL === "developer" ? "Developer" : "User";

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: "include",
      headers: { "x-webmanager-portal": PORTAL }
    }).then(async (response) => {
      if (response.ok) setSignedIn(true);
    }).catch(() => {});
  }, []);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStage("email");
    setNotice("");
    setError("");
  }

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/request-code`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-webmanager-portal": PORTAL },
        body: JSON.stringify({ email, name, intent: mode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to request a code.");
      setStage("code");
      setNotice(data.message ?? "If this account can use this portal, a verification code will be emailed shortly.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to contact the authentication service.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-webmanager-portal": PORTAL },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to verify the code.");
      setSignedIn(true);
      setNotice("You're signed in. Your session is stored in a secure, HTTP-only cookie.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to contact the authentication service.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-webmanager-portal": PORTAL },
        body: "{}"
      });
      if (!response.ok) throw new Error("Could not sign out.");
      setSignedIn(false);
      setStage("email");
      setCode("");
      setNotice("You have been signed out.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`entry-page entry-page--${PORTAL} ${isSignup ? "entry-page--signup" : "entry-page--signin"}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="WebManager home">
          <span className="brand-symbol" aria-hidden="true"><span /><span /><span /><span /></span>
          <span className="brand-word">webmanager<span className="brand-period">.</span></span>
        </a>
        <span className="topbar-note"><span className="topbar-dot" /> {portalLabel} portal</span>
      </header>

      <div className="entry-layout">
        <section className="story-panel" aria-label="About WebManager">
          <div className="story-orbit" aria-hidden="true">
            <div className="orbit orbit--outer" /><div className="orbit orbit--middle" /><div className="orbit orbit--inner" />
            <div className="orbit-core"><span className="core-glyph">w.</span></div>
            <span className="orbit-node orbit-node--one" /><span className="orbit-node orbit-node--two" />
            <span className="orbit-node orbit-node--three" /><span className="orbit-node orbit-node--four" />
            <span className="orbit-spark orbit-spark--one">✳</span><span className="orbit-spark orbit-spark--two">✦</span>
          </div>
          <div className="story-copy">
            <p className="overline"><span className="overline-line" /> YOUR SPACE, IN SYNC</p>
            <h1>{isSignup ? <>Make room for<br /><em>what’s next.</em></> : <>Your digital life.<br /><em>Less scattered.</em></>}</h1>
            <p className="story-description">
              {PORTAL === "admin" ? "A controlled space for authorized platform administration."
                : PORTAL === "developer" ? "A dedicated workspace for authorized developers and builders."
                : isSignup ? "Bring your tools, projects and everyday work into one thoughtfully connected space."
                : "A calmer home for the tools you use, the things you build and the work that moves you forward."}
            </p>
          </div>
          <div className="story-bottom">
            <div className="mini-avatars" aria-hidden="true"><span>W</span><span>✳</span><span>↗</span></div>
            <p><strong>One account.</strong> Access determined by permissions.</p><span className="story-index">01 <i>/</i> 03</span>
          </div>
        </section>

        <section className="auth-panel" aria-label={`${portalLabel} portal sign in`}>
          <div className="auth-card">
            <div className="mobile-intro">
              <span className="mobile-kicker">{portalLabel.toUpperCase()} PORTAL</span>
              <h1>{isSignup ? <>Make room for<br /><em>what’s next.</em></> : <>Your digital life.<br /><em>Less scattered.</em></>}</h1>
            </div>
            <div className="auth-heading">
              <span className="auth-step">{signedIn ? "SESSION ACTIVE" : stage === "code" ? "CHECK YOUR EMAIL" : `${portalLabel.toUpperCase()} ACCESS`}</span>
              <h2>{signedIn ? "You're signed in." : stage === "code" ? "Enter your code." : isSignup ? "Create your space" : "Welcome back."}</h2>
              <p>{signedIn ? "Your identity was verified by the shared authentication service." : stage === "code" ? `Enter the six-digit code sent to ${email}.` : isSignup ? "Start with your name and email. No password required." : "Enter your email to request a one-time verification code."}</p>
            </div>

            {PORTAL === "user" && stage === "email" && !signedIn && (
              <div className="auth-switch" aria-label="Choose account action">
                <button type="button" className={!isSignup ? "switch-option is-active" : "switch-option"} aria-pressed={!isSignup} onClick={() => changeMode("signin")}>Sign in <span>↗</span></button>
                <button type="button" className={isSignup ? "switch-option is-active" : "switch-option"} aria-pressed={isSignup} onClick={() => changeMode("signup")}>Create account <span>＋</span></button>
              </div>
            )}

            {!signedIn && stage === "email" && (
              <form className="auth-form" onSubmit={handleRequestCode}>
                {isSignup && PORTAL === "user" && <label className="input-group"><span>Your name</span><div className="input-wrap"><span className="input-icon" aria-hidden="true">✳</span><input autoComplete="name" name="name" type="text" maxLength={80} placeholder="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} required /></div></label>}
                <label className="input-group"><span>Email address</span><div className="input-wrap"><span className="input-icon input-icon--mail" aria-hidden="true">＠</span><input autoComplete="email" name="email" type="email" maxLength={254} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label>
                {isSignup && PORTAL === "user" && <p className="signup-hint"><span aria-hidden="true">✦</span> We'll email a one-time code to verify your address.</p>}
                <button className="submit-button" type="submit" disabled={busy}><span>{busy ? "Please wait…" : isSignup ? "Create my account" : "Email me a code"}</span><span className="submit-arrow" aria-hidden="true">↗</span></button>
              </form>
            )}

            {!signedIn && stage === "code" && (
              <form className="auth-form" onSubmit={handleVerifyCode}>
                <label className="input-group"><span>Six-digit verification code</span><div className="input-wrap"><span className="input-icon" aria-hidden="true">✳</span><input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} name="code" placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required /></div></label>
                <button className="submit-button" type="submit" disabled={busy || code.length !== 6}><span>{busy ? "Verifying…" : "Verify and sign in"}</span><span className="submit-arrow" aria-hidden="true">↗</span></button>
                <button className="switch-option" type="button" onClick={() => { setStage("email"); setCode(""); setError(""); }}>Use a different email / request a new code</button>
              </form>
            )}

            {signedIn && <button className="submit-button" type="button" onClick={handleLogout} disabled={busy}><span>{busy ? "Please wait…" : "Sign out"}</span><span className="submit-arrow" aria-hidden="true">↗</span></button>}
            {notice && <div className="preview-notice" role="status"><strong>{signedIn ? "Session" : "Check your inbox"}</strong><span>{notice}</span></div>}
            {error && <div className="preview-notice" role="alert"><strong>Unable to continue</strong><span>{error}</span></div>}
            <div className="privacy-note"><span className="privacy-mark" aria-hidden="true">◇</span><p><strong>Your account, your boundaries.</strong><br />The server checks portal permissions independently of the page you visit.</p></div>
            <p className="legal-note">Never share your verification code. Privileged access must be provisioned by an authorized administrator.</p>
          </div>
          <footer className="auth-footer"><span>© {new Date().getFullYear()} WebManager</span><span className="preview-status"><i /> {signedIn ? "Authenticated" : "Email verification"}</span></footer>
        </section>
      </div>
    </main>
  );
}
