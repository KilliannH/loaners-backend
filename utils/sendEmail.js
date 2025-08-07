const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = (to, subject, html) => {
  return transporter.sendMail({
    from: `"Loners" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};