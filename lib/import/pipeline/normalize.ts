import type {
  ColumnMappingItem,
  ImportFieldKey,
  MappedImportRow,
  RawImportData,
} from "@/lib/import/types";

function toNumber(value: string) {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMappedValue(
  row: string[],
  headers: string[],
  mappings: ColumnMappingItem[],
  field: ImportFieldKey
) {
  const mapping = mappings.find((item) => item.field === field);
  if (!mapping?.header) {
    return "";
  }

  const index = headers.indexOf(mapping.header);
  if (index === -1) {
    return "";
  }

  return row[index]?.trim() ?? "";
}

export function mapRowsToImportRecords(
  raw: RawImportData,
  mappings: ColumnMappingItem[]
): MappedImportRow[] {
  return raw.rows.map((row, index) => ({
    rowIndex: index + 1,
    customer: getMappedValue(row, raw.headers, mappings, "customer"),
    product: getMappedValue(row, raw.headers, mappings, "product"),
    quantity: toNumber(getMappedValue(row, raw.headers, mappings, "quantity")) || 1,
    amount: toNumber(getMappedValue(row, raw.headers, mappings, "amount")),
    paid: toNumber(getMappedValue(row, raw.headers, mappings, "paid")),
    remaining: toNumber(getMappedValue(row, raw.headers, mappings, "remaining")),
    currency: getMappedValue(row, raw.headers, mappings, "currency") || "TWD",
    orderId: getMappedValue(row, raw.headers, mappings, "orderId"),
    paymentMethod: getMappedValue(row, raw.headers, mappings, "paymentMethod"),
    status: getMappedValue(row, raw.headers, mappings, "status"),
    remarks: getMappedValue(row, raw.headers, mappings, "remarks"),
  }));
}
