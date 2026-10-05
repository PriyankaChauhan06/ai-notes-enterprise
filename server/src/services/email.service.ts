import { mailTransporter } from "../config/mail";

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await mailTransporter.sendMail({
    from: `"AI Notes" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Reset your AI Notes password",
    text: `Reset your password using this link: ${resetUrl}`,
    html: `
      <h2>Password Reset</h2>

      <p>You requested to reset your AI Notes password.</p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>This link will expire in 15 minutes.</p>

      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}
