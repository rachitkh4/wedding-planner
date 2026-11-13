/**
 * Normalise a typed phone number to E.164. Indian numbers can be typed with or
 * without +91 / 0; anything starting with "+" is treated as international.
 * Returns null when the input can't be a real mobile number.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    if (digits.startsWith("91")) return isIndianMobile(digits.slice(2)) ? `+${digits}` : null;
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return isIndianMobile(digits) ? `+91${digits}` : null;
  if (digits.length === 11 && digits.startsWith("0")) {
    return isIndianMobile(digits.slice(1)) ? `+91${digits.slice(1)}` : null;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return isIndianMobile(digits.slice(2)) ? `+${digits}` : null;
  }
  return null;
}

function isIndianMobile(tenDigits: string) {
  return /^[6-9]\d{9}$/.test(tenDigits);
}

/** "+919876543210" → "98765 43210"; other countries are shown as stored. */
export function formatPhone(e164: string): string {
  if (e164.startsWith("+91") && e164.length === 13) {
    return `${e164.slice(3, 8)} ${e164.slice(8)}`;
  }
  return e164;
}

export function telHref(phone: string) {
  const e164 = normalizePhone(phone) ?? phone;
  return `tel:${e164}`;
}

export function whatsappHref(phone: string, text?: string) {
  const e164 = normalizePhone(phone) ?? phone;
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
