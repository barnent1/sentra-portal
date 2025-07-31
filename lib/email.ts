import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
    html: options.html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Verify Your Email</h1>
      <p style="color: #666;">Thank you for registering with Sentra Portal. Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <p style="color: #666;">Or copy and paste this link into your browser:</p>
      <p style="color: #0070f3; word-break: break-all;">${verificationUrl}</p>
      <p style="color: #999; font-size: 14px;">This link will expire in 24 hours.</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: "Verify your email - Sentra Portal",
    html,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Reset Your Password</h1>
      <p style="color: #666;">You requested a password reset for your Sentra Portal account. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p style="color: #666;">Or copy and paste this link into your browser:</p>
      <p style="color: #0070f3; word-break: break-all;">${resetUrl}</p>
      <p style="color: #999; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: "Reset your password - Sentra Portal",
    html,
  })
}