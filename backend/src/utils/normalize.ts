export function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function contactMatchesKeyword(contactName: string, keyword: string) {
  return normalizeText(contactName).includes(normalizeText(keyword));
}

export function normalizePhoneAR(phone = '') {
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('15')) digits = digits.slice(2);
  if (digits.startsWith('54')) {
    digits = digits.replace(/^549?/, '');
  }
  if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.replace(/^(\d{2,4})15/, '$1');
  return `549${digits}`;
}

export function capitalize(text: string) {
  const clean = normalizeText(text);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
