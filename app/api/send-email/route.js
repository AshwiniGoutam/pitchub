import nodemailer from "nodemailer";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // ✅ required import

export async function POST(req) {
  try {
    const { to, subject, body, startupId } = await req.json();

    // Step 1: Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Step 2: Send email
    await transporter.sendMail({
      from: `"Your Name" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: body,
    });

    // Step 3: Update startup status to "contacted"
    if (startupId) {
      const db = await getDatabase();
      await db
        .collection("startups")
        .updateOne(
          { _id: new ObjectId(startupId) }, // ✅ now works
          { $set: { status: "contacted", updatedAt: new Date() } }
        );
    }

    return new Response(
      JSON.stringify({ message: "Email sent and status updated" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        message: "Error sending email",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
