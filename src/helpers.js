// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language option, else Home Assistant's full locale when its base matches the card
// language (keeps pt-BR, de-CH…). A bare "pt" (Home Assistant's European Portuguese) becomes "pt-PT".
export const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Whole percentages, written the way of the language ("45 %" in French, "45%" in English).
export const PCT_FMT = {};
export const fmtPct = (v, locale) =>
  v === null || v === undefined
    ? "—"
    : (PCT_FMT[locale] ??= new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })).format(Math.round(v) / 100);

export const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
