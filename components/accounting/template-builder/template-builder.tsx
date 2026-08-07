"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";

import { AiGeneratorPlaceholder } from "@/components/accounting/template-builder/ai-generator-placeholder";
import { TemplateFieldEditor } from "@/components/accounting/template-builder/template-field-editor";
import { TemplatePreviewPanel } from "@/components/accounting/template-builder/template-preview-panel";
import { TemplateSidebar } from "@/components/accounting/template-builder/template-sidebar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { exportRowsWithTemplate } from "@/lib/export/engine";
import {
  EXPORT_TEMPLATES_UPDATED_EVENT,
  createDefaultTemplate,
  deleteExportTemplate,
  duplicateExportTemplate,
  getExportTemplates,
  readExportSelection,
  resolveTemplateForExport,
  saveExportTemplate,
} from "@/lib/export/template-storage";
import type { ExportTemplate } from "@/lib/export/types";
import { buildExportRows } from "@/lib/export/voucher-resolver";
import { getVouchers } from "@/lib/accounting/voucher-storage";
import { useTranslation } from "@/lib/i18n/context";

function cloneTemplate(template: ExportTemplate): ExportTemplate {
  return {
    ...template,
    fields: template.fields.map((field) => ({ ...field })),
  };
}

export function TemplateBuilder() {
  const { t, locale } = useTranslation();
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExportTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const loadTemplates = useCallback(() => {
    const nextTemplates = getExportTemplates(locale);
    setTemplates(nextTemplates);
    return nextTemplates;
  }, [locale]);

  useEffect(() => {
    const nextTemplates = loadTemplates();
    const initial =
      nextTemplates.find((template) => template.builtInKey === "purchase-order") ??
      nextTemplates[0] ??
      null;

    setSelectedId(initial?.id ?? null);
    setDraft(initial ? cloneTemplate(initial) : null);
  }, [loadTemplates]);

  useEffect(() => {
    const handleUpdate = () => loadTemplates();
    window.addEventListener(EXPORT_TEMPLATES_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(EXPORT_TEMPLATES_UPDATED_EVENT, handleUpdate);
  }, [loadTemplates]);

  const builtInTemplates = useMemo(
    () => templates.filter((template) => template.isBuiltIn),
    [templates]
  );

  const userTemplates = useMemo(
    () => templates.filter((template) => !template.isBuiltIn),
    [templates]
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? null,
    [selectedId, templates]
  );

  const handleSelectTemplate = (template: ExportTemplate) => {
    setSelectedId(template.id);
    setDraft(cloneTemplate(template));
    setError(null);
    setExportMessage(null);
  };

  const handleCreateTemplate = () => {
    const template = createDefaultTemplate(
      locale,
      t("exportTemplates.newTemplateName")
    );

    setSelectedId(template.id);
    setDraft(template);
    setError(null);
    setExportMessage(null);
  };

  const handleDuplicateTemplate = () => {
    if (!selectedTemplate) {
      return;
    }

    const duplicated = duplicateExportTemplate(selectedTemplate, locale);
    setSelectedId(duplicated.id);
    setDraft(duplicated);
    setError(null);
    setExportMessage(null);
  };

  const handleSaveTemplate = () => {
    if (!draft || draft.isBuiltIn) {
      return;
    }

    const name = draft.name.trim();
    if (!name) {
      setError(t("exportTemplates.nameRequired"));
      return;
    }

    const enabledFields = draft.fields.filter((field) => field.enabled);
    if (enabledFields.length === 0) {
      setError(t("exportTemplates.columnsRequired"));
      return;
    }

    if (enabledFields.some((field) => !field.header.trim())) {
      setError(t("exportTemplates.headerRequired"));
      return;
    }

    const saved = saveExportTemplate({
      ...draft,
      name,
      fields: draft.fields.map((field) => ({
        ...field,
        header: field.header.trim() || field.header,
      })),
    });

    const nextTemplates = loadTemplates();
    setSelectedId(saved.id);
    setDraft(
      cloneTemplate(
        nextTemplates.find((template) => template.id === saved.id) ?? saved
      )
    );
    setError(null);
  };

  const handleDeleteTemplate = () => {
    if (!draft || draft.isBuiltIn) {
      return;
    }

    deleteExportTemplate(draft.id);
    const nextTemplates = loadTemplates();
    const next =
      nextTemplates.find((template) => template.builtInKey === "purchase-order") ??
      nextTemplates[0] ??
      null;

    setSelectedId(next?.id ?? null);
    setDraft(next ? cloneTemplate(next) : null);
    setError(null);
  };

  const handleExport = () => {
    if (!draft) {
      return;
    }

    const selectedIds = readExportSelection();
    const vouchers = getVouchers().filter((voucher) =>
      selectedIds.includes(voucher.id)
    );

    if (vouchers.length === 0) {
      setExportMessage(t("exportTemplates.exportNoSelection"));
      return;
    }

    try {
      const resolvedTemplate = resolveTemplateForExport(draft, locale);
      const rows = buildExportRows(
        vouchers,
        resolvedTemplate.fields,
        resolvedTemplate.templateType
      );

      exportRowsWithTemplate(resolvedTemplate, rows);
      setExportMessage(
        t("exportTemplates.exportSuccess", { count: vouchers.length })
      );
      setError(null);
    } catch {
      setError(t("exportTemplates.exportFailed"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title={t("exportTemplates.title")}
        description={t("exportTemplates.description")}
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            asChild
            className="h-10 w-full touch-manipulation sm:w-auto"
          >
            <Link href="/voucher-management">
              {t("exportTemplates.backToVouchers")}
            </Link>
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={!draft}
            className="h-10 w-full touch-manipulation shadow-sm sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t("exportTemplates.exportWithTemplate")}
          </Button>
        </div>
      </PageHeader>

      {(error || exportMessage) && (
        <div className="space-y-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {exportMessage && (
            <p className="text-sm text-muted-foreground">{exportMessage}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <TemplateSidebar
          builtInTemplates={builtInTemplates}
          userTemplates={userTemplates}
          selectedId={selectedId}
          onSelect={handleSelectTemplate}
          onCreate={handleCreateTemplate}
        />

        <div className="space-y-4">
          <TemplateFieldEditor
            draft={draft}
            onChange={setDraft}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            error={error}
          />
          <AiGeneratorPlaceholder />
        </div>

        <TemplatePreviewPanel draft={draft} />
      </div>
    </div>
  );
}
