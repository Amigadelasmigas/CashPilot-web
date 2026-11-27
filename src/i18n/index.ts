// Translation lookup. Every string a visitor sees lives in src/i18n/<code>.json,
// one file per locale with the same keys as en.json. A locale with no file is
// not built. A key missing from a locale falls back to English, and a key
// missing from English fails the build. `bun run i18n:check` lists the gaps.
import en from "./en.json";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

export { LOCALES, DEFAULT_LOCALE, type Locale };

type Dict = Record<string, unknown>;
const files = import.meta.glob<Dict>("./*.json", { eager: true, import: "default" });
const dictFor = (code: string): Dict | undefined => files[`./${code}.json`];

/** Locales that have a translation file, in picker order. English is always first. */
export const AVAILABLE: Locale[] = LOCALES.filter((l) => l.code === DEFAULT_LOCALE || dictFor(l.code));

export function getLocale(code: string | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}

export function localeFromPath(path: string | undefined): Locale {
  return AVAILABLE.find((l) => l.path === (path ?? "")) ?? LOCALES[0]!;
}

function lookup(dict: Dict | undefined, key: string): unknown {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Dict)) cur = (cur as Dict)[part];
    else return undefined;
  }
  return cur;
}

export type Vars = Record<string, string | number>;

export function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export interface Translator {
  locale: Locale;
  /** A string by dotted key, with {name} placeholders filled from vars. */
  (key: string, vars?: Vars): string;
  /** Keys of an object node in English order, for lists such as the FAQ. */
  keys(key: string): string[];
  /** Absolute path for a site route in this locale, e.g. "/download/" -> "/es/download/". */
  href(route: string): string;
  num(n: number): string;
  date(iso: string): string;
}

export function useT(locale: Locale): Translator {
  const dict = dictFor(locale.code);
  const t = ((key: string, vars?: Vars) => {
    const local = lookup(dict, key);
    if (typeof local === "string") return interpolate(local, vars);
    const value = lookup(en, key);
    if (typeof value !== "string") throw new Error(`i18n: missing English string "${key}"`);
    // An English fallback inside a right-to-left page: isolate it (U+2068 FSI
    // ... U+2069 PDI) so its full stop stays at the end of the sentence.
    const out = interpolate(value, vars);
    return locale.dir === "rtl" ? `\u2068${out}\u2069` : out;
  }) as Translator;
  t.locale = locale;
  t.keys = (key) => {
    const node = lookup(en, key);
    if (!node || typeof node !== "object") throw new Error(`i18n: "${key}" is not an object in en.json`);
    return Object.keys(node);
  };
  t.href = (route) => localizedPath(locale, route);
  t.num = (n) => new Intl.NumberFormat(locale.code).format(n);
  t.date = (iso) => new Intl.DateTimeFormat(locale.code, { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));
  return t;
}

export function localizedPath(locale: Locale, route: string): string {
  const clean = route.startsWith("/") ? route : `/${route}`;
  return locale.path ? `/${locale.path}${clean}` : clean;
}

/** getStaticPaths entries for every built locale. English has no prefix. */
export function localeParams() {
  return AVAILABLE.map((l) => ({ params: { locale: l.path || undefined } }));
}
