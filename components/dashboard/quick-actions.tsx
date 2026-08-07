"use client";

import Link from "next/link";
import { ArrowRight, FileSpreadsheet, FileUp, Upload } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    {
      title: t("dashboard.uploadInvoice"),
      description: t("dashboard.uploadInvoiceDescription"),
      href: "/invoice-upload",
      icon: Upload,
      color: "bg-violet-100 text-violet-700",
      hoverColor: "group-hover:bg-violet-600 group-hover:text-white",
    },
    {
      title: t("dashboard.importLedger"),
      description: t("dashboard.importLedgerDescription"),
      href: "/excel-import",
      icon: FileSpreadsheet,
      color: "bg-purple-100 text-purple-700",
      hoverColor: "group-hover:bg-purple-600 group-hover:text-white",
    },
    {
      title: t("dashboard.exportVouchers"),
      description: t("dashboard.exportVouchersDescription"),
      href: "/voucher-management",
      icon: FileUp,
      color: "bg-indigo-100 text-indigo-700",
      hoverColor: "group-hover:bg-indigo-600 group-hover:text-white",
    },
  ];

  return (
    <Card className="animate-fade-in-delay-3 border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">{t("dashboard.quickActionsTitle")}</CardTitle>
        <CardDescription>{t("dashboard.quickActionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-[120px] touch-manipulation flex-col items-start gap-4 rounded-xl border border-border/60 bg-background p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                action.color,
                action.hoverColor
              )}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold tracking-tight">{action.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {action.description}
              </p>
              <span className="mt-2 inline-flex items-center text-sm font-medium text-primary sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                {t("common.getStarted")}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
