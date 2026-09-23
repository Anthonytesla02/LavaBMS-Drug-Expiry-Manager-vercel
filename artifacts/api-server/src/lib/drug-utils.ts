import type { Drug } from "@workspace/db";

export type DrugStatus = "good" | "expiring" | "expired";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiryUtc = Date.UTC(year, month - 1, day);
  return Math.ceil((expiryUtc - todayUtc) / MS_PER_DAY);
}

export function getDrugStatus(daysUntilExpiry: number): DrugStatus {
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 90) return "expiring";
  return "good";
}

export function toDrugResponse(drug: Drug) {
  const daysUntilExpiry = getDaysUntilExpiry(drug.expiryDate);
  return {
    id: drug.id,
    name: drug.name,
    alternativeNames: drug.alternativeNames,
    brandNames: drug.brandNames,
    expiryDate: new Date(`${drug.expiryDate}T00:00:00.000Z`),
    batchNumber: drug.batchNumber,
    notes: drug.notes,
    status: getDrugStatus(daysUntilExpiry),
    daysUntilExpiry,
    createdAt: drug.createdAt,
    updatedAt: drug.updatedAt,
  };
}

export function matchesDrug(drug: Drug, searchTerm: string): string | null {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) return null;

  const terms = [drug.name, ...drug.alternativeNames, ...drug.brandNames];
  const matchedTerm = terms.find((term) =>
    term.toLowerCase().includes(normalized),
  );
  return matchedTerm ?? null;
}