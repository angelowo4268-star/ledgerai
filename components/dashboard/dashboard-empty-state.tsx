"use client";

import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

export function DashboardEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="border-dashed border-primary/20 bg-primary/5">
      <CardHeader className="text-center sm:text-left">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 sm:mx-0">
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4 text-lg">{t("dashboard.emptyTitle")}</CardTitle>
        <CardDescription>{t("dashboard.emptyDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-10 touch-manipulation shadow-sm">
          <Link href="/invoice-upload">
            {t("dashboard.goToDocumentCenter")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-10 touch-manipulation">
          <Link href="/voucher-management">
            {t("dashboard.goToVoucherManagement")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
