import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env" }); // ensures it loads the file


async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER, // send to yourself
    subject: "SMTP Test",
    text: "✅ Your SMTP setup works!",
  });

  console.log("Email sent:", info.response);
}

testEmail().catch(console.error);
