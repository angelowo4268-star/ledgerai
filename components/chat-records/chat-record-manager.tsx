"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, FileSpreadsheet, Loader2 } from "lucide-react";

import { ChatRecordsTable } from "@/components/chat-records/chat-records-table";
import { ChatSummaryCards } from "@/components/chat-records/chat-summary-cards";
import { ChatTextInput } from "@/components/chat-records/chat-text-input";
import { ChatUploadZone } from "@/components/chat-records/chat-upload-zone";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  analyzeChatText,
  buildSourceLabel,
  computeChatSummary,
  createChatRecords,
  filterChatRecords,
} from "@/lib/chat-records/chat-utils";
import { exportChatRecordsToExcel } from "@/lib/chat-records/export-chat-records";
import { useTranslation } from "@/lib/i18n/context";
import type { ChatRecord } from "@/lib/chat-records/types";

export function ChatRecordManager() {
  const { t } = useTranslation();
  const [chatText, setChatText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [records, setRecords] = useState<ChatRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRecords = useMemo(
    () => filterChatRecords(records, search),
    [records, search]
  );
  const summary = useMemo(() => computeChatSummary(records), [records]);

  const handleTextLoaded = (text: string, file: File) => {
    setChatText(text);
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    const text = chatText.trim();
    if (!text || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeChatText(text);
      const nextRecords = createChatRecords(
        result.records,
        buildSourceLabel(selectedFile)
      );

      setRecords((current) => [...nextRecords, ...current]);
    } catch {
      setError(t("chatRecords.analyzeFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    try {
      exportChatRecordsToExcel(records);
    } catch {
      setError(t("chatRecords.exportFailed"));
    }
  };

  const handleDelete = (id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title={t("chatRecords.title")}
        description={t("chatRecords.description")}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={records.length === 0}
          className="h-10 w-full touch-manipulation sm:w-auto"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {t("common.exportExcel")}
        </Button>
      </PageHeader>

      <ChatSummaryCards summary={summary} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChatUploadZone
          onTextLoaded={handleTextLoaded}
          disabled={isAnalyzing}
        />
        <ChatTextInput
          value={chatText}
          onChange={setChatText}
          disabled={isAnalyzing}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedFile
            ? t("chatRecords.selectedFile", { name: selectedFile.name })
            : t("chatRecords.pasteOrUpload")}
        </p>
        <Button
          type="button"
          onClick={() => void handleAnalyze()}
          disabled={!chatText.trim() || isAnalyzing}
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
              {t("common.analyzeChat")}
            </>
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ChatRecordsTable
        records={filteredRecords}
        search={search}
        onSearchChange={setSearch}
        onDelete={handleDelete}
      />
    </div>
  );
}
