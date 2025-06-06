import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/landing");
  } else {
    redirect("/dashboard");
  }
  return <div>test</div>;
}
