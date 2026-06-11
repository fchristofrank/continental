/**
 * ISO 3166-1 numeric -> alpha-2 lookup.
 *
 * The world-atlas TopoJSON tags every country with its ISO 3166-1 *numeric*
 * id (e.g. 840 = US, 356 = India, 408 = North Korea, 196 = Cyprus) — the same
 * codes your trade API uses for `exporter` / `importer`. We only need alpha-2
 * here to call the fundamental-indicators endpoint.
 *
 * This covers the major economies + the codes in your examples. Extend freely:
 * a full table lives at https://en.wikipedia.org/wiki/ISO_3166-1_numeric
 */
export const NUMERIC_TO_ISO2: Record<number, string> = {
  4: 'AF', 8: 'AL', 12: 'DZ', 32: 'AR', 36: 'AU', 40: 'AT', 50: 'BD', 56: 'BE',
  68: 'BO', 76: 'BR', 100: 'BG', 104: 'MM', 116: 'KH', 120: 'CM', 124: 'CA',
  144: 'LK', 152: 'CL', 156: 'CN', 170: 'CO', 178: 'CG', 180: 'CD', 188: 'CR',
  191: 'HR', 192: 'CU', 196: 'CY', 203: 'CZ', 208: 'DK', 214: 'DO', 218: 'EC',
  818: 'EG', 222: 'SV', 231: 'ET', 246: 'FI', 250: 'FR', 268: 'GE', 276: 'DE',
  288: 'GH', 300: 'GR', 320: 'GT', 340: 'HN', 344: 'HK', 348: 'HU', 352: 'IS',
  356: 'IN', 360: 'ID', 364: 'IR', 368: 'IQ', 372: 'IE', 376: 'IL', 380: 'IT',
  388: 'JM', 392: 'JP', 400: 'JO', 398: 'KZ', 404: 'KE', 408: 'KP', 410: 'KR',
  414: 'KW', 418: 'LA', 422: 'LB', 434: 'LY', 440: 'LT', 458: 'MY', 484: 'MX',
  504: 'MA', 508: 'MZ', 516: 'NA', 524: 'NP', 528: 'NL', 554: 'NZ', 558: 'NI',
  562: 'NE', 566: 'NG', 578: 'NO', 586: 'PK', 591: 'PA', 600: 'PY', 604: 'PE',
  608: 'PH', 616: 'PL', 620: 'PT', 634: 'QA', 642: 'RO', 643: 'RU', 682: 'SA',
  686: 'SN', 688: 'RS', 702: 'SG', 703: 'SK', 705: 'SI', 710: 'ZA', 724: 'ES',
  729: 'SD', 752: 'SE', 756: 'CH', 760: 'SY', 158: 'TW', 764: 'TH', 788: 'TN',
  792: 'TR', 800: 'UG', 804: 'UA', 784: 'AE', 826: 'GB', 840: 'US', 858: 'UY',
  860: 'UZ', 862: 'VE', 704: 'VN', 887: 'YE', 894: 'ZM', 716: 'ZW',
};

export function iso2For(numericId: number): string | undefined {
  return NUMERIC_TO_ISO2[numericId];
}
