import OpenAI from "openai";
import { NextResponse } from "next/server";

import type { ImportFieldKey } from "@/lib/import/types";
import { buildHeuristicColumnMappings } from "@/lib/import/pipeline/column-mapping";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIELD_LIST: ImportFieldKey[] = [
  "customer",
  "product",
  "quantity",
  "amount",
  "paid",
  "remaining",
  "currency",
  "orderId",
  "paymentMethod",
  "status",
  "remarks",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      headers?: string[];
      sampleRows?: string[][];
    };

    const headers = body.headers ?? [];
    const sampleRows = body.sampleRows ?? [];

    if (headers.length === 0) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    const heuristic = buildHeuristicColumnMappings(headers);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ mappings: heuristic });
    }

    const prompt = `Map spreadsheet headers to LedgerAI import fields.

Headers:
${JSON.stringify(headers)}

Sample rows:
${JSON.stringify(sampleRows.slice(0, 5))}

Return JSON:
{
  "mappings": [
    { "field": "customer", "header": "Header Name or null", "confidence": 0 }
  ]
}

Allowed fields: ${FIELD_LIST.join(", ")}
Use null when no good match exists. Confidence is 0-100.`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      text: { format: { type: "json_object" } },
    });

    const outputText = response.output_text;
    if (!outputText) {
      return NextResponse.json({ mappings: heuristic });
    }

    const parsed = JSON.parse(outputText) as {
      mappings?: Array<{
        field: ImportFieldKey;
        header: string | null;
        confidence: number;
      }>;
    };

    const aiMappings = (parsed.mappings ?? []).filter((item) =>
      FIELD_LIST.includes(item.field)
    );

    const merged = heuristic.map((item) => {
      const aiItem = aiMappings.find((mapping) => mapping.field === item.field);
      if (!aiItem?.header) {
        return item;
      }

      return (aiItem.confidence ?? 0) >= item.confidence ? aiItem : item;
    });

    return NextResponse.json({ mappings: merged });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Column mapping failed" }, { status: 500 });
  }
}
