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

interface ConversationTextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ConversationTextInput({
  value,
  onChange,
  disabled = false,
}: ConversationTextInputProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("communicationCenter.pasteTitle")}
        </CardTitle>
        <CardDescription>{t("communicationCenter.pasteDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="conversation-text">
          {t("communicationCenter.conversationLabel")}
        </Label>
        <textarea
          id="conversation-text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={t("communicationCenter.conversationPlaceholder")}
          className="min-h-[220px] w-full rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </CardContent>
    </Card>
  );
}
