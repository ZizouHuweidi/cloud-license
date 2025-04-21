"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.replace("/login");
    }
  }, [router]);
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56">
        {/* Topbar */}
        <header className="h-16 border-b flex items-center px-8 justify-between bg-background">
          <div className="font-semibold text-xl">Dashboard</div>
          <div>
            <form onSubmit={e => {
              e.preventDefault();
              localStorage.removeItem("token");
              router.replace("/login");
            }}>
              <Button type="submit" variant="outline">Logout</Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}

import { Sidebar } from "./sidebar";
