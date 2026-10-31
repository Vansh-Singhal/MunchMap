// Parse decimal digits rather than multiplying a binary floating-point price.
export const toPaise = (price: number): number | undefined => {
  if (!Number.isFinite(price) || price < 0) return undefined;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(price));
  if (!match?.[1]) return undefined;
  const paise = BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
  return paise <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(paise) : undefined;
};
