import { parseAmount } from "@/lib/ai-analysis/form-utils";
import type { AIAnalysisResult } from "@/lib/ai-analysis/types";
import { findMatchingRule } from "@/lib/accounting/rule-storage";

export interface VoucherSuggestion {
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  summary: string;
  matchedRule: boolean;
}

const SOFTWARE_VENDORS = ["google", "microsoft", "adobe"];
const TRANSPORTATION_VENDORS = ["uber", "台灣高鐵", "高鐵"];
const OFFICE_VENDORS = ["7-eleven", "7 eleven", "全聯", "家樂福"];
const MEAL_VENDORS = ["starbucks", "路易莎"];

function matchesVendor(vendor: string, keywords: string[]): boolean {
  const normalized = vendor.toLowerCase();

  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function suggestDebitAccount(vendor: string): string {
  if (matchesVendor(vendor, SOFTWARE_VENDORS)) {
    return "軟體費用";
  }

  if (matchesVendor(vendor, TRANSPORTATION_VENDORS)) {
    return "交通費";
  }

  if (matchesVendor(vendor, OFFICE_VENDORS)) {
    return "辦公用品費";
  }

  if (matchesVendor(vendor, MEAL_VENDORS)) {
    return "餐飲交際費";
  }

  return "其他費用";
}

export function generateVoucherSuggestion(
  result: AIAnalysisResult
): VoucherSuggestion {
  const amount = parseAmount(result.amount);
  const summary = [result.vendor, result.documentType, result.invoiceNumber]
    .filter(Boolean)
    .join(" · ");
  const matchingRule = findMatchingRule(result.vendor);

  if (matchingRule) {
    return {
      debitAccount: matchingRule.debitAccount,
      debitAmount: amount,
      creditAccount: matchingRule.creditAccount,
      creditAmount: amount,
      summary,
      matchedRule: true,
    };
  }

  return {
    debitAccount: suggestDebitAccount(result.vendor),
    debitAmount: amount,
    creditAccount: "現金",
    creditAmount: amount,
    summary,
    matchedRule: false,
  };
}
