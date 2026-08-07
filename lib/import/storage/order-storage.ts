export interface ImportOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  product: string;
  quantity: number;
  amount: number;
  paid: number;
  remaining: number;
  currency: string;
  paymentMethod: string;
  status: string;
  remarks: string;
  source: string;
  importedAt: string;
}

const STORAGE_KEY = "ledgerai-import-orders";

function readStorage(): ImportOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ImportOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(orders: ImportOrder[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("ledgerai-import-orders-updated"));
}

export function getImportOrders(): ImportOrder[] {
  return readStorage();
}

export function appendImportOrders(orders: ImportOrder[]) {
  writeStorage([...orders, ...readStorage()]);
}
