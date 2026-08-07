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
import { parseConversationFile } from "@/lib/communication/conversation-utils";
import { cn } from "@/lib/utils";

interface ConversationUploadZoneProps {
  onTextLoaded: (text: string, file: File) => void;
  disabled?: boolean;
}

const ACCEPT = ".txt,.csv,.json,text/plain,text/csv,application/json";

export function ConversationUploadZone({
  onTextLoaded,
  disabled = false,
}: ConversationUploadZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) {
      return;
    }

    const file = files[0];
    const text = await parseConversationFile(file);
    onTextLoaded(text, file);
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("communicationCenter.uploadTitle")}
        </CardTitle>
        <CardDescription>
          {t("communicationCenter.uploadDescription")}
        </CardDescription>
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
          <p className="mt-4 text-sm font-medium">
            {t("communicationCenter.uploadDropHint")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("communicationCenter.uploadFormatsHint")}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="mt-5 h-10 touch-manipulation"
          >
            <FileText className="h-4 w-4" />
            {t("communicationCenter.chooseFile")}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            disabled={disabled}
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
