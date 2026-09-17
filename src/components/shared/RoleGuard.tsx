"use client";

import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, router]);

  if (isChecking) {
    return null; // Don't flash unauthenticated content or access denied screen during initial check
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card text-card-foreground p-8 rounded-xl shadow-lg border text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-danger/10 text-danger rounded-full flex items-center justify-center">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-8">
            You do not have the required permissions to view this page.
          </p>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
