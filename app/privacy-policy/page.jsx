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
                <li>Email address (when joining the waitlist)</li>
                <li>
                  Name or startup details (if shared later in the platform)
                </li>
              </ul>

              <h3 className="font-medium mb-1">
                b. Google/Gmail Permissions (Only if granted by you in the
                future)
              </h3>
              <p className="mb-2">
                Pitchub may request limited Gmail or Google account access
                strictly for platform features such as:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Authentication (logging in securely)</li>
                <li>
                  Syncing relevant communication between founders and investors
                  (only if explicitly allowed)
                </li>
              </ul>

              <p className="mb-2">Pitchub never:</p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                <li>Reads your personal emails</li>
                <li>Stores your email content</li>
                <li>Shares your Gmail data with third parties</li>
              </ul>

              <p>All permissions follow Google OAuth policies.</p>
            </div>

            {/* 2. How We Use Your Information */}
            <div>
              <h2 className="font-semibold mb-1">
                2. How We Use Your Information
              </h2>
              <p className="mb-2">We use your data to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide early access notifications</li>
                <li>Improve platform performance and user experience</li>
                <li>Authenticate users securely</li>
                <li>
                  Offer communication and transparency features between founders
                  and investors (later stages)
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
                <li>Encryption</li>
                <li>Secure servers</li>
                <li>Restricted internal access</li>
              </ul>
              <p>
                Your data is never sold, shared, or traded with third parties.
              </p>
            </div>

            {/* 4. Cookies & Analytics */}
            <div>
              <h2 className="font-semibold mb-1">4. Cookies &amp; Analytics</h2>
              <p>
                We may use cookies and analytics tools to understand site usage
                and improve the experience. This data is anonymous and never
                personally identifies you.
              </p>
            </div>

            {/* 5. Your Rights */}
            <div>
              <h2 className="font-semibold mb-1">5. Your Rights</h2>
              <p className="mb-2">You may:</p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Request deletion of your data</li>
                <li>Request correction of information</li>
                <li>Opt out of communications at any time</li>
              </ul>
              <p>
                Just email us at{" "}
                <a
                  href="mailto:pitchubtech@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  pitchubtech@gmail.com
                </a>
                .
              </p>
            </div>

            {/* 6. Third-Party Services */}
            <div>
              <h2 className="font-semibold mb-1">6. Third-Party Services</h2>
              <p>
                We follow strict integration rules with platforms like Google,
                and we only request permissions required for specific features.
              </p>
            </div>

            {/* 7. Policy Updates */}
            <div>
              <h2 className="font-semibold mb-1">7. Policy Updates</h2>
              <p>
                We may update this Privacy Policy occasionally. Continued use of
                our services means you accept the updated policy.
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
