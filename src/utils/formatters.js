export function toEnglishDigits(value) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return String(value)
    .split("")
    .map((ch) => {
      const pIndex = persian.indexOf(ch);
      if (pIndex > -1) return String(pIndex);
      const aIndex = arabic.indexOf(ch);
      if (aIndex > -1) return String(aIndex);
      return ch;
    })
    .join("");
}

export function sanitizeDigits(raw) {
  return toEnglishDigits(raw).replace(/\D/g, "");
}