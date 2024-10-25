import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.MAIL_SMTP,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.MAIL_PW,
  },
});

export async function sendMail({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  try {
    await transporter.verify();
  } catch (err) {
    console.error(err);
    return;
  }

  const mail = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return mail;
}
