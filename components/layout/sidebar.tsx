"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  ScrollText,
  Scale,
  Settings,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems, type NavItemKey } from "@/lib/mock-data";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  upload: Upload,
  sparkles: Sparkles,
  voucher: ScrollText,
  scale: Scale,
  "message-circle": MessageCircle,
  "messages-square": MessagesSquare,
  "bar-chart": BarChart3,
  "cloud-download": CloudDownload,
  "file-spreadsheet": FileSpreadsheet,
  history: History,
  settings: Settings,
} as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobileDrawer = mobileOpen;

  const getNavLabel = (key: NavItemKey) =>
    t(`nav.${key}` as TranslationKey);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        role={isMobileDrawer ? "dialog" : undefined}
        aria-modal={isMobileDrawer ? true : undefined}
        aria-label={isMobileDrawer ? t("nav.navigationMenu") : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out",
          "w-[min(100vw-3rem,18rem)] lg:w-64",
          collapsed && "lg:w-[68px]",
          "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0 shadow-2xl"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed && !mobileOpen ? "lg:justify-center" : "gap-3"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                LedgerAI
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {t("nav.brandSubtitle")}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-11 w-11 touch-manipulation lg:hidden"
            onClick={onMobileClose}
            aria-label={t("nav.closeNavigationMenu")}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
          {(!collapsed || mobileOpen) && (
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("nav.mainMenu")}
            </p>
          )}
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const showCollapsed = collapsed && !mobileOpen;

            const linkContent = (
              <Link
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex min-h-12 touch-manipulation items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  showCollapsed && "lg:min-h-0 lg:justify-center lg:px-0 lg:py-2.5"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors lg:h-[18px] lg:w-[18px]",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                {!showCollapsed && <span>{getNavLabel(item.key)}</span>}
              </Link>
            );

            if (showCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{getNavLabel(item.key)}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        <Separator />

        <div className="hidden p-3 lg:block">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={onToggle}
            className={cn(
              "w-full text-muted-foreground hover:text-foreground",
              !collapsed && "justify-start gap-2"
            )}
            aria-label={collapsed ? t("nav.collapseSidebar") : t("nav.collapseSidebar")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>{t("nav.collapseSidebar")}</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
