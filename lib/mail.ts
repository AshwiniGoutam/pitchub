import nodemailer from "nodemailer";

export async function sendPitchSubmissionEmail(
  to: string,
  startupName: string
) {
  // Configure your transporter (use your real SMTP credentials or service)
  const transporter = nodemailer.createTransport({
    service: "gmail", // or "SendGrid", "Outlook", etc.
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your app password
    },
  });

  const mailOptions = {
    from: `"Pitchub" <${process.env.SMTP_USER}>`,
    to,
    subject: `Pitch Received: ${startupName}`,
    html: `
      <h2>Thank you for submitting your pitch!</h2>
      <p>We’ve successfully received your startup <strong>${startupName}</strong>.</p>
      <p>Our team will review your details and get back to you soon.</p>
      <br/>
      <p>– Pitchub</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
