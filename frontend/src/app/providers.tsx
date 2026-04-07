"use client";

import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Navbar } from "@/components/navbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
      </AuthProvider>
    </ThemeProvider>
  );
}
