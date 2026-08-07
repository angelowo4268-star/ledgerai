import { appendConversationRecords } from "@/lib/communication/conversation-storage";
import type { ConversationRecord } from "@/lib/communication/types";
import { generateAccountingEntriesFromRecords } from "@/lib/communication/generate-vouchers";
import type { ImportResult, MappedImportRow } from "@/lib/import/types";
import {
  getCustomers,
  upsertCustomer,
} from "@/lib/import/storage/customer-storage";
import {
  appendImportOrders,
  type ImportOrder,
} from "@/lib/import/storage/order-storage";

function toConversationRecord(
  row: MappedImportRow,
  sourceLabel: string
): ConversationRecord {
  const createdAt = new Date().toISOString();
  const platform = sourceLabel.includes("Google Forms")
    ? "Google Forms"
    : "Google Sheets";

  return {
    id: crypto.randomUUID(),
    orderNumber: row.orderId,
    customerName: row.customer,
    customerId: "",
    platform,
    product: row.product,
    sku: "",
    quantity: row.quantity,
    amount: row.amount,
    currency: row.currency,
    paymentStatus: row.status,
    paymentMethod: row.paymentMethod,
    paymentDate: "",
    orderStatus: row.status,
    shippingMethod: "",
    trackingNumber: "",
    shippingDate: "",
    customerNotified: "",
    notes: row.remarks,
    orderDate: row.orderDate ?? "",
    confidence: 100,
    sourceLabel,
    createdAt,
    analyzedAt: createdAt,
  };
}

function toImportOrder(row: MappedImportRow, sourceLabel: string): ImportOrder {
  return {
    id: crypto.randomUUID(),
    orderNumber: row.orderId,
    customerName: row.customer,
    product: row.product,
    quantity: row.quantity,
    amount: row.amount,
    paid: row.paid,
    remaining: row.remaining,
    currency: row.currency,
    paymentMethod: row.paymentMethod,
    status: row.status,
    remarks: row.remarks,
    source: sourceLabel,
    importedAt: new Date().toISOString(),
  };
}

export function executeImport(
  rows: MappedImportRow[],
  sourceLabel: string,
  options: { createVouchers?: boolean } = {}
): ImportResult {
  let customersCreated = 0;
  let customersUpdated = 0;
  const processedNames = new Set<string>();

  rows.forEach((row) => {
    const name = row.customer.trim();
    if (!name) {
      return;
    }

    const normalizedName = name.toLowerCase();
    if (processedNames.has(normalizedName)) {
      return;
    }
    processedNames.add(normalizedName);

    const existing = getCustomers().find(
      (customer) => customer.name.toLowerCase() === normalizedName
    );

    if (existing) {
      upsertCustomer({
        ...existing,
        name,
        updatedAt: new Date().toISOString(),
      });
      customersUpdated += 1;
      return;
    }

    upsertCustomer({
      id: crypto.randomUUID(),
      name,
      customerId: row.orderId ? `GS-${row.orderId}` : "",
      platform: sourceLabel.includes("Google Forms") ? "Google Forms" : "Google Sheets",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    customersCreated += 1;
  });

  const orders = rows.map((row) => toImportOrder(row, sourceLabel));
  appendImportOrders(orders);

  const communicationRecords = rows.map((row) =>
    toConversationRecord(row, sourceLabel)
  );
  appendConversationRecords(communicationRecords);

  let vouchersCreated = 0;
  if (options.createVouchers) {
    vouchersCreated = generateAccountingEntriesFromRecords(communicationRecords);
  }

  return {
    customersCreated,
    customersUpdated,
    ordersCreated: orders.length,
    communicationRecordsCreated: communicationRecords.length,
    vouchersCreated,
  };
}
