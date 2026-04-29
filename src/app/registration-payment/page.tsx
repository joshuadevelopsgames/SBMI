"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, Lock, Wallet } from "lucide-react";
import { ShellHead, ShellFoot } from "@/components/portal/Chrome";
import { REGISTRATION_FEE_CAD, REGISTRATION_TOTAL_CAD } from "@/lib/registration-fee";
import { isStripePublishableKeyConfigured } from "@/lib/stripe-ui";

export default function RegistrationPaymentPage() {
  const stripeUiReady = isStripePublishableKeyConfigured();
  const [plan, setPlan] = useState<"full" | "installments">("full");
  const fee = REGISTRATION_FEE_CAD;
  const gst = REGISTRATION_TOTAL_CAD - fee;
  const total = REGISTRATION_TOTAL_CAD;
  const installmentMonthly = 25;

  return (
    <div className="shell">
      <ShellHead
        rightSlot={
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-link" style={{ background: "none", border: 0, cursor: "pointer" }}>
              Sign out
            </button>
          </form>
        }
      />

      <div className="center-stage">
        <div className="center-card x-wide">
          <div className="step-row">
            <span>① Account</span>
            <span className="sep">›</span>
            <span>② Verify</span>
            <span className="sep">›</span>
            <span className="active">③ Registration fee</span>
          </div>

          <h1 className="cc-h" style={{ textAlign: "left" }}>Complete your registration</h1>
          <p className="cc-sub" style={{ textAlign: "left", marginBottom: 24 }}>
            A one-time registration fee finalizes your membership. After payment, you&apos;ll have full access to the
            portal.
          </p>

          {!stripeUiReady && (
            <div className="callout" role="status" style={{ marginBottom: 20, textAlign: "left", alignItems: "flex-start", gap: 12 }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                Card checkout is not enabled until Stripe keys are configured (<code style={{ fontSize: 12 }}>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> + server secret). You can still explore this screen; payment cannot complete yet.
              </span>
            </div>
          )}

          <div className="form-grid-2">
            <div className="field full">
              <label className="label">Payment plan</label>
              <div className="radio-cards">
                <button
                  type="button"
                  className={"radio-card" + (plan === "full" ? " selected" : "")}
                  onClick={() => setPlan("full")}
                >
                  <span className="rd" aria-hidden="true">
                    <span className="rd-fill" />
                  </span>
                  <div>
                    <h5>Pay in full · ${fee.toFixed(2)}</h5>
                    <p>One-time payment. Member status and portal access granted immediately.</p>
                  </div>
                </button>
                <button
                  type="button"
                  className={"radio-card" + (plan === "installments" ? " selected" : "")}
                  onClick={() => setPlan("installments")}
                >
                  <span className="rd" aria-hidden="true">
                    <span className="rd-fill" />
                  </span>
                  <div>
                    <h5>6-month installments · ${installmentMonthly}/mo</h5>
                    <p>Conditional access until fully paid. Auto-charged on the 15th.</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="field full">
              <label className="label">
                Payment details <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>· secured by Stripe</span>
              </label>
              <div className="stripe-mock">
                <div className="stripe-mock-input placeholder">
                  <Wallet size={14} style={{ marginRight: 8 }} />
                  Card number — 1234 5678 9012 3456
                </div>
                <div className="stripe-mock-row">
                  <div className="stripe-mock-input placeholder">MM / YY</div>
                  <div className="stripe-mock-input placeholder">CVC</div>
                  <div className="stripe-mock-input placeholder">ZIP / Postal</div>
                </div>
                <div className="stripe-mock-foot">
                  <span>PCI-compliant · we never see your card details.</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Lock size={11} /> Stripe
                  </span>
                </div>
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
                <span>Registration fee</span>
                <span className="num">${fee.toFixed(2)}</span>
              </div>
              <div className="sum-row">
                <span>GST (5%)</span>
                <span className="num">${gst.toFixed(2)}</span>
              </div>
              <div className="sum-row total">
                <span>Due today</span>
                <span className="num">
                  {plan === "full" ? `$${total.toFixed(2)} CAD` : `$${installmentMonthly.toFixed(2)} CAD`}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="btn btn-accent full"
              style={{ height: 48, fontSize: 15, opacity: stripeUiReady ? 0.72 : 0.65 }}
            >
              <Lock size={15} />
              Complete payment · {plan === "full" ? `$${total.toFixed(2)}` : `$${installmentMonthly.toFixed(2)}`}{" "}
              ({stripeUiReady ? "checkout wiring pending" : "Stripe not configured"})
            </button>

            <p
              className="full callout"
              style={{ fontSize: 13, margin: 0, lineHeight: 1.55, textAlign: "left" }}
            >
              {stripeUiReady
                ? "Stripe keys are present; Payment Element / webhooks still need to be wired before charges succeed."
                : "Card processing is not connected yet. This screen matches the planned checkout; SBMI will enable Stripe here before go-live. You can still use the rest of the portal while your status is pending registration."}
            </p>

            <p
              className="full"
              style={{ fontSize: 11.5, color: "var(--ink-400)", textAlign: "center", margin: 0, lineHeight: 1.55 }}
            >
              By paying you agree to SBMI&apos;s bylaws and the recurring contribution schedule. You can pause or
              cancel recurring payments anytime.
            </p>

            <p className="full" style={{ fontSize: 12.5, textAlign: "center", margin: 0 }}>
              <Link href="/dashboard" className="text-link">
                ← Back to dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ShellFoot />
    </div>
  );
}
