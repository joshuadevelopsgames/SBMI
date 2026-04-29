/**
 * Google reCAPTCHA v2 siteverify (forgot-password and similar gates).
 * When keys are unset in production, verification fails closed for forgot-password.
 */

export async function verifyRecaptchaToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!secret?.trim() || !siteKey?.trim()) {
    return process.env.NODE_ENV !== "production";
  }

  if (!token?.trim()) return false;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secret.trim(), response: token.trim() }),
  });

  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export function isRecaptchaConfigured(): boolean {
  return !!(process.env.RECAPTCHA_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim());
}
