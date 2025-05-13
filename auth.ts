import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import prisma from "./app/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
 
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [ Google],
  adapter: PrismaAdapter(prisma),
  callbacks:{
    async session({session, user}) {
        if(user) {
            session.user.id = user.id
        }
        return session;
    }
  }
})