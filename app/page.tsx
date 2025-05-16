import { redirect } from "next/navigation";
import Dashboard from "./components/dashboard";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/");
  }
  return <Dashboard></Dashboard>;
}
