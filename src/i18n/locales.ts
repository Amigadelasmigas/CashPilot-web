// The 20 launch locales. `code` names the file in src/i18n/<code>.json and the
// hreflang value; `path` is the URL segment (/es/, /pt-br/). English lives at /.
// `font: "system"` means the self-hosted Latin/Cyrillic font does not cover the
// script, so the page uses the system font stack for that language.
export interface Locale {
  code: string;
  path: string;
  name: string;
  dir: "ltr" | "rtl";
  font: "brand" | "system";
}

export const DEFAULT_LOCALE = "en";

export const LOCALES: Locale[] = [
  { code: "en", path: "", name: "English", dir: "ltr", font: "brand" },
  { code: "es", path: "es", name: "Español", dir: "ltr", font: "brand" },
  { code: "pt-BR", path: "pt-br", name: "Português (Brasil)", dir: "ltr", font: "brand" },
  { code: "fr", path: "fr", name: "Français", dir: "ltr", font: "brand" },
  { code: "de", path: "de", name: "Deutsch", dir: "ltr", font: "brand" },
  { code: "it", path: "it", name: "Italiano", dir: "ltr", font: "brand" },
  { code: "nl", path: "nl", name: "Nederlands", dir: "ltr", font: "brand" },
  { code: "pl", path: "pl", name: "Polski", dir: "ltr", font: "brand" },
  { code: "ru", path: "ru", name: "Русский", dir: "ltr", font: "brand" },
  { code: "uk", path: "uk", name: "Українська", dir: "ltr", font: "brand" },
  { code: "tr", path: "tr", name: "Türkçe", dir: "ltr", font: "brand" },
  { code: "ar", path: "ar", name: "العربية", dir: "rtl", font: "system" },
  { code: "hi", path: "hi", name: "हिन्दी", dir: "ltr", font: "system" },
  { code: "id", path: "id", name: "Bahasa Indonesia", dir: "ltr", font: "brand" },
  { code: "vi", path: "vi", name: "Tiếng Việt", dir: "ltr", font: "system" },
  { code: "th", path: "th", name: "ไทย", dir: "ltr", font: "system" },
  { code: "zh-CN", path: "zh-cn", name: "简体中文", dir: "ltr", font: "system" },
  { code: "ja", path: "ja", name: "日本語", dir: "ltr", font: "system" },
  { code: "ko", path: "ko", name: "한국어", dir: "ltr", font: "system" },
  { code: "fil", path: "fil", name: "Filipino", dir: "ltr", font: "brand" },
];
