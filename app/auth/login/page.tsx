"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { user, setUser } = useUser();
  console.log(user);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      router.push("/dashboard/investor");
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return (
    <div className="h-screen flex">
      <div className="w-1/2">
        <img
          src="https://img.freepik.com/premium-psd/working-laptop-connecting-internet_53876-28285.jpg"
          alt="Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-50 p-8">
        <img
          src="/images/logo.png"
          alt="logo"
          width="300px"
          className="mb-10"
        />

        {session ? (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={session.user?.image ?? undefined}
              alt="User Image"
              className="w-32 h-32 rounded-full"
            />
            <p className="text-lg">{session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
