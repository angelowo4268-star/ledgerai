import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT = `你是一位熟悉台灣電商、客服對帳與會計分錄的 AI 助理。

請分析以下客戶對話紀錄，找出每一筆可轉為會計紀錄的訂單或交易資訊。

請只回傳 JSON，格式如下：

{
  "records": [
    {
      "orderNumber": "",
      "customerName": "",
      "customerId": "",
      "platform": "",
      "product": "",
      "sku": "",
      "quantity": 0,
      "amount": 0,
      "currency": "",
      "paymentStatus": "",
      "paymentMethod": "",
      "paymentDate": "",
      "orderStatus": "",
      "shippingMethod": "",
      "trackingNumber": "",
      "shippingDate": "",
      "customerNotified": "",
      "notes": "",
      "orderDate": "",
      "confidence": 0
    }
  ]
}

欄位說明：
- orderNumber: 訂單編號
- customerName: 客戶名稱
- customerId: 客戶編號
- platform: 銷售平台（例如：Shopee、Momo、官網）
- product: 產品或商品名稱
- sku: 商品 SKU
- quantity: 數量（數字，無法判斷填 1）
- amount: 訂單金額（數字，無法判斷填 0）
- currency: 幣別（例如：TWD、USD、NT$，無法判斷填 TWD）
- paymentStatus: 付款狀態（例如：已付款、未付款、部分付款、已退款）
- paymentMethod: 付款方式（例如：信用卡、轉帳、貨到付款、Line Pay）
- paymentDate: 付款日期（YYYY/MM/DD 或 YYYY-MM-DD，無法判斷填空白字串）
- orderStatus: 訂單狀態（例如：已確認、處理中、已完成、已取消）
- shippingMethod: 配送方式（例如：宅配、超商取貨）
- trackingNumber: 物流編號
- shippingDate: 出貨日期（YYYY/MM/DD 或 YYYY-MM-DD，無法判斷填空白字串）
- customerNotified: 是否已通知客戶（例如：是、否、已通知、未通知）
- notes: 備註
- orderDate: 訂單日期（YYYY/MM/DD 或 YYYY-MM-DD，無法判斷填空白字串）
- confidence: AI 信心度（0-100 整數）

若聊天中沒有明確金額，amount 請填 0。
若無法判斷客戶名稱，請使用「未知客戶」。
若只有一筆資料，records 仍使用陣列格式。`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "缺少對話內容" }, { status: 400 });
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
              text: `對話紀錄：\n\n${text}`,
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
    return NextResponse.json({ error: "對話分析失敗" }, { status: 500 });
  }
}
