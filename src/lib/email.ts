/**
 * SOW: 2FA code and password reset sent by email.
 * Uses RESEND_API_KEY if set; otherwise logs to console (dev).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export async function send2FACode(to: string, code: string): Promise<void> {
  const subject = "Your verification code";
  const body = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`;
  await send(to, subject, body);
  if (!RESEND_API_KEY) console.log("[dev] 2FA code for", to, ":", code);
}

export async function sendPasswordResetLink(to: string, magicLink: string): Promise<void> {
  const subject = "Password reset instructions";
  const body = `Click the link below to reset your password:\n\n${magicLink}\n\nThis link is single-use and will expire in 1 hour.`;
  await send(to, subject, body);
  if (!RESEND_API_KEY) console.log("[dev] Password reset link for", to, ":", magicLink);
}

async function send(to: string, subject: string, body: string): Promise<void> {
  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "SBMI Portal <noreply@example.com>",
        to: [to],
        subject,
        text: body,
      }),
    });
    if (!res.ok) throw new Error(`Email send failed: ${await res.text()}`);
  }
}

export function buildPasswordResetLink(token: string): string {
  return `${APP_URL}/login/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendEmailChangeConfirmation(to: string, newEmail: string, approvalLink: string): Promise<void> {
  const subject = "Confirm email change";
  const body = `You requested to change your account email to: ${newEmail}\n\nClick the link below to approve this change. You will be logged out and must sign in with your new email.\n\n${approvalLink}\n\nThis link expires in 1 hour.`;
  await send(to, subject, body);
  if (!RESEND_API_KEY) console.log("[dev] Email change approval link for", to, ":", approvalLink);
}

export function buildEmailChangeApprovalLink(token: string): string {
  return `${APP_URL}/api/auth/approve-email-change?token=${encodeURIComponent(token)}`;
}

/** SOW US51: notify designated administrators of new assistance request. */
export async function sendAssistanceRequestNotification(
  to: string,
  payload: {
    requestType: string;
    memberName: string;
    beneficiarySummary?: string;
    /** @deprecated use beneficiarySummary */
    forName?: string;
    phone?: string;
    description: string;
  }
): Promise<void> {
  const lines = [
    `A member has submitted an assistance request.`,
    ``,
    `Request type: ${payload.requestType}`,
    `Submitted by (member): ${payload.memberName}`,
  ];
  const ben = payload.beneficiarySummary ?? payload.forName;
  if (ben) lines.push(`Beneficiary: ${ben}`);
  if (payload.phone) lines.push(`Contact phone: ${payload.phone}`);
  lines.push(``, `Description:`, payload.description);
  const body = lines.join("\n");
  const subject = "SBMI: New assistance request";
  await send(to, subject, body);
  if (!RESEND_API_KEY) console.log("[dev] Assistance request notification to", to);
}
