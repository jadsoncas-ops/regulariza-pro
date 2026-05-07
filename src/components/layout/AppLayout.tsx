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
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <AppHeader title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1480px] w-full mx-auto px-8 py-10 flex flex-col gap-10 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
