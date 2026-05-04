import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  return (
    <div className="flex h-dvh w-full bg-background text-foreground overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <AppHeader title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-[1400px] w-full mx-auto p-8 flex flex-col gap-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
