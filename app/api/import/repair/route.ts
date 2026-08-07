import OpenAI from "openai";
import { NextResponse } from "next/server";

import { applyRuleBasedRepairs } from "@/lib/import/pipeline/repair";
import type { DataRepair, MappedImportRow } from "@/lib/import/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rows?: MappedImportRow[] };
    const rows = body.rows ?? [];

    const ruleBased = applyRuleBasedRepairs(rows);

    if (!process.env.OPENAI_API_KEY || rows.length === 0) {
      return NextResponse.json(ruleBased);
    }

    const prompt = `Review imported order rows and suggest additional repairs for payment status, currency, remaining amount, and date formatting.

Input rows:
${JSON.stringify(ruleBased.rows.slice(0, 20))}

Return JSON:
{
  "rows": [...same shape as input...],
  "repairs": [
    {
      "rowIndex": 1,
      "field": "status",
      "originalValue": "",
      "repairedValue": "",
      "reason": ""
    }
  ]
}

Only include repairs that improve data quality. Keep numeric fields numeric.`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      text: { format: { type: "json_object" } },
    });

    const outputText = response.output_text;
    if (!outputText) {
      return NextResponse.json(ruleBased);
    }

    const parsed = JSON.parse(outputText) as {
      rows?: MappedImportRow[];
      repairs?: DataRepair[];
    };

    const aiRows =
      Array.isArray(parsed.rows) && parsed.rows.length > 0
        ? parsed.rows
        : ruleBased.rows;

    return NextResponse.json({
      rows: aiRows,
      repairs: [...ruleBased.repairs, ...(parsed.repairs ?? [])],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Repair failed" }, { status: 500 });
  }
}
