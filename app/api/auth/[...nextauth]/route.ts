import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord") return true;
      const discordId =
        account.providerAccountId || (profile as { id?: string })?.id;
      if (!discordId) return false;

      await prisma.user.upsert({
        where: { discordId },
        update: {
          name: user.name || "Unknown",
          image: user.image || null,
        },
        create: {
          discordId,
          name: user.name || "Unknown",
          image: user.image || null,
        },
      });

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord") {
        token.discordId =
          account.providerAccountId || (profile as { id?: string })?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.discordId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
