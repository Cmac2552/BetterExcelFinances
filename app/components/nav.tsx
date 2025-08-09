import Link from "next/link";
import { signOut } from "@/auth";

export function Nav() {
  return (
    <div className="w-full h-[4rem] bg-[#141414] mb-4 flex items-center justify-between px-4 border-b-2 border-[#f4f0e1]">
      <h1 className="text-3xl text-[#f4f0e1] ml-4">BetterExcelFinances</h1>
      <div className="flex gap-4 items-center ">
        <Link href="/dashboard" className="text-[#f4f0e1]">
          Dashboard
        </Link>
        <Link href="/upload" className="text-[#f4f0e1]">
          Upload
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"; // This function runs on the server
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        className="bg-[#f4f0e1] px-4 py-2 rounded-md hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 font-medium"
        type="submit"
      >
        Sign Out
      </button>
    </form>
  );
}
