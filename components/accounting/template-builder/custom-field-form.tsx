"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomFieldType, TemplateField } from "@/lib/export/types";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface CustomFieldFormProps {
  nextOrder: number;
  onAdd: (field: TemplateField) => void;
}

const CUSTOM_TYPE_LABEL_KEYS: Record<CustomFieldType, TranslationKey> = {
  text: "exportTemplates.customTypeText",
  number: "exportTemplates.customTypeNumber",
  currency: "exportTemplates.customTypeCurrency",
  date: "exportTemplates.customTypeDate",
  "yes-no": "exportTemplates.customTypeYesNo",
  dropdown: "exportTemplates.customTypeDropdown",
};

export function CustomFieldForm({ nextOrder, onAdd }: CustomFieldFormProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [header, setHeader] = useState("");
  const [customType, setCustomType] = useState<CustomFieldType>("text");
  const [dropdownOptions, setDropdownOptions] = useState("");

  const reset = () => {
    setLabel("");
    setHeader("");
    setCustomType("text");
    setDropdownOptions("");
    setIsOpen(false);
  };

  const handleAdd = () => {
    const trimmedLabel = label.trim();
    const trimmedHeader = header.trim() || trimmedLabel;

    if (!trimmedLabel) {
      return;
    }

    onAdd({
      id: `custom-${crypto.randomUUID()}`,
      key: `custom-${crypto.randomUUID()}`,
      label: trimmedLabel,
      header: trimmedHeader,
      enabled: true,
      required: false,
      section: "custom",
      order: nextOrder,
      isCustom: true,
      customType,
      dropdownOptions:
        customType === "dropdown"
          ? dropdownOptions
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean)
          : undefined,
    });

    reset();
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="h-10 w-full touch-manipulation"
      >
        <Plus className="h-4 w-4" />
        {t("exportTemplates.addCustomField")}
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="custom-field-label">
            {t("exportTemplates.customFieldLabel")}
          </Label>
          <Input
            id="custom-field-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("exportTemplates.customFieldLabelPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-field-header">
            {t("exportTemplates.customFieldHeader")}
          </Label>
          <Input
            id="custom-field-header"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder={t("exportTemplates.headerPlaceholder")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="custom-field-type">
            {t("exportTemplates.customFieldType")}
          </Label>
          <select
            id="custom-field-type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value as CustomFieldType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {(Object.keys(CUSTOM_TYPE_LABEL_KEYS) as CustomFieldType[]).map(
              (type) => (
                <option key={type} value={type}>
                  {t(CUSTOM_TYPE_LABEL_KEYS[type])}
                </option>
              )
            )}
          </select>
        </div>
        {customType === "dropdown" && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="custom-field-options">
              {t("exportTemplates.customFieldOptions")}
            </Label>
            <Input
              id="custom-field-options"
              value={dropdownOptions}
              onChange={(e) => setDropdownOptions(e.target.value)}
              placeholder={t("exportTemplates.customFieldOptionsPlaceholder")}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={reset}>
          {t("common.cancel")}
        </Button>
        <Button type="button" onClick={handleAdd} className="shadow-sm">
          {t("exportTemplates.addFieldConfirm")}
        </Button>
      </div>
    </div>
  );
}
