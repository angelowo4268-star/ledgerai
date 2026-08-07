import type { RawImportData } from "@/lib/import/types";

interface FormQuestionItem {
  itemId?: string;
  title?: string;
  questionItem?: {
    question?: {
      questionId?: string;
    };
  };
}

interface GoogleFormPayload {
  formId?: string;
  info?: {
    title?: string;
    documentTitle?: string;
  };
  items?: FormQuestionItem[];
}

interface FormAnswer {
  questionId?: string;
  textAnswers?: {
    answers?: Array<{ value?: string }>;
  };
}

interface FormResponseItem {
  responseId?: string;
  createTime?: string;
  lastSubmittedTime?: string;
  answers?: Record<string, FormAnswer>;
}

interface FormResponsesPayload {
  responses?: FormResponseItem[];
}

function getQuestionTitle(item: FormQuestionItem) {
  return item.title?.trim() || "Untitled Question";
}

function getQuestionId(item: FormQuestionItem) {
  return item.questionItem?.question?.questionId ?? item.itemId ?? "";
}

function buildQuestionMap(form: GoogleFormPayload) {
  const map = new Map<string, string>();

  (form.items ?? []).forEach((item) => {
    const questionId = getQuestionId(item);
    if (!questionId) {
      return;
    }

    map.set(questionId, getQuestionTitle(item));
  });

  return map;
}

function extractAnswerValue(answer?: FormAnswer) {
  const values = answer?.textAnswers?.answers ?? [];
  return values
    .map((item) => item.value?.trim() ?? "")
    .filter(Boolean)
    .join(", ");
}

export function parseGoogleFormResponses(
  form: GoogleFormPayload,
  responsesPayload: FormResponsesPayload,
  formId: string,
  formName: string
): RawImportData {
  const questionMap = buildQuestionMap(form);
  const questionIds = [...questionMap.keys()];
  const headers = [...questionIds.map((id) => questionMap.get(id)!), "Submitted At"];

  const rows = (responsesPayload.responses ?? []).map((response) => {
    const answers = response.answers ?? {};
    const questionValues = questionIds.map((questionId) => {
      const entry = Object.values(answers).find(
        (answer) => answer.questionId === questionId
      );
      return extractAnswerValue(entry);
    });

    const submittedAt =
      response.lastSubmittedTime ?? response.createTime ?? "";

    return [...questionValues, submittedAt];
  });

  return {
    sourceId: formId,
    sourceName: formName,
    sheetId: formId,
    sheetName: "Responses",
    headers,
    rows,
    totalRows: rows.length,
  };
}

export type { GoogleFormPayload, FormResponsesPayload };
