import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

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
      <Button variant="primary" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
