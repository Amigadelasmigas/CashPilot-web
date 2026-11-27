// Codes a visitor types by hand. The catalog marks a code the link cannot pass
// on (`referral.code_entry`, e.g. Dawn). This file adds the codes the catalog
// shows only inside a link or a sentence, so the site can show them typed out
// with a Copy button. Every entry is checked against the live catalog at build
// time (checkTypedCodes), so a code changed in the catalog fails the build
// instead of showing an old code.
import type { Service } from "../data/fetch";

export type TypedKind = "required" | "referral" | "coupon";
export interface TypedCode {
  code: string;
  kind: TypedKind;
}

/**
 * referral: the same code as the link carries, for a sign-up form that asks for it.
 * coupon: a discount code typed at checkout; the catalog names it in `bonus.referee`.
 */
export const EXTRA_TYPED_CODES: Record<string, TypedCode> = {
  honeygain: { code: "SERGIB4014", kind: "referral" },
  "deeper-network": { code: "SERGIO", kind: "coupon" },
};

/** The code a visitor of this service should type, if there is one. */
export function typedCode(s: Service): TypedCode | null {
  if (s.codeEntry) return { code: s.codeEntry, kind: "required" };
  return EXTRA_TYPED_CODES[s.slug] ?? null;
}

/** Errors for every entry above that no longer matches the catalog. */
export function checkTypedCodes(services: Service[]): string[] {
  const errors: string[] = [];
  for (const [slug, tc] of Object.entries(EXTRA_TYPED_CODES)) {
    const s = services.find((x) => x.slug === slug);
    if (!s) errors.push(`${slug}: not in the catalog any more`);
    else if (tc.kind === "referral" && (s.code !== tc.code || !s.signupUrl?.includes(tc.code)))
      errors.push(`${slug}: the catalog code is ${s.code}, not ${tc.code}`);
    else if (tc.kind === "coupon" && !new RegExp(`\\b${tc.code}\\b`).test(s.bonusReferee ?? ""))
      errors.push(`${slug}: the catalog bonus does not name the coupon ${tc.code} (${s.bonusReferee})`);
  }
  return errors;
}
