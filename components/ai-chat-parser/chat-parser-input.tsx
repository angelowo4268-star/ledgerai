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

interface ChatParserInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ChatParserInput({
  value,
  onChange,
  disabled = false,
}: ChatParserInputProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("aiChatParser.inputTitle")}</CardTitle>
        <CardDescription>{t("aiChatParser.inputDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            {t("aiChatParser.examplesTitle")}
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>
              <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">
                匯200須補60
              </code>{" "}
              → {t("aiChatParser.example1")}
            </li>
            <li>
              <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">
                內退80
              </code>{" "}
              → {t("aiChatParser.example2")}
            </li>
            <li>
              <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">
                取付520
              </code>{" "}
              → {t("aiChatParser.example3")}
            </li>
            <li>
              <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">
                已匯
              </code>{" "}
              → {t("aiChatParser.example4")}
            </li>
            <li>
              <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">
                賣貨便20
              </code>{" "}
              → {t("aiChatParser.example5")}
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chat-parser-text">{t("aiChatParser.chatLabel")}</Label>
          <textarea
            id="chat-parser-text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder={t("aiChatParser.chatPlaceholder")}
            className="min-h-[240px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </CardContent>
    </Card>
  );
}
