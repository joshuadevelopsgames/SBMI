interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'SBMI <noreply@sbmi.ca>'

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set. Email not sent:', options.subject, 'to', options.to)
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  await sendEmail({
    to,
    subject: 'Reset your SBMI password',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 24px;">Reset Your Password</h1>
        <p style="color: #333; line-height: 1.6;">You requested a password reset for your SBMI account. Click the link below to set a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #1B5E20; color: white; text-decoration: none; font-weight: bold;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 14px;">Note: Email delivery may take a few minutes. Please check your spam folder if you do not see it.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
    text: `Reset your SBMI password by visiting: ${resetUrl}`,
  })
}

export async function send2FACodeEmail(
  to: string,
  code: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'Your SBMI verification code',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 24px;">Verification Code</h1>
        <p style="color: #333; line-height: 1.6;">Your SBMI two-factor authentication code is:</p>
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #1B5E20; margin: 24px 0; font-family: monospace;">${code}</div>
        <p style="color: #666; font-size: 14px;">This code may take up to two minutes to arrive. Please check your spam folder if you do not see it.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
    text: `Your SBMI verification code is: ${code}`,
  })
}

export async function sendEmailChangeConfirmation(
  to: string,
  newEmail: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const approveUrl = `${appUrl}/api/profile/approve-email-change?token=${token}`

  await sendEmail({
    to,
    subject: 'Confirm your SBMI email address change',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 24px;">Confirm Email Change</h1>
        <p style="color: #333; line-height: 1.6;">You requested to change your SBMI email address to: <strong>${newEmail}</strong></p>
        <p style="color: #333; line-height: 1.6;">Click the link below to confirm this change. After confirmation, you will need to log in with your new email address.</p>
        <a href="${approveUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #1B5E20; color: white; text-decoration: none; font-weight: bold;">Confirm Email Change</a>
        <p style="color: #666; font-size: 14px;">If you did not request this change, please contact SBMI immediately.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
    text: `Confirm your SBMI email change to ${newEmail}: ${approveUrl}`,
  })
}

export async function sendAssistanceRequestNotification(
  adminEmail: string,
  requestDetails: {
    memberName: string
    requestType: string
    familyMemberName?: string
    otherName?: string
    otherPhone?: string
    description: string
  }
): Promise<void> {
  const { memberName, requestType, familyMemberName, otherName, otherPhone, description } = requestDetails

  const forWhom =
    requestType === 'SELF'
      ? `for family member: ${familyMemberName || 'themselves'}`
      : `for: ${otherName} (Phone: ${otherPhone})`

  await sendEmail({
    to: adminEmail,
    subject: `SBMI Assistance Request from ${memberName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 24px;">New Assistance Request</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">From:</td><td style="padding: 8px 0;">${memberName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Request Type:</td><td style="padding: 8px 0;">${requestType === 'SELF' ? 'For Self / Family Member' : 'For Someone Else'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Assistance For:</td><td style="padding: 8px 0;">${forWhom}</td></tr>
        </table>
        <h2 style="color: #1B5E20; font-size: 18px; margin-top: 24px;">Description</h2>
        <p style="color: #333; line-height: 1.6; background: #f9f9f9; padding: 16px; border-left: 4px solid #1B5E20;">${description}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
    text: `New assistance request from ${memberName} (${requestType}): ${description}`,
  })
}

export async function sendPaymentReminderEmail(
  to: string,
  memberName: string,
  dueDate: string,
  amountDue: string,
  penaltyAmount: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `SBMI Payment Reminder — Due ${dueDate}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #C62828; font-size: 24px; margin-bottom: 24px;">Payment Reminder</h1>
        <p style="color: #333; line-height: 1.6;">Dear ${memberName},</p>
        <p style="color: #333; line-height: 1.6;">This is a reminder that your SBMI membership contribution of <strong>${amountDue}</strong> is due on <strong>${dueDate}</strong>.</p>
        <p style="color: #C62828; line-height: 1.6;">If payment is not received by the due date, a penalty of <strong>${penaltyAmount}</strong> will be added to your balance.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member/payments" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #1B5E20; color: white; text-decoration: none; font-weight: bold;">Make a Payment</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
  })
}

export async function sendPaymentDeclinedEmail(
  to: string,
  memberName: string,
  penaltyAmount: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'SBMI — Recurring Payment Declined',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #C62828; font-size: 24px; margin-bottom: 24px;">Payment Declined</h1>
        <p style="color: #333; line-height: 1.6;">Dear ${memberName},</p>
        <p style="color: #333; line-height: 1.6;">Your recurring SBMI membership payment was declined. Your recurring payment has been cancelled.</p>
        <p style="color: #C62828; line-height: 1.6;">A penalty of <strong>${penaltyAmount}</strong> has been added to your account balance.</p>
        <p style="color: #333; line-height: 1.6;">To resolve this, please log in to your member portal, pay the outstanding balance (including the penalty), and set up a new recurring payment agreement.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member/payments" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #1B5E20; color: white; text-decoration: none; font-weight: bold;">Resolve Payment</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
  })
}

export async function sendApplicationApprovedEmail(
  to: string,
  firstName: string,
  tempPassword: string | null
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const loginUrl = `${appUrl}/login`

  await sendEmail({
    to,
    subject: 'Welcome to SBMI — Your Application Has Been Approved',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 24px;">Welcome to Samuel Bete Mutual Iddir!</h1>
        <p style="color: #333; line-height: 1.6;">Dear ${firstName},</p>
        <p style="color: #333; line-height: 1.6;">We are pleased to inform you that your application to join the Samuel Bete Mutual Iddir has been <strong>approved</strong>.</p>
        ${tempPassword ? `
          <p style="color: #333; line-height: 1.6;">Your account has been created. Please log in with the following temporary credentials and change your password immediately:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold; width: 40%;">Email:</td><td style="padding: 8px; background: #f5f5f5;">${to}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Temporary Password:</td><td style="padding: 8px; font-family: monospace; font-size: 16px;">${tempPassword}</td></tr>
          </table>
        ` : `
          <p style="color: #333; line-height: 1.6;">You can log in to your existing account to access the member portal.</p>
        `}
        <a href="${loginUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #1B5E20; color: white; text-decoration: none; font-weight: bold;">Log In to Member Portal</a>
        <p style="color: #666; font-size: 14px;">If you have any questions, please contact us at admin@sbmi.ca.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
    text: `Welcome to SBMI, ${firstName}! Your application has been approved. Log in at: ${loginUrl}${tempPassword ? ` with password: ${tempPassword}` : ''}`,
  })
}

export async function sendApplicationRejectedEmail(
  to: string,
  firstName: string,
  notes: string | null
): Promise<void> {
  await sendEmail({
    to,
    subject: 'SBMI — Application Update',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 24px;">Application Update</h1>
        <p style="color: #333; line-height: 1.6;">Dear ${firstName},</p>
        <p style="color: #333; line-height: 1.6;">Thank you for your interest in joining the Samuel Bete Mutual Iddir. After careful review, we are unable to approve your application at this time.</p>
        ${notes ? `<p style="color: #555; line-height: 1.6; background: #f9f9f9; padding: 16px; border-left: 4px solid #ccc;"><em>${notes}</em></p>` : ''}
        <p style="color: #333; line-height: 1.6;">If you have any questions or would like to discuss this further, please contact us at admin@sbmi.ca.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Samuel Bete Mutual Iddir &mdash; sbmi.ca</p>
      </div>
    `,
    text: `Dear ${firstName}, we were unable to approve your SBMI application at this time. Please contact admin@sbmi.ca for more information.`,
  })
}
