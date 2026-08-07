"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";

import { ConversationResultsTable } from "@/components/communication-center/conversation-results-table";
import { ConversationTextInput } from "@/components/communication-center/conversation-text-input";
import { ConversationUploadZone } from "@/components/communication-center/conversation-upload-zone";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  SuccessToast,
  useSuccessToast,
} from "@/components/ui/success-toast";
import {
  analyzeConversationText,
  buildConversationSourceLabel,
  createConversationRecords,
} from "@/lib/communication/conversation-utils";
import {
  appendConversationRecords,
  deleteConversationRecords,
  getConversationRecords,
  updateConversationRecord,
} from "@/lib/communication/conversation-storage";
import { exportConversationsToExcel } from "@/lib/communication/export-conversations";
import { generateAccountingEntriesFromRecords } from "@/lib/communication/generate-vouchers";
import type { ConversationRecord } from "@/lib/communication/types";
import { useTranslation } from "@/lib/i18n/context";

export function CommunicationCenterManager() {
  const { t } = useTranslation();
  const toast = useSuccessToast();
  const [conversationText, setConversationText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecords(getConversationRecords());
  }, []);

  const handleTextLoaded = (text: string, file: File) => {
    setConversationText(text);
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    const text = conversationText.trim();
    if (!text || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeConversationText(text);
      const nextRecords = createConversationRecords(
        result.records,
        buildConversationSourceLabel(selectedFile)
      );

      appendConversationRecords(nextRecords);
      setRecords((current) => [...nextRecords, ...current]);
      setSelectedIds((current) => {
        const next = new Set(current);
        nextRecords.forEach((record) => next.add(record.id));
        return next;
      });

      toast.show(
        t("communicationCenter.analyzeSuccess", {
          count: result.records.length,
        })
      );
    } catch {
      setError(t("communicationCenter.analyzeFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateRecord = (record: ConversationRecord) => {
    updateConversationRecord(record);
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? record : item))
    );
  };

  const handleDeleteRecords = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    deleteConversationRecords(ids);
    const idSet = new Set(ids);
    setRecords((current) => current.filter((record) => !idSet.has(record.id)));
    setSelectedIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(records.map((record) => record.id)));
      return;
    }

    setSelectedIds(new Set());
  };

  const handleExportExcel = async () => {
    try {
      await exportConversationsToExcel(records);
      setError(null);
      toast.show(t("communicationCenter.exportSuccess"));
    } catch {
      setError(t("communicationCenter.exportFailed"));
    }
  };

  const handleGenerateVoucher = () => {
    const selectedRecords = records.filter((record) =>
      selectedIds.has(record.id)
    );

    if (selectedRecords.length === 0) {
      setError(t("communicationCenter.generateNoneSelected"));
      return;
    }

    const count = generateAccountingEntriesFromRecords(selectedRecords);

    if (count === 0) {
      setError(t("communicationCenter.generateFailed"));
      return;
    }

    setError(null);
    toast.show(
      t("communicationCenter.generateVoucherSuccess", { count })
    );
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in sm:space-y-8">
        <PageHeader
          title={t("communicationCenter.title")}
          description={t("communicationCenter.description")}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <ConversationUploadZone
            onTextLoaded={handleTextLoaded}
            disabled={isAnalyzing}
          />
          <ConversationTextInput
            value={conversationText}
            onChange={setConversationText}
            disabled={isAnalyzing}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedFile
              ? t("communicationCenter.selectedFile", { name: selectedFile.name })
              : t("communicationCenter.pasteOrUpload")}
          </p>
          <Button
            type="button"
            onClick={() => void handleAnalyze()}
            disabled={!conversationText.trim() || isAnalyzing}
            className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.analyzing")}
              </>
            ) : (
              <>
                <BrainCircuit className="h-4 w-4" />
                {t("communicationCenter.analyzeConversation")}
              </>
            )}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <ConversationResultsTable
          records={records}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onGenerateVoucher={handleGenerateVoucher}
          onExportExcel={() => void handleExportExcel()}
          onUpdate={handleUpdateRecord}
          onDelete={handleDeleteRecords}
        />
      </div>

      <SuccessToast message={toast.message} onDismiss={toast.dismiss} />
    </>
  );
}
