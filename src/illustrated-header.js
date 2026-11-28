// ---------------------------------------------------------------------------
// Illustrated header ("banner"): 90 px, a facade wall, the covers' own pictures, a pavement strip
// ---------------------------------------------------------------------------
import { F, GUARDED, ICONS, SECURED } from "./core.js";
import { clamp, esc, fmtPct, intlLocale, t } from "./helpers.js";
import { SCHEDULE_KEYS, SCHEDULE_WORDS, TIME_RE, TRAVEL_MOVES, TRAVEL_TICK_MS, areaOf, classOf, dayDiff, estimate, favoritesOf, fmtTime, has, hasTilt, isMoving, isOffline, itemsOf, nameOf, numAttr, pedestrianOf, positionOf, scheduleOf, stateClass, svgIcon, tiltOf, travelTimeOf, whenOf } from "./automatic-schedule.js";
import { AXES, SCENE_STYLE, axisOf, coverSvg } from "./pictures.js";
import { BASE_STYLE, CONFIRM_GUARD_MS, DIALOG_STYLE, FOCUS_SELECTOR, FULL_STYLE, GROUP_ACTIONS, HOLD_MS, KEY_COMMIT_MS, MINI_STYLE, SERVICES, TARGET_MS, focusKey, isOutside, watchOutside } from "./styles.js";
import { STRINGS } from "./i18n/strings.js";
import { rcMorph } from "./in-place-redraw.js";

// Covers drawn in the banner at most (fewer on a narrow card, see BANNER_STYLE).
export const BANNER_MAX = 3;

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
// The width of an element's whole text in fractional pixels, even while it is cut with an ellipsis (0 when hidden).
export const textWidth = (el) => {
  if (!el?.getClientRects?.().length || typeof document.createRange !== "function") return 0;
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  if (config?.illustration_theme === "night") return true;
  if (config?.illustration_theme === "day") return false;
  return Boolean(hass?.themes?.darkMode);
};

// A potted plant against the wall, standing on the pavement.
export const PLANT = `<svg class="plant" viewBox="0 0 18 30" aria-hidden="true"><path class="leaf" d="M9 20C3 18 1 11 3 6c3 3 5 7 6 12 1-6 3-11 7-14 1 6-1 13-7 16Z"/><rect class="pot" x="2" y="19" width="14" height="11" rx="1"/><rect class="rim" x="1" y="18" width="16" height="3" rx="1"/></svg>`;

// The banner: wall colour and siding at the left fading in under the pictures, text colours, state-colored icon,
// the covers on the right at 84 px high (100 × 120 pictures), lowered so that floor-standing ones (garage door,
// gate, door, whose ground line is y 112) stand on the 10 px pavement strip.
export const BANNER_STYLE = `
  .banner { --bh: 90px; --g: 10px; --wall: #e9dccb; --siding: #dccab2; --ink-b: #3a2f24; --muted-b: #6e5c49;
            --pave: #9aa1a9; --pave-top: #b5bbc2; --leaf: #5aa83d; --pot: #c0603a;
            position: relative; height: var(--bh); overflow: hidden; display: flex; align-items: stretch; background: var(--wall); color: var(--ink-b); }
  .banner.night { --wall: #33303a; --siding: #3c3844; --ink-b: #fff; --muted-b: rgba(255,255,255,.76);
                  --pave: #2c323b; --pave-top: #3a414b; --leaf: #3e6a4a; --pot: #8f4a30; }
  .wall { position: absolute; inset: 0 0 var(--g) 0; pointer-events: none;
          background: repeating-linear-gradient(180deg, transparent 0 7px, var(--siding) 7px 8px);
          -webkit-mask-image: linear-gradient(90deg, transparent 40%, #000 62%); mask-image: linear-gradient(90deg, transparent 40%, #000 62%); }
  .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--g); background: var(--pave); box-shadow: inset 0 2px 0 var(--pave-top); }
  .htext { position: relative; z-index: 1; flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 10px;
           padding: 0 8px var(--g) 14px; }
  .htext .titles { flex: 1 1 auto; min-width: 0; container: cc-titles / inline-size; display: flex; flex-direction: column; align-items: flex-start; }
  .htext .titles > * { max-width: 100%; }
  .banner .chip { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bsub { font-size: 12px; line-height: 1.3; color: var(--muted-b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :host([hide-title]) .banner .name { display: none; }
  /* The round icon on the wall: its color is the state's (moving blue, open green, open garage door amber,
     closed grey, unavailable red), day and night. */
  .banner .badge { position: relative; color: color-mix(in srgb, var(--c) 82%, #000); background: rgba(255,255,255,.62);
                   box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 30%, transparent); }
  .banner .badge.idle { color: #7d838a; }
  .banner.night .badge { color: color-mix(in srgb, var(--c) 78%, #fff); background: rgba(255,255,255,.12);
                         box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .badge.idle { color: #b3b8be; }
  .bscene { position: relative; flex: none; display: flex; align-items: flex-end; gap: 8px; padding: 0 14px 0 4px;
            margin-bottom: calc(var(--g) - 5.6px); }
  /* The mini card's detail button sits at the top right: the pictures keep clear of it. */
  .zoomable .bscene { padding-right: 34px; }
  .bv { width: 70px; height: 84px; flex: none; }
  .bv .scene { filter: drop-shadow(0 2px 3px rgba(0,0,0,.2)); }
  .night .bv .scene { filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)) brightness(.86); }
  .bv.off .scene { filter: grayscale(1); opacity: .5; }
  /* At night the window behind hinged shutters or a window awning glows warm, a barrier's lamp shines red and a pergola lets no sun in. */
  .night .bv .hinged .warm, .night .bv .window_awning .warm { opacity: .8; }
  .night .bv .barrier .lamp { fill: #ff3b30; } .night .bv:not(.moving) .barrier .lamp-glow { opacity: .45; transform: scale(1.2); }
  .night .bv .pergola .rays { display: none; }
  .plant { width: 18px; height: 30px; flex: none; margin: 0 14px 5.6px 0; }
  .plant .leaf { fill: var(--leaf); } .plant .pot { fill: var(--pot); } .plant .rim { fill: color-mix(in srgb, var(--pot) 80%, #000); }
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; width: 24px; height: 24px; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  /* Narrower card: fewer covers drawn, then no plant, then no picture at all. */
  @container (max-width: 459px) { .bv:nth-of-type(n + 3) { display: none; } }
  @container (max-width: 379px) { .bv:nth-of-type(n + 2) { display: none; } }
  @container (max-width: 279px) { .plant { display: none; } }
  @container (max-width: 199px) { .bscene { display: none; } .zoomable .htext { padding-right: 34px; } }
`;

export class CoverBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._targets = {};
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("pointerdown", (ev) => {
      this._byPointer = true;
      // No rewrite of the card between the press and the release: Home Assistant updates the card several times a
      // second, and a rewrite under the pointer replaces the element pressed, so that the click lands on the card
      // itself and does nothing. The pending render is done once released (after the click). A slider pressed is
      // held by its own drag state (see _onPointerDown).
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
      this._onPointerDown(ev);
    });
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      // After the click (same task): a press with no click (released elsewhere) draws what it held back.
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    // Enter / Space on an element with the button role act as a click (a <button> clicks on its own); arrows,
    // Page Up / Down, Home and End move a slider.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      this._byPointer = false;
      const el = ev.target;
      if (el?.dataset?.slider) return this._onSliderKey(ev, el);
      if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      el.click();
    });
    // Escape closes the confirmation popup (as Cancel), listened on the window while it is open.
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._confirm) return;
      ev.stopPropagation();
      this._closeConfirm();
    };
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed.
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const { items } = itemsOf(h, this._config);
    // With an area, the registries tell which covers belong to it.
    const reg = this._config.area ? [h.entities, h.devices] : [];
    // The entities of the automatic schedule, the card's and every cover's.
    const sched = [this._config, ...items].flatMap((o) => SCHEDULE_KEYS.map((k) => o[k]).filter((v) => typeof v === "string" && v.includes(".")));
    return [h.language, h.locale, h.areas, h.themes?.darkMode, ...reg, ...items.map((i) => h.states[i.entity]), ...sched.map((id) => h.states[id])];
  }

  // A click elsewhere on the page folds the covers back to their defaults and closes the popup.
  connectedCallback() {
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._confirm) return;
        this._toggled = new Map();
        if (this._confirm) this._closeConfirm();
        else this._update();
      },
    );
    this._outside.on();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._pillResize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._pillWidth) return;
        this._pillWidth = w;
        cancelAnimationFrame(this._pillFrame);
        this._pillFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._pillResize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    this._connected = true;
    // Back on the page after leaving it: rendered again in its default state.
    if (this._hass && this._config) this._update();
    if (this._confirm) window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    this._outside?.off();
    this._pillResize?.disconnect();
    this._pillWidth = null;
    window.removeEventListener("keydown", this._onKey);
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._confirm = null;
    clearTimeout(this._holdTimer);
    this._connected = false;
    this._syncClock();
    this._syncTravel();
    clearTimeout(this._kbd?.timer);
    this._kbd = null;
    this._drag = null;
    this._pressing = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.entities !== undefined && !Array.isArray(config.entities)) throw new Error("entities must be a list");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _pct(v) {
    return fmtPct(v, intlLocale(this._hass, this._config));
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it is not "Uncaught".
  _call(service, data) {
    return Promise.resolve(this._hass.callService("cover", service, data)).catch(() => {});
  }

  // The covers shown, with their state object, device class, name and favorites.
  _items() {
    const { items, area } = itemsOf(this._hass, this._config);
    this._area = area;
    const cardFavs = favoritesOf(this._config.favorites);
    return items.map((i) => {
      let s = this._hass.states[i.entity];
      // Covers with no state feedback (a radio RTS motor, which reports nothing back): at rest they are drawn and
      // badged closed, since their open/closed state is only assumed. While the cover moves, the real state is kept
      // so the picture still animates; a cover that actually reports a position is left alone — it has real feedback.
      const noFeedback = Boolean(i.no_feedback ?? this._config.no_feedback);
      if (noFeedback && s && !isMoving(s) && s.state !== "closed" && s.state !== "unavailable" && numAttr(s, "current_position") === null) {
        s = { ...s, state: "closed" };
      }
      // A full course time: while the cover moves, its position is estimated from the time since it started, for a
      // motor (Somfy…) that only reports the position once stopped.
      const travel = travelTimeOf(i.travel_time ?? this._config.travel_time);
      if (travel) s = this._travelling(i.entity, s, travel);
      return {
        id: i.entity,
        s,
        timed: Boolean(travel && isMoving(s)),
        noFeedback,
        cls: classOf(s, i.device_class || this._config.device_class),
        pedestrian: pedestrianOf(this._hass, i.entity, classOf(s, i.device_class || this._config.device_class), i.pedestrian ?? this._config.pedestrian),
        // The light of a pergola (its LED strip), drawn lit under the louvres while it is on.
        light: typeof (i.light ?? this._config.light) === "string" ? i.light ?? this._config.light : null,
        // Covers whose integration reports the position the wrong way round (often awnings): the card mirrors it.
        invert: Boolean(i.invert ?? this._config.invert),
        name: nameOf(this._hass, i.entity, i.name),
        // A cover's own favorites, else the card's (on a card of several covers, the card's apply to all of them).
        favorites: i.favorites !== undefined ? favoritesOf(i.favorites) : items.length === 1 ? cardFavs : [],
        // Its automatic schedule: its own, else the card's when it is the card's only cover (on a card of several
        // covers, the card's schedule is shown once, above them).
        schedule: scheduleOf(i, items.length === 1 ? this._config : null),
      };
    });
  }

  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (.pill-below) and the title keeps its row
  // (cut only when it does not fit alone). The subtitle then keeps one line (its whole text in its tooltip), and when
  // the block still runs out of the banner or into its ground strip, or the label does not fit its own line, the pill
  // keeps its dot alone (.pill-dot, the label in its tooltip and aria-label). Measured after each render and on each
  // new width, never by a fixed width, so that every language fits.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const chips = [...t.querySelectorAll(".chip")];
      if (!chips[0]?.getBoundingClientRect) continue;
      t.classList.remove("pill-below", "pill-dot");
      const sub = t.querySelector(".sub, .bsub");
      sub?.removeAttribute("title");
      if (!chips[0].querySelector(".t")?.getClientRects().length) continue;
      const avail = t.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(chips[0].parentElement).columnGap) || 0;
      const widths = chips.map((c) => c.getBoundingClientRect().width);
      if (textWidth(t.querySelector(".name")) + widths.reduce((w, c) => w + gap + c, 0) <= avail + 0.01) continue;
      t.classList.add("pill-below");
      if (sub && sub.scrollWidth > sub.clientWidth) sub.title = sub.textContent.trim();
      const banner = t.closest(".banner");
      const box = banner?.getBoundingClientRect();
      const floor = banner?.querySelector(".ground")?.getBoundingClientRect().top ?? box?.bottom;
      const r = t.getBoundingClientRect();
      const out = box && (r.top < box.top - 0.5 || r.bottom > floor + 0.5);
      // On its own line the pill may run over the picture, up to the banner's right edge (it has its own background).
      const room = box ? box.right - 8 - t.getBoundingClientRect().left : avail;
      if (out || widths.some((w) => w > room + 0.01)) t.classList.add("pill-dot");
    }
    // A pill reduced to its dot: the body says the state again (see .pill-echo).
    this.shadowRoot?.querySelector?.("ha-card")?.classList.toggle("pill-dot", !!this.shadowRoot.querySelector(".titles.pill-dot"));
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Never while a slider is held or being moved from the keyboard: a redraw would drop the pointer capture.
    if (this._drag || this._kbd) return;
    // Not under a press either (see the pointerdown listener): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    this._syncClock();
    if (this._hold) {
      const changed = this._hass.states[this._hold.id] !== this._hold.s;
      if (!changed && Date.now() < this._hold.until) return;
      this._hold = null;
    }
    let html = this._render();
    this._syncTravel();
    if (this._confirm) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    }
    if (html === this._html) return;
    const focused = this._confirm && this.shadowRoot.activeElement?.dataset?.action;
    // The focus is kept across a rewrite for the keyboard only: after a mouse click, it would draw the focus ring.
    const kept = this._confirm || this._byPointer ? null : this._focusedSpot();
    this._html = html;
    // In place (see rcMorph): the nodes stay, so the card keeps its height, its animations and its focus.
    rcMorph(this.shadowRoot, html);
    this._fitPill();
    if (kept) this._restoreFocus(kept);
    if (this._confirm) {
      const sel = focused === "confirm_cancel" ? '[data-action="confirm_cancel"]' : ".modal .primary";
      this.shadowRoot.querySelector(sel)?.focus({ preventScroll: true });
    }
  }

  // The focused element as what identifies it in the next render (tag, data attributes, rank among the same).
  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  // The state of a moving cover with its position estimated from its course time: from the position it started at
  // (the one it reports, else where an earlier estimate left it, else fully closed / open by the way it goes), a full
  // course in `travel` seconds. A new position reported on the way starts the estimate again from it. Still: the
  // real state, and the course forgotten.
  // The courses are kept per entity for the whole page (TRAVEL_MOVES), not per card: a card drawn anew (a popup
  // opened again, another view) picks the course up where it is instead of starting it over. A course this page has
  // not seen start is dated from Home Assistant's own clock (last_changed / last_updated), not from the moment the
  // card is drawn.
  _travelling(id, s, travel) {
    const rec = this._moves.get(id);
    if (!s || !isMoving(s)) {
      if (rec) this._moves.delete(id);
      return s;
    }
    const reported = numAttr(s, "current_position");
    const now = Date.now();
    let move = rec;
    // A course begun again since it was kept (no card on the page saw it stop): a new state change, a new course.
    const turned = !move || move.state !== s.state || (s.last_changed !== undefined && s.last_changed !== move.changed);
    if (turned && move?.state === s.state) move = null;
    if (turned || (reported !== null && reported !== move.reported)) {
      const from = reported ?? (move ? estimate(move, travel, now) : s.state === "opening" ? 0 : 100);
      // A course already under way when first seen: started when Home Assistant saw it change, never in the future.
      const since = move ? NaN : Date.parse(turned && reported === null ? s.last_changed : s.last_updated);
      move = { state: s.state, changed: s.last_changed, t0: Number.isFinite(since) ? Math.min(now, since) : now, p0: from, reported };
      this._moves.set(id, move);
    }
    return { ...s, attributes: { ...s.attributes, current_position: Math.round(estimate(move, travel, now)) } };
  }

  get _moves() {
    return TRAVEL_MOVES;
  }

  // Whether a cover moving on its course time has not reached its end yet: the card is drawn again a few times a
  // second meanwhile.
  _travelPending() {
    if (!this._moves.size || !this._hass || !this._config) return false;
    return this._items().some((i) => i.timed && (i.s.state === "opening" ? numAttr(i.s, "current_position") < 100 : numAttr(i.s, "current_position") > 0));
  }

  _syncTravel() {
    const want = Boolean(this._connected && this._travelPending());
    if (want && !this._travelTimer) {
      this._travelTimer = setInterval(() => this._update(), TRAVEL_TICK_MS);
      this._travelTimer.unref?.();
    } else if (!want && this._travelTimer) {
      clearInterval(this._travelTimer);
      this._travelTimer = null;
    }
  }

  _item(id) {
    return this._items().find((i) => i.id === id);
  }

  // Position as the card shows it, mirrored (100 − p) for an inverted cover. `_pos` from the attribute alone (null
  // when the cover reports none), `_posOf` with the state fallback (0 closed, 100 open) for the picture.
  _pos(item) {
    const p = numAttr(item.s, "current_position");
    return item.invert && p !== null ? 100 - p : p;
  }

  _posOf(item) {
    const p = positionOf(item.s);
    return item.invert && p !== null ? 100 - p : p;
  }

  // Whether the cover is drawn and badged open: mirrored for an inverted cover, moving states stay open.
  _shownOpen(item) {
    const s = item.s;
    if (!s || isOffline(s)) return false;
    return item.invert ? s.state !== "open" : s.state !== "closed";
  }

  // Whether the cover counts as open when it is still (not moving): mirrored for an inverted cover.
  _shownOpenStill(item) {
    return item.invert ? item.s?.state === "closed" : item.s?.state === "open";
  }

  // The position to send to set_cover_position for a display value, mirrored back for an inverted cover.
  _sendPos(item, value) {
    return item?.invert ? 100 - value : value;
  }

  // ---- Clicks -------------------------------------------------------------

  _onClick(ev) {
    this._pressing = false;
    if (ev.detail === 0) this._byPointer = false;
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.slider || n.dataset.action || n.dataset.entity));
    if (!this._confirm && Date.now() - (this._confirmClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._confirm) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "confirm_ok") {
        const run = this._confirm.run;
        this._closeConfirm();
        run();
      } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) {
        this._closeConfirm();
      }
      return;
    }
    if (!el || el.dataset.slider) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle") {
      this._toggled = new Map(this._toggled).set(entity, !this._isCollapsed(entity));
      return this._update();
    }
    if (SERVICES[action]) return this._command(action, entity);
    if (GROUP_ACTIONS[action]) return this._groupCommand(GROUP_ACTIONS[action]);
    if (action === "pedestrian") return this._pedestrian(entity);
    if (action === "fav") return this._favorite(entity, Number(el.dataset.index));
    if (action === "fav_all") return this._favorite(null, Number(el.dataset.index));
    if (entity) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
  }

  // Runs `run` at once, or after the popup when `confirm` asks for it (opening, closing and moving `items`, never
  // stopping): `true` always, `false` never, unset for a garage door, a gate or a door among them.
  _maybeConfirm(text, ok, run, items) {
    const c = this._config.confirm;
    const ask = c === true || (c !== false && items.some((i) => SECURED.has(i.cls)));
    if (ask) this._openConfirm({ text, ok, run });
    else run();
  }

  _command(action, id) {
    const item = this._item(id);
    const [service, feature] = SERVICES[action];
    if (!item || isOffline(item.s) || !has(item.s, feature)) return;
    const run = () => this._call(service, { entity_id: id });
    if (action === "open" || action === "close") this._maybeConfirm(this._t(`confirm_${action}`, { name: item.name }), this._t(action), run, [item]);
    else run();
  }

  // Pedestrian opening: the gate to its pedestrian position, or the pedestrian button, script or switch pressed; asks
  // first like opening it.
  _pedestrian(id) {
    const item = this._item(id);
    const ped = item?.pedestrian;
    if (!ped || isOffline(item.s)) return;
    let run;
    if (ped.position !== undefined) {
      if (!has(item.s, F.SET_POSITION)) return;
      run = () => {
        this._targets[id] = { value: ped.position, until: Date.now() + TARGET_MS };
        this._call("set_cover_position", { entity_id: id, position: this._sendPos(item, ped.position) });
        this._update();
      };
    } else {
      const domain = ped.entity.split(".")[0];
      const [svcDomain, service] = domain === "button" || domain === "input_button" ? [domain, "press"] : domain === "script" || domain === "switch" ? [domain, "turn_on"] : ["homeassistant", "turn_on"];
      run = () => Promise.resolve(this._hass.callService(svcDomain, service, { entity_id: ped.entity })).catch(() => {});
    }
    this._maybeConfirm(this._t("confirm_pedestrian", { name: item.name }), this._t("pedestrian"), run, [item]);
  }

  // The covers of the card that can take an action: online and supporting it.
  _able(feature, items = this._items()) {
    return items.filter((i) => !isOffline(i.s) && has(i.s, feature)).map((i) => i.id);
  }

  _groupCommand(action) {
    const [service, feature] = SERVICES[action];
    const ids = this._able(feature);
    if (!ids.length) return;
    const run = () => this._call(service, { entity_id: ids });
    if (action === "stop") return run();
    const items = this._items().filter((i) => ids.includes(i.id));
    const text = ids.length === 1 ? this._t(`confirm_${action}`, { name: items[0].name }) : this._t(`confirm_${action}_all`, { n: ids.length });
    this._maybeConfirm(text, this._t(action), run, items);
  }

  // A favorite of one cover (id), or of the card for every cover (null).
  _favorite(id, index) {
    const items = id ? [this._item(id)].filter(Boolean) : this._items();
    const fav = id ? items[0]?.favorites[index] : favoritesOf(this._config.favorites)[index];
    if (!fav) return;
    const pos = fav.position !== null ? this._able(F.SET_POSITION, items) : [];
    const tilt = fav.tilt !== null ? this._able(F.SET_TILT_POSITION, items) : [];
    if (!pos.length && !tilt.length) return;
    const run = () => {
      if (pos.length) {
        for (const p of pos) this._targets[p] = { value: fav.position, until: Date.now() + TARGET_MS };
        // Each cover gets the position the way it reports it; a group of covers that all mirror it the same way
        // keeps a single call, otherwise one call per cover so each is mirrored on its own.
        const inv = (pid) => Boolean(items.find((i) => i.id === pid)?.invert);
        if (pos.every((pid) => inv(pid) === inv(pos[0]))) {
          this._call("set_cover_position", { entity_id: id ? pos[0] : pos, position: this._sendPos({ invert: inv(pos[0]) }, fav.position) });
        } else {
          for (const pid of pos) this._call("set_cover_position", { entity_id: pid, position: this._sendPos({ invert: inv(pid) }, fav.position) });
        }
      }
      if (tilt.length) this._call("set_cover_tilt_position", { entity_id: id ? tilt[0] : tilt, tilt_position: fav.tilt });
      this._update();
    };
    const label = this._favLabel(fav);
    const text = id ? this._t("confirm_move", { name: items[0].name, to: label }) : this._t("confirm_move_all", { n: Math.max(pos.length, tilt.length), to: label });
    this._maybeConfirm(text, this._t("move"), run, items.filter((i) => pos.includes(i.id) || tilt.includes(i.id)));
  }

  _openConfirm(confirm) {
    this._confirm = confirm;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal .primary")?.focus();
  }

  _closeConfirm() {
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _confirmHtml() {
    const c = this._confirm;
    return `<style>${DIALOG_STYLE}</style><div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="msg">${esc(c.text)}</div>
        <div class="modal-actions">
          <button class="btn" data-action="confirm_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="confirm_ok"><span>${esc(c.ok)}</span></button>
        </div>
      </div>
    </div>`;
  }

  // ---- Sliders (the picture for the position, a track for the tilt) ---------

  // The value under the pointer: the picture maps the run of its rail (axisOf), the tilt track its width.
  _valueAt(el, ev) {
    const r = el.getBoundingClientRect();
    if (el.dataset.slider === "tilt") return clamp(Math.round(((ev.clientX - r.left) / (r.width || 1)) * 100));
    const axis = AXES[el.dataset.axis] ? el.dataset.axis : "up";
    const a = AXES[axis];
    const across = axis === "across";
    const size = across ? r.width / 100 : r.height / 120;
    const start = (across ? r.left : r.top) + a.from * size;
    const f = ((across ? ev.clientX : ev.clientY) - start) / (a.len * size || 1);
    return clamp(Math.round((a.open < 0 ? 1 - f : f) * 100));
  }

  _onPointerDown(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.slider);
    if (!el || el.getAttribute("aria-disabled") === "true" || (ev.button !== undefined && ev.button > 0) || this._confirm) return;
    ev.preventDefault();
    el.setPointerCapture?.(ev.pointerId);
    el.focus?.({ preventScroll: true });
    const drag = { el, kind: el.dataset.slider, id: el.dataset.entity, value: null };
    this._drag = drag;
    const move = (e) => this._preview(drag.id, drag.kind, (drag.value = this._valueAt(el, e)));
    const end = (e) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      this._drag = null;
      if (e.type === "pointerup" && drag.value !== null) this._commit(drag.id, drag.kind, drag.value);
      else this._redraw();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    move(ev);
  }

  _onSliderKey(ev, el) {
    const step = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 25, PageDown: -25 }[ev.key];
    if (step === undefined && ev.key !== "Home" && ev.key !== "End") return;
    if (el.getAttribute("aria-disabled") === "true") return;
    ev.preventDefault();
    const kind = el.dataset.slider;
    const id = el.dataset.entity;
    const now = this._kbd?.id === id && this._kbd.kind === kind ? this._kbd.value : Number(el.getAttribute("aria-valuenow")) || 0;
    const value = ev.key === "Home" ? 0 : ev.key === "End" ? 100 : clamp(now + step);
    clearTimeout(this._kbd?.timer);
    this._kbd = {
      id,
      kind,
      value,
      timer: setTimeout(() => {
        this._kbd = null;
        this._commit(id, kind, value);
      }, KEY_COMMIT_MS),
    };
    this._preview(id, kind, value);
  }

  // Moves the picture, the slider and the value label of a cover to `value` without a redraw.
  _preview(id, kind, value) {
    const v = String(value);
    for (const n of this.shadowRoot.querySelectorAll(`[data-for="${CSS_ESCAPE(id)}"]`)) n.style?.setProperty(kind === "tilt" ? "--t" : "--p", v);
    for (const n of this.shadowRoot.querySelectorAll(`[data-slider="${kind}"][data-entity="${CSS_ESCAPE(id)}"]`)) {
      n.setAttribute("aria-valuenow", v);
      n.setAttribute("aria-valuetext", this._pct(value));
    }
    for (const n of this.shadowRoot.querySelectorAll(`[data-label="${CSS_ESCAPE(`${id}|${kind}`)}"]`)) n.textContent = this._pct(value);
  }

  // Redraws the card even when its HTML did not change: a slider preview moved the picture without a redraw.
  _redraw() {
    this._html = "";
    this._update();
  }

  _commit(id, kind, value) {
    const item = this._item(id);
    const tilt = kind === "tilt";
    if (!item || isOffline(item.s) || !has(item.s, tilt ? F.SET_TILT_POSITION : F.SET_POSITION)) return this._redraw();
    // The picture stays where it was dropped until the cover reports its new state (or the hold ends).
    const hold = () => {
      this._hold = { id, s: item.s, until: Date.now() + HOLD_MS };
      clearTimeout(this._holdTimer);
      this._holdTimer = setTimeout(() => this._redraw(), HOLD_MS + 50);
    };
    if (tilt) {
      this._call("set_cover_tilt_position", { entity_id: id, tilt_position: value });
      return hold();
    }
    const send = () => {
      this._targets[id] = { value, until: Date.now() + TARGET_MS };
      this._call("set_cover_position", { entity_id: id, position: this._sendPos(item, value) });
    };
    // A garage door, a gate or a door (or any cover with `confirm: true`) asks first; the popup redraws the card, so
    // after OK the picture shows where the cover is, with the mark of where it goes.
    let now = true;
    const run = () => {
      send();
      if (now) hold();
      else this._redraw();
    };
    this._maybeConfirm(this._t("confirm_move", { name: item.name, to: this._pct(value) }), this._t("move"), run, [item]);
    now = false;
  }

  // Where a cover was sent, while it gets there.
  _target(item) {
    const tg = this._targets[item.id];
    if (!tg) return null;
    const pos = this._posOf(item);
    if (Date.now() > tg.until || (!isMoving(item.s) && pos === tg.value)) {
      delete this._targets[item.id];
      return null;
    }
    return pos === tg.value ? null : tg.value;
  }

  // ---- Pieces ---------------------------------------------------------------

  _stateText(s) {
    if (!s) return this._t("not_found");
    const k = `s_${s.state}`;
    return STRINGS.en[k] ? this._t(k) : s.state;
  }

  // The position of a cover as a percentage, or its state when it reports none.
  _valueText(item) {
    const p = this._pos(item);
    const louvres = this._louvres(item);
    if (louvres !== null) return this._pct(louvres);
    return p !== null && !isOffline(item.s) ? this._pct(p) : this._stateText(item.s);
  }

  // The louvres' angle of a pergola that only tilts (no position), shown as its value; else null.
  _louvres(item) {
    return item.cls === "pergola" && this._pos(item) === null && !isOffline(item.s) ? tiltOf(item.s) : null;
  }

  // Overall state of the card's covers: { text, cls, open }.
  _aggregate(items) {
    if (items.length === 1) {
      const i = items[0];
      return { text: this._stateText(i.s), cls: stateClass(i.s, i.cls), open: this._shownOpen(i) };
    }
    const live = items.filter((i) => !isOffline(i.s));
    if (!live.length) return { text: this._t("s_unavailable"), cls: "crit", open: false };
    const moving = live.filter((i) => isMoving(i.s));
    if (moving.length) {
      const dir = moving.every((i) => i.s.state === "opening") ? "s_opening" : moving.every((i) => i.s.state === "closing") ? "s_closing" : null;
      return { text: dir ? this._t(dir) : this._t("n_moving", { n: moving.length }), cls: "active", open: true };
    }
    const open = live.filter((i) => this._shownOpenStill(i));
    if (open.length) {
      const all = open.length === items.length;
      return {
        text: all ? this._t("all_open") : this._t("n_open", { n: open.length }),
        cls: open.some((i) => GUARDED.has(i.cls)) ? "warn" : "ok",
        open: true,
      };
    }
    return { text: this._t("all_closed"), cls: live.length < items.length ? "warn" : "idle", open: false };
  }

  _subtitle(items) {
    const area = this._area?.name;
    if (items.length === 1) {
      const a = area || this._hass.areas?.[areaOf(this._hass, items[0].id)]?.name;
      return [this._t(`c_${items[0].cls}`), a].filter(Boolean).join(" · ");
    }
    const pos = items.filter((i) => !isOffline(i.s)).map((i) => this._pos(i)).filter((p) => p !== null);
    const parts = [this._t("n_covers", { n: items.length })];
    if (pos.length) parts.push(this._t("average", { pct: this._pct(pos.reduce((a, b) => a + b, 0) / pos.length) }));
    return parts.join(" · ");
  }

  _title(items) {
    const c = this._config;
    if (c.title) return c.title;
    if (items.length === 1 && !c.area) return items[0].name;
    return this._area?.name || this._t("covers");
  }

  _header(items) {
    const agg = this._aggregate(items);
    const cls = items[0]?.cls || "shutter";
    const target = items.length === 1 ? items[0].id : "";
    const icon = ICONS[cls][agg.open ? 1 : 0];
    const label = esc(agg.text);
    const clickable = target ? ` clickable" role="button" tabindex="0" data-entity="${esc(target)}` : "";
    if (this._config.illustration !== false) return this._banner(items, agg, icon, label, clickable);
    return `
      <div class="header">
        <div class="badge${clickable}" aria-label="${label}">${svgIcon(icon)}</div>
        <div class="titles">
          <div class="trow">
            <div class="name">${esc(this._title(items))}</div>
            <span class="chip ${agg.cls}${clickable}" title="${label}" aria-label="${label}"><span class="dot"></span><span class="t">${label}</span></span>
          </div>
          <div class="sub">${esc(this._subtitle(items))}</div>
        </div>
        ${this._zoomButton()}
      </div>`;
  }

  // The illustrated header: the title on a facade wall at the left, the covers drawn big at the right (their own
  // pictures, positions and animations), a pavement strip edge to edge at the bottom. The round icon takes the
  // state color; night follows the sun (or the dark theme), `illustration_theme` forces day or night.
  _banner(items, agg, icon, label, clickable) {
    // The state in the pill right after the title, the subtitle under them.
    const sub = this._config.show_subtitle === false ? "" : this._subtitle(items);
    const covers = items
      .slice(0, BANNER_MAX)
      .map((i) => {
        const { cls, style } = this._pictureOf(i, "bv");
        return `<div class="${cls}" data-for="${esc(i.id)}" style="${style}">${coverSvg(i.cls)}</div>`;
      })
      .join("");
    const zoom = this._zoomButton();
    return `
      <div class="banner${isNight(this._hass, this._config) ? " night" : ""}${zoom ? " zoomable" : ""}">
        <div class="wall" aria-hidden="true"></div>
        <div class="htext">
          <div class="badge ${agg.cls}${clickable}" aria-label="${label}" title="${label}">${svgIcon(icon)}</div>
          <div class="titles">
            <div class="trow">
              <div class="name">${esc(this._title(items))}</div>
              <span class="chip ${agg.cls}${clickable}" title="${label}" aria-label="${label}"><span class="dot"></span><span class="t">${label}</span></span>
            </div>
            ${sub ? `<div class="bsub">${esc(sub)}</div>` : ""}
          </div>
        </div>
        <div class="bscene" aria-hidden="true">${PLANT}${covers}</div>
        <div class="ground" aria-hidden="true"></div>
        ${zoom}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  // The countdown of the automatic schedule moves on: a render every 20 s while the card is on the page and shows a
  // schedule (a render that changes nothing writes nothing).
  _syncClock() {
    const want = Boolean(this._connected && this._hass && this._hasSchedule());
    if (want && !this._clock) {
      this._clock = setInterval(() => this._update(), 20000);
      this._clock.unref?.();
    } else if (!want && this._clock) {
      clearInterval(this._clock);
      this._clock = null;
    }
  }

  _hasSchedule() {
    const c = this._config;
    if (!c || c.show_schedule === false) return false;
    return Boolean(scheduleOf(c, null)) || itemsOf(this._hass, c).items.some((i) => scheduleOf(i, null));
  }

  // The automatic opening and closing as two tiles: the next one in the accent color with its countdown, one already
  // past (a date and time gone by) dimmed, one turned off by its condition (an entity at off) struck through.
  _schedule(sched, small = false) {
    if (!sched || this._config.show_schedule === false) return "";
    const now = Date.now();
    const locale = intlLocale(this._hass, this._config);
    const slots = ["open", "close"]
      .map((kind) => {
        const ref = sched[`${kind}_time`];
        if (!ref) return null;
        const value = TIME_RE.test(ref) ? ref : this._hass.states[ref]?.state;
        const when = whenOf(value, now);
        if (!when) return null;
        const cond = sched[`${kind}_condition`];
        return { kind, when, skipped: Boolean(cond) && this._hass.states[cond]?.state === "off", past: when.getTime() <= now };
      })
      .filter(Boolean);
    if (!slots.length) return "";
    const next = slots.filter((x) => !x.skipped && !x.past).sort((a, b) => a.when - b.when)[0];
    const tiles = slots.map((x) => {
      const days = dayDiff(now, x.when);
      const day = days === 1 ? this._t("sch_tomorrow") : days > 1 || days < 0 ? new Intl.DateTimeFormat(locale, { weekday: "short" }).format(x.when) : "";
      const word = this._t(SCHEDULE_WORDS[x.kind][x.past ? 1 : 0]);
      const mins = Math.ceil((x.when.getTime() - now) / 60000);
      const soon = x === next && mins < 1440;
      // A skipped one keeps its word alone ("Opens · skipped"), so that the label fits a small tile.
      const head = esc([word, x.past || soon || x.skipped ? "" : day].filter(Boolean).join(" "));
      const extra = x.skipped ? this._t("sch_skipped") : soon ? this._t("sch_in", { d: this._duration(mins) }) : "";
      const cls = x.skipped ? " skip" : x === next ? " next" : x.past ? " done" : "";
      const time = fmtTime(x.when, locale, this._hass.locale?.time_format);
      return `<div class="slot${cls}"><span class="pi">${svgIcon(ICONS[`sch_${x.kind}`])}</span><span class="k"><span class="l">${head}${
        extra ? ` <span class="in">· ${esc(extra)}</span>` : ""
      }</span><b>${esc(time)}</b></span></div>`;
    });
    return `<div class="sched${small ? " small" : ""}" role="group" aria-label="${esc(this._t("sch_title"))}">${tiles.join("")}</div>`;
  }

  // A duration in minutes, as hours and minutes ("2 h 45 min", "35 min").
  _duration(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (!h) return this._t("dur_m", { m });
    return this._t(m ? "dur_hm" : "dur_h", { h, m });
  }

  _errorCard(key, vars) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key, vars))}</div></ha-card>`;
  }

  // Errors of the configuration, or null: no cover, an unknown area or an area without covers.
  _configError(items) {
    if (this._config.area && !this._area) return ["unknown_area", { area: this._config.area }];
    if (!items.length) return this._config.area ? ["empty_area", { area: this._area.name }] : ["no_entities", {}];
    return null;
  }

  // The picture of a cover, its position slider when the cover can be set to a position.
  // How a picture is drawn: its classes (state, moving, offline) and its --p / --t.
  _pictureOf(item, base) {
    const s = item.s;
    const off = isOffline(s);
    const p = this._posOf(item) ?? (isMoving(s) ? 50 : 100);
    // A pergola's louvres turn with its tilt, else with its position (many report the louvres' angle as one).
    const tilt = tiltOf(s) ?? (item.cls === "pergola" ? p : p > 0 ? 50 : 0);
    const lit = item.light && this._hass?.states?.[item.light]?.state === "on" ? "lit" : "";
    const cls = [base, stateClass(s, item.cls), isMoving(s) ? `moving ${s.state}` : "", item.timed ? "timed" : "", off ? "off" : "", lit].filter(Boolean).join(" ");
    return { p, off, cls, style: `--p:${p};--t:${tilt}` };
  }

  _visual(item, { slider = true } = {}) {
    const s = item.s;
    const { p, off, cls, style } = this._pictureOf(item, "visual");
    const id = esc(item.id);
    const canSlide = slider && s && has(s, F.SET_POSITION);
    if (!canSlide) {
      return `<div class="${cls}" data-for="${id}" style="${style}">${coverSvg(item.cls)}</div>`;
    }
    const label = esc(this._t("position_of", { name: item.name }));
    const axis = axisOf(item.cls);
    return `<div class="${cls}" data-for="${id}" style="${style}" role="slider" tabindex="0" aria-orientation="${axis === "across" ? "horizontal" : "vertical"}" aria-valuemin="0" aria-valuemax="100"
      aria-valuenow="${p}" aria-valuetext="${esc(this._pct(p))}" aria-label="${label}" title="${label}"${off ? ' aria-disabled="true"' : ""} data-slider="pos" data-axis="${axis}" data-entity="${id}">${coverSvg(item.cls, {
        slider: true,
        target: this._target(item),
      })}</div>`;
  }

  // Open / stop / close buttons a cover supports. Open is disabled once fully open, close once fully closed, unless the
  // cover only assumes its state (a radio motor that reports nothing back, as Home Assistant does); the button of the
  // way the cover moves gets the accent color.
  _buttons(item, { round = false, labels = true } = {}) {
    const s = item.s;
    const off = isOffline(s);
    const pos = s?.attributes?.assumed_state === true || item.noFeedback ? null : positionOf(s);
    const out = [];
    for (const action of ["open", "pedestrian", "stop", "close"]) {
      if (action === "pedestrian") {
        out.push(this._pedButton(item, { round, labels, off }));
        continue;
      }
      if (!s || !has(s, SERVICES[action][1])) continue;
      const on = (action === "open" && s.state === "opening") || (action === "close" && s.state === "closing");
      const done = (action === "open" && (s.state === "opening" || (pos === 100 && !isMoving(s)))) || (action === "close" && (s.state === "closing" || (pos === 0 && !isMoving(s))));
      const label = esc(this._t(action));
      out.push(
        `<button class="btn ${round ? "round small " : ""}${action}${on ? " on" : ""}" data-action="${action}" data-entity="${esc(item.id)}" title="${label}" aria-label="${label}"${off || (done && !on) ? " disabled" : ""}>${svgIcon(
          ICONS[action],
        )}${labels && !round ? `<span>${label}</span>` : ""}</button>`,
      );
    }
    return out.join("");
  }

  // The pedestrian button of a gate that has a pedestrian opening; lit while the gate stands at its pedestrian position.
  _pedButton(item, { round, labels, off }) {
    const ped = item.pedestrian;
    if (!ped || !item.s || (ped.position !== undefined && !has(item.s, F.SET_POSITION))) return "";
    const on = ped.position !== undefined && this._posOf(item) === ped.position && !isMoving(item.s);
    const label = esc(this._t("pedestrian"));
    return `<button class="btn ${round ? "round small " : ""}pedestrian${on ? " on" : ""}" data-action="pedestrian" data-entity="${esc(item.id)}" title="${label}" aria-label="${label}"${off ? " disabled" : ""}>${svgIcon(ICONS.walk)}${labels && !round ? `<span>${label}</span>` : ""}</button>`;
  }

  _favLabel(f) {
    if (f.name) return f.name;
    if (f.position !== null && f.tilt !== null) return `${this._pct(f.position)} · ${this._pct(f.tilt)}`;
    return this._pct(f.position ?? f.tilt);
  }

  // Favorite positions of a cover (id) or of the whole card (null), as buttons; the one reached is lit.
  _favorites(items, favs, id) {
    if (this._config.show_favorites === false || !favs.length) return "";
    const usable = favs
      .map((f, index) => ({ f, index }))
      .filter(({ f }) => (f.position !== null && this._able(F.SET_POSITION, items).length) || (f.tilt !== null && this._able(F.SET_TILT_POSITION, items).length));
    if (!usable.length) return "";
    const live = items.filter((i) => !isOffline(i.s));
    const btns = usable.map(({ f, index }) => {
      const reached =
        live.length > 0 &&
        live.every((i) => (f.position === null || this._posOf(i) === f.position) && (f.tilt === null || tiltOf(i.s) === f.tilt) && !isMoving(i.s));
      const label = esc(this._favLabel(f));
      const aria = esc(this._t("move_to", { to: this._favLabel(f) }));
      return `<button class="btn${reached ? " on" : ""}" data-action="${id ? "fav" : "fav_all"}"${id ? ` data-entity="${esc(id)}"` : ""} data-index="${index}" title="${aria}" aria-label="${aria}">${svgIcon(ICONS.star)}<span>${label}</span></button>`;
    });
    return `<div class="favs">${btns.join("")}</div>`;
  }

  // Group buttons: open, stop and close every cover that supports it.
  _groupButtons(items) {
    const one = items.length === 1;
    return ["open", "stop", "close"]
      .map((action) => {
        const ids = this._able(SERVICES[action][1], items);
        if (!ids.length && !items.some((i) => i.s && has(i.s, SERVICES[action][1]))) return "";
        const label = esc(this._t(one || action === "stop" ? action : `${action}_all`));
        const on = items.some((i) => i.s?.state === (action === "open" ? "opening" : action === "close" ? "closing" : ""));
        return `<button class="btn ${action}${on ? " on" : ""}" data-action="${action}_all" title="${label}" aria-label="${label}"${ids.length ? "" : " disabled"}>${svgIcon(ICONS[action])}<span>${label}</span></button>`;
      })
      .join("");
  }
}

// Tiles per line of a card of several covers: 1 (foldable rows, the default), 2 or 3.
export const columnsOf = (config) => {
  const n = Number(config?.columns);
  return n === 2 || n === 3 ? n : 1;
};

// CSS.escape where it exists (browsers); the test sandbox has none, and entity ids need no escaping there.
export const CSS_ESCAPE = (v) => (globalThis.CSS?.escape ? globalThis.CSS.escape(v) : String(v).replace(/["\\]/g, "\\$&"));

export class CoverCard extends CoverBase {
  static getConfigElement() {
    return document.createElement("cover-card-editor");
  }

  static getStubConfig(hass) {
    const id = Object.keys(hass?.states || {}).find((e) => e.startsWith("cover."));
    return id ? { entity: id } : {};
  }

  getCardSize() {
    const n = this._hass && this._config ? itemsOf(this._hass, this._config).items.length : 1;
    if (n < 2) return 4;
    const cols = columnsOf(this._config);
    return cols > 1 ? 2 + Math.ceil(n / cols) * 5 : 2 + n;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  // A cover of several is folded unless `expanded`, or unfolded by hand (folded back by a click elsewhere).
  _isCollapsed(id) {
    if (this._toggled?.has(id)) return this._toggled.get(id);
    return this._config.expanded !== true;
  }

  _render() {
    const items = this._items();
    const err = this._configError(items);
    if (err) return this._errorCard(...err);
    const c = this._config;
    const parts = [];
    if (items.length === 1) {
      parts.push(this._detail(items[0], false, true));
    } else {
      if (c.show_controls !== false && c.show_group_controls !== false) parts.push(`<div class="group">${this._groupButtons(items)}</div>`);
      parts.push(this._favorites(items, favoritesOf(c.favorites), null));
      parts.push(this._schedule(scheduleOf(c, null)));
      const cols = columnsOf(c);
      parts.push(
        cols > 1
          ? `<div class="items grid" style="--cc-columns:${cols}">${items.map((i) => this._tile(i)).join("")}</div>`
          : `<div class="items">${items.map((i) => this._row(i)).join("")}</div>`,
      );
    }
    return `<style>${BASE_STYLE}${SCENE_STYLE}${this._bannerStyle()}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(items)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  // One cover in full: picture and position, state, buttons, tilt and favorites.
  // `single`: the card's only cover, whose state the header pill already says. The body then does not repeat it: the
  // line under the position says what the pill does not (a cover only partly open), and the state comes back
  // (.pill-echo) only on a card so narrow that the pill keeps just its dot.
  _detail(item, inRow = false, single = false) {
    const s = item.s;
    const c = this._config;
    const cls = stateClass(s, item.cls);
    const p = this._pos(item);
    const word = p === null || isOffline(s);
    const partly = single && s?.state === "open" && p > 0 && p < 100;
    const echo = single && !partly ? " pill-echo" : "";
    const stateText = partly ? this._t("partly_open") : this._stateText(s);
    const stateLine =
      c.show_state === false ? "" : `<div class="line state ${cls}${echo}"><span class="dot"></span><span>${esc(stateText)}</span></div>`;
    // A pergola whose louvres only tilt: the louvres' angle in place of a position.
    const louvres = this._louvres(item);
    const value = louvres !== null
      ? `<div class="pos clickable" role="button" tabindex="0" data-entity="${esc(item.id)}">${esc(this._pct(louvres))}</div><div class="line state ${cls}"><span class="dot"></span><span>${esc(this._t("tilt"))}</span></div>`
      : word
      ? `<div class="pos word ${cls}${echo} clickable" role="button" tabindex="0" data-entity="${esc(item.id)}">${esc(this._stateText(s))}</div>`
      : `<div class="pos clickable" role="button" tabindex="0" data-entity="${esc(item.id)}" data-label="${esc(`${item.id}|pos`)}">${esc(this._pct(p))}</div>${stateLine}`;
    // In a row of several, the row itself carries the buttons.
    const controls = c.show_controls !== false && s && !inRow ? `<div class="controls">${this._buttons(item)}</div>` : "";
    return `<div class="hero">
        ${this._visual(item)}
        <div class="info${c.center_value ? " center" : ""}">${value}${controls}</div>
      </div>
      ${this._tilt(item)}
      ${this._schedule(item.schedule)}
      ${this._favorites([item], item.favorites, item.id)}`;
  }

  // Tilt of the slats (blinds, some shutters and awnings): a slider when it can be set, and its buttons.
  _tilt(item) {
    const s = item.s;
    if (this._config.show_tilt === false || !s || !hasTilt(s)) return "";
    const off = isOffline(s);
    const v = tiltOf(s);
    const shown = v ?? 0;
    const label = esc(this._t("tilt_of", { name: item.name }));
    const track = has(s, F.SET_TILT_POSITION)
      ? `<div class="track" data-for="${esc(item.id)}" style="--t:${shown}" role="slider" tabindex="0" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100"
          aria-valuenow="${shown}" aria-valuetext="${esc(this._pct(shown))}" aria-label="${label}" title="${label}"${off ? ' aria-disabled="true"' : ""} data-slider="tilt" data-entity="${esc(item.id)}"><div class="fill"></div><div class="thumb"></div></div>`
      : "<div></div>";
    const btns = this._config.show_controls === false ? "" : this._tiltButtons(item);
    return `<div class="tilt-row">
        <span class="k">${svgIcon(ICONS.tilt)}<span>${esc(this._t("tilt"))}</span></span>
        ${track}
        <span class="v" data-label="${esc(`${item.id}|tilt`)}">${esc(v === null || off ? "—" : this._pct(v))}</span>
        <span class="btns">${btns}</span>
      </div>`;
  }

  // Round buttons that open, stop and close the tilt (the slats, a pergola's louvres), the ones the cover supports.
  _tiltButtons(item) {
    const s = item.s;
    const off = isOffline(s);
    return ["tilt_open", "tilt_stop", "tilt_close"]
      .filter((a) => has(s, SERVICES[a][1]))
      .map((a) => {
        const l = esc(this._t(a));
        return `<button class="btn round small ${a}" data-action="${a}" data-entity="${esc(item.id)}" title="${l}" aria-label="${l}"${off ? " disabled" : ""}>${svgIcon(ICONS[a === "tilt_stop" ? "stop" : a])}</button>`;
      })
      .join("");
  }

  // One cover of several in a grid (`columns`): a tile always unfolded, its name over the full detail.
  _tile(item) {
    const s = item.s;
    const icon = ICONS[item.cls][this._shownOpen(item) ? 1 : 0];
    return `<div class="tile">
        <div class="tile-head ${stateClass(s, item.cls)} clickable" role="button" tabindex="0" data-entity="${esc(item.id)}">
          <span class="mbadge">${svgIcon(icon)}</span><span class="iname">${esc(item.name)}</span>
        </div>
        ${this._detail(item)}
      </div>`;
  }

  // One cover of several: a foldable row with its state and buttons, the full detail once unfolded.
  _row(item) {
    const s = item.s;
    const cls = stateClass(s, item.cls);
    const open = !this._isCollapsed(item.id);
    const icon = ICONS[item.cls][this._shownOpen(item) ? 1 : 0];
    const state = s && !isOffline(s) && this._pos(item) !== null && !isMoving(s) ? this._pct(this._pos(item)) : this._stateText(s);
    const ctrl = this._config.show_controls !== false && s ? `<div class="item-ctrl">${this._buttons(item, { round: true })}</div>` : "";
    return `<div class="item">
        <div class="item-head">
          <div class="toggle ${cls}" role="button" tabindex="0" data-action="toggle" data-entity="${esc(item.id)}" aria-expanded="${open}">
            <span class="mbadge">${svgIcon(icon)}</span>
            <span class="txt"><div class="iname">${esc(item.name)}</div><div class="istate">${esc(state)}</div></span>
            ${svgIcon(ICONS.chevron_down, "chevron")}
          </div>
          ${ctrl}
        </div>
        ${open ? this._detail(item, true) : ""}
      </div>`;
  }
}

// The mini card shows a group compactly: a small picture per cover and the buttons for all of them. Its detail
// button (top right, `zoom: false` removes it) switches it to the full card and back; a click anywhere else on the
// page brings the compact view back.
export class CoverMiniCard extends CoverCard {
  constructor() {
    super();
    this._unzoom = watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (this._zoomed) this._setZoom(false);
      },
    );
  }

  static getConfigElement() {
    return document.createElement("cover-mini-card-editor");
  }

  // The area with the most covers, else the first covers.
  static getStubConfig(hass) {
    const counts = {};
    for (const id of Object.keys(hass?.states || {})) {
      if (!id.startsWith("cover.")) continue;
      const a = areaOf(hass, id);
      if (a) counts[a] = (counts[a] || 0) + 1;
    }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (best) return { area: best[0] };
    const ids = Object.keys(hass?.states || {}).filter((e) => e.startsWith("cover."));
    return ids.length ? { entities: ids.slice(0, 4) } : {};
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen (see the full card).
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  // A single cover: the banner already draws it, so the body is its position and state, and its buttons as round
  // ones on the right, as in the other mini cards.
  _single(item) {
    const s = item.s;
    const c = this._config;
    const cls = stateClass(s, item.cls);
    const p = this._pos(item);
    const partly = s?.state === "open" && p > 0 && p < 100;
    const louvres = this._louvres(item);
    const value = louvres !== null ? this._pct(louvres) : p !== null && !isOffline(s) ? this._pct(p) : this._stateText(s);
    const state = louvres !== null ? this._t("tilt") : partly ? this._t("partly_open") : this._stateText(s);
    const stateLine = (p !== null || louvres !== null) && !isOffline(s) && c.show_state !== false ? `<div class="sstate ${cls}"><span class="dot"></span><span>${esc(state)}</span></div>` : "";
    // A pergola's louvres turn from the mini card too.
    const tilt = item.cls === "pergola" && hasTilt(s) ? this._tiltButtons(item) : "";
    const buttons = c.show_controls !== false && s ? `<div class="sbtns">${this._buttons(item, { round: true })}${tilt}</div>` : "";
    return `<style>${BASE_STYLE}${SCENE_STYLE}${this._bannerStyle()}${MINI_STYLE}</style>
      <ha-card>
        ${this._header([item])}
        <div class="content">
          <div class="single">
            <div class="sinfo clickable" role="button" tabindex="0" data-entity="${esc(item.id)}"><div class="sval">${esc(value)}</div>${stateLine}</div>
            ${buttons}
          </div>
          ${this._schedule(item.schedule, true)}
          ${this._favorites([item], item.favorites, item.id)}
        </div>
      </ha-card>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const items = this._items();
    const err = this._configError(items);
    if (err) return this._errorCard(...err);
    const c = this._config;
    if (items.length === 1) return this._single(items[0]);
    const thumbs = items
      .map((i) => {
        const label = esc(`${i.name}: ${this._valueText(i)}`);
        return `<div class="thumb ${stateClass(i.s, i.cls)}" role="button" tabindex="0" data-entity="${esc(i.id)}" title="${label}" aria-label="${label}">
          ${this._visual(i, { slider: false })}
          <div class="tname">${esc(i.name)}</div><div class="tval">${esc(this._valueText(i))}</div></div>`;
      })
      .join("");
    const group = c.show_controls !== false ? `<div class="group">${this._groupButtons(items)}</div>` : "";
    return `<style>${BASE_STYLE}${SCENE_STYLE}${this._bannerStyle()}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(items)}
        <div class="content">
          <div class="thumbs">${thumbs}</div>
          ${group}
          ${this._schedule(scheduleOf(c, null), true)}
          ${this._favorites(items, favoritesOf(c.favorites), null)}
        </div>
      </ha-card>`;
  }
}
