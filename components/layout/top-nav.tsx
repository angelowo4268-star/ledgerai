"use client";

import { useState } from "react";
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface TopNavProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function TopNav({
  sidebarCollapsed,
  onMobileMenuToggle,
  mobileMenuOpen,
}: TopNavProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300",
        "left-0 pt-[env(safe-area-inset-top,0px)] lg:left-64",
        sidebarCollapsed && "lg:left-[68px]"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 touch-manipulation lg:hidden"
            onClick={onMobileMenuToggle}
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden min-w-0 flex-1 md:block md:max-w-sm lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("topNav.searchPlaceholder")}
              className="h-10 border-border/60 bg-muted/40 pl-9 text-sm transition-all focus-visible:bg-background"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 touch-manipulation md:hidden"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label={t("topNav.toggleSearch")}
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 touch-manipulation text-muted-foreground hover:text-foreground"
            aria-label={t("topNav.notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-11 w-11 text-muted-foreground hover:text-foreground sm:inline-flex"
            aria-label={t("topNav.help")}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ml-0 h-11 min-w-11 touch-manipulation gap-2 rounded-full px-2 hover:bg-muted sm:ml-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    王
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline-block">
                  王小明
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>王小明</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    wang@company.com
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="min-h-11">
                <User className="mr-2 h-4 w-4" />
                {t("topNav.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="min-h-11">
                <Settings className="mr-2 h-4 w-4" />
                {t("topNav.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="min-h-11 text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t("topNav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder={t("topNav.searchPlaceholder")}
              className="h-11 border-border/60 bg-muted/40 pl-9 text-base"
            />
          </div>
        </div>
      )}
    </header>
  );
}
