"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function AITestPage() {
  const [result, setResult] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setFailed(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "你好，請介紹你自己。",
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as { result?: unknown };

      if (data.result === undefined || data.result === null) {
        throw new Error("Missing result");
      }

      setResult(
        typeof data.result === "string"
          ? data.result
          : JSON.stringify(data.result, null, 2)
      );
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Button onClick={handleTest} disabled={loading}>
        測試 OpenAI
      </Button>

      {failed && <p className="text-destructive">AI 呼叫失敗</p>}

      {result && (
        <pre className="max-w-2xl whitespace-pre-wrap break-words rounded-lg border bg-muted/50 p-4 text-sm">
          {result}
        </pre>
      )}
    </main>
  );
}
