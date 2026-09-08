/**
 * Single source of truth for the operating company's legal identity.
 *
 * Values come from `NEXT_PUBLIC_COMPANY_*` environment variables (see
 * `.env.local` / `.env.example`) — the Next.js analogue of the API's
 * appsettings + Options pattern. The literals below are only *fallback
 * defaults* (mirroring how the .NET Options classes declare defaults); the
 * env vars are authoritative and must be set per environment.
 *
 * NOTE: each var is referenced as a literal `process.env.NEXT_PUBLIC_...`
 * on purpose — Next.js only inlines literal references into the client
 * bundle, so a computed `process.env[key]` lookup would be undefined in the
 * browser. Do not refactor these into a loop/helper that indexes env by key.
 *
 * These must stay consistent with the API's `Company` config section
 * (effortless-insight-api .../appsettings.json) and the GST registration.
 */
export const COMPANY = {
  /** Public-facing brand / product name. */
  brand: process.env.NEXT_PUBLIC_COMPANY_BRAND || 'EffortlessInsight',
  /** Registered legal entity name (as on the Certificate of Incorporation). */
  legalName:
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || 'ARSTEG SOLUTIONS PRIVATE LIMITED',
  /** Corporate Identity Number (MCA). */
  cin: process.env.NEXT_PUBLIC_COMPANY_CIN || 'U72300HR2015PTC057471',
  /** GST Identification Number — must match the invoice config. */
  gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || '06AANCA9681K1ZZ',
  /** Registered office, single-line form for footers/contact/legal. */
  addressInline:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
    'Aravali Heights, Sector 24, Dharuhera, Rewari, Haryana – 123106, India',
  /** District whose courts have jurisdiction (matches registered office). */
  jurisdiction: process.env.NEXT_PUBLIC_COMPANY_JURISDICTION || 'Rewari, Haryana',
  /** General/press/legal contact email. */
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@effortlessinsight.in',
  /**
   * Pre-sales contact email. Customer *support* is deliberately not an email
   * channel — it lives in-app (dashboard support) — so no support@ exists.
   */
  salesEmail:
    process.env.NEXT_PUBLIC_COMPANY_SALES_EMAIL || 'sales@effortlessinsight.in',
  /** Public contact phone, display form. */
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+91 93113 91932',
  /** Phone in tel: href form (E.164, no spaces). */
  phoneHref: process.env.NEXT_PUBLIC_COMPANY_PHONE_HREF || '+919311391932',
} as const
