"use client";

import Link from "next/link";

const CONTACT_MAILTO =
  typeof process.env.NEXT_PUBLIC_SUPPORT_EMAIL === "string" && process.env.NEXT_PUBLIC_SUPPORT_EMAIL
    ? `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`
    : "mailto:info@sbmi.ca";

type Variant = "login" | "home";

export function LoginNarrative({ variant = "login" }: { variant?: Variant }) {
  const isHome = variant === "home";

  return (
    <div className="login-narrative">
      <Link href="/" className="brand" style={{ textDecoration: "none" }}>
        <div className="brand-mark brand-mark--marketing">
          <span>SBMI</span>
        </div>
        <div className="brand-name brand-name--marketing">
          <span>Samuel Bete Mutual Iddir</span>
          <small>Member portal</small>
        </div>
      </Link>

      <div className="narrative-body">
        <div className="eyebrow eyebrow--marketing">
          <span className="eyebrow-dot" aria-hidden />
          Calgary, Alberta · Est. 2012
        </div>
        <h1 className="narrative-h narrative-h--marketing">
          When one of us
          <br />
          grieves, we all
          <br />
          <em className="narrative-em-gold">stand together.</em>
        </h1>
        <p className="narrative-p">
          {isHome ? (
            <>
              Apply to join SBMI, or sign in if you already have an account. The Executive Committee reviews each
              application; no payment is required at this stage.
            </>
          ) : (
            <>
              Sign in to manage your household, contributions, and requests for mutual aid — the same community care
              you see on our public site, built for members.
            </>
          )}
        </p>

        <div className="narrative-stats">
          <div>
            <div className="stat-num">800+</div>
            <div className="stat-label">Member households</div>
          </div>
          <div>
            <div className="stat-num">
              15<span style={{ fontSize: 18, color: "var(--ink-500)" }}>yrs</span>
            </div>
            <div className="stat-label">Of mutual aid</div>
          </div>
          <div>
            <div className="stat-num">4</div>
            <div className="stat-label">Avg. household</div>
          </div>
        </div>
      </div>

      <div className="narrative-foot">
        <span>© {new Date().getFullYear()} Samuel Bete Mutual Aid Association</span>
        <span>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href={CONTACT_MAILTO}>Contact</a>
          <a href="/bylaws.pdf" target="_blank" rel="noopener noreferrer">
            Bylaws
          </a>
        </span>
      </div>
    </div>
  );
}
