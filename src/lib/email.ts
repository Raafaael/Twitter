import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  to: string,
  code: string,
  name: string,
  link: string,
) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    console.log("\n========================================");
    console.log("  SMTP não configurado — confirme manualmente:");
    console.log(`  Para:   ${to}`);
    console.log(`  Código: ${code}`);
    console.log(`  Link:   ${link}`);
    console.log("========================================\n");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "Confirme sua conta",
    text:
      `Olá ${name},\n\n` +
      `Seu código de verificação é: ${code}\n\n` +
      `Ou confirme direto por este link: ${link}\n\n` +
      `O código e o link expiram em 10 minutos. ` +
      `Se o link expirar, basta abri-lo que enviaremos um novo automaticamente.\n\n` +
      `Se você não pediu isto, ignore este e-mail.`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px;">Olá, ${name}!</h2>
        <p>Use o código abaixo para confirmar sua conta:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; background: #f5f5f5; padding: 16px; text-align: center; border-radius: 8px; font-family: monospace; margin: 16px 0;">${code}</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${link}" style="display: inline-block; background: #1d9bf0; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 9999px;">Confirmar minha conta</a>
        </p>
        <p style="color: #666; font-size: 14px;">O código e o link expiram em 10 minutos. Se o link expirar, abra-o mesmo assim — enviaremos um novo automaticamente. Se você não pediu isto, ignore este e-mail.</p>
      </div>
    `,
  });
}
