"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CloudDownload,
  FolderOpen,
  Loader2,
  RefreshCw,
  Sheet,
  Wrench,
} from "lucide-react";

import {
  ImportEmptyState,
  ImportErrorAlert,
  ImportLoadingBanner,
  ImportResourceRow,
  ImportResourceSkeleton,
  ImportSectionCard,
  ImportSourceCard,
  ImportStatTile,
  ImportStepFooter,
  ImportStepIndicator,
  ImportStepPanel,
  ImportSuccessPanel,
  ImportWarningCallout,
  importCardClass,
} from "@/components/import-center/import-center-ui";
import { ImportMappingPanel } from "@/components/import-center/import-mapping-panel";
import { ImportReviewExportMenu } from "@/components/import-center/import-review-export-menu";
import { ImportReviewSummary } from "@/components/import-center/import-review-summary";

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
import { googleFormsConnector } from "@/lib/import/connectors/google-forms/connector";
import { googleSheetsConnector, fetchGoogleOAuthConfig } from "@/lib/import/connectors/google-sheets/connector";
import type { GoogleOAuthConfigStatus } from "@/lib/import/connectors/google-sheets/google-config";
import {
  buildFormColumnMappings,
  mapFormColumnsWithAi,
  mergeFormColumnMappings,
} from "@/lib/import/pipeline/form-column-mapping";
import {
  countRowsWithMissingFields,
  mapRowsToFormImportRecords,
} from "@/lib/import/pipeline/form-normalize";
import {
  buildHeuristicColumnMappings,
  mapColumnsWithAi,
  mergeColumnMappings,
} from "@/lib/import/pipeline/column-mapping";
import { executeImport } from "@/lib/import/pipeline/executor";
import { exportImportReviewToExcel } from "@/lib/import/export-review";
import { mapRowsToImportRecords } from "@/lib/import/pipeline/normalize";
import { repairImportRows } from "@/lib/import/pipeline/repair";
import {
  buildFormReviewSummary,
  buildSheetReviewSummary,
} from "@/lib/import/pipeline/review-summary";
import { validateImportRows } from "@/lib/import/pipeline/validation";
import type {
  ColumnMappingItem,
  DataRepair,
  FormColumnMappingItem,
  GoogleFormSummary,
  GoogleSpreadsheetSummary,
  GoogleWorksheetSummary,
  ImportFieldKey,
  ImportFormFieldKey,
  ImportResult,
  MappedFormImportRow,
  MappedImportRow,
  RawImportData,
  ValidationIssue,
} from "@/lib/import/types";
import { IMPORT_FIELD_KEYS, IMPORT_FORM_FIELD_KEYS } from "@/lib/import/types";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type ImportSource = "google-sheets" | "google-forms";

type WizardStep =
  | "connect"
  | "source"
  | "spreadsheet"
  | "worksheet"
  | "form"
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

const SHEET_REVIEW_EXPORT_FIELDS: ImportFieldKey[] = [
  "customer",
  "product",
  "amount",
  "paid",
  "remaining",
  "status",
];

const FORM_REVIEW_EXPORT_FIELDS: ImportFormFieldKey[] = [
  "customer",
  "product",
  "amount",
  "status",
  "date",
];

const FORM_FIELD_LABELS: Record<ImportFormFieldKey, TranslationKey> = {
  customer: "importCenter.fieldCustomer",
  product: "importCenter.fieldProduct",
  amount: "importCenter.fieldAmount",
  status: "importCenter.fieldStatus",
  date: "importCenter.fieldDate",
};

function formatModifiedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStepKeys(importSource: ImportSource | null): WizardStep[] {
  if (importSource === "google-forms") {
    return [
      "connect",
      "source",
      "form",
      "mapping",
      "review",
      "complete",
    ];
  }

  if (importSource === "google-sheets") {
    return [
      "connect",
      "source",
      "spreadsheet",
      "worksheet",
      "mapping",
      "review",
      "complete",
    ];
  }

  return ["connect", "source", "mapping", "review", "complete"];
}

function getPreviousStep(
  current: WizardStep,
  importSource: ImportSource | null
): WizardStep | null {
  const keys = getStepKeys(importSource);
  const index = keys.indexOf(current);
  if (index <= 0) {
    return null;
  }

  return keys[index - 1];
}

interface CompleteSummary {
  importedRows: number;
  detectedColumns: number;
  warnings: number;
}

function cloneColumnMappings(items: ColumnMappingItem[]) {
  return items.map((item) => ({ ...item }));
}

function cloneFormMappings(items: FormColumnMappingItem[]) {
  return items.map((item) => ({ ...item }));
}

function logImportPipeline(
  stage: string,
  rawData: RawImportData | null,
  mappedRows: MappedImportRow[],
  formRows: MappedFormImportRow[],
  importSource: ImportSource | null
) {
  const reviewRows = importSource === "google-forms" ? formRows : mappedRows;

  console.log(`[Import Pipeline] ${stage}`, {
    rawRows: rawData?.rows?.length ?? null,
    mappedRows: mappedRows.length,
    formRows: formRows.length,
    reviewRows: reviewRows.length,
    importSource,
  });
}

export function ImportCenterManager() {
  const { t } = useTranslation();
  const toast = useSuccessToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [step, setStep] = useState<WizardStep>("connect");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<TranslationKey | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState(0);

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
  const [importSource, setImportSource] = useState<ImportSource | null>(null);
  const [forms, setForms] = useState<GoogleFormSummary[]>([]);
  const [selectedForm, setSelectedForm] = useState<GoogleFormSummary | null>(
    null
  );
  const [formMappings, setFormMappings] = useState<FormColumnMappingItem[]>([]);
  const [formRows, setFormRows] = useState<MappedFormImportRow[]>([]);
  const [baselineMappings, setBaselineMappings] = useState<ColumnMappingItem[]>(
    []
  );
  const [baselineFormMappings, setBaselineFormMappings] = useState<
    FormColumnMappingItem[]
  >([]);
  const [remappingField, setRemappingField] = useState<string | null>(null);
  const [remappingAll, setRemappingAll] = useState(false);
  const [completeSummary, setCompleteSummary] = useState<CompleteSummary | null>(
    null
  );

  const beginLoading = useCallback((message: TranslationKey) => {
    setLoading(true);
    setLoadingMessage(message);
  }, []);

  const endLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage(null);
  }, []);

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
      return false;
    }

    beginLoading("importCenter.loadingConnectingGoogle");
    try {
      const isConnected = await googleSheetsConnector.isConnected();
      setConnected(isConnected);
      if (isConnected) {
        setStep((current) => (current === "connect" ? "source" : current));
      }
      return isConnected;
    } finally {
      endLoading();
    }
  }, [beginLoading, endLoading, loadOAuthConfig, oauthConfig]);

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
      void refreshConnection().then((isConnected) => {
        if (isConnected) {
          toast.show(t("importCenter.toastGoogleConnected"));
        }
      });
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
      toast.showError(t("importCenter.toastGoogleConnectionFailed"));
      window.history.replaceState({}, "", "/import-center");
    }
  }, [refreshConnection, t, toast]);

  const loadSpreadsheets = useCallback(async () => {
    beginLoading("importCenter.loadingSpreadsheets");
    setError(null);
    try {
      const items = await googleSheetsConnector.listSpreadsheets();
      setSpreadsheets(items);
    } catch {
      setError(t("importCenter.loadSpreadsheetsFailed"));
      toastRef.current.showError(t("importCenter.toastGoogleConnectionFailed"));
    } finally {
      endLoading();
    }
  }, [beginLoading, endLoading, t]);

  const loadForms = useCallback(async () => {
    beginLoading("importCenter.loadingForms");
    setError(null);
    try {
      const items = await googleFormsConnector.listForms();
      setForms(items);
    } catch {
      setError(t("importCenter.loadFormsFailed"));
      toastRef.current.showError(t("importCenter.toastGoogleConnectionFailed"));
    } finally {
      endLoading();
    }
  }, [beginLoading, endLoading, t]);

  useEffect(() => {
    if (!connected || step !== "spreadsheet" || importSource !== "google-sheets") {
      return;
    }

    let cancelled = false;

    const run = async () => {
      beginLoading("importCenter.loadingSpreadsheets");
      setError(null);
      try {
        const items = await googleSheetsConnector.listSpreadsheets();
        if (!cancelled) {
          setSpreadsheets(items);
        }
      } catch {
        if (!cancelled) {
          setError(t("importCenter.loadSpreadsheetsFailed"));
          toastRef.current.showError(
            t("importCenter.toastGoogleConnectionFailed")
          );
        }
      } finally {
        if (!cancelled) {
          endLoading();
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      endLoading();
    };
  }, [connected, step, importSource, beginLoading, endLoading, t]);

  useEffect(() => {
    if (!connected || step !== "form" || importSource !== "google-forms") {
      return;
    }

    let cancelled = false;

    const run = async () => {
      beginLoading("importCenter.loadingForms");
      setError(null);
      try {
        const items = await googleFormsConnector.listForms();
        if (!cancelled) {
          setForms(items);
        }
      } catch {
        if (!cancelled) {
          setError(t("importCenter.loadFormsFailed"));
          toastRef.current.showError(
            t("importCenter.toastGoogleConnectionFailed")
          );
        }
      } finally {
        if (!cancelled) {
          endLoading();
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      endLoading();
    };
  }, [connected, step, importSource, beginLoading, endLoading, t]);

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
    setMaxVisitedStepIndex(0);
    setImportSource(null);
    setSpreadsheets([]);
    setWorksheets([]);
    setForms([]);
    setSelectedSpreadsheet(null);
    setSelectedWorksheet(null);
    setSelectedForm(null);
    setRawData(null);
    setFormMappings([]);
    setFormRows([]);
    setBaselineMappings([]);
    setBaselineFormMappings([]);
  };

  const handleSelectSource = (source: ImportSource) => {
    setImportSource(source);
    setError(null);
    setRawData(null);
    setFormMappings([]);
    setFormRows([]);
    setMappings([]);
    setMappedRows([]);
    setCreateVouchers(source === "google-forms");
    setStep(source === "google-sheets" ? "spreadsheet" : "form");
  };

  const handleSelectForm = async (form: GoogleFormSummary) => {
    if (loading) {
      return;
    }

    beginLoading("importCenter.loadingFormResponses");
    setError(null);
    setSelectedForm(form);

    try {
      const data = await googleFormsConnector.loadFormResponses(form.id, form.name);
      setRawData(data);

      setLoadingMessage("importCenter.analyzingColumnsAi");
      const heuristic = buildFormColumnMappings(data.headers);
      let merged: FormColumnMappingItem[] = heuristic;

      try {
        const aiResult = await mapFormColumnsWithAi(
          data.headers,
          data.rows.slice(0, 5)
        );
        merged = mergeFormColumnMappings(heuristic, aiResult.mappings);
        toast.show(t("importCenter.toastAiMappingCompleted"));
      } catch {
        toast.showError(t("importCenter.toastAiMappingFailed"));
      }

      setFormMappings(merged);
      setBaselineFormMappings(cloneFormMappings(merged));

      const rows = mapRowsToFormImportRecords(data, merged);
      setFormRows(rows);
      logImportPipeline(
        "after-load-form",
        data,
        mappedRows,
        rows,
        "google-forms"
      );
      setStep("mapping");
    } catch {
      setError(t("importCenter.loadFormResponsesFailed"));
      toast.showError(t("importCenter.toastGoogleConnectionFailed"));
    } finally {
      endLoading();
    }
  };

  const applyFormMappings = useCallback(
    (nextMappings: FormColumnMappingItem[]) => {
      if (!rawData) {
        return;
      }

      setFormMappings(nextMappings);
      const rows = mapRowsToFormImportRecords(rawData, nextMappings);
      setFormRows(rows);
      logImportPipeline(
        "after-apply-form-mappings",
        rawData,
        mappedRows,
        rows,
        "google-forms"
      );
    },
    [rawData, mappedRows]
  );

  const applySheetMappings = useCallback(
    (nextMappings: ColumnMappingItem[]) => {
      if (!rawData) {
        return;
      }

      setMappings(nextMappings);
      const rows = mapRowsToImportRecords(rawData, nextMappings);
      setMappedRows(rows);
      setIssues(validateImportRows(rows));
      logImportPipeline(
        "after-apply-sheet-mappings",
        rawData,
        rows,
        formRows,
        "google-sheets"
      );
    },
    [rawData, formRows]
  );

  const handleFormMappingChange = (
    field: ImportFormFieldKey,
    header: string
  ) => {
    if (!rawData) {
      return;
    }

    const nextMappings = formMappings.map((item) =>
      item.field === field
        ? {
            ...item,
            header: header === "__none__" ? null : header,
            confidence: header === "__none__" ? 0 : 100,
          }
        : item
    );

    applyFormMappings(nextMappings);
  };

  const handleResetFormMapping = (field: string) => {
    const baseline = baselineFormMappings.find((item) => item.field === field);
    if (!baseline) {
      return;
    }

    const nextMappings = formMappings.map((item) =>
      item.field === field ? { ...baseline } : item
    );
    applyFormMappings(nextMappings);
  };

  const handleResetAllFormMappings = () => {
    applyFormMappings(cloneFormMappings(baselineFormMappings));
  };

  const handleAiRemapFormField = async (field: string) => {
    if (!rawData || loading || remappingAll) {
      return;
    }

    setRemappingField(field);
    setError(null);

    try {
      const heuristic = buildFormColumnMappings(rawData.headers);
      const aiResult = await mapFormColumnsWithAi(
        rawData.headers,
        rawData.rows.slice(0, 5)
      );
      const merged = mergeFormColumnMappings(heuristic, aiResult.mappings);
      const aiField = merged.find((item) => item.field === field);

      if (!aiField) {
        return;
      }

      const nextMappings = formMappings.map((item) =>
        item.field === field ? { ...aiField } : item
      );
      applyFormMappings(nextMappings);
      toast.show(t("importCenter.toastAiMappingCompleted"));
    } catch {
      toast.showError(t("importCenter.toastAiMappingFailed"));
    } finally {
      setRemappingField(null);
    }
  };

  const handleAiRemapAllFormMappings = async () => {
    if (!rawData || loading || remappingField) {
      return;
    }

    setRemappingAll(true);
    setError(null);
    beginLoading("importCenter.analyzingColumnsAi");

    try {
      const heuristic = buildFormColumnMappings(rawData.headers);
      const aiResult = await mapFormColumnsWithAi(
        rawData.headers,
        rawData.rows.slice(0, 5)
      );
      const merged = mergeFormColumnMappings(heuristic, aiResult.mappings);
      setBaselineFormMappings(cloneFormMappings(merged));
      applyFormMappings(merged);
      toast.show(t("importCenter.toastAiMappingCompleted"));
    } catch {
      toast.showError(t("importCenter.toastAiMappingFailed"));
    } finally {
      setRemappingAll(false);
      endLoading();
    }
  };

  const handleSelectSpreadsheet = async (spreadsheet: GoogleSpreadsheetSummary) => {
    if (loading) {
      return;
    }

    beginLoading("importCenter.loadingWorksheets");
    setError(null);
    setSelectedSpreadsheet(spreadsheet);
    try {
      const items = await googleSheetsConnector.listWorksheets(spreadsheet.id);
      setWorksheets(items);
      setStep("worksheet");
    } catch {
      setError(t("importCenter.loadWorksheetsFailed"));
      toast.showError(t("importCenter.toastGoogleConnectionFailed"));
    } finally {
      endLoading();
    }
  };

  const handleSelectWorksheet = async (worksheet: GoogleWorksheetSummary) => {
    if (!selectedSpreadsheet || loading) {
      return;
    }

    beginLoading("importCenter.loadingWorksheetData");
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

      setLoadingMessage("importCenter.analyzingColumnsAi");
      const heuristic = buildHeuristicColumnMappings(data.headers);
      let merged: ColumnMappingItem[] = heuristic;

      try {
        const aiResult = await mapColumnsWithAi(
          data.headers,
          data.rows.slice(0, 5)
        );
        merged = mergeColumnMappings(heuristic, aiResult.mappings);
        toast.show(t("importCenter.toastAiMappingCompleted"));
      } catch {
        toast.showError(t("importCenter.toastAiMappingFailed"));
      }

      setMappings(merged);
      setBaselineMappings(cloneColumnMappings(merged));

      const rows = mapRowsToImportRecords(data, merged);
      setMappedRows(rows);
      setIssues(validateImportRows(rows));
      logImportPipeline(
        "after-load-worksheet",
        data,
        rows,
        formRows,
        "google-sheets"
      );
      setStep("mapping");
    } catch {
      setError(t("importCenter.loadWorksheetFailed"));
      toast.showError(t("importCenter.toastGoogleConnectionFailed"));
    } finally {
      endLoading();
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

    applySheetMappings(nextMappings);
  };

  const handleResetSheetMapping = (field: string) => {
    const baseline = baselineMappings.find((item) => item.field === field);
    if (!baseline) {
      return;
    }

    const nextMappings = mappings.map((item) =>
      item.field === field ? { ...baseline } : item
    );
    applySheetMappings(nextMappings);
  };

  const handleResetAllSheetMappings = () => {
    applySheetMappings(cloneColumnMappings(baselineMappings));
  };

  const handleAiRemapSheetField = async (field: string) => {
    if (!rawData || loading || remappingAll) {
      return;
    }

    setRemappingField(field);
    setError(null);

    try {
      const heuristic = buildHeuristicColumnMappings(rawData.headers);
      const aiResult = await mapColumnsWithAi(
        rawData.headers,
        rawData.rows.slice(0, 5)
      );
      const merged = mergeColumnMappings(heuristic, aiResult.mappings);
      const aiField = merged.find((item) => item.field === field);

      if (!aiField) {
        return;
      }

      const nextMappings = mappings.map((item) =>
        item.field === field ? { ...aiField } : item
      );
      applySheetMappings(nextMappings);
      toast.show(t("importCenter.toastAiMappingCompleted"));
    } catch {
      toast.showError(t("importCenter.toastAiMappingFailed"));
    } finally {
      setRemappingField(null);
    }
  };

  const handleAiRemapAllSheetMappings = async () => {
    if (!rawData || loading || remappingField) {
      return;
    }

    setRemappingAll(true);
    setError(null);
    beginLoading("importCenter.analyzingColumnsAi");

    try {
      const heuristic = buildHeuristicColumnMappings(rawData.headers);
      const aiResult = await mapColumnsWithAi(
        rawData.headers,
        rawData.rows.slice(0, 5)
      );
      const merged = mergeColumnMappings(heuristic, aiResult.mappings);
      setBaselineMappings(cloneColumnMappings(merged));
      applySheetMappings(merged);
      toast.show(t("importCenter.toastAiMappingCompleted"));
    } catch {
      toast.showError(t("importCenter.toastAiMappingFailed"));
    } finally {
      setRemappingAll(false);
      endLoading();
    }
  };

  const handleContinueToReview = async () => {
    if (loading || !rawData) {
      return;
    }

    if (importSource === "google-forms") {
      const rows = mapRowsToFormImportRecords(rawData, formMappings);
      setFormRows(rows);
      setRepairs([]);
      setIssues([]);
      logImportPipeline(
        "enter-review-forms",
        rawData,
        mappedRows,
        rows,
        importSource
      );
      setStep("review");
      return;
    }

    beginLoading("importCenter.checkingImportedData");
    setError(null);

    try {
      const currentRows = mapRowsToImportRecords(rawData, mappings);
      logImportPipeline(
        "before-repair",
        rawData,
        currentRows,
        formRows,
        importSource
      );

      const repaired = await repairImportRows(currentRows);
      setMappedRows(repaired.rows);
      setRepairs(repaired.repairs);
      setIssues(validateImportRows(repaired.rows));
      logImportPipeline(
        "enter-review-sheets",
        rawData,
        repaired.rows,
        formRows,
        importSource
      );
      setStep("review");
    } catch (error) {
      console.error("[Import Center] continue to review failed:", error);
      setError(t("importCenter.repairFailed"));
      toast.showError(t("importCenter.toastImportFailed"));
    } finally {
      endLoading();
    }
  };

  const handleImport = () => {
    if (!rawData || loading) {
      return;
    }

    beginLoading("importCenter.importingData");
    setError(null);

    try {
      const warnings =
        importSource === "google-forms"
          ? countRowsWithMissingFields(formRows)
          : issues.length;

      if (importSource === "google-forms") {
        const importRows: MappedImportRow[] = formRows.map((row) => ({
          rowIndex: row.rowIndex,
          customer: row.customer,
          product: row.product,
          quantity: 1,
          amount: row.amount,
          paid: 0,
          remaining: row.amount,
          currency: "TWD",
          orderId: "",
          paymentMethod: "",
          status: row.status,
          remarks: row.date,
          orderDate: row.date,
        }));
        const sourceLabel = `Google Forms · ${rawData.sourceName}`;
        const result = executeImport(importRows, sourceLabel, { createVouchers });
        setImportResult(result);
        setCompleteSummary({
          importedRows: rawData.totalRows,
          detectedColumns: rawData.headers.length,
          warnings,
        });
        setStep("complete");
        toast.show(t("importCenter.toastImportCompleted"));
        return;
      }

      const sourceLabel = `Google Sheets · ${rawData.sourceName} · ${rawData.sheetName}`;
      const result = executeImport(mappedRows, sourceLabel, { createVouchers });
      setImportResult(result);
      setCompleteSummary({
        importedRows: rawData.totalRows,
        detectedColumns: rawData.headers.length,
        warnings,
      });
      setStep("complete");
      toast.show(t("importCenter.toastImportCompleted"));
    } catch {
      setError(t("importCenter.repairFailed"));
      toast.showError(t("importCenter.toastImportFailed"));
    } finally {
      endLoading();
    }
  };

  const handleExportExcel = () => {
    if (loading) {
      return;
    }

    try {
      if (importSource === "google-forms") {
        const headers = FORM_REVIEW_EXPORT_FIELDS.map((field) =>
          t(FORM_FIELD_LABELS[field])
        );
        const rows = formRows.map((row) => {
          const record: Record<string, string | number> = {};

          FORM_REVIEW_EXPORT_FIELDS.forEach((field, index) => {
            const header = headers[index];
            const isMissing = row.missingFields.includes(field);

            if (field === "amount") {
              record[header] = isMissing ? "" : row.amount;
              return;
            }

            record[header] = isMissing ? "" : row[field];
          });

          return record;
        });

        console.log("Export rows:", rows, {
          rawRows: rawData?.rows?.length ?? null,
          mappedRows: mappedRows.length,
          formRows: formRows.length,
          reviewRows: formRows.length,
          importSource,
        });

        exportImportReviewToExcel(rows, headers);
      } else {
        const headers = SHEET_REVIEW_EXPORT_FIELDS.map((field) =>
          t(FIELD_LABELS[field])
        );
        const rows = mappedRows.map((row) => {
          const record: Record<string, string | number> = {};

          SHEET_REVIEW_EXPORT_FIELDS.forEach((field, index) => {
            const header = headers[index];
            const value = row[field];

            if (typeof value === "number") {
              record[header] = value;
              return;
            }

            record[header] = value ?? "";
          });

          return record;
        });

        console.log("Export rows:", rows, {
          rawRows: rawData?.rows?.length ?? null,
          mappedRows: mappedRows.length,
          formRows: formRows.length,
          reviewRows: mappedRows.length,
          importSource,
        });

        exportImportReviewToExcel(rows, headers);
      }

      toast.show(t("importCenter.toastExportExcelSuccess"));
    } catch (error) {
      console.error("[Import Center] Excel export failed:", error);
      toast.showError(t("importCenter.toastExportExcelFailed"));
    }
  };

  const handlePrevious = () => {
    if (loading) {
      return;
    }

    const previous = getPreviousStep(step, importSource);
    if (previous) {
      setStep(previous);
      setError(null);
    }
  };

  const handleStepClick = (targetStep: WizardStep, targetIndex: number) => {
    if (loading || targetIndex > maxVisitedStepIndex || targetStep === step) {
      return;
    }

    setStep(targetStep);
    setError(null);
  };

  const handleImportAnother = () => {
    setStep("source");
    setImportResult(null);
    setCompleteSummary(null);
    setImportSource(null);
    setSelectedSpreadsheet(null);
    setSelectedWorksheet(null);
    setSelectedForm(null);
    setRawData(null);
    setMappings([]);
    setMappedRows([]);
    setFormMappings([]);
    setFormRows([]);
    setBaselineMappings([]);
    setBaselineFormMappings([]);
    setIssues([]);
    setRepairs([]);
    setError(null);
  };

  const previewRows = useMemo(
    () => mappedRows.slice(0, 8),
    [mappedRows]
  );

  const lowConfidenceMappings = mappings.filter(
    (item) => item.header && item.confidence < 70
  );

  const lowConfidenceFormMappings = formMappings.filter(
    (item) => item.header && item.confidence < 70
  );

  const formPreviewRows = useMemo(() => formRows.slice(0, 8), [formRows]);

  useEffect(() => {
    if (step !== "review") {
      return;
    }

    const reviewRows = importSource === "google-forms" ? formRows : mappedRows;

    console.log("[Import Pipeline] review-render", {
      rawRows: rawData?.rows?.length ?? null,
      mappedRows: mappedRows.length,
      formRows: formRows.length,
      reviewRows: reviewRows.length,
      previewRows:
        importSource === "google-forms"
          ? formPreviewRows.length
          : previewRows.length,
      importSource,
    });
  }, [
    step,
    rawData,
    mappedRows,
    formRows,
    formPreviewRows,
    previewRows,
    importSource,
  ]);

  const reviewSummaryLabels = useMemo(
    () => ({
      totalRows: t("importCenter.reviewTotalRows"),
      totalColumns: t("importCenter.reviewTotalColumns"),
      missingValues: t("importCenter.reviewMissingValues"),
      invalidValues: t("importCenter.reviewInvalidValues"),
      duplicateRecords: t("importCenter.reviewDuplicateRecords"),
    }),
    [t]
  );

  const sheetReviewSummary = useMemo(() => {
    if (!rawData) {
      return null;
    }

    return buildSheetReviewSummary(
      mappedRows,
      issues,
      rawData.headers.length
    );
  }, [mappedRows, issues, rawData]);

  const formReviewSummary = useMemo(() => {
    if (!rawData) {
      return null;
    }

    return buildFormReviewSummary(formRows, rawData.headers.length);
  }, [formRows, rawData]);

  const reviewExportLabels = useMemo(
    () => ({
      export: t("importCenter.export"),
      excel: t("importCenter.exportExcelOption"),
      csv: t("importCenter.exportCsvOption"),
      googleSheets: t("importCenter.exportGoogleSheetsOption"),
      pdf: t("importCenter.exportPdfOption"),
    }),
    [t]
  );

  useEffect(() => {
    const keys = getStepKeys(importSource);
    const index = keys.indexOf(step);
    if (index >= 0) {
      setMaxVisitedStepIndex((current) => Math.max(current, index));
    }
  }, [step, importSource]);

  useEffect(() => {
    const keys = getStepKeys(importSource);
    const index = keys.indexOf(step);
    setMaxVisitedStepIndex(index >= 0 ? index : 0);
  }, [importSource]);

  const stepItems = useMemo(() => {
    const keys = getStepKeys(importSource);
    const labels: Record<WizardStep, string> = {
      connect: t("importCenter.stepConnect"),
      source: t("importCenter.stepSource"),
      spreadsheet: t("importCenter.stepSpreadsheet"),
      worksheet: t("importCenter.stepWorksheet"),
      form: t("importCenter.stepForm"),
      mapping: t("importCenter.stepMapping"),
      review: t("importCenter.stepReview"),
      complete: t("importCenter.stepComplete"),
    };

    return keys.map((key) => [key, labels[key]] as const);
  }, [importSource, t]);

  const showPrevious = step !== "connect" && step !== "complete";
  const loadingLabel = loadingMessage ? t(loadingMessage) : t("importCenter.loading");

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-8">
        <PageHeader
          title={t("importCenter.title")}
          description={t("importCenter.description")}
        />

        <ImportStepIndicator
          steps={stepItems}
          currentStep={step}
          maxVisitedStepIndex={maxVisitedStepIndex}
          loading={loading}
          onStepClick={(targetStep, index) =>
            handleStepClick(targetStep as WizardStep, index)
          }
        />

        {loading && loadingMessage && (
          <ImportLoadingBanner message={loadingLabel} />
        )}

        {error && (
          <ImportErrorAlert
            message={error}
            onDismiss={() => setError(null)}
            dismissLabel={t("common.cancel")}
          />
        )}

        <ImportStepPanel stepKey={step}>
        {step === "connect" && (
          <div className="space-y-6">
            {!oauthReady && oauthConfig && (
              <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                <CardHeader className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    {t("importCenter.setupTitle")}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {t("importCenter.setupHint")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
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

            <ImportSectionCard
              title={t("importCenter.connectTitle")}
              description={t("importCenter.connectHint")}
              icon={CloudDownload}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleConnect}
                  disabled={!oauthReady || loading}
                  className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
                >
                  {t("importCenter.connectGoogle")}
                </Button>
                {connected && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep("source")}
                    disabled={loading}
                    className="h-11 w-full touch-manipulation sm:w-auto"
                  >
                    {t("importCenter.continue")}
                  </Button>
                )}
              </div>
            </ImportSectionCard>
          </div>
        )}

        {step === "source" && (
          <>
            <ImportSectionCard
              title={t("importCenter.sourceTitle")}
              description={t("importCenter.sourceHint")}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ImportSourceCard
                  title={t("importCenter.sourceSheets")}
                  description={t("importCenter.sourceSheetsHint")}
                  icon={Sheet}
                  disabled={loading}
                  onClick={() => handleSelectSource("google-sheets")}
                />
                <ImportSourceCard
                  title={t("importCenter.sourceForms")}
                  description={t("importCenter.sourceFormsHint")}
                  icon={ClipboardList}
                  disabled={loading}
                  onClick={() => handleSelectSource("google-forms")}
                />
              </div>
            </ImportSectionCard>
            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            />
          </>
        )}

        {step === "spreadsheet" && (
          <>
            <ImportSectionCard
              title={t("importCenter.spreadsheetsTitle")}
              description={t("importCenter.spreadsheetsHint")}
              icon={Sheet}
              actions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={loading}
                    onClick={() => void loadSpreadsheets()}
                    aria-label={t("importCenter.loadingSpreadsheets")}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => void handleDisconnect()}
                  >
                    {t("importCenter.disconnect")}
                  </Button>
                </>
              }
            >
              {loading && spreadsheets.length === 0 ? (
                <ImportResourceSkeleton />
              ) : !loading && spreadsheets.length === 0 ? (
                <ImportEmptyState
                  icon={FolderOpen}
                  title={t("importCenter.noSpreadsheets")}
                  description={t("importCenter.spreadsheetsHint")}
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void loadSpreadsheets()}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t("importCenter.loadingSpreadsheets")}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {spreadsheets.map((spreadsheet) => (
                    <ImportResourceRow
                      key={spreadsheet.id}
                      title={spreadsheet.name}
                      subtitle={`${t("importCenter.lastModified")}: ${formatModifiedDate(spreadsheet.modifiedTime)}`}
                      icon={Sheet}
                      disabled={loading}
                      onClick={() => void handleSelectSpreadsheet(spreadsheet)}
                    />
                  ))}
                </div>
              )}
            </ImportSectionCard>
            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            />
          </>
        )}

        {step === "worksheet" && selectedSpreadsheet && (
          <>
            <ImportSectionCard
              title={t("importCenter.worksheetsTitle")}
              description={`${selectedSpreadsheet.name} · ${t("importCenter.worksheetsHint")}`}
              icon={Sheet}
            >
              {loading ? (
                <ImportResourceSkeleton count={3} />
              ) : (
                <div className="space-y-3">
                  {worksheets.map((worksheet) => (
                    <ImportResourceRow
                      key={worksheet.sheetId}
                      title={worksheet.title}
                      icon={Sheet}
                      disabled={loading}
                      onClick={() => void handleSelectWorksheet(worksheet)}
                      trailing={
                        <Badge variant="secondary">#{worksheet.index + 1}</Badge>
                      }
                    />
                  ))}
                </div>
              )}
            </ImportSectionCard>
            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            />
          </>
        )}

        {step === "form" && (
          <>
            <ImportSectionCard
              title={t("importCenter.formsTitle")}
              description={t("importCenter.formsHint")}
              icon={ClipboardList}
              actions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={loading}
                    onClick={() => void loadForms()}
                    aria-label={t("importCenter.loadingForms")}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => void handleDisconnect()}
                  >
                    {t("importCenter.disconnect")}
                  </Button>
                </>
              }
            >
              {loading && forms.length === 0 ? (
                <ImportResourceSkeleton />
              ) : !loading && forms.length === 0 ? (
                <ImportEmptyState
                  icon={FolderOpen}
                  title={t("importCenter.noForms")}
                  description={t("importCenter.formsHint")}
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void loadForms()}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t("importCenter.loadingForms")}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {forms.map((form) => (
                    <ImportResourceRow
                      key={form.id}
                      title={form.name}
                      subtitle={`${t("importCenter.lastModified")}: ${formatModifiedDate(form.modifiedTime)}`}
                      icon={ClipboardList}
                      disabled={loading}
                      onClick={() => void handleSelectForm(form)}
                    />
                  ))}
                </div>
              )}
            </ImportSectionCard>
            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            />
          </>
        )}

        {step === "mapping" && rawData && importSource === "google-forms" && (
          <div className="space-y-6">
            <Card className={importCardClass}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("importCenter.previewTitle")}
                </CardTitle>
                <CardDescription>
                  {rawData.sourceName} · {rawData.totalRows}{" "}
                  {t("importCenter.responsesLabel")}
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

            <Card className={importCardClass}>
              <CardContent className="pt-6">
                <ImportMappingPanel
                  title={t("importCenter.formMappingTitle")}
                  description={t("importCenter.formMappingHint")}
                  fields={IMPORT_FORM_FIELD_KEYS.map((field) => ({
                    key: field,
                    label: t(FORM_FIELD_LABELS[field]),
                  }))}
                  mappings={formMappings}
                  headers={rawData.headers}
                  unmappedLabel={t("importCenter.unmapped")}
                  mappedToLabel={t("importCenter.mappedTo")}
                  confidenceLabel={t("importCenter.confidenceLabel")}
                  resetLabel={t("importCenter.resetMapping")}
                  aiRemapLabel={t("importCenter.aiRemap")}
                  aiRemapAllLabel={t("importCenter.aiRemapAll")}
                  resetAllLabel={t("importCenter.resetAllMappings")}
                  disabled={loading}
                  remappingField={remappingField}
                  remappingAll={remappingAll}
                  onChange={(field, header) =>
                    handleFormMappingChange(field as ImportFormFieldKey, header)
                  }
                  onResetField={handleResetFormMapping}
                  onAiRemapField={(field) => void handleAiRemapFormField(field)}
                  onResetAll={handleResetAllFormMappings}
                  onAiRemapAll={() => void handleAiRemapAllFormMappings()}
                />
              </CardContent>
            </Card>

            {countRowsWithMissingFields(formRows) > 0 && (
              <ImportWarningCallout>
                {t("importCenter.formMissingFieldsHint", {
                  count: countRowsWithMissingFields(formRows),
                })}
              </ImportWarningCallout>
            )}

            {lowConfidenceFormMappings.length > 0 && (
              <ImportWarningCallout>
                {t("importCenter.lowConfidenceHint")}
              </ImportWarningCallout>
            )}

            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            >
              <Button
                type="button"
                size="lg"
                onClick={() => void handleContinueToReview()}
                disabled={loading || remappingAll || Boolean(remappingField)}
                className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
              >
                {t("importCenter.continueReview")}
              </Button>
            </ImportStepFooter>
          </div>
        )}

        {step === "mapping" && rawData && importSource === "google-sheets" && (
          <div className="space-y-6">
            <Card className={importCardClass}>
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

            <Card className={importCardClass}>
              <CardContent className="pt-6">
                <ImportMappingPanel
                  title={t("importCenter.mappingTitle")}
                  description={t("importCenter.mappingHint")}
                  fields={IMPORT_FIELD_KEYS.map((field) => ({
                    key: field,
                    label: t(FIELD_LABELS[field]),
                  }))}
                  mappings={mappings}
                  headers={rawData.headers}
                  unmappedLabel={t("importCenter.unmapped")}
                  mappedToLabel={t("importCenter.mappedTo")}
                  confidenceLabel={t("importCenter.confidenceLabel")}
                  resetLabel={t("importCenter.resetMapping")}
                  aiRemapLabel={t("importCenter.aiRemap")}
                  aiRemapAllLabel={t("importCenter.aiRemapAll")}
                  resetAllLabel={t("importCenter.resetAllMappings")}
                  disabled={loading}
                  remappingField={remappingField}
                  remappingAll={remappingAll}
                  onChange={(field, header) =>
                    handleMappingChange(field as ImportFieldKey, header)
                  }
                  onResetField={handleResetSheetMapping}
                  onAiRemapField={(field) => void handleAiRemapSheetField(field)}
                  onResetAll={handleResetAllSheetMappings}
                  onAiRemapAll={() => void handleAiRemapAllSheetMappings()}
                />
              </CardContent>
            </Card>

            {lowConfidenceMappings.length > 0 && (
              <ImportWarningCallout>
                {t("importCenter.lowConfidenceHint")}
              </ImportWarningCallout>
            )}

            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            >
              <Button
                type="button"
                size="lg"
                onClick={() => void handleContinueToReview()}
                disabled={loading || remappingAll || Boolean(remappingField)}
                className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
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
            </ImportStepFooter>
          </div>
        )}

        {step === "review" && importSource === "google-forms" && formReviewSummary && (
          <div className="space-y-6">
            <ImportReviewSummary
              summary={formReviewSummary}
              labels={reviewSummaryLabels}
            />

            <ImportSectionCard
              title={t("importCenter.formReviewTitle")}
              description={t("importCenter.formReviewHint")}
              icon={AlertTriangle}
              iconClassName="text-amber-600"
            >
              {countRowsWithMissingFields(formRows) === 0 ? (
                <ImportEmptyState
                  icon={CheckCircle2}
                  title={t("importCenter.formNoMissingFields")}
                />
              ) : (
                <div className="space-y-2">
                  {formRows
                    .filter((row) => row.missingFields.length > 0)
                    .slice(0, 10)
                    .map((row) => (
                      <div
                        key={row.rowIndex}
                        className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
                      >
                        <span className="font-medium">
                          {t("importCenter.row")} {row.rowIndex}:
                        </span>{" "}
                        {t("importCenter.formMissingFieldsRow", {
                          fields: row.missingFields
                            .map((field) => t(FORM_FIELD_LABELS[field]))
                            .join(", "),
                        })}
                      </div>
                    ))}
                </div>
              )}
            </ImportSectionCard>

            <Card className={importCardClass}>
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
                      <TableHead>{t("importCenter.fieldStatus")}</TableHead>
                      <TableHead>{t("importCenter.fieldDate")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formPreviewRows.map((row) => (
                      <TableRow key={row.rowIndex}>
                        <TableCell
                          className={
                            row.missingFields.includes("customer")
                              ? "text-destructive"
                              : undefined
                          }
                        >
                          {row.customer || "—"}
                        </TableCell>
                        <TableCell
                          className={
                            row.missingFields.includes("product")
                              ? "text-destructive"
                              : undefined
                          }
                        >
                          {row.product || "—"}
                        </TableCell>
                        <TableCell
                          className={
                            row.missingFields.includes("amount")
                              ? "text-destructive"
                              : undefined
                          }
                        >
                          {row.amount || "—"}
                        </TableCell>
                        <TableCell
                          className={
                            row.missingFields.includes("status")
                              ? "text-destructive"
                              : undefined
                          }
                        >
                          {row.status || "—"}
                        </TableCell>
                        <TableCell
                          className={
                            row.missingFields.includes("date")
                              ? "text-destructive"
                              : undefined
                          }
                        >
                          {row.date || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="flex items-center gap-3 pt-6">
                <input
                  id="create-vouchers-forms"
                  type="checkbox"
                  checked={createVouchers}
                  onChange={(event) => setCreateVouchers(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <Label htmlFor="create-vouchers-forms">
                  {t("importCenter.createVouchers")}
                </Label>
              </CardContent>
            </Card>

            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            >
              <ImportReviewExportMenu
                disabled={loading}
                labels={reviewExportLabels}
                onExportExcel={handleExportExcel}
              />
              <Button
                type="button"
                size="lg"
                onClick={handleImport}
                disabled={loading}
                className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("importCenter.importingData")}
                  </>
                ) : (
                  t("importCenter.confirmImport")
                )}
              </Button>
            </ImportStepFooter>
          </div>
        )}

        {step === "review" && importSource === "google-sheets" && sheetReviewSummary && (
          <div className="space-y-6">
            <ImportReviewSummary
              summary={sheetReviewSummary}
              labels={reviewSummaryLabels}
            />

            <ImportSectionCard
              title={t("importCenter.validationTitle")}
              icon={AlertTriangle}
              iconClassName="text-amber-600"
            >
              {issues.length === 0 ? (
                <ImportEmptyState
                  icon={CheckCircle2}
                  title={t("importCenter.noIssues")}
                />
              ) : (
                <div className="space-y-2">
                  {issues.map((issue, index) => (
                    <div
                      key={`${issue.rowIndex}-${issue.code}-${index}`}
                      className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium">
                        {t("importCenter.row")} {issue.rowIndex}:
                      </span>{" "}
                      {issue.message}
                    </div>
                  ))}
                </div>
              )}
            </ImportSectionCard>

            <ImportSectionCard
              title={t("importCenter.repairsTitle")}
              icon={Wrench}
            >
              {repairs.length === 0 ? (
                <ImportEmptyState
                  icon={CheckCircle2}
                  title={t("importCenter.noRepairs")}
                />
              ) : (
                <div className="space-y-2">
                  {repairs.map((repair, index) => (
                    <div
                      key={`${repair.rowIndex}-${repair.field}-${index}`}
                      className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
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
                </div>
              )}
            </ImportSectionCard>

            <Card className={importCardClass}>
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

            <ImportStepFooter
              showPrevious={showPrevious}
              onPrevious={handlePrevious}
              loading={loading}
              previousLabel={t("importCenter.previous")}
            >
              <ImportReviewExportMenu
                disabled={loading}
                labels={reviewExportLabels}
                onExportExcel={handleExportExcel}
              />
              <Button
                type="button"
                size="lg"
                onClick={handleImport}
                disabled={loading}
                className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("importCenter.importingData")}
                  </>
                ) : (
                  t("importCenter.confirmImport")
                )}
              </Button>
            </ImportStepFooter>
          </div>
        )}

        {step === "complete" && importResult && completeSummary && (
          <ImportSuccessPanel
            title={t("importCenter.completeTitle")}
            subtitle={t("importCenter.completeSubtitle")}
            summarySectionLabel={t("importCenter.completeSummarySection")}
            recordsSectionLabel={t("importCenter.completeRecordsSection")}
            summaryTiles={
              <>
                <ImportStatTile
                  label={t("importCenter.completeImportedRows")}
                  value={completeSummary.importedRows}
                  highlight
                />
                <ImportStatTile
                  label={t("importCenter.completeDetectedColumns")}
                  value={completeSummary.detectedColumns}
                />
                <ImportStatTile
                  label={t("importCenter.completeWarnings")}
                  value={completeSummary.warnings}
                />
              </>
            }
            resultTiles={
              <>
                <ImportStatTile
                  label={t("importCenter.resultCustomers")}
                  value={
                    importResult.customersCreated + importResult.customersUpdated
                  }
                />
                <ImportStatTile
                  label={t("importCenter.resultOrders")}
                  value={importResult.ordersCreated}
                />
                <ImportStatTile
                  label={t("importCenter.resultCommunication")}
                  value={importResult.communicationRecordsCreated}
                />
                <ImportStatTile
                  label={t("importCenter.resultVouchers")}
                  value={importResult.vouchersCreated}
                />
              </>
            }
            primaryAction={
              <Button asChild size="lg" className="h-11 w-full shadow-sm sm:flex-1">
                <Link href="/">{t("importCenter.goToDashboard")}</Link>
              </Button>
            }
            secondaryAction={
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleImportAnother}
                className="h-11 w-full sm:flex-1"
              >
                {t("importCenter.importAnother")}
              </Button>
            }
          />
        )}
        </ImportStepPanel>

        {step !== "complete" && (
        <Card className="border-dashed border-border/60 bg-muted/10 shadow-sm">
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
        )}
      </div>

      <SuccessToast
        message={toast.message}
        variant={toast.variant}
        onDismiss={toast.dismiss}
      />
    </>
  );
}
