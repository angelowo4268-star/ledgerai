import type { FormColumnMappingItem, ImportFormFieldKey } from "@/lib/import/types";

const FORM_FIELD_ALIASES: Record<ImportFormFieldKey, string[]> = {
  customer: [
    "customer",
    "client",
    "name",
    "email",
    "客戶",
    "客戶名稱",
    "姓名",
    "名稱",
  ],
  product: ["product", "item", "service", "商品", "產品", "品項", "項目"],
  amount: ["amount", "price", "total", "金額", "費用", "價格"],
  status: ["status", "state", "payment status", "狀態", "付款狀態"],
  date: [
    "date",
    "submitted at",
    "submission time",
    "timestamp",
    "日期",
    "提交時間",
    "時間",
  ],
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreHeader(header: string, aliases: string[]) {
  const normalized = normalizeHeader(header);
  if (!normalized) {
    return 0;
  }

  if (aliases.some((alias) => normalized === alias)) {
    return 1;
  }

  if (aliases.some((alias) => normalized.includes(alias))) {
    return 0.85;
  }

  return 0;
}

export function buildFormColumnMappings(headers: string[]) {
  const usedHeaders = new Set<string>();

  return (Object.keys(FORM_FIELD_ALIASES) as ImportFormFieldKey[]).map(
    (field) => {
      let bestHeader: string | null = null;
      let bestScore = 0;

      headers.forEach((header) => {
        if (usedHeaders.has(header)) {
          return;
        }

        const score = scoreHeader(header, FORM_FIELD_ALIASES[field]);
        if (score > bestScore) {
          bestScore = score;
          bestHeader = header;
        }
      });

      if (bestHeader && bestScore >= 0.85) {
        usedHeaders.add(bestHeader);
      } else {
        bestHeader = null;
        bestScore = 0;
      }

      return {
        field,
        header: bestHeader,
        confidence: Math.round(bestScore * 100),
      } satisfies FormColumnMappingItem;
    }
  );
}

export async function mapFormColumnsWithAi(
  headers: string[],
  sampleRows: string[][]
) {
  const response = await fetch("/api/import/map-columns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      headers,
      sampleRows,
      fields: ["customer", "product", "amount", "status", "date"],
    }),
  });

  if (!response.ok) {
    throw new Error("Form column mapping failed");
  }

  const payload = (await response.json()) as {
    mappings: FormColumnMappingItem[];
  };

  return payload;
}

export function mergeFormColumnMappings(
  heuristic: FormColumnMappingItem[],
  aiMappings: FormColumnMappingItem[]
) {
  const aiByField = new Map(aiMappings.map((item) => [item.field, item]));

  return heuristic.map((item) => {
    const aiItem = aiByField.get(item.field);
    if (!aiItem?.header) {
      return item;
    }

    return (aiItem.confidence ?? 0) >= item.confidence ? aiItem : item;
  });
}
