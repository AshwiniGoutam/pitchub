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
            <h1 className="text-3xl font-semibold">Terms &amp; Conditions</h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: 2025</p>
          </header>

          <p className="mb-6">
            Welcome to Pitchub. By accessing or using our website, services, or
            joining our early-access waitlist, you agree to the following Terms
            &amp; Conditions. Please read them carefully.
          </p>

          <section className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="font-semibold mb-1">1. Acceptance of Terms</h2>
              <p>
                By using Pitchub’s website or submitting your email to join the
                waitlist, you agree to comply with and be legally bound by these
                Terms &amp; Conditions.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">2. Description of Service</h2>
              <p>
                Pitchub is a next-generation platform designed to connect
                startups and investors, offering fundraising tools, insights,
                and collaboration features. Our landing page currently provides
                information about the upcoming platform, and users may join a
                waitlist to receive updates.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">3. Eligibility</h2>
              <p>
                You must be at least 18 years old to use our services or join
                the waitlist.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">4. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Provide accurate and complete information when joining the
                  waitlist.
                </li>
                <li>Use the service only for lawful purposes.</li>
                <li>
                  Do not attempt to misuse, damage, or disrupt the platform in
                  any way.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-1">
                5. Email &amp; Google Authentication
              </h2>
              <p className="mb-2">
                Pitchub may request access to your email (Gmail) only for
                specific platform features once launched, such as:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Verifying your identity</li>
                <li>
                  Sending notifications and updates related to your fundraising
                  or investments
                </li>
                <li>
                  Syncing relevant communication to improve transparency between
                  founders and investors
                </li>
              </ul>
              <p>
                We never read, store, or access your personal Gmail content
                (emails, attachments, contacts) without explicit permission. Any
                Google OAuth permissions will be used strictly for the stated
                feature and nothing else.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">6. Early Access Program</h2>
              <p>
                Joining the waitlist does not guarantee platform access. We may
                grant or deny access at our discretion.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">7. Intellectual Property</h2>
              <p>
                All content on Pitchub (text, graphics, branding, design) is
                owned by Pitchub and may not be copied or reproduced without
                permission.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">8. Limitation of Liability</h2>
              <p>
                Pitchub is provided on an &quot;as-is&quot; basis. We are not
                liable for any indirect or consequential damages arising from
                the use or inability to use the platform.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access for any
                violation of these terms.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">10. Changes to Terms</h2>
              <p>
                We may update these Terms &amp; Conditions at any time.
                Continued use of our services means you accept the updated
                terms.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">11. Contact</h2>
              <p>
                If you have questions, email us at{" "}
                <a
                  href="mailto:pitchubtech@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  pitchubtech@gmail.com
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
