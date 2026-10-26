import nodemailer from "nodemailer";

export async function sendVerificationCode(email: string, code: string, portal: string): Promise<void> {
  const host = process.env.EMAIL_SERVER_HOST;
  const from = process.env.EMAIL_FROM;
  if (!host || !from) throw new Error("Email transport is not configured");

  const port = Number(process.env.EMAIL_SERVER_PORT ?? 1025);
  const secure = process.env.EMAIL_SERVER_SECURE === "true";
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const transport = nodemailer.createTransport({
    host, port, secure,
    ...(user && pass ? { auth: { user, pass } } : {})
  });

  await transport.sendMail({
    from,
    to: email,
    subject: "Your WebManager verification code",
    text: `Your WebManager ${portal} portal verification code is ${code}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your WebManager <strong>${portal}</strong> portal verification code is:</p><p style="font-size:28px;letter-spacing:6px"><strong>${code}</strong></p><p>It expires in 5 minutes. If you did not request this code, you can ignore this email.</p>`
  });
}
