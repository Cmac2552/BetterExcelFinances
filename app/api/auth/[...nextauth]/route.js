import NextAuth from "next-auth/next";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/app/lib/prisma";
export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({session, user}) {
            if (user) {
                session.user.id = user.id
            }
            return session;
        }
    },
    events:{
        async createUser({user}){
            console.log("User ADDED");
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};