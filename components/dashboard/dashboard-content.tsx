"use client";

import { useMemo } from "react";

import { AccountingStatCards } from "@/components/dashboard/accounting-stat-cards";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentVouchersActivity } from "@/components/dashboard/recent-vouchers-activity";
import { PageHeader } from "@/components/layout/page-header";
import { useVoucherData } from "@/hooks/use-voucher-data";
import { useTranslation } from "@/lib/i18n/context";
import {
  computeCategoryBreakdown,
  computeDashboardSummary,
  computeMonthlyTrend,
  computeTopVendors,
  getRecentVouchers,
  hasExpenseTrendData,
  hasVoucherData,
} from "@/lib/accounting/dashboard-stats";

export function DashboardContent() {
  const { vouchers, isReady } = useVoucherData();
  const { t } = useTranslation();

  const summary = useMemo(
    () => computeDashboardSummary(vouchers),
    [vouchers]
  );
  const monthlyTrend = useMemo(
    () => computeMonthlyTrend(vouchers),
    [vouchers]
  );
  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(vouchers),
    [vouchers]
  );
  const topVendors = useMemo(
    () => computeTopVendors(vouchers),
    [vouchers]
  );
  const recentVouchers = useMemo(
    () => getRecentVouchers(vouchers),
    [vouchers]
  );
  const hasData = hasVoucherData(vouchers);
  const hasTrendData = hasExpenseTrendData(vouchers);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        className="animate-fade-in"
      />

      {!isReady ? (
        <DashboardSkeleton />
      ) : (
        <>
          <AccountingStatCards summary={summary} />

          {!hasData && <DashboardEmptyState />}

          <DashboardCharts
            monthlyTrend={monthlyTrend}
            categoryBreakdown={categoryBreakdown}
            topVendors={topVendors}
            hasTrendData={hasTrendData}
          />

          <QuickActions />

          <RecentVouchersActivity vouchers={recentVouchers} />
        </>
      )}
    </div>
  );
}
