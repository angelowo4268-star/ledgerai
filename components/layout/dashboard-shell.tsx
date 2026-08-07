"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { LanguageProvider } from "@/lib/i18n/context";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardShellContent({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useBodyScrollLock(mobileOpen);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <TopNav
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
        mobileMenuOpen={mobileOpen}
      />

      <main
        className={cn(
          "min-h-screen pt-[calc(4rem+env(safe-area-inset-top,0px))] transition-all duration-300 lg:pt-16",
          "pl-0 lg:pl-64",
          sidebarCollapsed && "lg:pl-[68px]"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <LanguageProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </LanguageProvider>
  );
}
