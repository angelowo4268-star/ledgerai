import type { SupportedLocale } from "@/lib/i18n/types";

import {
  buildBuiltInTemplate,
  createBlankCustomTemplate,
  sortFields,
} from "@/lib/export/template-catalog";
import type {
  BuiltInTemplateKey,
  ExportTemplate,
  ExportTemplateColumn,
  TemplateField,
  TemplateType,
} from "@/lib/export/types";

export const EXPORT_TEMPLATES_UPDATED_EVENT = "ledgerai-export-templates-updated";
export const EXPORT_SELECTION_STORAGE_KEY = "ledgerai-export-selection";

const STORAGE_KEY = "ledgerai-export-templates";

interface LegacyExportTemplate {
  id: string;
  name: string;
  description?: string;
  columns?: ExportTemplateColumn[];
  fields?: TemplateField[];
  templateType?: TemplateType;
  isBuiltIn?: boolean;
  builtInKey?: string;
  createdAt: string;
  updatedAt: string;
}

function readCustomTemplates(): ExportTemplate[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LegacyExportTemplate[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((template) => migrateLegacyTemplate(template))
      .filter((template): template is ExportTemplate => Boolean(template));
  } catch {
    return [];
  }
}

function migrateLegacyTemplate(
  template: LegacyExportTemplate
): ExportTemplate | null {
  if (template.fields?.length) {
    return {
      ...template,
      templateType: template.templateType ?? "custom",
      supportedFormats: ["excel"],
      defaultFormat: "excel",
      fields: sortFields(template.fields),
      builtInKey: template.builtInKey as BuiltInTemplateKey | undefined,
    };
  }

  if (!template.columns?.length) {
    return null;
  }

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    templateType: "custom",
    supportedFormats: ["excel"],
    defaultFormat: "excel",
    fields: template.columns.map((column, index) => ({
      id: `field-${column.field}`,
      key: column.field,
      label: column.field,
      header: column.header,
      enabled: column.enabled,
      required: false,
      section: "accounting",
      order: index,
      isCustom: false,
    })),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

function writeCustomTemplates(templates: ExportTemplate[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new Event(EXPORT_TEMPLATES_UPDATED_EVENT));
}

function normalizeBuiltInKey(key?: string): BuiltInTemplateKey | undefined {
  if (key === "purchase-orders") {
    return "purchase-order";
  }

  if (key === "financial-summary") {
    return "financial-report";
  }

  if (
    key === "accounting-voucher" ||
    key === "purchase-order" ||
    key === "financial-report"
  ) {
    return key;
  }

  return undefined;
}

export function getBuiltInTemplates(locale: SupportedLocale): ExportTemplate[] {
  return [
    buildBuiltInTemplate("accounting-voucher", locale),
    buildBuiltInTemplate("purchase-order", locale),
    buildBuiltInTemplate("financial-report", locale),
  ];
}

export function getExportTemplates(locale: SupportedLocale): ExportTemplate[] {
  return [...getBuiltInTemplates(locale), ...readCustomTemplates()];
}

export function getExportTemplateById(
  id: string,
  locale: SupportedLocale
): ExportTemplate | undefined {
  return getExportTemplates(locale).find((template) => template.id === id);
}

export function saveExportTemplate(template: ExportTemplate): ExportTemplate {
  if (template.isBuiltIn) {
    throw new Error("Built-in templates cannot be saved.");
  }

  const templates = readCustomTemplates();
  const now = new Date().toISOString();
  const saved: ExportTemplate = {
    ...template,
    isBuiltIn: false,
    builtInKey: undefined,
    supportedFormats: template.supportedFormats.length
      ? template.supportedFormats
      : ["excel"],
    defaultFormat: template.defaultFormat ?? "excel",
    fields: sortFields(template.fields),
    updatedAt: now,
    createdAt: template.createdAt || now,
  };

  const index = templates.findIndex((item) => item.id === saved.id);
  if (index === -1) {
    templates.unshift(saved);
  } else {
    templates[index] = saved;
  }

  writeCustomTemplates(templates);
  return saved;
}

export function deleteExportTemplate(id: string): void {
  writeCustomTemplates(readCustomTemplates().filter((template) => template.id !== id));
}

export function duplicateExportTemplate(
  template: ExportTemplate,
  locale: SupportedLocale
): ExportTemplate {
  const suffix = locale === "zh-TW" ? "副本" : "Copy";

  return {
    ...template,
    id: crypto.randomUUID(),
    name: `${template.name} (${suffix})`,
    isBuiltIn: false,
    builtInKey: undefined,
    templateType:
      template.templateType === "accounting-voucher"
        ? "custom"
        : template.templateType,
    fields: sortFields(template.fields).map((field) => ({ ...field })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultTemplate(
  locale: SupportedLocale,
  name: string
): ExportTemplate {
  return createBlankCustomTemplate(locale, name);
}

export function saveExportSelection(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    EXPORT_SELECTION_STORAGE_KEY,
    JSON.stringify(ids)
  );
}

export function readExportSelection(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(EXPORT_SELECTION_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function resolveTemplateForExport(
  template: ExportTemplate,
  locale: SupportedLocale
): ExportTemplate {
  const builtInKey = normalizeBuiltInKey(template.builtInKey);

  if (template.isBuiltIn && builtInKey) {
    return buildBuiltInTemplate(builtInKey, locale);
  }

  return template;
}

/** @deprecated Use createDefaultTemplate */
export function createDefaultColumns() {
  return [];
}
