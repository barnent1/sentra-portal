import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  variant?: "default" | "with-sidebar" | "minimal";
  className?: string;
}

export function AppLayout({
  children,
  variant = "default",
  className,
}: AppLayoutProps) {
  if (variant === "minimal") {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  if (variant === "with-sidebar") {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/10">
            <div className={cn("container py-6", className)}>{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className={cn("container py-6", className)}>{children}</div>
      </main>
      <Footer />
    </div>
  );
}