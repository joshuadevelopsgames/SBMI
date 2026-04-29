/**
 * Client-readable Stripe readiness (NEXT_PUBLIC key only).
 * Server routes should also verify STRIPE_SECRET_KEY before calling Stripe APIs.
 */
export function isStripePublishableKeyConfigured(): boolean {
  const k = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return typeof k === "string" && k.trim().length > 0;
}
