import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendRecoveryEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Libria Password Recovery',
    html: `
      <h1>Password Recovery</h1>
      <p>Your recovery code is: <strong>${code}</strong></p>
      <p>This code will expire in 30 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};