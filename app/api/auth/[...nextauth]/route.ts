import NextAuth, { type NextAuthOptions, type Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDatabase } from "@/lib/mongodb";

// 🧠 Helper function: refresh Google access token
async function refreshAccessToken(token: any) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    console.log("✅ Access token refreshed successfully");

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      authorization: {
        params: {
          // ⭐⭐⭐ FIXED SCOPES WITH CALENDAR PERMISSIONS ⭐⭐⭐
          scope: [
            "openid",
            "profile",
            "email",

            // Gmail read access
            "https://www.googleapis.com/auth/gmail.readonly",

            // REQUIRED FOR GOOGLE MEET LINK CREATION
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),

          access_type: "offline", // REQUIRED for refresh token
          prompt: "consent", // Forces Google to issue new token with new scopes
        },
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // Initial login
      if (account && user) {
        const db = await getDatabase();

        const existingUser = await db
          .collection("users")
          .findOne({ email: user.email });

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            picture: user.image,
            provider: account.provider,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await db.collection("users").updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name,
                picture: user.image,
                provider: account.provider,
                accessToken: account.access_token,
                refreshToken:
                  account.refresh_token ?? existingUser.refreshToken,
                updatedAt: new Date(),
              },
            }
          );
        }

        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at as number) * 1000,
          user,
        };
      }

      // If token valid, return it
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Refresh expired token
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error;
      session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
