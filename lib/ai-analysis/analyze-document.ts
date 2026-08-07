import type { AIAnalysisRequest, AIAnalysisResult } from "@/lib/ai-analysis/types";

export async function analyzeDocument({
  file,
}: AIAnalysisRequest): Promise<AIAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Analysis request failed");
  }

  return (await response.json()) as AIAnalysisResult;
}
