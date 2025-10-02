"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AfterLogin() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role"); // founder OR investor

    useEffect(() => {
        if (session?.user) {
            if (role === "founder") {
                router.replace("/dashboard/founder/submit");
            } else {
                router.replace("/dashboard/investor");
            }
        }
    }, [session, role, router]);

    return <p>Redirecting...</p>;
}
