import { FileText, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { recentDocuments, type DocumentStatus } from "@/lib/mock-data";

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "success" | "pending" | "warning" | "destructive" }
> = {
  approved: { label: "已過帳", variant: "success" },
  pending: { label: "待處理", variant: "pending" },
  review: { label: "審核中", variant: "warning" },
  rejected: { label: "已退回", variant: "destructive" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function RecentDocumentsTable() {
  return (
    <Card className="animate-fade-in-delay-2 border-border/60">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">最近文件</CardTitle>
          <CardDescription>
            最新由 AI 辨識處理的發票與傳票
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-10 w-full touch-manipulation sm:w-auto">
          查看全部
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:hidden">
          {recentDocuments.map((doc) => {
            const status = statusConfig[doc.status];

            return (
              <div
                key={doc.id}
                className="rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{doc.document}</p>
                      <Badge
                        variant={status.variant}
                        className={cn(
                          "shrink-0 text-[10px]",
                          doc.status === "pending" &&
                            "bg-violet-50 text-violet-700 hover:bg-violet-50"
                        )}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    {doc.category && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {doc.category}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-medium">{doc.vendor}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(doc.amount)}
                      </span>
                      <span className="text-muted-foreground">{doc.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>文件</TableHead>
                <TableHead>供應商</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocuments.map((doc) => {
                const status = statusConfig[doc.status];

                return (
                  <TableRow key={doc.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-secondary">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.document}</p>
                          {doc.category && (
                            <p className="text-xs text-muted-foreground">
                              {doc.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{doc.vendor}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(doc.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={status.variant}
                        className={cn(
                          doc.status === "pending" &&
                            "bg-violet-50 text-violet-700 hover:bg-violet-50"
                        )}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
