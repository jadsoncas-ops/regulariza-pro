"use client";
import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AppHeader title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
          <div className="max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
