import type {
  FormColumnMappingItem,
  ImportFormFieldKey,
  MappedFormImportRow,
  RawImportData,
} from "@/lib/import/types";

function toNumber(value: string) {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMappedValue(
  row: string[],
  headers: string[],
  mappings: FormColumnMappingItem[],
  field: ImportFormFieldKey
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

function getMissingFields(
  row: MappedFormImportRow,
  mappings: FormColumnMappingItem[]
): ImportFormFieldKey[] {
  const missing: ImportFormFieldKey[] = [];

  mappings.forEach((mapping) => {
    const value = row[mapping.field];
    const isEmpty =
      mapping.field === "amount" ? row.amount <= 0 : String(value).trim() === "";

    if (!mapping.header || isEmpty) {
      missing.push(mapping.field);
    }
  });

  return [...new Set(missing)];
}

export function mapRowsToFormImportRecords(
  raw: RawImportData,
  mappings: FormColumnMappingItem[]
): MappedFormImportRow[] {
  return raw.rows.map((row, index) => {
    const record: MappedFormImportRow = {
      rowIndex: index + 1,
      customer: getMappedValue(row, raw.headers, mappings, "customer"),
      product: getMappedValue(row, raw.headers, mappings, "product"),
      amount: toNumber(getMappedValue(row, raw.headers, mappings, "amount")),
      status: getMappedValue(row, raw.headers, mappings, "status"),
      date: getMappedValue(row, raw.headers, mappings, "date"),
      missingFields: [],
    };

    record.missingFields = getMissingFields(record, mappings);
    return record;
  });
}

export function countRowsWithMissingFields(rows: MappedFormImportRow[]) {
  return rows.filter((row) => row.missingFields.length > 0).length;
}
