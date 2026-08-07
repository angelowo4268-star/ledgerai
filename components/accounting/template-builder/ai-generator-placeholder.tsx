"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

export function AiGeneratorPlaceholder() {
  const { t } = useTranslation();

  return (
    <Card className="border-dashed border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">
            {t("exportTemplates.aiGeneratorTitle")}
          </CardTitle>
          <Badge variant="secondary">{t("exportTemplates.comingSoon")}</Badge>
        </div>
        <CardDescription>{t("exportTemplates.aiGeneratorDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-6 text-sm text-muted-foreground">
          {t("exportTemplates.aiGeneratorExample")}
        </div>
      </CardContent>
    </Card>
  );
}
