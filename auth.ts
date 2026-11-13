import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import prisma from "./app/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
 
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [ Google],
  adapter: PrismaAdapter(prisma),
  callbacks:{
    async signIn({ user }) {
      if (!user?.email) {
        return "/landing?error=SignupsClosed";
      }
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });
      if (!existingUser) {
        return "/landing?error=SignupsClosed";
      }
      return true;
    },
    async session({session, user}) {
        if(user) {
            session.user.id = user.id
        }
        return session;
    }
  }
})