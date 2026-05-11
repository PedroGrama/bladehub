/** Digits-only phone for stable keys (loyalty wallet, seals). */
export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}
