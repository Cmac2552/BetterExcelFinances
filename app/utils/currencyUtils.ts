import { FinancialSectionData, NetWorthCalculation } from "../types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateNetWorth(
  sections: FinancialSectionData[]
): NetWorthCalculation {
  let totalAssets = 0;
  let totalDebts = 0;

  sections.forEach((section) => {
    const sectionTotal = section.values.reduce(
      (sum, item) => sum + item.value,
      0
    );
    if (section.assetClass?.toLowerCase() === "asset") {
      totalAssets += sectionTotal;
    } else if (section.assetClass?.toLowerCase() === "debt") {
      totalDebts += Math.abs(sectionTotal);
    }
  });

  return {
    totalNetWorth: totalAssets - totalDebts,
    totalAssets,
    totalDebts,
  };
}