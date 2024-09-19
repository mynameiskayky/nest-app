"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <TransactionProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </TransactionProvider>
    </NextAuthSessionProvider>
  );
}
