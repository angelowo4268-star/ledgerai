"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/context";

interface ChatTextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ChatTextInput({
  value,
  onChange,
  disabled = false,
}: ChatTextInputProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("chatRecords.pasteTitle")}</CardTitle>
        <CardDescription>{t("chatRecords.pasteDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="chat-text">{t("chatRecords.chatTextLabel")}</Label>
        <textarea
          id="chat-text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={t("chatRecords.chatTextPlaceholder")}
          className="min-h-[220px] w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </CardContent>
    </Card>
  );
}
