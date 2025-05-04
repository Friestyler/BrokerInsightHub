import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="ml-16 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
