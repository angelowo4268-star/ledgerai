export interface AIAnalysisResult {
  documentType: string;
  invoiceNumber: string;
  vendor: string;
  date: string;
  amount: string;
  suggestedAccount: string;
  deductible: string;
  confidence: number;
}

export interface AIAnalysisRequest {
  file: File;
}

export type AIAnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AIAnalysisError {
  message: string;
}

export interface EditableAIFormValues {
  vendor: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  category: string;
  confidence: number;
}
