import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDatabase } from "@/lib/mongodb";


/* -------------------- Refresh Token Helper -------------------- */
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("❌ Refresh token error", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

/* -------------------- NextAuth Config -------------------- */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent", // 🔥 REQUIRED to re-grant scopes
        },
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    /* -------------------- JWT -------------------- */
    async jwt({ token, account, user }) {
      // 🟢 Initial login
      if (account && user) {
        const db = await getDatabase();
        const users = db.collection("users");

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              email: user.email,
              name: user.name,
              picture: user.image,
              provider: account.provider,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              scope: account.scope,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );

        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at as number) * 1000,
          scope: account.scope,
          user,
        };
      }

      // 🟢 Token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 🔁 Refresh expired token
      return await refreshAccessToken(token);
    },

    /* -------------------- Session -------------------- */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.scope = token.scope as string;
      session.error = token.error;
      session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
