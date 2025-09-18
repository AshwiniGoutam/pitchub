"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div>
        <img src={session.user?.image ?? undefined} alt="image" className="w-100" />
        <p>Welcome {session.user?.email}</p>
        <button onClick={() => signOut()}>Logout</button>
      </div>
    )
  }

  return <button onClick={() => signIn("google")}>Login with Google</button>
}
