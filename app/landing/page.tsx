import Link from 'next/link'; // Import Link for Next.js navigation

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#141414] text-[#f4f0e1] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* Simple abstract visual element */}
        <div className="flex justify-center items-end space-x-2 h-16 mb-6">
          <div className="w-4 h-8 bg-gray-700 rounded-t-sm"></div>
          <div className="w-4 h-12 bg-gray-600 rounded-t-sm"></div>
          <div className="w-4 h-16 bg-gray-500 rounded-t-sm"></div>
          <div className="w-4 h-10 bg-gray-600 rounded-t-sm"></div>
        </div>
        <h1 className="text-5xl font-bold mb-4">BetterExcelFinances</h1>
        <p className="text-xl text-gray-400 mb-8">Track your finances with clarity.</p>
        <Link href="/api/auth/signin?callbackUrl=/" legacyBehavior>
          <a className="inline-block bg-[#f4f0e1] text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5">
            Sign In
          </a>
        </Link>
      </div>
    </main>
  );
}
