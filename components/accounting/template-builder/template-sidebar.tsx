"use client";

import { GripVertical, LayoutTemplate, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExportTemplate } from "@/lib/export/types";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface TemplateSidebarProps {
  builtInTemplates: ExportTemplate[];
  userTemplates: ExportTemplate[];
  selectedId: string | null;
  onSelect: (template: ExportTemplate) => void;
  onCreate: () => void;
}

function TemplateListItem({
  template,
  isActive,
  onSelect,
}: {
  template: ExportTemplate;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-colors",
        isActive
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 hover:bg-muted/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 shrink-0 text-primary" />
            <p className="truncate text-sm font-medium">{template.name}</p>
          </div>
          {template.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {template.description}
            </p>
          )}
        </div>
        {template.isBuiltIn && (
          <Badge variant="secondary" className="shrink-0">
            {t("exportTemplates.builtIn")}
          </Badge>
        )}
      </div>
    </button>
  );
}

export function TemplateSidebar({
  builtInTemplates,
  userTemplates,
  selectedId,
  onSelect,
  onCreate,
}: TemplateSidebarProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 shadow-sm xl:sticky xl:top-6">
      <CardHeader className="gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg">{t("exportTemplates.sidebarTitle")}</CardTitle>
          <CardDescription>{t("exportTemplates.sidebarDescription")}</CardDescription>
        </div>
        <Button
          type="button"
          onClick={onCreate}
          className="h-10 w-full touch-manipulation shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t("exportTemplates.createTemplate")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("exportTemplates.builtInTemplates")}
          </p>
          <div className="space-y-2">
            {builtInTemplates.map((template) => (
              <TemplateListItem
                key={template.id}
                template={template}
                isActive={template.id === selectedId}
                onSelect={() => onSelect(template)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("exportTemplates.userTemplates")}
          </p>
          {userTemplates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
              {t("exportTemplates.noUserTemplates")}
            </div>
          ) : (
            <div className="space-y-2">
              {userTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  isActive={template.id === selectedId}
                  onSelect={() => onSelect(template)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
