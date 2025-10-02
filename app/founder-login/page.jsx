"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AfterLogin() {
    const { data: session, status } = useSession(); // track loading status
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (status === "loading") return; // wait until session is loaded

        const role = searchParams.get("role"); // founder OR investor

        if (session?.user) {
            if (role === "founder") {
                router.replace("/dashboard/founder/submit");
            } else {
                router.replace("/dashboard/investor");
            }
        }
    }, [session, status, searchParams, router]);

    return <p>Redirecting...</p>;
}
