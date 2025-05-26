import Link from "next/link"; // Import Link for Next.js navigation

export default function LandingPage() {
  return (
    <main className="min-h-screen text-[#f4f0e1] flex flex-col items-center justify-center p-4">
      <div className="flex justify-center items-end space-x-2 h-16 mb-6">
        <div className="w-4 h-8 bg-[#008F7F] rounded-t-sm"></div>
        <div className="w-4 h-12 bg-[#66C9B4] rounded-t-sm"></div>
        <div className="w-4 h-16 bg-[#00A896] rounded-t-sm"></div>
        <div className="w-4 h-10 bg-[#66C9B4] rounded-t-sm"></div>
      </div>
      <h1 className="text-5xl font-bold mb-4">BetterExcelFinances</h1>

      <div className="text-center">
        {/* Image Slot Start: Replace the div below with your img tag or Next.js Image component */}
        {/* Recommended aspect ratio: 16:9 for consistency, but flexible */}
        <div className="mb-8">
          {" "}
          {/* Container for image slot */}
          <div className="w-full max-w-md h-64 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 text-lg">
            Your Image Here
            <br />
            (e.g., 16:9 aspect ratio)
          </div>
        </div>

        <p className="text-xl text-gray-400 mb-8">
          Track your finances with clarity.
        </p>
        <Link
          href="/api/auth/signin?callbackUrl=/"
          className="inline-block bg-[#f4f0e1] text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
