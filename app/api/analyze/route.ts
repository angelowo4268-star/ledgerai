import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT = `請辨識這張台灣發票，並只回傳 JSON：

{
  "documentType": "",
  "invoiceNumber": "",
  "vendor": "",
  "date": "",
  "amount": "",
  "suggestedAccount": "",
  "deductible": "",
  "confidence": 95
}`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "沒有收到檔案" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "僅支援圖片檔案" },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            {
              type: "input_image",
              detail: "auto",
              image_url: `data:${file.type};base64,${base64}`,
            },
          ],
        },
      ],
      text: {
        format: { type: "json_object" },
      },
    });

    const outputText = response.output_text;
    if (!outputText) {
      return NextResponse.json({ error: "AI 回傳空白" }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(outputText));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI分析失敗" }, { status: 500 });
  }
}
