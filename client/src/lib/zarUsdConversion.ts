export function zarToUsdInput(zarValue: string, zarUsdRate?: number) {
  if (zarValue.trim() === "" || !zarUsdRate || !Number.isFinite(zarUsdRate) || zarUsdRate <= 0) {
    return "";
  }

  const zar = Number(zarValue);
  if (!Number.isFinite(zar) || zar < 0) return "";

  return (Math.round(zar * zarUsdRate * 100) / 100).toFixed(2);
}

export function zarUsdRateLabel(zarUsdRate?: number) {
  if (!zarUsdRate || !Number.isFinite(zarUsdRate) || zarUsdRate <= 0) return null;
  return `R1.00 = $${zarUsdRate.toFixed(4)}`;
}
