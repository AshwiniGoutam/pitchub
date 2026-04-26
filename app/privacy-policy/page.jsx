"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import React from "react";

export default function TermsOfUse() {
  return (
    <>
      <header className="border-b border-gray-100 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Pitchub"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <button
            className="bg-primary rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium px-4 py-2 text-white cursor-pointer"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/founder-login?role=founder",
              })
            }
          >
            Join the Waitlist
          </button>
        </div>
      </header>
      <main className="mx-auto px-4 py-12">
        <div className="container mx-auto px-4 relative z-10">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold">Pitchub – Privacy Policy</h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: 2025</p>
          </header>

          <p className="mb-6">
            Your privacy and data security are extremely important to us. This
            Privacy Policy explains how Pitchub collects, uses, and protects
            your information.
          </p>

         <section className="space-y-6 text-sm leading-relaxed">
  {/* 1. Information We Collect */}
  <div>
    <h2 className="font-semibold mb-1">1. Information We Collect</h2>

    <h3 className="font-medium mb-1">
      a. Information you provide directly
    </h3>
    <ul className="list-disc list-inside space-y-1 mb-3">
      <li>Email address (waitlist or account registration)</li>
      <li>Name, startup details, or profile information (if provided)</li>
    </ul>

    <h3 className="font-medium mb-1">
      b. Google Account & Gmail Access (only if permitted by you)
    </h3>
    <p className="mb-2">
      If you choose to connect your Google account, Pitchub may request
      limited access via secure OAuth 2.0 authentication.
    </p>

    <p className="mb-2">This access is strictly used to:</p>
    <ul className="list-disc list-inside space-y-1 mb-2">
      <li>
        Identify relevant business-related communications (such as investor
        conversations)
      </li>
      <li>
        Help organize interactions between founders and investors
      </li>
    </ul>

    <p className="mb-2">Pitchub never:</p>
    <ul className="list-disc list-inside space-y-1 mb-3">
      <li>Sends emails on your behalf</li>
      <li>Modifies or deletes your Gmail data</li>
      <li>Sells or shares Gmail data with third parties</li>
      <li>Uses Gmail data for advertising</li>
    </ul>

    <p className="mb-2">
      We only access the minimum necessary data required to provide core
      features.
    </p>

    <p>
      Pitchub complies with Google API Services User Data Policy,
      including Limited Use requirements. Users can revoke access at any
      time via their Google account settings.
    </p>
  </div>

  {/* 2. How We Use Your Information */}
  <div>
    <h2 className="font-semibold mb-1">
      2. How We Use Your Information
    </h2>
    <p className="mb-2">We use your data to:</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Provide platform functionality</li>
      <li>Improve user experience</li>
      <li>Enable secure authentication</li>
      <li>
        Organize communication between founders and investors
      </li>
    </ul>
  </div>

  {/* 3. Data Protection & Security */}
  <div>
    <h2 className="font-semibold mb-1">
      3. Data Protection &amp; Security
    </h2>
    <p className="mb-2">
      We use industry-standard security measures to protect your data,
      including:
    </p>
    <ul className="list-disc list-inside space-y-1 mb-2">
      <li>HTTPS encryption</li>
      <li>Secure token storage</li>
      <li>Restricted data access</li>
    </ul>
  </div>

  {/* 4. Data Retention & Deletion */}
  <div>
    <h2 className="font-semibold mb-1">
      4. Data Retention &amp; Deletion
    </h2>
    <p className="mb-2">
      We retain data only as long as necessary.
    </p>
    <p className="mb-2">If a user requests deletion:</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Data is deleted within 7–30 days</li>
      <li>OAuth access is revoked immediately</li>
    </ul>
  </div>

  {/* 5. Cookies & Analytics */}
  <div>
    <h2 className="font-semibold mb-1">5. Cookies &amp; Analytics</h2>
    <p>
      We use cookies to improve user experience. These do not personally
      identify users.
    </p>
  </div>

  {/* 6. Your Rights */}
  <div>
    <h2 className="font-semibold mb-1">6. Your Rights</h2>
    <p className="mb-2">You may:</p>
    <ul className="list-disc list-inside space-y-1 mb-2">
      <li>Request access to your data</li>
      <li>Request deletion</li>
      <li>Opt out of communication</li>
    </ul>
    <p>
      Contact:{" "}
      <a
        href="mailto:pitchubtech@gmail.com"
        className="text-blue-600 hover:underline"
      >
        pitchubtech@gmail.com
      </a>
    </p>
  </div>

  {/* 7. Compliance Statement */}
  <div>
    <h2 className="font-semibold mb-1">
      7. Compliance Statement
    </h2>
    <p>
      Pitchub does not use Google user data for any purpose other than
      providing user-facing features. We do not transfer data to third
      parties except where required by law.
    </p>
  </div>

  {/* 8. Policy Updates */}
  <div>
    <h2 className="font-semibold mb-1">8. Policy Updates</h2>
    <p>
      We may update this Privacy Policy. Continued use implies
      acceptance.
    </p>
  </div>

  {/* Footer */}
  <div>
    <p>
      If you have any questions about privacy, contact{" "}
      <a
        href="mailto:pitchubtech@gmail.com"
        className="text-blue-600 hover:underline"
      >
        pitchubtech@gmail.com
      </a>
      .
    </p>
    <p className="text-xs text-gray-500 mt-4">
      © 2025 Pitchub. All rights reserved.
    </p>
  </div>
</section>
        </div>
      </main>
    </>
  );
}
