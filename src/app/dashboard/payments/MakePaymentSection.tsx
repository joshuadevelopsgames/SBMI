"use client";

import { useState } from "react";
import { Lock, Wallet, Shield, Info } from "lucide-react";
import { isStripePublishableKeyConfigured } from "@/lib/stripe-ui";

export function MakePaymentSection({ monthlyCents }: { monthlyCents: number | null }) {
  const stripeUiReady = isStripePublishableKeyConfigured();
  const minDollars = monthlyCents != null ? (monthlyCents / 100).toFixed(2) : null;
  const [type, setType] = useState<"one-time" | "recurring">("one-time");
  const [amount, setAmount] = useState(minDollars ?? "25.00");

  const presets = ["25", "50", "100", "250"];

  return (
    <div className="card card-pad" style={{ padding: 32 }}>
      <div className="form-grid-2">
        {!stripeUiReady && (
          <div className="field full callout" role="status" style={{ alignItems: "flex-start", gap: 12 }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13.5, lineHeight: 1.55 }}>
              Online payments are not enabled yet. When SBMI adds Stripe, set{" "}
              <code style={{ fontSize: 12 }}>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and{" "}
              <code style={{ fontSize: 12 }}>STRIPE_SECRET_KEY</code> in the deployment environment—then card checkout
              can go live here.
            </span>
          </div>
        )}
        <div className="field full">
          <label className="label">Payment type</label>
          <div className="radio-cards">
            <button
              type="button"
              className={"radio-card" + (type === "one-time" ? " selected" : "")}
              onClick={() => setType("one-time")}
            >
              <span className="rd" aria-hidden="true">
                <span className="rd-fill" />
              </span>
              <div>
                <h5>One-time payment</h5>
                <p>Pay any amount now. Useful for catching up or contributing extra.</p>
              </div>
            </button>
            <button
              type="button"
              className={"radio-card" + (type === "recurring" ? " selected" : "")}
              onClick={() => setType("recurring")}
            >
              <span className="rd" aria-hidden="true">
                <span className="rd-fill" />
              </span>
              <div>
                <h5>Set up recurring</h5>
                <p>
                  Auto-charge {minDollars ? `$${minDollars}` : "your monthly contribution"} each month. Pause or
                  cancel from your dashboard.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="field full">
          <label className="label">Amount</label>
          <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                background: "var(--paper)",
                border: "1px solid var(--hairline-strong)",
                borderRight: 0,
                borderTopLeftRadius: "var(--r-md)",
                borderBottomLeftRadius: "var(--r-md)",
                color: "var(--ink-500)",
                fontSize: 14,
              }}
            >
              CAD $
            </div>
            <input
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                flex: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                fontFamily: "var(--font-display-stack)",
                fontSize: 18,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {presets.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className="btn btn-ghost"
                style={{ height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 500 }}
              >
                ${v}
              </button>
            ))}
          </div>
          {minDollars && (
            <div className="field-hint">
              Your monthly obligation is{" "}
              <strong style={{ color: "var(--ink-700)" }}>${minDollars}</strong>. Anything beyond goes toward
              future months.
            </div>
          )}
          {!minDollars && (
            <div className="field-hint">
              Monthly contribution is not configured. Contact the administrator.
            </div>
          )}
        </div>

        <div className="field full" style={{ opacity: stripeUiReady ? 1 : 0.72 }}>
          <label className="label">Payment method</label>
          <div className="stripe-mock">
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
              <div
                style={{
                  width: 36,
                  height: 24,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #1A1F71, #4A4FBE)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                VISA
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)" }}>
                  Visa ending in 4242
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>
                  Expires 09/27 · default method
                </div>
              </div>
              <a className="text-link" style={{ color: "var(--green)", fontWeight: 600 }}>Change</a>
            </div>
          </div>
          <div className="field-hint">
            {stripeUiReady
              ? "Stripe keys are present in this environment; checkout wiring still lands in a future deploy."
              : "Placeholder UI until Stripe publishable + secret keys are configured."}
          </div>
        </div>

        <div
          className="full"
          style={{
            padding: "16px 18px",
            background: "var(--paper)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--r-md)",
          }}
        >
          <div className="sum-row">
            <span>Contribution</span>
            <span className="num">${amount || "0.00"}</span>
          </div>
          <div className="sum-row">
            <span>Processing fee</span>
            <span className="num">$0.00</span>
          </div>
          <div className="sum-row total">
            <span>Total today</span>
            <span className="num">${amount || "0.00"} CAD</span>
          </div>
        </div>

        <div className="full" style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="button"
            disabled={!stripeUiReady}
            className="btn btn-accent"
            style={{ flex: 1, height: 48, fontSize: 15, opacity: stripeUiReady ? 1 : 0.65 }}
            title={!stripeUiReady ? "Stripe is not configured yet" : undefined}
          >
            <Lock size={15} />
            Process payment
          </button>
          <button type="button" className="btn btn-ghost" style={{ height: 48 }}>
            Cancel
          </button>
        </div>

        <div className="full callout green" style={{ marginTop: 4 }}>
          <Shield size={16} />
          <span>Payments are processed by Stripe. SBMI never stores your card details.</span>
        </div>

        <div className="full" style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
          <Wallet size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          One-time and recurring payments both apply to your monthly contributions per bylaws.
        </div>
      </div>
    </div>
  );
}
