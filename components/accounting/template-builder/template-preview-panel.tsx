"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExportTemplate } from "@/lib/export/types";
import { buildPreviewRows, getPreviewHeaders } from "@/lib/export/preview-samples";
import { useTranslation } from "@/lib/i18n/context";

interface TemplatePreviewPanelProps {
  draft: ExportTemplate | null;
}

export function TemplatePreviewPanel({ draft }: TemplatePreviewPanelProps) {
  const { t, locale } = useTranslation();

  if (!draft) {
    return (
      <Card className="border-border/60 shadow-sm xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle className="text-lg">{t("exportTemplates.previewTitle")}</CardTitle>
          <CardDescription>{t("exportTemplates.previewEmpty")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const headers = getPreviewHeaders(draft.fields);
  const rows = buildPreviewRows(
    draft.fields,
    draft.templateType,
    locale,
    headers.length > 0 ? 3 : 0
  );

  return (
    <Card className="border-border/60 shadow-sm xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle className="text-lg">{t("exportTemplates.previewTitle")}</CardTitle>
        <CardDescription>{t("exportTemplates.previewHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        {headers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            {t("exportTemplates.previewNoColumns")}
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {headers.map((header) => (
                    <TableHead
                      key={header}
                      className="whitespace-nowrap text-xs font-semibold"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header) => (
                      <TableCell
                        key={`${rowIndex}-${header}`}
                        className="whitespace-nowrap text-xs tabular-nums"
                      >
                        {String(row[header] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
