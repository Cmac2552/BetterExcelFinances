// app/upload/layout.js
import { ReactNode } from "react";
import { Nav } from "../components/nav";

interface Props {
  children: ReactNode;
}

export default function UploadLayout({ children }: Readonly<Props>) {
  return (
    <div className="upload h-screen">
      <main className="h-full">
        <Nav />
        {children}
      </main>
    </div>
  );
}
