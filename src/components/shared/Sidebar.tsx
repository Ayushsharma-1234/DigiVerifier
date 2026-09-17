"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { twMerge } from "tailwind-merge";
import { 
  LayoutDashboard, Scale, FilePlus, FileText, Award, Bell, User,
  ClipboardList, Calendar, Search, Shield, Tag, DollarSign,
  Users, Building2, Database, BarChart3, ScrollText,
  Menu, ChevronLeft, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROLE_NAV_CONFIG = {
  APPLICANT: [
    { title: "Dashboard", href: "/dashboard/applicant", icon: LayoutDashboard },
    { title: "My Instruments", href: "/instruments", icon: Scale },
    { title: "Apply for Verification", href: "/apply", icon: FilePlus },
    { title: "My Applications", href: "/applications", icon: FileText },
    { title: "My Certificates", href: "/certificates", icon: Award },
    { title: "Notifications", href: "/notifications", icon: Bell, badge: 3 }, // Mock badge
    { title: "Profile", href: "/profile", icon: User },
  ],
  LMO: [
    { title: "Dashboard", href: "/dashboard/lmo", icon: LayoutDashboard },
    { title: "Work Queue", href: "/lmo/queue", icon: ClipboardList },
    { title: "My Schedule", href: "/lmo/schedule", icon: Calendar },
    { title: "Inspection Form", href: "/lmo/inspect", icon: Search },
    { title: "Certificates Issued", href: "/lmo/certificates", icon: Award },
    { title: "Enforcement Log", href: "/lmo/enforcement", icon: Shield },
    { title: "Profile", href: "/profile", icon: User },
  ],
  GATC: [
    { title: "Dashboard", href: "/dashboard/gatc", icon: LayoutDashboard },
    { title: "Work Queue", href: "/gatc/queue", icon: ClipboardList },
    { title: "My Schedule", href: "/gatc/schedule", icon: Calendar },
    { title: "Authorized Categories", href: "/gatc/categories", icon: Tag },
    { title: "Fee Schedule", href: "/gatc/fees", icon: DollarSign },
    { title: "Certificates Issued", href: "/gatc/certificates", icon: Award },
    { title: "Profile", href: "/profile", icon: User },
  ],
  ADMIN: [
    { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "All Applications", href: "/admin/applications", icon: FileText },
    { title: "Users Management", href: "/admin/users", icon: Users },
    { title: "Officers & GATCs", href: "/admin/officers", icon: Building2 },
    { title: "Master Data", href: "/admin/master-data", icon: Database },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
    { title: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  ]
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar } = useUIStore();

  const role = user?.role as keyof typeof ROLE_NAV_CONFIG;
  const navItems = role ? ROLE_NAV_CONFIG[role] : [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={twMerge(
          "fixed top-0 left-0 z-50 h-screen bg-primary text-primary-foreground transition-all duration-300 ease-in-out flex flex-col shadow-xl",
          isSidebarCollapsed ? "w-16" : "w-64",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-foreground/10 shrink-0">
          {!isSidebarCollapsed && (
            <Link href="/" className="font-bold text-xl tracking-tight truncate">
              DigiVerifier
            </Link>
          )}
          {isSidebarCollapsed && (
            <Link href="/" className="font-bold text-xl mx-auto tracking-tight truncate">
              DV
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="hidden lg:flex text-primary-foreground hover:bg-primary-foreground/10 hover:text-white ml-auto"
          >
            {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 scrollbar-thin scrollbar-thumb-primary-foreground/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            const content = (
              <Link
                href={item.href}
                className={twMerge(
                  "flex items-center rounded-md px-3 py-2.5 transition-colors group relative",
                  isActive 
                    ? "bg-primary-foreground/15 text-white border-l-4 border-accent font-medium pl-2" 
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white pl-3"
                )}
              >
                <Icon className={twMerge("h-5 w-5 shrink-0", isSidebarCollapsed ? "mx-auto" : "mr-3", isActive ? "text-accent" : "")} />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.title}</span>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-accent text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                
                {/* Mobile Notification Badge on Collapsed */}
                {isSidebarCollapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-primary"></span>
                )}
              </Link>
            );

            if (isSidebarCollapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-800">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{content}</div>;
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-primary-foreground/10 p-4 shrink-0">
          <div className={twMerge("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center min-w-0">
              <Avatar className="h-9 w-9 border border-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground/10 text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              {!isSidebarCollapsed && (
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-primary-foreground/60 truncate uppercase tracking-wider">{user?.role || "ROLE"}</p>
                </div>
              )}
            </div>
            
            {!isSidebarCollapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="text-primary-foreground/60 hover:text-white hover:bg-danger/20 shrink-0"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
