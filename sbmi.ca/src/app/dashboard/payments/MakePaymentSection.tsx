"use client";

import { useState } from "react";

/** SOW US3: payment type selection (radio). One-Time | Recurring Monthly. */
export function MakePaymentSection({ monthlyCents }: { monthlyCents: number | null }) {
  const [type, setType] = useState<"one-time" | "recurring">("one-time");
  const minDollars = monthlyCents != null ? (monthlyCents / 100).toFixed(2) : null;

  return (
    <div className="sbmi-card p-6">
      <h2 className="font-display font-semibold text-[#1B5E3B] mb-3">Make a payment</h2>
      <p className="text-sm text-[#3D5A4A] mb-4">
        Choose how you want to pay. Only one option can be selected at a time.
      </p>
      <div className="space-y-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentType"
            checked={type === "one-time"}
            onChange={() => setType("one-time")}
            className="text-[#D4A43A] focus:ring-[#D4A43A]/30"
          />
          <span className="text-[#1B5E3B]">One-Time Payment</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentType"
            checked={type === "recurring"}
            onChange={() => setType("recurring")}
            className="text-[#D4A43A] focus:ring-[#D4A43A]/30"
          />
          <span className="text-[#1B5E3B]">Recurring Monthly Payment</span>
        </label>
      </div>
      {type === "one-time" && (
        <p className="text-sm text-[#3D5A4A] mb-3">
          {minDollars != null ? (
            <>Minimum payment: ${minDollars} (monthly contribution). You may increase the amount above the minimum.</>
          ) : (
            <>Monthly contribution is not configured. Contact the administrator.</>
          )}
        </p>
      )}
      {type === "recurring" && (
        <p className="text-sm text-[#3D5A4A] mb-3">
          {minDollars != null ? (
            <>Recurring amount: ${minDollars} per month, charged on the first of each month.</>
          ) : (
            <>Monthly contribution is not configured. Contact the administrator.</>
          )}
        </p>
      )}
      <p className="text-sm text-[#3D5A4A]">
        Stripe payment flow is used for processing. If Stripe is not configured, the administrator must set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </p>
    </div>
  );
}
