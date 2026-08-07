"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const importCardClass = "border-border/60 shadow-sm";

type WizardStepKey = string;

interface ImportStepIndicatorProps {
  steps: ReadonlyArray<readonly [WizardStepKey, string]>;
  currentStep: WizardStepKey;
  maxVisitedStepIndex: number;
  loading: boolean;
  onStepClick: (step: WizardStepKey, index: number) => void;
}

export function ImportStepIndicator({
  steps,
  currentStep,
  maxVisitedStepIndex,
  loading,
  onStepClick,
}: ImportStepIndicatorProps) {
  const currentIndex = steps.findIndex(([key]) => key === currentStep);

  return (
    <nav
      aria-label="Import progress"
      className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex min-w-max items-center gap-1 sm:min-w-0 sm:gap-0">
        {steps.map(([key, label], index) => {
          const isActive = currentStep === key;
          const isComplete = index < currentIndex;
          const isReachable = index <= maxVisitedStepIndex;
          const isClickable = isReachable && !isActive && !loading;

          return (
            <li key={key} className="flex items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick(key, index)}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all duration-200 sm:px-3",
                  isActive &&
                    "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20",
                  !isActive &&
                    isReachable &&
                    "text-foreground hover:bg-muted/60",
                  !isReachable && "cursor-not-allowed text-muted-foreground/70",
                  isClickable && "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete &&
                      !isActive &&
                      "bg-primary/15 text-primary",
                    !isActive &&
                      !isComplete &&
                      isReachable &&
                      "bg-muted text-muted-foreground",
                    !isReachable && "bg-muted/60 text-muted-foreground/60"
                  )}
                >
                  {isComplete && !isActive ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:inline",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight
                  aria-hidden
                  className={cn(
                    "mx-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 sm:mx-1",
                    index < currentIndex && "text-primary/40"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function ImportStepPanel({
  stepKey,
  children,
  className,
}: {
  stepKey: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div key={stepKey} className={cn("animate-step-in space-y-6", className)}>
      {children}
    </div>
  );
}

export function ImportLoadingBanner({ message }: { message: string }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
      <CardContent className="flex items-center gap-3 py-4 sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ImportErrorAlert({
  message,
  onDismiss,
  dismissLabel,
}: {
  message: string;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
      <CardContent className="flex items-start gap-3 py-4 sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-destructive">{message}</p>
          {onDismiss && dismissLabel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="h-8 border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              {dismissLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImportEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ImportResourceSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-xl border border-border/50 bg-background px-4 py-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 max-w-[70vw]" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-5 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ImportSourceCard({
  title,
  description,
  icon: Icon,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between rounded-xl border border-border/60 bg-background p-5 text-left transition-all duration-200",
        "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      <div className="pr-4">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </button>
  );
}

export function ImportResourceRow({
  title,
  subtitle,
  icon: Icon,
  disabled,
  onClick,
  trailing,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-4 py-3.5 text-left transition-all duration-200",
        "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{title}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </button>
  );
}

export function ImportStepFooter({
  showPrevious,
  onPrevious,
  loading,
  previousLabel,
  children,
}: {
  showPrevious?: boolean;
  onPrevious?: () => void;
  loading?: boolean;
  previousLabel: string;
  children?: ReactNode;
}) {
  if (!showPrevious && !children) {
    return null;
  }

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {showPrevious && onPrevious ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onPrevious}
          disabled={loading}
          className="h-11 w-full touch-manipulation sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          {previousLabel}
        </Button>
      ) : (
        <span className="hidden sm:block" />
      )}
      {children ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ImportSectionCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(importCardClass, className)}>
      <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            {Icon && (
              <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
            )}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function ImportStatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background px-4 py-4 sm:py-5",
        highlight
          ? "border-primary/20 bg-primary/5"
          : "border-border/60"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight sm:text-3xl",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ImportWarningCallout({ children }: { children: ReactNode }) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
      <CardContent className="flex items-start gap-3 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImportSuccessPanel({
  title,
  subtitle,
  summarySectionLabel,
  recordsSectionLabel,
  summaryTiles,
  resultTiles,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  subtitle: string;
  summarySectionLabel: string;
  recordsSectionLabel: string;
  summaryTiles: ReactNode;
  resultTiles: ReactNode;
  primaryAction: ReactNode;
  secondaryAction: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-primary/20 shadow-md">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 py-8 sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Check className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
      <CardContent className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {summarySectionLabel}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">{summaryTiles}</div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {recordsSectionLabel}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resultTiles}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row">
          {primaryAction}
          {secondaryAction}
        </div>
      </CardContent>
    </Card>
  );
}
