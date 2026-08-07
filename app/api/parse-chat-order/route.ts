import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT = `你是一位熟悉台灣電商、代購、直播下單、LINE 購物聊天的 AI 訂單解析助理。

你的任務不是用 regex 抽數字，而是理解購物流程與句子語意，推論完整訂單欄位。

請分析使用者貼上的聊天/下單訊息。每一行或每一筆可識別的訂單請輸出為一個 order 物件。

## 必須輸出的 JSON 格式

{
  "orders": [
    {
      "customer": "",
      "product": "",
      "quantity": 1,
      "total": 0,
      "paid": 0,
      "remaining": 0,
      "refund": 0,
      "shipping": 0,
      "paymentMethod": "",
      "status": "",
      "notes": "",
      "sourceLine": "",
      "confidence": 0
    }
  ],
  "summary": {
    "orders": 0,
    "pendingPayments": 0,
    "refunds": 0,
    "paid": 0,
    "cod": 0,
    "shippingTotal": 0,
    "expectedIncome": 0
  }
}

## 欄位說明

- customer: 客戶名稱；無法判斷填「未知客戶」
- product: 商品名稱
- quantity: 數量，預設 1
- total: 訂單總價
- paid: 已付金額
- remaining: 待補 / 尾款
- refund: 退款金額
- shipping: 運費（含賣貨便等物流費用）
- paymentMethod: 付款方式，可用 COD、Bank Transfer、Line Pay 等
- status: 訂單狀態，例如 Paid、Pending Payment、Refund Pending
- notes: 備註
- sourceLine: 原始句子
- confidence: 0-100

## 必須理解的台灣購物句型（不可只做字串抽取）

1. 「匯200須補60」
   - paid = 200
   - remaining = 60
   - total = 260（200 + 60，絕不可變成 20060）
   - status = Pending Payment
   - paymentMethod = Bank Transfer

2. 「內退80」
   - refund = 80
   - status = Refund Pending

3. 「取付520」或單獨「取付」
   - paymentMethod = COD
   - status = Unpaid
   - 若有金額：total = 該金額、paid = 0、remaining = total
   - 若無金額：total / paid / remaining 維持 0，但 status 仍為 Unpaid

4. 「已匯」
   - status = Paid
   - paid = total（若 total 已知）；若只有 paid 則 total = paid
   - remaining = 0

5. 「賣貨便20」
   - shipping = 20
   - notes 可標註「賣貨便」

## summary 計算規則

- orders: orders 陣列長度
- pendingPayments: status 含 Pending Payment / 待付 / 須補，或 remaining > 0 且非 Paid / Refund
- refunds: status 含 Refund / 退，或 refund > 0
- paid: status 含 Paid / 已匯 / 已付 的筆數
- cod: paymentMethod = COD / 取付 / 貨到付款 的筆數
- shippingTotal: 所有 orders 的 shipping 加總
- expectedIncome: 所有 orders 的 (total - refund) 加總，最小為 0

## 其他常用詞

- 須補、補款、尾款 → remaining
- 已付、已匯 → paid 或 status = Paid
- 取付、貨到付款、到付 → paymentMethod = COD
- 內退、退款 → refund
- +1、要1 → quantity

## 推論規則

- 若 paid + remaining 可推得 total，請自動計算 total
- 不要把相鄰數字串接（200 + 60 絕不是 20060）
- 多筆訂單請輸出多個 orders
- 只回傳 JSON，不要 markdown`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "缺少聊天內容" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key 未設定" }, { status: 503 });
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
              text: `購物聊天內容：\n\n${text}`,
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
    console.error("[parse-chat-order]", error);
    return NextResponse.json({ error: "聊天解析失敗" }, { status: 500 });
  }
}
