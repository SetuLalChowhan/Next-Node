import nodemailer from "nodemailer";

const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.EMAIL_PORT || "465");
const smtpUser = process.env.EMAIL_USER || "";
const smtpPass = process.env.EMAIL_PASS || "";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

/**
 * Sends a HTML/text email using Nodemailer config.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  type: "hello" | "support" = "hello"
): Promise<void> => {
  const fromEmail = type === "support" ? "support@getstakd.co" : "hello@getstakd.co";
  const mailOptions = {
    from: `"STAKD" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: unknown) {
    const err = error as Error | null;
    console.error(`Failed to send email to ${to}:`, err?.message || err);
  }
};

export default sendEmail;
