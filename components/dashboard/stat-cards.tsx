import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Clock,
  FileText,
  ScrollText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardStats } from "@/lib/mock-data";

const iconMap = {
  invoices: FileText,
  ai: BrainCircuit,
  pending: Clock,
  vouchers: ScrollText,
} as const;

const animationClasses = [
  "animate-fade-in",
  "animate-fade-in-delay-1",
  "animate-fade-in-delay-2",
  "animate-fade-in-delay-3",
];

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat, index) => {
        const Icon = iconMap[stat.icon as keyof typeof iconMap];

        return (
          <Card
            key={stat.title}
            className={cn(
              "group border-border/60 hover:border-primary/20 hover:shadow-md",
              animationClasses[index]
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10">
                <Icon className="h-[18px] w-[18px] text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {stat.changeType === "positive" && (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {stat.changeType === "negative" && (
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span
                  className={cn(
                    stat.changeType === "positive" && "text-emerald-600",
                    stat.changeType === "negative" && "text-emerald-600",
                    stat.changeType === "neutral" && "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
