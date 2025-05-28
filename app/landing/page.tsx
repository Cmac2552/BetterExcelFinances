import Link from "next/link"; // Import Link for Next.js navigation
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <main className="min-h-screen text-[#f4f0e1] flex flex-col items-center justify-center p-4">
      <div className="flex justify-center items-end space-x-2 h-16 mb-4">
        <div className="w-4 h-8 bg-[#008F7F] rounded-t-sm"></div>
        <div className="w-4 h-12 bg-[#66C9B4] rounded-t-sm"></div>
        <div className="w-4 h-16 bg-[#00A896] rounded-t-sm"></div>
        <div className="w-4 h-10 bg-[#66C9B4] rounded-t-sm"></div>
      </div>
      <h1 className="text-5xl font-bold mb-6">BetterExcelFinances</h1>

      <div className="text-center">
        {/* Image Slot Start: Replace the div below with your img tag or Next.js Image component */}
        {/* Recommended aspect ratio: 16:9 for consistency, but flexible */}
        <Image
          src="/images/dashboard.png"
          alt="My photo"
          width={750}
          height={500}
          className="border-2 border-[#f4f0e1] rounded-sm mb-6"
        />

        <p className="text-xl text-gray-400 mb-6">
          Track your finances with clarity.
        </p>
        <Link
          href="/api/auth/signin?callbackUrl=/"
          className="inline-block bg-[#f4f0e1] text-black px-8 py-3 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
