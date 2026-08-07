import type { ImportFieldKey } from "@/lib/import/types";

const FIELD_ALIASES: Record<ImportFieldKey, string[]> = {
  customer: [
    "customer",
    "client",
    "buyer",
    "name",
    "客戶",
    "客戶名稱",
    "顧客",
    "姓名",
  ],
  product: ["product", "item", "sku name", "商品", "產品", "品項", "項目"],
  quantity: ["quantity", "qty", "count", "數量", "件數"],
  amount: ["amount", "total", "price", "sum", "金額", "總額", "應收", "訂單金額"],
  paid: ["paid", "received", "deposit", "已付", "已收", "實收", "付款金額"],
  remaining: [
    "remaining",
    "balance",
    "unpaid",
    "outstanding",
    "未付",
    "餘額",
    "待收",
    "尾款",
  ],
  currency: ["currency", "curr", "幣別", "幣種"],
  orderId: ["order id", "orderid", "order no", "order number", "訂單編號", "訂單號"],
  paymentMethod: [
    "payment method",
    "pay method",
    "付款方式",
    "支付方式",
    "收款方式",
  ],
  status: ["status", "order status", "payment status", "狀態", "訂單狀態", "付款狀態"],
  remarks: ["remarks", "remark", "note", "notes", "memo", "備註", "說明"],
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

export function buildHeuristicColumnMappings(headers: string[]) {
  const usedHeaders = new Set<string>();

  return (Object.keys(FIELD_ALIASES) as ImportFieldKey[]).map((field) => {
    let bestHeader: string | null = null;
    let bestScore = 0;

    headers.forEach((header) => {
      if (usedHeaders.has(header)) {
        return;
      }

      const score = scoreHeader(header, FIELD_ALIASES[field]);
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
    };
  });
}

export async function mapColumnsWithAi(
  headers: string[],
  sampleRows: string[][]
) {
  const response = await fetch("/api/import/map-columns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ headers, sampleRows }),
  });

  if (!response.ok) {
    throw new Error("Column mapping failed");
  }

  return (await response.json()) as {
    mappings: Array<{
      field: ImportFieldKey;
      header: string | null;
      confidence: number;
    }>;
  };
}

export function mergeColumnMappings(
  heuristic: ReturnType<typeof buildHeuristicColumnMappings>,
  aiMappings: Array<{
    field: ImportFieldKey;
    header: string | null;
    confidence: number;
  }>
) {
  const aiByField = new Map(aiMappings.map((item) => [item.field, item]));

  return heuristic.map((item) => {
    const aiItem = aiByField.get(item.field);
    if (!aiItem?.header) {
      return item;
    }

    if ((aiItem.confidence ?? 0) >= item.confidence) {
      return aiItem;
    }

    return item;
  });
}
