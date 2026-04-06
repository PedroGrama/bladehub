import nodemailer from 'nodemailer';

const user = process.env.GMAIL_USER || "";
const pass = process.env.GMAIL_APP_PASSWORD || "";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationLink = `${appUrl}/api/verify-email?token=${token}`;

  const mailOptions = {
    from: `"BladeHub SaaS" <${user}>`,
    to: email,
    subject: "Verifique seu e-mail corporativo",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #000;">Bem-vindo ao BladeHub!</h2>
        <p>Por favor, confirme seu e-mail para ativar sua conta e acessar o painel administrativo.</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
          Verificar meu E-mail
        </a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Se você não solicitou este cadastro, pode ignorar este e-mail.<br/>
          Este link expira em 24h.
        </p>
      </div>
    `
  };

  if (!user || !pass) {
    console.warn("GMAIL_USER and GMAIL_APP_PASSWORD are not set. Check your console for the verification link.");
    console.log("Verification link:", verificationLink);
    return;
  }

  await transporter.sendMail(mailOptions);
}
