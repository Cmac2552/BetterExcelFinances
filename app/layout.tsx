import { Inter } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "./components/ClientSessionProvider";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider session={session}>{children}</ClientSessionProvider>
      </body>
    </html>
  );
}
