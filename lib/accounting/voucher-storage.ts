export type VoucherStatus = "Draft" | "Confirmed" | "Exported";

export interface Voucher {
  id: string;
  date: string;
  vendor: string;
  invoiceNumber: string;
  summary: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  status: VoucherStatus;
}

export type NewVoucher = Omit<Voucher, "id">;

const STORAGE_KEY = "ledgerai-vouchers";

function readStorage(): Voucher[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Voucher[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(vouchers: Voucher[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers));
  window.dispatchEvent(new Event("ledgerai-vouchers-updated"));
}

export function getVouchers(): Voucher[] {
  return readStorage();
}

export function saveVoucher(voucher: NewVoucher): Voucher {
  const vouchers = readStorage();
  const saved: Voucher = {
    ...voucher,
    id: crypto.randomUUID(),
  };

  vouchers.unshift(saved);
  writeStorage(vouchers);

  return saved;
}

export function deleteVoucher(id: string): void {
  deleteVouchers([id]);
}

export function deleteVouchers(ids: string[]): void {
  if (ids.length === 0) {
    return;
  }

  const idSet = new Set(ids);
  const vouchers = readStorage().filter((voucher) => !idSet.has(voucher.id));
  writeStorage(vouchers);
}

export function markVouchersExported(ids: string[]): void {
  if (ids.length === 0) {
    return;
  }

  const idSet = new Set(ids);
  const vouchers = readStorage().map((voucher) =>
    idSet.has(voucher.id)
      ? { ...voucher, status: "Exported" as const }
      : voucher
  );

  writeStorage(vouchers);
}

export function updateVoucher(voucher: Voucher): Voucher {
  const vouchers = readStorage();
  const index = vouchers.findIndex((item) => item.id === voucher.id);

  if (index === -1) {
    throw new Error("Voucher not found");
  }

  vouchers[index] = voucher;
  writeStorage(vouchers);

  return voucher;
}
