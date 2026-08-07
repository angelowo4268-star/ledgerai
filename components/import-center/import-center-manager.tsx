"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  Loader2,
  RefreshCw,
  Sheet,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SuccessToast,
  useSuccessToast,
} from "@/components/ui/success-toast";
import { googleSheetsConnector, fetchGoogleOAuthConfig } from "@/lib/import/connectors/google-sheets/connector";
import type { GoogleOAuthConfigStatus } from "@/lib/import/connectors/google-sheets/google-config";
import {
  buildHeuristicColumnMappings,
  mapColumnsWithAi,
  mergeColumnMappings,
} from "@/lib/import/pipeline/column-mapping";
import { executeImport } from "@/lib/import/pipeline/executor";
import { mapRowsToImportRecords } from "@/lib/import/pipeline/normalize";
import { repairImportRows } from "@/lib/import/pipeline/repair";
import { validateImportRows } from "@/lib/import/pipeline/validation";
import type {
  ColumnMappingItem,
  DataRepair,
  GoogleSpreadsheetSummary,
  GoogleWorksheetSummary,
  ImportFieldKey,
  ImportResult,
  MappedImportRow,
  RawImportData,
  ValidationIssue,
} from "@/lib/import/types";
import { IMPORT_FIELD_KEYS } from "@/lib/import/types";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type WizardStep =
  | "connect"
  | "spreadsheet"
  | "worksheet"
  | "mapping"
  | "review"
  | "complete";

const FIELD_LABELS: Record<ImportFieldKey, TranslationKey> = {
  customer: "importCenter.fieldCustomer",
  product: "importCenter.fieldProduct",
  quantity: "importCenter.fieldQuantity",
  amount: "importCenter.fieldAmount",
  paid: "importCenter.fieldPaid",
  remaining: "importCenter.fieldRemaining",
  currency: "importCenter.fieldCurrency",
  orderId: "importCenter.fieldOrderId",
  paymentMethod: "importCenter.fieldPaymentMethod",
  status: "importCenter.fieldStatus",
  remarks: "importCenter.fieldRemarks",
};

function formatModifiedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function ImportCenterManager() {
  const { t } = useTranslation();
  const toast = useSuccessToast();

  const [step, setStep] = useState<WizardStep>("connect");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheetSummary[]>(
    []
  );
  const [worksheets, setWorksheets] = useState<GoogleWorksheetSummary[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] =
    useState<GoogleSpreadsheetSummary | null>(null);
  const [selectedWorksheet, setSelectedWorksheet] =
    useState<GoogleWorksheetSummary | null>(null);
  const [rawData, setRawData] = useState<RawImportData | null>(null);
  const [mappings, setMappings] = useState<ColumnMappingItem[]>([]);
  const [mappedRows, setMappedRows] = useState<MappedImportRow[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [repairs, setRepairs] = useState<DataRepair[]>([]);
  const [createVouchers, setCreateVouchers] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [oauthConfig, setOauthConfig] = useState<GoogleOAuthConfigStatus | null>(
    null
  );

  const loadOAuthConfig = useCallback(async () => {
    try {
      const config = await fetchGoogleOAuthConfig();
      setOauthConfig(config);
      return config;
    } catch {
      setOauthConfig(null);
      setError(t("importCenter.configLoadFailed"));
      return null;
    }
  }, [t]);

  const refreshConnection = useCallback(async () => {
    const config = oauthConfig ?? (await loadOAuthConfig());
    if (!config?.configured) {
      setConnected(false);
      return;
    }

    const isConnected = await googleSheetsConnector.isConnected();
    setConnected(isConnected);
    if (isConnected) {
      setStep((current) => (current === "connect" ? "spreadsheet" : current));
    }
  }, [loadOAuthConfig, oauthConfig]);

  useEffect(() => {
    void loadOAuthConfig();
  }, [loadOAuthConfig]);

  useEffect(() => {
    void refreshConnection();
  }, [refreshConnection]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    if (params.get("google") === "connected") {
      void refreshConnection();
      window.history.replaceState({}, "", "/import-center");
    }

    if (params.get("google") === "error") {
      if (message === "oauth_not_configured") {
        setError(t("importCenter.oauthNotConfigured"));
      } else if (message === "missing_code") {
        setError(t("importCenter.oauthMissingCode"));
      } else if (message === "oauth_failed") {
        setError(t("importCenter.oauthExchangeFailed"));
      } else if (message === "oauth_start_failed") {
        setError(t("importCenter.oauthStartFailed"));
      } else {
        setError(t("importCenter.connectFailed"));
      }
      window.history.replaceState({}, "", "/import-center");
    }
  }, [refreshConnection, t]);

  const loadSpreadsheets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await googleSheetsConnector.listSpreadsheets();
      setSpreadsheets(items);
    } catch {
      setError(t("importCenter.loadSpreadsheetsFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (connected && step === "spreadsheet") {
      void loadSpreadsheets();
    }
  }, [connected, step, loadSpreadsheets]);

  const handleConnect = () => {
    if (!oauthConfig?.configured) {
      setError(t("importCenter.oauthNotConfigured"));
      return;
    }

    googleSheetsConnector.connect();
  };

  const oauthReady = oauthConfig?.configured ?? false;

  const handleDisconnect = async () => {
    await googleSheetsConnector.disconnect();
    setConnected(false);
    setStep("connect");
    setSpreadsheets([]);
    setWorksheets([]);
    setSelectedSpreadsheet(null);
    setSelectedWorksheet(null);
    setRawData(null);
  };

  const handleSelectSpreadsheet = async (spreadsheet: GoogleSpreadsheetSummary) => {
    setLoading(true);
    setError(null);
    setSelectedSpreadsheet(spreadsheet);
    try {
      const items = await googleSheetsConnector.listWorksheets(spreadsheet.id);
      setWorksheets(items);
      setStep("worksheet");
    } catch {
      setError(t("importCenter.loadWorksheetsFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorksheet = async (worksheet: GoogleWorksheetSummary) => {
    if (!selectedSpreadsheet) {
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedWorksheet(worksheet);

    try {
      const data = await googleSheetsConnector.loadWorksheet(
        selectedSpreadsheet.id,
        worksheet.title,
        selectedSpreadsheet.name,
        worksheet.sheetId
      );
      setRawData(data);

      const heuristic = buildHeuristicColumnMappings(data.headers);
      const aiResult = await mapColumnsWithAi(
        data.headers,
        data.rows.slice(0, 5)
      );
      const merged = mergeColumnMappings(heuristic, aiResult.mappings);
      setMappings(merged);

      const rows = mapRowsToImportRecords(data, merged);
      setMappedRows(rows);
      setIssues(validateImportRows(rows));
      setStep("mapping");
    } catch {
      setError(t("importCenter.loadWorksheetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (field: ImportFieldKey, header: string) => {
    if (!rawData) {
      return;
    }

    const nextMappings = mappings.map((item) =>
      item.field === field
        ? {
            ...item,
            header: header === "__none__" ? null : header,
            confidence: header === "__none__" ? 0 : 100,
          }
        : item
    );

    setMappings(nextMappings);
    const rows = mapRowsToImportRecords(rawData, nextMappings);
    setMappedRows(rows);
    setIssues(validateImportRows(rows));
  };

  const handleContinueToReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const repaired = await repairImportRows(mappedRows);
      setMappedRows(repaired.rows);
      setRepairs(repaired.repairs);
      setIssues(validateImportRows(repaired.rows));
      setStep("review");
    } catch {
      setError(t("importCenter.repairFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!rawData) {
      return;
    }

    const sourceLabel = `Google Sheets · ${rawData.sourceName} · ${rawData.sheetName}`;
    const result = executeImport(mappedRows, sourceLabel, { createVouchers });
    setImportResult(result);
    setStep("complete");
    toast.show(t("importCenter.importSuccess"));
  };

  const previewRows = useMemo(
    () => mappedRows.slice(0, 8),
    [mappedRows]
  );

  const lowConfidenceMappings = mappings.filter(
    (item) => item.header && item.confidence < 70
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in sm:space-y-8">
        <PageHeader
          title={t("importCenter.title")}
          description={t("importCenter.description")}
        />

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {(
            [
              ["connect", t("importCenter.stepConnect")],
              ["spreadsheet", t("importCenter.stepSpreadsheet")],
              ["worksheet", t("importCenter.stepWorksheet")],
              ["mapping", t("importCenter.stepMapping")],
              ["review", t("importCenter.stepReview")],
              ["complete", t("importCenter.stepComplete")],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                step === key
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-border/60 text-muted-foreground"
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {step === "connect" && (
          <div className="space-y-4">
            {!oauthReady && oauthConfig && (
              <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    {t("importCenter.setupTitle")}
                  </CardTitle>
                  <CardDescription>{t("importCenter.setupHint")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium">{t("importCenter.setupMissingEnv")}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      {oauthConfig.missing.map((key) => (
                        <li key={key}>
                          <code>{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium">{t("importCenter.setupRequiredApis")}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      {oauthConfig.requiredApis.map((api) => (
                        <li key={api}>{api}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium">{t("importCenter.setupRedirectUri")}</p>
                    <code className="mt-2 block rounded-lg border border-border/60 bg-background px-3 py-2 text-xs">
                      {oauthConfig.redirectUri}
                    </code>
                  </div>

                  {oauthConfig.recommendedEnv.length > 0 && (
                    <div>
                      <p className="font-medium">{t("importCenter.setupRecommendedEnv")}</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        {oauthConfig.recommendedEnv.map((key) => (
                          <li key={key}>
                            <code>{key}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-muted-foreground">
                    {t("importCenter.setupCopyEnv")}{" "}
                    <code>.env.local.example</code>
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CloudDownload className="h-5 w-5 text-primary" />
                  {t("importCenter.connectTitle")}
                </CardTitle>
                <CardDescription>{t("importCenter.connectHint")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleConnect}
                  disabled={!oauthReady}
                  className="h-11 touch-manipulation shadow-sm"
                >
                  {t("importCenter.connectGoogle")}
                </Button>
                {connected && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("spreadsheet")}
                    className="h-11 touch-manipulation"
                  >
                    {t("importCenter.continue")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === "spreadsheet" && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {t("importCenter.spreadsheetsTitle")}
                </CardTitle>
                <CardDescription>
                  {t("importCenter.spreadsheetsHint")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadSpreadsheets()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDisconnect()}
                >
                  {t("importCenter.disconnect")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("importCenter.loading")}
                </div>
              )}
              {!loading && spreadsheets.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("importCenter.noSpreadsheets")}
                </p>
              )}
              {spreadsheets.map((spreadsheet) => (
                <button
                  key={spreadsheet.id}
                  type="button"
                  onClick={() => void handleSelectSpreadsheet(spreadsheet)}
                  className="flex w-full items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-left hover:border-primary/30 hover:bg-primary/5"
                >
                  <div>
                    <p className="font-medium">{spreadsheet.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("importCenter.lastModified")}:{" "}
                      {formatModifiedDate(spreadsheet.modifiedTime)}
                    </p>
                  </div>
                  <Sheet className="h-4 w-4 text-primary" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {step === "worksheet" && selectedSpreadsheet && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("importCenter.worksheetsTitle")}
              </CardTitle>
              <CardDescription>
                {selectedSpreadsheet.name} · {t("importCenter.worksheetsHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {worksheets.map((worksheet) => (
                <button
                  key={worksheet.sheetId}
                  type="button"
                  onClick={() => void handleSelectWorksheet(worksheet)}
                  className="flex w-full items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-left hover:border-primary/30 hover:bg-primary/5"
                >
                  <p className="font-medium">{worksheet.title}</p>
                  <Badge variant="secondary">#{worksheet.index + 1}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {step === "mapping" && rawData && (
          <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("importCenter.previewTitle")}
                </CardTitle>
                <CardDescription>
                  {rawData.sourceName} · {rawData.sheetName} ·{" "}
                  {rawData.totalRows} {t("importCenter.rows")}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {rawData.headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.rows.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("importCenter.mappingTitle")}
                </CardTitle>
                <CardDescription>{t("importCenter.mappingHint")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {IMPORT_FIELD_KEYS.map((field) => {
                  const mapping = mappings.find((item) => item.field === field);
                  return (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`map-${field}`}>
                        {t(FIELD_LABELS[field])}
                        {mapping && mapping.confidence < 70 && mapping.header && (
                          <Badge variant="secondary" className="ml-2">
                            {mapping.confidence}%
                          </Badge>
                        )}
                      </Label>
                      <select
                        id={`map-${field}`}
                        value={mapping?.header ?? "__none__"}
                        onChange={(event) =>
                          handleMappingChange(field, event.target.value)
                        }
                        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                      >
                        <option value="__none__">
                          {t("importCenter.unmapped")}
                        </option>
                        {rawData.headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {lowConfidenceMappings.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                <CardContent className="flex items-start gap-3 pt-6">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">
                    {t("importCenter.lowConfidenceHint")}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => void handleContinueToReview()}
                disabled={loading}
                className="h-11 touch-manipulation shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("importCenter.validating")}
                  </>
                ) : (
                  t("importCenter.continueReview")
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  {t("importCenter.validationTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {issues.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("importCenter.noIssues")}
                  </p>
                )}
                {issues.map((issue, index) => (
                  <div
                    key={`${issue.rowIndex}-${issue.code}-${index}`}
                    className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">
                      {t("importCenter.row")} {issue.rowIndex}:
                    </span>{" "}
                    {issue.message}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5 text-primary" />
                  {t("importCenter.repairsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {repairs.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("importCenter.noRepairs")}
                  </p>
                )}
                {repairs.map((repair, index) => (
                  <div
                    key={`${repair.rowIndex}-${repair.field}-${index}`}
                    className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {t("importCenter.row")} {repair.rowIndex} ·{" "}
                      {t(FIELD_LABELS[repair.field])}
                    </p>
                    <p className="text-muted-foreground">
                      {repair.originalValue || "—"} → {repair.repairedValue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {repair.reason}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("importCenter.mappedPreviewTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("importCenter.fieldCustomer")}</TableHead>
                      <TableHead>{t("importCenter.fieldProduct")}</TableHead>
                      <TableHead>{t("importCenter.fieldAmount")}</TableHead>
                      <TableHead>{t("importCenter.fieldPaid")}</TableHead>
                      <TableHead>{t("importCenter.fieldRemaining")}</TableHead>
                      <TableHead>{t("importCenter.fieldStatus")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow key={row.rowIndex}>
                        <TableCell>{row.customer}</TableCell>
                        <TableCell>{row.product}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>{row.paid}</TableCell>
                        <TableCell>{row.remaining}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="flex items-center gap-3 pt-6">
                <input
                  id="create-vouchers"
                  type="checkbox"
                  checked={createVouchers}
                  onChange={(event) => setCreateVouchers(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <Label htmlFor="create-vouchers">
                  {t("importCenter.createVouchers")}
                </Label>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("mapping")}
                className="h-11 touch-manipulation"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                className="h-11 touch-manipulation shadow-sm"
              >
                {t("importCenter.confirmImport")}
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && importResult && (
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {t("importCenter.completeTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {t("importCenter.resultCustomers")}
                </p>
                <p className="text-2xl font-bold">
                  {importResult.customersCreated + importResult.customersUpdated}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {t("importCenter.resultOrders")}
                </p>
                <p className="text-2xl font-bold">{importResult.ordersCreated}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {t("importCenter.resultCommunication")}
                </p>
                <p className="text-2xl font-bold">
                  {importResult.communicationRecordsCreated}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {t("importCenter.resultVouchers")}
                </p>
                <p className="text-2xl font-bold">
                  {importResult.vouchersCreated}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-dashed border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {t("importCenter.futureConnectorsTitle")}
            </CardTitle>
            <CardDescription>
              {t("importCenter.futureConnectorsHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              "Google Forms",
              "Excel",
              "CSV",
              "Discord",
              "Slack",
              "Email",
              "Telegram",
            ].map((name) => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <SuccessToast message={toast.message} onDismiss={toast.dismiss} />
    </>
  );
}
