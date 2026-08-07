export interface Customer {
  id: string;
  name: string;
  customerId: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ledgerai-customers";

function readStorage(): Customer[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(customers: Customer[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  window.dispatchEvent(new Event("ledgerai-customers-updated"));
}

export function getCustomers(): Customer[] {
  return readStorage();
}

export function saveCustomers(customers: Customer[]) {
  writeStorage(customers);
}

export function upsertCustomer(customer: Customer) {
  const customers = readStorage();
  const index = customers.findIndex((item) => item.id === customer.id);

  if (index === -1) {
    writeStorage([customer, ...customers]);
    return;
  }

  customers[index] = customer;
  writeStorage(customers);
}
