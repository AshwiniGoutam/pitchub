import { NextResponse } from "next/server";

export async function GET() {
  const GAS_URL =
"script.google.com/macros/s/AKfycbxXEcCwlx9bk2nwTqG7U5SbSbtO6vdluq3sHltFdI6gMebljzNb1a5QFmksyKy1TDFDYQ/exec?key=dw_gmail_9F3kQx7P2LmA&limit=1";
  const GAS_KEY = "dw_gmail_9F3kQx7P2LmA";

  const res = await fetch(
    `${GAS_URL}?key=${GAS_KEY}&limit=1`,
    { cache: "no-store", redirect: "follow" }
  );

  const text = await res.text(); // 👈 IMPORTANT

  return NextResponse.json({
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    bodyPreview: text.slice(0, 500),
  });
}
