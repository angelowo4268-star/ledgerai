"use client";

import { useMemo, useState } from "react";
import { Copy, GripVertical, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomFieldForm } from "@/components/accounting/template-builder/custom-field-form";
import { reorderFields, sortFields } from "@/lib/export/template-catalog";
import type { CustomFieldType, ExportTemplate, FieldSection, TemplateField } from "@/lib/export/types";
import { getAllFormats } from "@/lib/export/formats";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const SECTION_LABEL_KEYS: Record<FieldSection, TranslationKey> = {
  "order-information": "exportTemplates.sectionOrderInformation",
  payment: "exportTemplates.sectionPayment",
  shipping: "exportTemplates.sectionShipping",
  customer: "exportTemplates.sectionCustomer",
  accounting: "exportTemplates.sectionAccounting",
  financial: "exportTemplates.sectionFinancial",
  custom: "exportTemplates.sectionCustom",
};

const CUSTOM_TYPE_LABEL_KEYS: Record<CustomFieldType, TranslationKey> = {
  text: "exportTemplates.customTypeText",
  number: "exportTemplates.customTypeNumber",
  currency: "exportTemplates.customTypeCurrency",
  date: "exportTemplates.customTypeDate",
  "yes-no": "exportTemplates.customTypeYesNo",
  dropdown: "exportTemplates.customTypeDropdown",
};

interface TemplateFieldEditorProps {
  draft: ExportTemplate | null;
  onChange: (draft: ExportTemplate) => void;
  onSave: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  error: string | null;
}

export function TemplateFieldEditor({
  draft,
  onChange,
  onSave,
  onDelete,
  onDuplicate,
  error,
}: TemplateFieldEditorProps) {
  const { t } = useTranslation();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const isReadOnly = Boolean(draft?.isBuiltIn);

  const sortedFields = useMemo(
    () => (draft ? sortFields(draft.fields) : []),
    [draft]
  );

  const sections = useMemo(() => {
    const grouped = new Map<FieldSection, TemplateField[]>();

    sortedFields.forEach((field) => {
      const current = grouped.get(field.section) ?? [];
      current.push(field);
      grouped.set(field.section, current);
    });

    return [...grouped.entries()];
  }, [sortedFields]);

  const updateField = (fieldId: string, patch: Partial<TemplateField>) => {
    if (!draft) {
      return;
    }

    onChange({
      ...draft,
      fields: draft.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field
      ),
    });
  };

  const removeField = (fieldId: string) => {
    if (!draft) {
      return;
    }

    onChange({
      ...draft,
      fields: sortFields(
        draft.fields
          .filter((field) => field.id !== fieldId)
          .map((field, index) => ({ ...field, order: index }))
      ),
    });
  };

  const handleDrop = (toIndex: number) => {
    if (!draft || dragIndex == null) {
      return;
    }

    onChange({
      ...draft,
      fields: reorderFields(draft.fields, dragIndex, toIndex),
    });
    setDragIndex(null);
  };

  const handleAddCustomField = (field: TemplateField) => {
    if (!draft) {
      return;
    }

    onChange({
      ...draft,
      fields: sortFields([...draft.fields, field]),
    });
  };

  if (!draft) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="py-16 text-center">
          <p className="text-sm font-medium">{t("exportTemplates.emptyEditorTitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("exportTemplates.emptyEditorDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="gap-4 space-y-0 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-lg">
            {isReadOnly
              ? t("exportTemplates.viewTitle")
              : t("exportTemplates.editTitle")}
          </CardTitle>
          <CardDescription>
            {isReadOnly
              ? t("exportTemplates.builtInHint")
              : t("exportTemplates.editHint")}
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onDuplicate}
            className="h-10 touch-manipulation"
          >
            <Copy className="h-4 w-4" />
            {t("exportTemplates.duplicateTemplate")}
          </Button>
          {!isReadOnly && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                className="h-10 touch-manipulation text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {t("exportTemplates.deleteTemplate")}
              </Button>
              <Button
                type="button"
                onClick={onSave}
                className="h-10 touch-manipulation shadow-sm"
              >
                <Save className="h-4 w-4" />
                {t("exportTemplates.saveTemplate")}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="template-name">{t("exportTemplates.templateName")}</Label>
            <Input
              id="template-name"
              value={draft.name}
              disabled={isReadOnly}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              placeholder={t("exportTemplates.templateNamePlaceholder")}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="template-description">
              {t("exportTemplates.templateDescription")}
            </Label>
            <Input
              id="template-description"
              value={draft.description ?? ""}
              disabled={isReadOnly}
              onChange={(e) => onChange({ ...draft, description: e.target.value })}
              placeholder={t("exportTemplates.templateDescriptionPlaceholder")}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label>{t("exportTemplates.exportFormatsTitle")}</Label>
            <div className="flex flex-wrap gap-2">
              {getAllFormats().map((format) => (
                <Badge
                  key={format.id}
                  variant={format.implemented ? "default" : "outline"}
                  className={cn(!format.implemented && "opacity-60")}
                >
                  {format.label}
                  {!format.implemented && ` · ${t("exportTemplates.comingSoon")}`}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">{t("exportTemplates.columnsTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("exportTemplates.columnsHint")}
            </p>
          </div>

          {sections.map(([section, fields]) => (
            <div key={section} className="space-y-2">
              <p className="border-b border-border/60 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t(SECTION_LABEL_KEYS[section])}
              </p>
              <div className="space-y-2">
                {fields.map((field) => {
                  const globalIndex = sortedFields.findIndex(
                    (item) => item.id === field.id
                  );

                  return (
                    <div
                      key={field.id}
                      draggable={!isReadOnly}
                      onDragStart={() => setDragIndex(globalIndex)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(globalIndex)}
                      className={cn(
                        "rounded-xl border border-border/60 p-3",
                        !field.enabled && "opacity-60",
                        dragIndex === globalIndex && "border-primary/40 bg-primary/5"
                      )}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {!isReadOnly && (
                            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                          )}
                          <input
                            type="checkbox"
                            checked={field.enabled}
                            disabled={isReadOnly}
                            onChange={(e) =>
                              updateField(field.id, { enabled: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            aria-label={field.label}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{field.label}</p>
                            {field.isCustom && field.customType && (
                              <p className="text-xs text-muted-foreground">
                                {t(CUSTOM_TYPE_LABEL_KEYS[field.customType])}
                              </p>
                            )}
                          </div>
                          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground lg:ml-0">
                            <input
                              type="checkbox"
                              checked={field.required}
                              disabled={isReadOnly || !field.enabled}
                              onChange={(e) =>
                                updateField(field.id, { required: e.target.checked })
                              }
                              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                            />
                            {t("exportTemplates.requiredField")}
                          </label>
                        </div>
                        <div className="flex items-center gap-2 lg:min-w-[280px]">
                          <Input
                            value={field.header}
                            disabled={isReadOnly || !field.enabled}
                            onChange={(e) =>
                              updateField(field.id, { header: e.target.value })
                            }
                            placeholder={t("exportTemplates.headerPlaceholder")}
                            className="h-9"
                          />
                          {!isReadOnly && field.isCustom && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeField(field.id)}
                              className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!isReadOnly && (
          <CustomFieldForm
            nextOrder={draft.fields.length}
            onAdd={handleAddCustomField}
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
