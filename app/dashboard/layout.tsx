// app/dashboard/layout.js
import { ReactNode } from "react";
import { Nav } from "../components/nav";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Readonly<Props>) {
  return (
    <div className="dashboard h-screen">
      <main className="h-full font-serif">
        <Nav />
        {children}
      </main>
    </div>
  );
}
