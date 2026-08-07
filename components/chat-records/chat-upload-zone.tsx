"use client";

import { useRef } from "react";
import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface ChatUploadZoneProps {
  onTextLoaded: (text: string, file: File) => void;
  disabled?: boolean;
}

export function ChatUploadZone({
  onTextLoaded,
  disabled = false,
}: ChatUploadZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) {
      return;
    }

    const file = files[0];
    const text = await file.text();
    onTextLoaded(text, file);
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("chatRecords.uploadTitle")}</CardTitle>
        <CardDescription>{t("chatRecords.uploadDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/25 bg-primary/5 px-4 py-10 text-center transition-colors",
            !disabled && "hover:border-primary/40 hover:bg-primary/10"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium">{t("chatRecords.uploadDropHint")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("chatRecords.uploadEncodingHint")}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="mt-5 h-10 touch-manipulation"
          >
            <FileText className="h-4 w-4" />
            {t("chatRecords.chooseFile")}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            disabled={disabled}
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
