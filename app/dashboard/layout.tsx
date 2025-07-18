// app/dashboard/layout.js
import { ReactNode } from "react";
import { Nav } from "../components/nav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>) {
  return (
    <div className="dashboard h-screen">
      <main className="h-full">
        <Nav />
        {children}
      </main>
    </div>
  );
}
