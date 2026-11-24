// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { PICTURES } from "./core.js";
import { clamp, lang, t } from "./helpers.js";
import { columnsOf } from "./illustrated-header.js";
import { STRINGS } from "./i18n/strings.js";

export const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];
export const FAVORITE_PRESETS = ["10", "25", "50", "75", "90"];
// The `columns` option in the editor, as strings (a select); 1 is the default and stays out of the YAML.
export const COLUMN_CHOICES = ["1", "2", "3"];
// The `confirm` option in the editor: unset (garage doors, gates and doors), true or false.
export const CONFIRM_MODES = [
  ["auto", undefined],
  ["always", true],
  ["never", false],
];

// Editor form data ↔ card config: the cover list holds ids in the form (objects keep their own options), the
// favorites strings (objects are kept as they are), and options left at their default stay out of the YAML.
export const toForm = (config, toggles) => {
  const data = { ...config };
  const ids = [];
  if (config.entity) ids.push(config.entity);
  for (const e of Array.isArray(config.entities) ? config.entities : []) ids.push(typeof e === "string" ? e : e?.entity);
  data.entities = ids.filter(Boolean);
  delete data.entity;
  data.favorites = (Array.isArray(config.favorites) ? config.favorites : []).filter((f) => typeof f === "number" || typeof f === "string").map(String);
  data.device_class ??= "auto";
  data.invert ??= false;
  data.no_feedback ??= false;
  data.illustration_theme ??= "auto";
  data.confirm = CONFIRM_MODES.find(([, v]) => v === config.confirm)?.[0] ?? "auto";
  data.columns = String(columnsOf(config));
  for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
  return data;
};

export const fromForm = (value, previous, toggles) => {
  const config = { ...value };
  const objects = new Map(
    (Array.isArray(previous.entities) ? previous.entities : []).filter((e) => e && typeof e === "object").map((e) => [e.entity, e]),
  );
  const ids = Array.isArray(config.entities) ? config.entities.filter(Boolean) : [];
  delete config.entity;
  delete config.entities;
  const list = ids.map((id) => objects.get(id) || id);
  if (list.length === 1 && typeof list[0] === "string") config.entity = list[0];
  else if (list.length) config.entities = list;
  const kept = (Array.isArray(previous.favorites) ? previous.favorites : []).filter((f) => f && typeof f === "object");
  const nums = (Array.isArray(config.favorites) ? config.favorites : [])
    .map((f) => Number(f))
    .filter((n) => Number.isFinite(n))
    .map((n) => clamp(Math.round(n)));
  delete config.favorites;
  const favs = [...[...new Set(nums)].sort((a, b) => a - b), ...kept];
  if (favs.length) config.favorites = favs;
  if (config.device_class === "auto") delete config.device_class;
  if (config.invert === false) delete config.invert;
  if (config.no_feedback === false) delete config.no_feedback;
  if (config.illustration_theme === "auto") delete config.illustration_theme;
  const mode = CONFIRM_MODES.find(([k]) => k === config.confirm);
  if (mode && mode[1] !== undefined) config.confirm = mode[1];
  else delete config.confirm;
  const cols = columnsOf(config);
  if (cols > 1) config.columns = cols;
  else delete config.columns;
  const defaults = Object.fromEntries(toggles);
  for (const [k, v] of Object.entries(config)) {
    if (v === "" || v === undefined || v === null || (k in defaults && v === defaults[k])) delete config[k];
  }
  return config;
};

export class CoverEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "entities", selector: { entity: { domain: "cover", multiple: true } } },
      { name: "area", selector: { area: {} } },
      { name: "title", selector: { text: {} } },
      {
        name: "device_class",
        selector: { select: { mode: "dropdown", options: [{ value: "auto", label: tr("class_auto") }, ...PICTURES.map((c) => ({ value: c, label: tr(`c_${c}`) }))] } },
      },
      { name: "invert", selector: { boolean: {} } },
      { name: "no_feedback", selector: { boolean: {} } },
      { name: "pedestrian", selector: { text: {} } },
      { name: "light", selector: { entity: { domain: ["light", "switch"] } } },
      { name: "open_time", selector: { entity: { domain: ["sensor", "input_datetime"] } } },
      { name: "close_time", selector: { entity: { domain: ["sensor", "input_datetime"] } } },
      { name: "open_condition", selector: { entity: { domain: ["binary_sensor", "input_boolean", "switch", "schedule"] } } },
      { name: "close_condition", selector: { entity: { domain: ["binary_sensor", "input_boolean", "switch", "schedule"] } } },
      {
        name: "favorites",
        selector: { select: { multiple: true, custom_value: true, mode: "dropdown", options: FAVORITE_PRESETS.map((v) => ({ value: v, label: `${v} %` })) } },
      },
      { name: "columns", selector: { select: { mode: "dropdown", options: COLUMN_CHOICES.map((v) => ({ value: v, label: v })) } } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } },
      },
      { name: "confirm", selector: { select: { mode: "dropdown", options: CONFIRM_MODES.map(([value]) => ({ value, label: tr(`confirm_${value}`) })) } } },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, `e_${s.name}`);
      this._form.computeHelper = (s) => (STRINGS.en[`h_${s.name}`] ? t(this._hass, this._config, `h_${s.name}`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = fromForm(ev.detail.value, this._config, toggles);
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = toForm(this._config, toggles);
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// The toggles of the full card; the mini card's detailed view is the full card, so its editor has them all too.
export const CARD_TOGGLES = [
  ["illustration", true],
  ["show_title", true],
  ["show_subtitle", true],
  ["show_controls", true],
  ["show_group_controls", true],
  ["show_tilt", true],
  ["show_state", true],
  ["center_value", false],
  ["show_favorites", true],
  ["show_schedule", true],
  ["expanded", false],
];

export class CoverCardEditor extends CoverEditorBase {
  static get toggles() {
    return CARD_TOGGLES;
  }
}

export class CoverMiniCardEditor extends CoverEditorBase {
  static get toggles() {
    return [...CARD_TOGGLES, ["zoom", true]];
  }
}
