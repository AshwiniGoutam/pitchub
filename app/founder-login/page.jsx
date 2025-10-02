import { Suspense } from "react";
import RedirectAfterLogin from "@/components/RedirectAfterLogin";

export default function FounderLoginPage() {
    return (
        <>
            <Suspense fallback={<p>Loading...</p>}>
                <RedirectAfterLogin />
            </Suspense>
        </>
    );
}
