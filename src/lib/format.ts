// Dansk formatering: karakterer med decimalkomma, priser som "89 kr."

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "–";
  return score.toLocaleString("da-DK", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatPrice(kr: number): string {
  return `${kr.toLocaleString("da-DK")} kr.`;
}
