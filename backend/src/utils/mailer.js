import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email, resetUrl) {
  if (!process.env.SMTP_HOST) {
    console.log(`[Demo reset password] ${email}: ${resetUrl}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Dat lai mat khau StudyShare',
    text: `Mo lien ket sau de dat lai mat khau: ${resetUrl}\nLien ket het han sau 30 phut.`,
    html: `<p>Bạn vừa yêu cầu đặt lại mật khẩu StudyShare.</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Liên kết hết hạn sau 30 phút.</p>`
  });
}
