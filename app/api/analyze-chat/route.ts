import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT = `你是一位熟悉台灣電商與客服對帳的 AI 助理。

請分析以下聊天紀錄，找出每一筆客戶交易資訊。

請只回傳 JSON，格式如下：

{
  "records": [
    {
      "customerName": "",
      "paidAmount": 0,
      "unpaidAmount": 0,
      "refundAmount": 0,
      "paymentStatus": "",
      "orderNote": ""
    }
  ]
}

欄位說明：
- customerName: 客戶名稱
- paidAmount: 已收款金額（數字）
- unpaidAmount: 未收款金額（數字）
- refundAmount: 退款金額（數字）
- paymentStatus: 付款狀態（例如：已付款、未付款、部分付款、已退款）
- orderNote: 訂單或對話重點摘要

若聊天中沒有明確金額，請填 0。
若無法判斷客戶名稱，請使用「未知客戶」。
若只有一筆資料，records 仍使用陣列格式。`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "缺少聊天內容" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            {
              type: "input_text",
              text: `聊天紀錄：\n\n${text}`,
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
    return NextResponse.json({ error: "聊天分析失敗" }, { status: 500 });
  }
}
