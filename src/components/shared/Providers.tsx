"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useState } from "react";

interface ProvidersProps {
  children: ReactNode;
}

import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
