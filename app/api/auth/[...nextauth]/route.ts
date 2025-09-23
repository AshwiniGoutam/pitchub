import NextAuth, { type NextAuthOptions, type Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDatabase } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],

 callbacks: {
  async jwt({ token, account, user }) {
    // Store Google access token
    if (account?.access_token) {
      token.accessToken = account.access_token;
    }

    // On first sign-in, store MongoDB _id and full user
    if (user?.email && !token.fullUser) {
      try {
        const db = await getDatabase();
        const dbUser = await db.collection("users").findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();      // store MongoDB _id
          token.fullUser = dbUser;               // store full MongoDB user
        }
      } catch (err) {
        console.error("JWT callback error:", err);
      }
    }

    return token;
  },

  async session({ session, token }) {
    session.accessToken = token.accessToken as string;

    if (token.fullUser) {
      const dbUser = token.fullUser;
      session.user = {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.picture,
        provider: dbUser.provider,
        investorProfile: dbUser.investorProfile,
        checkSize: dbUser.checkSize,
        excludedKeywords: dbUser.excludedKeywords,
        geographies: dbUser.geographies,
        keywords: dbUser.keywords,
        sectors: dbUser.sectors,
        stagePreference: dbUser.stagePreference,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      };
    }

    return session;
  },
},


  events: {
    async signIn({ user, account }: { user: any; account: Account | null }) {
      try {
        const db = await getDatabase();

        // Check if user exists
        const existingUser = await db.collection("users").findOne({ email: user.email });

        if (!existingUser) {
          // Save new user (like your POST API)
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            picture: user.image,
            provider: account?.provider,
            accessToken: account?.access_token,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log("New user saved to DB:", user.email);
        } else {
          // Update existing user
          await db.collection("users").updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name,
                picture: user.image,
                provider: account?.provider,
                accessToken: account?.access_token,
                updatedAt: new Date(),
              },
            }
          );
          console.log("Existing user updated:", user.email);
        }
      } catch (err) {
        console.error("Error saving Google user to DB:", err);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
