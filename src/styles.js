// ---------------------------------------------------------------------------
// Styles (same language as the other ha-* cards: tinted 40 px badge, state chip, smoked-glass buttons)
// ---------------------------------------------------------------------------
import { F } from "./core.js";

export const BASE_STYLE = `
  :host { --cc-ok: var(--success-color, #43a047); --cc-warn: var(--warning-color, #ffa600); --cc-crit: var(--error-color, #db4437);
          --cc-idle: var(--secondary-text-color, #9e9e9e); --cc-active: var(--info-color, #039be5); --cc-accent: var(--primary-color, #03a9f4); }
  /* The card is the container of its width queries (@container below). Inline-size containment drops the content
     from the card's own intrinsic width: in a parent that sizes it from its content (layout-card, a grid column auto,
     an inline-block) it would fall to a few pixels. An empty, zero-height row gives it back a preferred width, as a
     max-content width only: in a 1fr 1fr grid or a flex row the card still shrinks with its column. */
  :host { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; --cc-natural-width: 360px; }
  :host::before { content: ""; width: var(--cc-natural-width); max-width: 100%; height: 0; }
  ha-card { overflow: hidden; container: cc-card / inline-size; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  .ok { --c: var(--cc-ok); } .warn { --c: var(--cc-warn); } .crit { --c: var(--cc-crit); } .idle { --c: var(--cc-idle); } .active { --c: var(--cc-active); }
  /* Texts in a state color are mixed with the text color: tinted, and readable at 4.5:1 in both themes. */
  .ok, .warn, .crit, .idle, .active { --ink: color-mix(in srgb, var(--c) 40%, var(--primary-text-color, #212121)); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--cc-ok)); flex: none; display: inline-block; }
  .active .dot { animation: cc-dot 1s ease-in-out infinite alternate; }
  @keyframes cc-dot { from { opacity: 1; } to { opacity: .3; } }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--cc-ok)) 15%, transparent); color: var(--ink, var(--c, var(--cc-ok)));
          box-sizing: border-box; flex: 0 1 auto; min-width: 0; overflow: hidden; }
  .chip .t { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .badge { width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
           background: color-mix(in srgb, var(--cc-accent) 16%, transparent); color: var(--cc-accent); transition: background-color .3s ease, color .3s ease; }
  .badge .icon { width: 24px; height: 24px; }
  .titles { flex: 1 1 0; min-width: 5ch; container: cc-titles / inline-size; display: flex; flex-direction: column; align-items: flex-start; }
  .titles > * { max-width: 100%; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  /* Banner and classic header: the state pill sits on the title line, right after the title, when the whole title and
     its whole label fit there; otherwise it goes on its own line under the subtitle, and when even that is too tight
     only its dot is left (the label stays in its tooltip and aria-label). Decided by measure (see _fitPill). */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 0 1 auto; min-width: 0; }
  .trow .chip { flex: none; max-width: none; line-height: 16px; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .trow .name { max-width: 100%; }
  .titles.pill-below .trow .chip { order: 3; margin-top: 3px; }
  .titles.pill-dot .trow .chip { padding: 5px; } .titles.pill-dot .trow .chip .t { display: none; }
  @container cc-card (max-width: 200px) { .trow .chip { padding: 5px; } .trow .chip .t { display: none; } }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; line-height: 1.2; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--cc-warn) 40%, var(--primary-text-color, #212121)); }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--cc-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn.primary, .btn.on { background: color-mix(in srgb, var(--cc-accent) 16%, transparent); color: color-mix(in srgb, var(--cc-accent) 40%, var(--primary-text-color, #212121)); }
  .btn.primary .icon, .btn.on .icon { color: var(--cc-accent); }
  .btn.primary:not(:disabled):hover, .btn.on:not(:disabled):hover { background: color-mix(in srgb, var(--cc-accent) 24%, transparent); }
  .btn .icon { width: 18px; height: 18px; }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn.small { width: 30px; height: 30px; }
  .btn.small .icon { width: 16px; height: 16px; }
  .btn:disabled { opacity: .45; cursor: default; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--cc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--cc-accent); outline-offset: 1px; }
  [role="button"]:focus-visible, [role="slider"]:focus-visible, .btn:focus-visible { outline: 2px solid var(--cc-accent); outline-offset: 2px; border-radius: 6px; }
  .visual { position: relative; flex: none; touch-action: none; }
  .visual .scene { filter: drop-shadow(0 4px 8px rgba(0,0,0,.18)); }
  .visual[role="slider"] { cursor: ns-resize; }
  /* A horizontal slider leaves vertical swipes to the page, which scrolls. */
  .visual[data-axis="across"] { cursor: ew-resize; touch-action: pan-y; }
  .visual[aria-disabled="true"] { cursor: default; }
  .favs { display: flex; flex-wrap: wrap; gap: 6px; }
  .favs .btn { font-weight: 400; padding: 5px 12px 5px 8px; }
  .favs .btn .icon { width: 16px; height: 16px; color: var(--secondary-text-color); }
  .favs .btn.on .icon { color: var(--cc-accent); }
  .sched { display: flex; flex-wrap: wrap; gap: 8px; }
  .sched .slot { flex: 1 1 0; min-width: 130px; display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 12px;
                 background: var(--secondary-background-color, rgba(127,127,127,.12)); font-size: 12px; color: var(--secondary-text-color); }
  .sched .k { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .sched .l { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sched b { font-size: 15px; font-weight: 600; color: var(--primary-text-color); font-variant-numeric: tabular-nums; }
  .sched .pi { width: 28px; height: 28px; flex: none; border-radius: 50%; display: grid; place-items: center;
               background: color-mix(in srgb, var(--cc-accent) 14%, transparent); color: var(--cc-accent); }
  .sched .pi .icon { width: 16px; height: 16px; }
  .sched .slot.next { background: color-mix(in srgb, var(--cc-accent) 12%, transparent); }
  .sched .slot.next .in { color: var(--cc-accent); font-weight: 500; }
  .sched .slot.done { opacity: .6; }
  .sched .slot.skip b { text-decoration: line-through; color: var(--secondary-text-color); font-weight: 500; }
  .sched .slot.skip .pi { background: rgba(127,127,127,.15); color: var(--secondary-text-color); }
  .sched.small { gap: 6px; }
  .sched.small .slot { padding: 5px 8px; min-width: 110px; gap: 6px; }
  .sched.small b { font-size: 13px; }
  .sched.small .pi { width: 24px; height: 24px; }
  @container (max-width: 200px) {
    .header { gap: 6px; padding: 10px 8px 0; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
`;

// In-card confirmation popup, as in the other ha-* cards: a backdrop over the card with a small dialog at the top of
// the card, so that it stays in view when the card is long.
export const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 160px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

export const FULL_STYLE = `
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .hero { display: flex; gap: 14px; align-items: center; }
  .hero .visual { width: 104px; height: 125px; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .info.center { align-items: center; text-align: center; }
  .info.center .pos { width: auto; }
  .pos { font-size: 30px; font-weight: 400; line-height: 1; width: fit-content; }
  .pos.word { font-size: 22px; line-height: 1.1; color: var(--ink); overflow-wrap: anywhere; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line .icon { width: 16px; height: 16px; }
  .line.state { color: var(--ink); }
  /* What the header pill already says is not repeated under it, unless the pill keeps only its dot. */
  .pill-echo { display: none; }
  @container cc-card (max-width: 200px) { .line.pill-echo { display: flex; } .pos.pill-echo { display: block; } }
  ha-card.pill-dot .line.pill-echo { display: flex; } ha-card.pill-dot .pos.pill-echo { display: block; }
  .controls { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
  .controls .btn { flex: 1 1 auto; }
  .tilt-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); }
  .tilt-row .k { display: flex; align-items: center; gap: 4px; }
  .tilt-row .k .icon { width: 16px; height: 16px; }
  .tilt-row .v { font-weight: 500; color: var(--primary-text-color); min-width: 36px; text-align: right; }
  .tilt-row .btns { display: flex; gap: 4px; }
  .track { position: relative; height: 22px; cursor: ew-resize; touch-action: none; }
  .track::before { content: ""; position: absolute; left: 0; right: 0; top: 9px; height: 4px; border-radius: 2px;
                   background: color-mix(in srgb, var(--primary-text-color, #212121) 15%, transparent); }
  .track .fill { position: absolute; left: 0; top: 9px; height: 4px; border-radius: 2px; width: calc(var(--t) * 1%); background: var(--cc-accent); }
  .track .thumb { position: absolute; top: 4px; left: calc(var(--t) * 1% - 7px); width: 10px; height: 10px; border-radius: 50%;
                  background: var(--card-background-color, #fff); border: 2px solid var(--cc-accent); }
  .track[aria-disabled="true"] { cursor: default; opacity: .45; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .group { display: flex; flex-wrap: wrap; gap: 6px; }
  .group .btn { flex: 1 1 auto; }
  .items { display: flex; flex-direction: column; gap: 8px; }
  .item { border-radius: 12px; background: var(--secondary-background-color, rgba(127,127,127,.08)); padding: 6px 6px 6px 8px; display: flex; flex-direction: column; gap: 10px; }
  .item-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .toggle { display: flex; align-items: center; gap: 8px; flex: 1 1 0; min-width: 0; cursor: pointer; user-select: none; }
  .toggle .mbadge { width: 32px; height: 32px; border-radius: 50%; flex: none; display: grid; place-items: center;
                    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
  .toggle .mbadge .icon { width: 20px; height: 20px; }
  .toggle .txt { flex: 1 1 0; min-width: 0; }
  .toggle .iname { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .toggle .istate { font-size: 12px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .toggle .chevron { width: 16px; height: 16px; color: var(--secondary-text-color); transition: transform .2s ease; }
  .toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .item-ctrl { display: flex; gap: 4px; flex: none; }
  /* Roomier open / stop / close buttons on the folded row: 30 px is a tight touch target on phones. */
  .item-ctrl .btn.round.small { width: 32px; height: 32px; }
  .item-ctrl .btn.round.small .icon { width: 18px; height: 18px; }
  .item .hero, .item .tilt-row, .item .favs { padding: 0 4px 4px 0; }
  .item .hero { padding-left: 8px; gap: 18px; }
  .item .btn { background: color-mix(in srgb, var(--card-background-color, #fff) 75%, transparent); }
  .item .btn.on { background: color-mix(in srgb, var(--cc-accent) 16%, var(--card-background-color, #fff)); }
  /* columns: 2 or 3, a grid of unfolded tiles. Each tile is the container of the width queries below, so that a
     narrow tile hides the button labels and the tilt buttons the way a narrow card does. */
  .items.grid { display: grid; grid-template-columns: repeat(var(--cc-columns, 2), minmax(0, 1fr)); gap: 8px; }
  .tile { container-type: inline-size; min-width: 0; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.08));
          padding: 8px; display: flex; flex-direction: column; gap: 10px; }
  .tile-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tile-head .mbadge { width: 28px; height: 28px; border-radius: 50%; flex: none; display: grid; place-items: center;
                       background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
  .tile-head .mbadge .icon { width: 18px; height: 18px; }
  .tile-head .iname { flex: 1 1 0; min-width: 0; font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .hero { flex: 1 1 auto; flex-direction: column; align-items: stretch; gap: 8px; }
  .tile .hero .visual { align-self: center; width: 104px; height: 125px; }
  /* Tiles in a row stretch to the same height; the picture + value area grows and the buttons sit at the bottom,
     so the button rows line up across tiles even when one cover shows a position and another only a word. */
  .tile .info { flex: 1 1 auto; align-items: center; text-align: center; }
  .tile .controls { flex-wrap: nowrap; align-self: stretch; margin-top: auto; }
  .tile .controls .btn { flex: 1 1 0; min-height: 40px; }
  .tile .btn { background: color-mix(in srgb, var(--card-background-color, #fff) 75%, transparent); }
  .tile .btn.on { background: color-mix(in srgb, var(--cc-accent) 16%, var(--card-background-color, #fff)); }
  /* Narrow card: the buttons keep their icons, the picture shrinks. */
  @container (max-width: 330px) {
    .controls .btn span, .group .btn span { display: none; }
  }
  @container (max-width: 280px) {
    .hero .visual { width: 80px; height: 96px; }
    .hero { gap: 10px; }
    .tilt-row { grid-template-columns: auto minmax(0, 1fr) auto; }
    .tilt-row .btns { display: none; }
  }
  @container (max-width: 220px) {
    .hero .visual { width: 60px; height: 72px; }
    .pos { font-size: 24px; }
    .item-ctrl .btn.stop { display: none; }
  }
  /* Too narrow for tiles side by side: one per line. */
  @container (max-width: 300px) {
    .items.grid { grid-template-columns: minmax(0, 1fr); }
  }
  @container (max-width: 150px) {
    .tile .hero .visual { width: 80px; height: 96px; }
  }
`;

export const MINI_STYLE = `
  :host { --cc-natural-width: 300px; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 10px; }
  .thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; }
  .thumb { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 4px; border-radius: 10px; min-width: 0;
           background: var(--secondary-background-color, rgba(127,127,127,.08)); cursor: pointer; }
  .thumb .visual { width: 44px; height: 53px; }
  .thumb .visual .scene { filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
  .thumb .tname { font-size: 11px; color: var(--secondary-text-color); max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .thumb .tval { font-size: 12px; font-weight: 500; color: var(--ink); white-space: nowrap; }
  .single { display: flex; align-items: center; gap: 12px; }
  .sinfo { flex: 1; min-width: 0; cursor: pointer; }
  .sval { font-size: 28px; line-height: 1.15; color: var(--ink); white-space: nowrap; }
  .sstate { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--secondary-text-color); }
  .sbtns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .sbtns .btn.round { width: 42px; height: 42px; }
  .sbtns .btn.round .icon { width: 20px; height: 20px; }
  @container (max-width: 280px) {
    .single { flex-direction: column; align-items: stretch; gap: 8px; }
    .sbtns { justify-content: space-between; }
    .sbtns .btn.round { width: 36px; height: 36px; }
  }
  .group { display: flex; flex-wrap: wrap; gap: 6px; }
  .group .btn { flex: 1 1 auto; }
  @container (max-width: 280px) {
    .group .btn span { display: none; }
  }
`;

// Element names of Home Assistant dialogs (more-info opened from the card, among others).
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);

// True for a click outside `card` that is not in a dialog opened from it (more-info, say).
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};
// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event. `tap(ev)` (press and release at the same spot) is for the tests.
export const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// After the popup closes, clicks on the card are ignored for this long: the second click of a double click on OK
// would otherwise land on what lies under the button.
export const CONFIRM_GUARD_MS = 400;
// After a position is sent, the picture keeps it until the cover reports a new state (or for this long), instead of
// jumping back to the old position meanwhile.
export const HOLD_MS = 3000;
// Keyboard on a slider: the value is sent once the keys have rested this long.
export const KEY_COMMIT_MS = 700;
// The mark of a position being reached stays this long at most.
export const TARGET_MS = 120000;

// Elements a click acts on, and how one is told from the others across renders.
export const FOCUS_SELECTOR = "[data-action], [data-entity], [data-slider]";
export const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset }).filter(([k]) => k !== "label");
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// Services of the buttons.
export const SERVICES = {
  open: ["open_cover", F.OPEN],
  close: ["close_cover", F.CLOSE],
  stop: ["stop_cover", F.STOP],
  tilt_open: ["open_cover_tilt", F.OPEN_TILT],
  tilt_close: ["close_cover_tilt", F.CLOSE_TILT],
  tilt_stop: ["stop_cover_tilt", F.STOP_TILT],
};
export const GROUP_ACTIONS = { open_all: "open", close_all: "close", stop_all: "stop" };
