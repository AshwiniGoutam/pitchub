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
            {/* 1. Acceptance */}
            <div>
              <h2 className="font-semibold mb-1">1. Acceptance</h2>
              <p>By using Pitchub, you agree to these terms.</p>
            </div>

            {/* 2. Service Description */}
            <div>
              <h2 className="font-semibold mb-1">2. Service Description</h2>
              <p>
                Pitchub is a platform that helps startups manage investor
                relationships and communication.
              </p>
            </div>

            {/* 3. Eligibility */}
            <div>
              <h2 className="font-semibold mb-1">3. Eligibility</h2>
              <p>Users must be 18 years or older.</p>
            </div>

            {/* 4. User Responsibilities */}
            <div>
              <h2 className="font-semibold mb-1">4. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate information</li>
                <li>Use the platform legally</li>
              </ul>
            </div>

            {/* 5. Google Authentication & Gmail Access */}
            <div>
              <h2 className="font-semibold mb-1">
                5. Google Authentication &amp; Gmail Access
              </h2>
              <p className="mb-2">
                Pitchub may request limited Gmail access via secure OAuth.
              </p>

              <p className="mb-2">This is used only to:</p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Identify relevant investor communication</li>
                <li>Improve organization of startup-investor interactions</li>
              </ul>

              <p className="mb-2">Pitchub does NOT:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send emails</li>
                <li>Modify Gmail data</li>
                <li>Use data for ads or resale</li>
              </ul>

              <p className="mt-2">
                All access is user-consented and compliant with Google policies.
              </p>
            </div>

            {/* 6. Early Access */}
            <div>
              <h2 className="font-semibold mb-1">6. Early Access</h2>
              <p>Joining the waitlist does not guarantee access.</p>
            </div>

            {/* 7. Intellectual Property */}
            <div>
              <h2 className="font-semibold mb-1">7. Intellectual Property</h2>
              <p>All content belongs to Pitchub.</p>
            </div>

            {/* 8. Limitation of Liability */}
            <div>
              <h2 className="font-semibold mb-1">8. Limitation of Liability</h2>
              <p>Service is provided &quot;as-is&quot;.</p>
            </div>

            {/* 9. Termination */}
            <div>
              <h2 className="font-semibold mb-1">9. Termination</h2>
              <p>We may suspend accounts for violations of these terms.</p>
            </div>

            {/* 10. Data Usage */}
            <div>
              <h2 className="font-semibold mb-1">10. Data Usage</h2>
              <p>Data is handled in accordance with our Privacy Policy.</p>
            </div>

            {/* 11. Changes */}
            <div>
              <h2 className="font-semibold mb-1">11. Changes</h2>
              <p>We may update these terms at any time.</p>
            </div>

            {/* 12. Contact */}
            <div>
              <h2 className="font-semibold mb-1">12. Contact</h2>
              <p>
                <a
                  href="mailto:pitchubtech@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  pitchubtech@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
