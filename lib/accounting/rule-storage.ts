export interface AccountingRule {
  id: string;
  vendor: string;
  debitAccount: string;
  creditAccount: string;
  category: string;
  autoApply: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewAccountingRule = Omit<
  AccountingRule,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateAccountingRule = Omit<AccountingRule, "createdAt"> & {
  createdAt?: string;
};

const STORAGE_KEY = "ledgerai-accounting-rules";

function readStorage(): AccountingRule[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AccountingRule[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(rules: AccountingRule[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event("ledgerai-rules-updated"));
}

function vendorsMatch(invoiceVendor: string, ruleVendor: string): boolean {
  const invoice = invoiceVendor.toLowerCase().trim();
  const rule = ruleVendor.toLowerCase().trim();

  if (!invoice || !rule) {
    return false;
  }

  return invoice === rule || invoice.includes(rule) || rule.includes(invoice);
}

export function getRules(): AccountingRule[] {
  return readStorage();
}

export function saveRule(rule: NewAccountingRule): AccountingRule {
  const rules = readStorage();
  const now = new Date().toISOString();
  const saved: AccountingRule = {
    ...rule,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  rules.unshift(saved);
  writeStorage(rules);

  return saved;
}

export function updateRule(rule: UpdateAccountingRule): AccountingRule {
  const rules = readStorage();
  const index = rules.findIndex((item) => item.id === rule.id);

  if (index === -1) {
    throw new Error("Rule not found");
  }

  const updated: AccountingRule = {
    ...rules[index],
    ...rule,
    createdAt: rule.createdAt ?? rules[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  rules[index] = updated;
  writeStorage(rules);

  return updated;
}

export function deleteRule(id: string): void {
  const rules = readStorage().filter((rule) => rule.id !== id);
  writeStorage(rules);
}

export function findMatchingRule(vendor: string): AccountingRule | null {
  const rules = readStorage().filter((rule) => rule.autoApply);

  const exactMatch = rules.find(
    (rule) => rule.vendor.toLowerCase().trim() === vendor.toLowerCase().trim()
  );
  if (exactMatch) {
    return exactMatch;
  }

  return (
    rules
      .filter((rule) => vendorsMatch(vendor, rule.vendor))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0] ?? null
  );
}

export function findRuleByVendor(vendor: string): AccountingRule | null {
  const rules = readStorage();

  return (
    rules.find(
      (rule) => rule.vendor.toLowerCase().trim() === vendor.toLowerCase().trim()
    ) ??
    rules.find((rule) => vendorsMatch(vendor, rule.vendor)) ??
    null
  );
}
