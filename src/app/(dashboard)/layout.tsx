"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { useUIStore } from "@/store/uiStore";
import { twMerge } from "tailwind-merge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <RoleGuard allowedRoles={['APPLICANT', 'LMO', 'GATC', 'ADMIN']}>
      <div className="flex min-h-screen w-full bg-slate-50">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content Area */}
        <div 
          className={twMerge(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          {/* Top Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
