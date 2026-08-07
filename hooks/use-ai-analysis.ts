"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { analyzeDocument } from "@/lib/ai-analysis/analyze-document";
import type {
  AIAnalysisResult,
  AIAnalysisStatus,
} from "@/lib/ai-analysis/types";

interface UseAIAnalysisOptions {
  /** Reset analysis when the selected file identity changes */
  fileKey?: string;
}

export function useAIAnalysis({ fileKey }: UseAIAnalysisOptions = {}) {
  const [status, setStatus] = useState<AIAnalysisStatus>("idle");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
    abortRef.current = false;
  }, [fileKey, reset]);

  const runAnalysis = useCallback(async (file: File) => {
    abortRef.current = false;
    setStatus("loading");
    setResult(null);
    setError(null);

    try {
      const analysisResult = await analyzeDocument({ file });

      if (abortRef.current) return;

      setResult(analysisResult);
      setStatus("success");
    } catch {
      if (abortRef.current) return;

      setError("分析失敗，請稍後再試");
      setStatus("error");
    }
  }, []);

  return {
    status,
    result,
    error,
    runAnalysis,
    reset,
    isAnalyzing: status === "loading",
  };
}
