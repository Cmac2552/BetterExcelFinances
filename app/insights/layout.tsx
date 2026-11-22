import { ReactNode } from "react";
import { Nav } from "../components/nav";

interface Props {
  children: ReactNode;
}

export default function InsightsLayout({ children }: Readonly<Props>) {
  return (
    <div className="insights min-h-screen bg-[#141414]">
      <main className="min-h-screen font-serif">
        <Nav />
        {children}
      </main>
    </div>
  );
}
