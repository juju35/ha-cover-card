// ---------------------------------------------------------------------------
// Automatic schedule: the next automatic opening and closing, read from entities (or written as times)
// ---------------------------------------------------------------------------
import { CLASSES, F, GATES, GUARDED, PICTURES, TILT_FEATURES } from "./core.js";
import { clamp } from "./helpers.js";

export const SCHEDULE_KEYS = ["open_time", "close_time", "open_condition", "close_condition"];
// The words of a tile: to come, then gone by.
export const SCHEDULE_WORDS = { open: ["sch_opens", "sch_opened"], close: ["sch_closes", "sch_closed"] };

// The schedule options of a cover (its own, else the card's when `card` is given), or null when it has no time.
export const scheduleOf = (own, card) => {
  const src = own && (own.open_time || own.close_time) ? own : card;
  if (!src || (!src.open_time && !src.close_time)) return null;
  return Object.fromEntries(SCHEDULE_KEYS.map((k) => [k, typeof src[k] === "string" ? src[k] : null]));
};

// When a time happens, as a Date, from an entity's state or a time written in the option itself:
// - a time alone ("07:42", "07:42:00": a template sensor, a time-only input_datetime) is its next occurrence, today
//   or tomorrow when already past;
// - a date and time (a timestamp sensor, "2026-11-19 07:42:00" of an input_datetime) is taken as it is, past or not.
export const TIME_RE = /^\s*(\d{1,2})[:h](\d{2})(?::(\d{2}))?\s*$/;
export const whenOf = (value, now) => {
  if (typeof value !== "string") return null;
  const m = TIME_RE.exec(value);
  if (m) {
    const [h, min, sec] = [Number(m[1]), Number(m[2]), Number(m[3] || 0)];
    if (h > 23 || min > 59 || sec > 59) return null;
    const d = new Date(now);
    d.setHours(h, min, sec, 0);
    if (d.getTime() <= now) d.setDate(d.getDate() + 1);
    return d;
  }
  if (!/\d{1,2}:\d{2}/.test(value)) return null;
  const ms = Date.parse(value.trim().replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T"));
  return Number.isFinite(ms) ? new Date(ms) : null;
};

// Days between two dates, by the calendar (0 today, 1 tomorrow).
export const dayDiff = (a, b) => Math.round((new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0)) / 86400000);

// Hours and minutes as Home Assistant shows them: its time format (12 / 24 h), else the language's; like Home
// Assistant, two-digit hours on a 24-hour clock ("07:42"), not on a 12-hour one ("7:42 AM").
export const TIME_FMT = {};
export const fmtTime = (date, locale, format) => {
  const key = `${locale}|${format}`;
  if (!TIME_FMT[key]) {
    const h12 =
      format === "12" || (format !== "24" && ["h11", "h12"].includes(new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle));
    TIME_FMT[key] = new Intl.DateTimeFormat(locale, { hour: h12 ? "numeric" : "2-digit", minute: "2-digit", hourCycle: h12 ? "h12" : "h23" });
  }
  return TIME_FMT[key].format(date);
};

// A position attribute as a whole number from 0 to 100, or null when the cover does not report it.
export const numAttr = (s, key) => {
  const v = s?.attributes?.[key];
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? clamp(Math.round(n)) : null;
};

// 0 = closed, 100 = open (Home Assistant's convention). A cover without a position is fully open or closed by
// its state; while it moves without one, the position is unknown (null).
export const positionOf = (s) => {
  const p = numAttr(s, "current_position");
  if (p !== null) return p;
  if (s?.state === "closed") return 0;
  if (s?.state === "open") return 100;
  return null;
};
export const tiltOf = (s) => numAttr(s, "current_tilt_position");

// Features of a cover. Without supported_features (an old template cover), what its attributes tell.
export const featuresOf = (s) => {
  const f = s?.attributes?.supported_features;
  if (f !== undefined && f !== null && Number.isFinite(Number(f))) return Number(f);
  const a = s?.attributes || {};
  return F.OPEN | F.CLOSE | F.STOP | (a.current_position !== undefined ? F.SET_POSITION : 0) | (a.current_tilt_position !== undefined ? TILT_FEATURES : 0);
};
export const has = (s, feature) => (featuresOf(s) & feature) !== 0;
export const hasTilt = (s) => (featuresOf(s) & TILT_FEATURES) !== 0;

export const isOffline = (s) => !s || s.state === "unavailable";
// Course time option (seconds for a full course, closed ↔ open), or null when unset or invalid.
export const travelTimeOf = (v) => {
  const n = Number(v);
  return v !== undefined && v !== null && v !== "" && Number.isFinite(n) && n > 0 ? n : null;
};
// Position estimated on a course started at `t0` from `p0`, `travel` seconds for 0 → 100, bounded to 0…100.
export const estimate = (move, travel, now) => {
  const step = ((now - move.t0) / 1000 / travel) * 100;
  return Math.min(100, Math.max(0, move.state === "opening" ? move.p0 + step : move.p0 - step));
};
// The courses of the covers moving on their course time, by entity, shared by every card of the page.
export const TRAVEL_MOVES = new Map();
// A render this often while a cover moves on its course time.
export const TRAVEL_TICK_MS = 250;
export const isMoving = (s) => s?.state === "opening" || s?.state === "closing";

// A gate whose name says it swings (two leaves on hinges) in any of the card's languages.
export const SWING_RE = /swing|battant|batant|fl[uü]gel|drehtor|batiente|battente|draai|batente|skrzyd|kr[ií]dl|k[rř][ií]dl|krilna|крил|распаш|розпаш|ny[ií]l[oó]|двукрил|slagrind|fløj|vērtņ|ανοιγ/i;
// A barrier (a gate, or a cover without a device class, whose name says so: a lifting arm), a pergola (louvres
// turning on a frame, whatever its device class but a door, gate or damper) and hinged shutters (a shutter, or a
// cover without a device class, whose two leaves fold out), in any of the card's languages.
export const BARRIER_RE = /barri[eè]r|barier|barrera|barjera|schranke|sbarra|slagboom|cancela|szlaban|z[aá]vor|zapornic|sorompó|shlagbaum|шлагбаум|бариер|рампа|\brampa\b|μπάρα|\bbom\b|boom gate/i;
export const PERGOLA_RE = /pergol|πέργκολ|περγκολ|пергол|louvre|louver|bioclim|lamellendach/i;
// A window awning (an awning, or a cover without a device class, whose name says so: drop arms beside a window), in
// any of the card's languages.
export const WINDOW_AWNING_RE = /window awning|drop.?arm|marquisolette|markisolette|fallarm|store (de |à )?(fen[eê]tre|projection)|fenstermarkise|toldo (de )?(ventana|janela|punto recto)|tenda (da finestra|a caduta)|uitvalscherm|markiza okienn|prozorsk\S* tend|прозорск\S* тенд|copertin[aă] de fereastr|vinduesmarkis|fönstermarkis|прозоречн\S* тент|оконн\S* маркиз|віконн\S* маркіз|ablakmark[ií]z|okenn[aáií] mark|okensk\S* mark|loga mark|τέντα παραθ/i;
export const HINGED_RE = /hinged|battant|klappl|fensterl[aä]d|contravent|postigo|battente|\bscur|luik|portada|okiennic|oblon|skodde|fönsterluck|kapci|капци|капаци|ставн|віконниц|zsalug|okenic|polkn|slēģ|παντζ/i;
export const classOf = (s, override) => {
  if (PICTURES.includes(override)) return override;
  const dc = s?.attributes?.device_class;
  const name = s?.attributes?.friendly_name || s?.entity_id || "";
  if ((dc === "gate" || !dc) && BARRIER_RE.test(name)) return "barrier";
  if (dc === "gate" && SWING_RE.test(name)) return "swing";
  if (!["door", "gate", "garage", "damper"].includes(dc) && PERGOLA_RE.test(name)) return "pergola";
  if ((dc === "shutter" || !dc) && HINGED_RE.test(name)) return "hinged";
  if ((dc === "awning" || !dc) && WINDOW_AWNING_RE.test(name)) return "window_awning";
  // A blind whose slats do not tilt (a zip screen, a roller blind reported as `blind`) is drawn as a roller shade,
  // as Home Assistant's more-info dialog tells them apart by their features.
  if (dc === "blind" && Number.isFinite(s?.attributes?.supported_features) && !(s.attributes.supported_features & TILT_FEATURES)) return "shade";
  return CLASSES.includes(dc) ? dc : "shutter";
};

// The pedestrian opening of a gate: `pedestrian` (the cover's, else the card's) as a position in % or an entity to
// press (button, script, switch), `false` for none; unset, the gate's own pedestrian button or switch, found on its
// device by its name. Returns { position } or { entity }, or null.
export const PEDESTRIAN_RE = /pedestrian|pi[eé]ton|fu(ss|ß)g|peat[oó]n|pedonal|voetg|piesz|pietonal|g[aå]ende|fodg|chodc|pě[sš]|pe[sš]c|pe[sš]ak|gājēj|πεζ|пешех|пешач|пішох|gyalog|wicket/i;
export const pedestrianOf = (hass, id, cls, own) => {
  if (own === false) return null;
  if (typeof own === "number" || (typeof own === "string" && own.trim() !== "" && Number.isFinite(Number(own)))) return { position: clamp(Math.round(Number(own))) };
  if (typeof own === "string" && own.includes(".")) return { entity: own };
  if (!GATES.has(cls)) return null;
  const device = hass?.entities?.[id]?.device_id;
  if (!device) return null;
  const found = Object.values(hass.entities || {}).find(
    (e) =>
      e.device_id === device &&
      /^(button|input_button|switch)\./.test(e.entity_id) &&
      PEDESTRIAN_RE.test(`${e.entity_id} ${e.name || ""} ${hass.states?.[e.entity_id]?.attributes?.friendly_name || ""}`),
  );
  return found ? { entity: found.entity_id } : null;
};

// State of one cover → color class: moving is active (blue), an open garage door, gate, door or window a warning,
// another open cover green, closed grey, unavailable red.
export const stateClass = (s, cls) => {
  if (isOffline(s)) return "crit";
  if (isMoving(s)) return "active";
  if (s.state === "open") return GUARDED.has(cls) ? "warn" : "ok";
  return "idle";
};

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

// Covers of an area: the entity's own area, else its device's; hidden entities and entity categories left out.
export const areaOf = (hass, id) => {
  const e = hass?.entities?.[id];
  if (!e) return null;
  return e.area_id || hass.devices?.[e.device_id]?.area_id || null;
};
export const findArea = (hass, ref) => {
  if (!ref || !hass?.areas) return null;
  if (hass.areas[ref]) return hass.areas[ref];
  const low = String(ref).toLowerCase();
  return Object.values(hass.areas).find((a) => String(a.name || "").toLowerCase() === low) || null;
};
// The covers of an area come from the registries (a cover outside the entity registry has no area): their scan is kept
// per registry objects, so that the card, which looks them up on every state change, does not walk every state.
export const _areaCovers = new WeakMap();
export const coversOfArea = (hass, areaId) => {
  const reg = hass?.entities;
  if (!reg) return [];
  let byArea = _areaCovers.get(reg);
  if (!byArea || byArea.devices !== hass.devices) _areaCovers.set(reg, (byArea = { devices: hass.devices, ids: new Map() }));
  let ids = byArea.ids.get(areaId);
  if (!ids) {
    ids = Object.values(reg)
      .filter((e) => e?.entity_id?.startsWith("cover.") && !e.hidden && !e.entity_category && areaOf(hass, e.entity_id) === areaId)
      .map((e) => e.entity_id);
    byArea.ids.set(areaId, ids);
  }
  return ids.filter((id) => hass.states?.[id]).sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b)));
};

export const nameOf = (hass, id, own) => own || hass?.states?.[id]?.attributes?.friendly_name || id;

// The covers a card shows, as { entity, name, device_class, favorites }: `entity`, then `entities` (ids or objects),
// then the covers of `area` not listed already.
export const itemsOf = (hass, config) => {
  const raw = [];
  if (config.entity) raw.push(config.entity);
  if (Array.isArray(config.entities)) raw.push(...config.entities);
  const items = [];
  const seen = new Set();
  for (const r of raw) {
    const item = typeof r === "string" ? { entity: r } : r && typeof r === "object" && typeof r.entity === "string" ? { ...r } : null;
    if (!item || seen.has(item.entity)) continue;
    seen.add(item.entity);
    items.push(item);
  }
  let area = null;
  if (config.area) {
    area = findArea(hass, config.area);
    if (area) for (const id of coversOfArea(hass, area.area_id)) if (!seen.has(id)) items.push({ entity: id });
  }
  return { items, area };
};

// Favorite positions: numbers (a position) or { name, position, tilt }, kept when they hold something to set.
export const favoritesOf = (list) =>
  (Array.isArray(list) ? list : [])
    .map((f) => {
      if (typeof f === "number" || (typeof f === "string" && f.trim() !== "" && Number.isFinite(Number(f)))) return { name: "", position: clamp(Math.round(Number(f))), tilt: null };
      if (!f || typeof f !== "object") return null;
      const position = f.position === undefined || f.position === null ? null : clamp(Math.round(Number(f.position)));
      const tilt = f.tilt === undefined || f.tilt === null ? null : clamp(Math.round(Number(f.tilt)));
      if (!Number.isFinite(position ?? 0) || !Number.isFinite(tilt ?? 0) || (position === null && tilt === null)) return null;
      return { name: f.name ? String(f.name) : "", position, tilt };
    })
    .filter(Boolean);
