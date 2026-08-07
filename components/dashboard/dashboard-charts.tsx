"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  CategorySlice,
  MonthlyTrendPoint,
  VendorBar,
} from "@/lib/accounting/dashboard-stats";
import { useTranslation } from "@/lib/i18n/context";

import { CategoryPieChart } from "./charts/category-pie-chart";
import { ExpenseTrendChart } from "./charts/expense-trend-chart";
import { TopVendorsChart } from "./charts/top-vendors-chart";

interface DashboardChartsProps {
  monthlyTrend: MonthlyTrendPoint[];
  categoryBreakdown: CategorySlice[];
  topVendors: VendorBar[];
  hasTrendData: boolean;
}

export function DashboardCharts({
  monthlyTrend,
  categoryBreakdown,
  topVendors,
  hasTrendData,
}: DashboardChartsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="border-border/60 xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">{t("dashboard.expenseTrendTitle")}</CardTitle>
          <CardDescription>{t("dashboard.expenseTrendDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseTrendChart data={monthlyTrend} hasData={hasTrendData} />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">{t("dashboard.categoryTitle")}</CardTitle>
          <CardDescription>{t("dashboard.categoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={categoryBreakdown} />
        </CardContent>
      </Card>

      <Card className="border-border/60 xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">{t("dashboard.topVendorsTitle")}</CardTitle>
          <CardDescription>{t("dashboard.topVendorsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <TopVendorsChart data={topVendors} />
        </CardContent>
      </Card>
    </div>
  );
}
