// ---------------------------------------------------------------------------
// Pictures: one drawn scene per device class, set by --p (position) and --t (tilt), animated while it moves
// ---------------------------------------------------------------------------

// The pictures are inline SVG (in the card's shadow root): their moving parts follow the CSS variables --p and --t
// of the picture, so dragging the picture moves them at once, without a redraw. Gradient ids carry a prefix per
// picture (`u`), as every picture of the card shares one shadow root.
export const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");

export const DEFS = (u) => `<defs>
  <linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfa"/><stop offset="1" stop-color="#d9dad7"/></linearGradient>
  <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe9fb"/><stop offset=".55" stop-color="#eef7fd"/><stop offset="1" stop-color="#b7dcf5"/></linearGradient>
  <linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ecef"/><stop offset="1" stop-color="#b9bfc6"/></linearGradient>
  <linearGradient id="${u}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa0a6"/><stop offset=".5" stop-color="#e6e8ea"/><stop offset="1" stop-color="#8a9097"/></linearGradient>
  <linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f73a0"/><stop offset=".5" stop-color="#7d9cc4"/><stop offset="1" stop-color="#4f73a0"/></linearGradient>
  <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a62"/><stop offset="1" stop-color="#8a6043"/></linearGradient>
</defs>`;

// A window: white frame, sky glass, mullions.
export const windowFrame = (u) =>
  `<rect x="10" y="14" width="80" height="96" rx="3" fill="url(#${u}f)" stroke="#c4c5c2"/>
   <rect x="14" y="18" width="72" height="88" fill="url(#${u}g)"/>
   <path d="M50 18V106M14 62H86" stroke="#d9dad7" stroke-width="2.5"/>
   <path d="M20 30l14-10M20 44l26-20" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
// Clips its content to the glass of the window (a nested viewport clips, no id needed).
export const glass = (inner) => `<svg x="14" y="18" width="72" height="88" viewBox="14 18 72 88">${inner}</svg>`;
// Warning lamp of a motorized door or gate, which blinks while it moves.
export const lamp = (x, y) => `<circle class="lamp" cx="${x}" cy="${y}" r="3.2"/><circle class="lamp-glow" cx="${x}" cy="${y}" r="7"/>`;

export const SCENES = {
  // Roller shutter: aluminium slats rolling up into the box above the window.
  shutter: (u) => `${windowFrame(u)}${glass(`<g class="shift"><g class="roll">
      <rect x="14" y="8" width="72" height="104" fill="url(#${u}s)"/>
      <path d="${range(21, (i) => `M14 ${8 + i * 5}H86`)}" stroke="#9aa0a6" stroke-width=".9"/></g>
      <rect x="14" y="103" width="72" height="3" fill="#7d838a"/></g>`)}
    <rect x="7" y="6" width="86" height="13" rx="2.5" fill="url(#${u}f)" stroke="#c4c5c2"/>`,
  // Venetian blind: slats turned by the tilt, lifted with the bottom rail.
  blind: (u) => `${windowFrame(u)}${glass(`<g class="shift"><g class="roll">
      ${range(20, (i) => `<rect class="slat" x="14" y="${8 + i * 5}" width="72" height="5" rx="1" fill="url(#${u}s)" stroke="#b0b6bd" stroke-width=".4"/>`)}</g>
      <path d="M30 8V104M70 8V104" stroke="#8a9097" stroke-width=".6"/>
      <rect x="14" y="103" width="72" height="3" rx="1" fill="#8a9097"/></g>`)}
    <rect x="8" y="9" width="84" height="9" rx="2" fill="url(#${u}f)" stroke="#c4c5c2"/>`,
  // Roller shade: linen fabric from a roller tube, weighted bottom bar that sways a little while it moves.
  shade: (u) => `${windowFrame(u)}${glass(`<g class="shift"><rect x="14" y="8" width="72" height="98" fill="#dcc9a8" opacity=".94"/>
      <path d="${range(9, (i) => `M${20 + i * 8} 8V104`)}" stroke="#c8b38f" stroke-width=".6"/>
      <g class="bob"><rect x="14" y="102" width="72" height="4" rx="1.5" fill="#8a6043"/></g></g>`)}
    <rect x="8" y="9" width="84" height="9" rx="4.5" fill="url(#${u}m)"/>`,
  // Curtains: two panels drawn aside on a rod; their folds sway while they move.
  curtain: (u) => `${windowFrame(u)}
    <path d="M5 11H95" stroke="#6f747a" stroke-width="2.5" stroke-linecap="round"/><circle cx="5" cy="11" r="2.6" fill="#6f747a"/><circle cx="95" cy="11" r="2.6" fill="#6f747a"/>
    <g class="panel left"><g class="sway"><rect x="10" y="12" width="40" height="98" fill="url(#${u}c)"/>
      <path d="${range(5, (i) => `M${14 + i * 8} 12V110`)}" stroke="#3d5f8a" stroke-width="1.6" opacity=".55"/></g></g>
    <g class="panel right"><g class="sway"><rect x="50" y="12" width="40" height="98" fill="url(#${u}c)"/>
      <path d="${range(5, (i) => `M${54 + i * 8} 12V110`)}" stroke="#3d5f8a" stroke-width="1.6" opacity=".55"/></g></g>`,
  // Awning over a window: striped fabric unrolled from its cassette, scalloped valance fluttering while it moves.
  awning: (u) => `<rect x="22" y="48" width="56" height="58" rx="2" fill="url(#${u}f)" stroke="#c4c5c2"/>
    <rect x="26" y="52" width="48" height="50" fill="url(#${u}g)"/><path d="M50 52V102M26 77H74" stroke="#d9dad7" stroke-width="2"/>
    <path d="M6 110H94" stroke="#b9bfc6" stroke-width="2"/>
    <g class="fabric">${range(7, (i) => `<rect x="${8 + i * 12}" y="18" width="12" height="54" fill="${i % 2 ? "#f2efe6" : "#2e7d6b"}"/>`)}</g>
    <g class="valance"><g class="flutter"><path d="M8 18${range(7, () => `h2a4 4 0 0 0 8 0h2`)}V14H8Z" fill="#2e7d6b"/></g></g>
    <rect x="5" y="10" width="90" height="9" rx="3" fill="url(#${u}m)"/>`,
  // Garage: sectional door rising under the roof, warning lamp blinking while it moves.
  garage: (u) => `<path d="M3 36L50 9L97 36Z" fill="#8a5a44"/><rect x="8" y="34" width="84" height="78" fill="#ece5d8" stroke="#d6cdbd"/>
    <rect x="16" y="46" width="68" height="66" fill="#2b2f36"/><path d="M28 112l6-14h32l6 14" fill="#3b4048"/>
    <svg x="16" y="46" width="68" height="66" viewBox="16 46 68 66"><g class="shift"><g class="bob">
      ${range(4, (i) => `<rect x="16" y="${46 + i * 16.5}" width="68" height="16.5" fill="url(#${u}f)" stroke="#c4c5c2" stroke-width=".8"/>
        <path d="M20 ${54 + i * 16.5}H80" stroke="#d6d7d4" stroke-width="1.2"/>`)}
      <rect x="44" y="104" width="12" height="3" rx="1.5" fill="#9aa0a6"/></g></g></svg>
    <rect x="13" y="42" width="74" height="4" fill="#d6cdbd"/>${lamp(50, 38)}
    <path d="M2 112H98" stroke="#b9bfc6" stroke-width="2"/>`,
  // Sliding gate between two pillars; the leaf slides behind the right one, lamp on the left one.
  gate: () => `<path d="M2 112H98" stroke="#b9bfc6" stroke-width="2"/>
    <svg x="14" y="40" width="72" height="72" viewBox="14 40 72 72"><g class="shift"><g class="bob">
      <rect x="16" y="54" width="68" height="52" rx="2" fill="none" stroke="#3d4147" stroke-width="3"/>
      <path d="${range(8, (i) => `M${24 + i * 8} 54V106`)}" stroke="#4a4e54" stroke-width="2.4"/>
      <path d="M16 80H84" stroke="#3d4147" stroke-width="2"/>
      <circle cx="26" cy="108" r="2.5" fill="#6f747a"/><circle cx="74" cy="108" r="2.5" fill="#6f747a"/></g></g></svg>
    <rect x="5" y="44" width="10" height="68" rx="1.5" fill="#a9a59c" stroke="#8f8b82"/><rect x="85" y="44" width="10" height="68" rx="1.5" fill="#a9a59c" stroke="#8f8b82"/>
    <rect x="4" y="41" width="12" height="4" rx="1" fill="#8f8b82"/><rect x="84" y="41" width="12" height="4" rx="1" fill="#8f8b82"/>${lamp(10, 35)}`,
  // Swing gate between two pillars: two leaves on their hinges, narrower as they swing open, their paths on the
  // drive; lamp on the left pillar.
  swing: () => `<path d="M2 112H98" stroke="#b9bfc6" stroke-width="2"/>
    <path d="M15 112Q24 98 50 104M85 112Q76 98 50 104" fill="none" stroke="#b9bfc6" stroke-width="1.2" stroke-dasharray="3 3"/>
    <g class="leaf-l"><g class="bob"><path d="M15 56Q32 50 50 54V108H15Z" fill="none" stroke="#3d4147" stroke-width="3"/>
      <path d="${range(4, (i) => `M${22 + i * 7} ${54 - (i < 2 ? i : 3 - i) * 0.6}V108`)}" stroke="#4a4e54" stroke-width="2.2"/>
      <path d="M15 82H50" stroke="#3d4147" stroke-width="2"/></g></g>
    <g class="leaf-r"><g class="bob"><path d="M85 56Q68 50 50 54V108H85Z" fill="none" stroke="#3d4147" stroke-width="3"/>
      <path d="${range(4, (i) => `M${78 - i * 7} ${54 - (i < 2 ? i : 3 - i) * 0.6}V108`)}" stroke="#4a4e54" stroke-width="2.2"/>
      <path d="M50 82H85" stroke="#3d4147" stroke-width="2"/></g></g>
    <rect x="5" y="44" width="10" height="68" rx="1.5" fill="#a9a59c" stroke="#8f8b82"/><rect x="85" y="44" width="10" height="68" rx="1.5" fill="#a9a59c" stroke="#8f8b82"/>
    <rect x="4" y="41" width="12" height="4" rx="1" fill="#8f8b82"/><rect x="84" y="41" width="12" height="4" rx="1" fill="#8f8b82"/>${lamp(10, 35)}`,
  // Barrier: a yellow cabinet on the drive, its striped arm lifting on its pivot, a fork post at its far end; red
  // lamp on the cabinet, which blinks while it moves (and glows at night in the banner).
  barrier: (u) => `<defs><linearGradient id="${u}y" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#f2b705"/></linearGradient></defs>
    <path d="M2 112H98" stroke="#b9bfc6" stroke-width="2"/>
    <rect x="84" y="88" width="4" height="24" fill="#868e96"/><path d="M80 86.5H92" stroke="#495057" stroke-width="3" stroke-linecap="round"/>
    <g class="arm"><rect x="17" y="76.5" width="72" height="7" rx="3.5" fill="url(#${u}f)" stroke="#c4c5c2" stroke-width=".6"/>
      ${range(4, (i) => `<rect x="${32 + i * 14}" y="76.5" width="7" height="7" fill="#e03131"/>`)}<circle cx="86" cy="80" r="2" fill="#ffd43b"/></g>
    <rect x="8" y="70" width="24" height="42" rx="3.5" fill="url(#${u}y)" stroke="#d99a00"/>
    <rect x="13" y="94" width="14" height="3" rx="1.5" fill="#343a40"/><rect x="13" y="100" width="14" height="8" rx="2" fill="#000" opacity=".08"/>
    <circle cx="20" cy="80" r="5" fill="#495057"/><circle cx="20" cy="80" r="2" fill="#adb5bd"/>
    <rect x="18.5" y="64" width="3" height="6" fill="#495057"/>${lamp(20, 61)}`,
  // Hinged shutters: two louvred leaves on the outer edges of the window, folding out against the wall as they open;
  // the window glows warm at night in the banner.
  hinged: (u) => `<defs><linearGradient id="${u}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#52b788"/><stop offset="1" stop-color="#2d6a4f"/></linearGradient></defs>
    <rect x="26" y="16" width="48" height="92" rx="2" fill="url(#${u}f)" stroke="#c4c5c2"/>
    <rect x="30" y="20" width="40" height="84" fill="url(#${u}g)"/><rect class="warm" x="30" y="20" width="40" height="84"/>
    <path d="M50 20V104M30 62H70" stroke="#d9dad7" stroke-width="2.5"/>
    <path d="M34 32l10-8M34 46l16-14" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
    <rect x="22" y="107" width="56" height="5" rx="1.5" fill="url(#${u}f)" stroke="#c4c5c2"/>
    <g class="hl"><g class="bob"><rect x="26" y="16" width="24" height="92" rx="1.5" fill="url(#${u}h)" stroke="#1b4332" stroke-width=".8"/>
      <path d="${range(16, (i) => `M28.5 ${21 + i * 5.4}H47.5`)}" stroke="#1b4332" stroke-width="1.3" opacity=".55"/><rect x="28" y="61" width="20" height="2.5" fill="#2d6a4f"/></g></g>
    <g class="hr"><g class="bob"><rect x="50" y="16" width="24" height="92" rx="1.5" fill="url(#${u}h)" stroke="#1b4332" stroke-width=".8"/>
      <path d="${range(16, (i) => `M52.5 ${21 + i * 5.4}H71.5`)}" stroke="#1b4332" stroke-width="1.3" opacity=".55"/><rect x="52" y="61" width="20" height="2.5" fill="#2d6a4f"/></g></g>
    <path d="M24 30V34M24 90V94M76 30V34M76 90V94" stroke="#495057" stroke-width="3" stroke-linecap="round"/>`,
  // Pergola: posts and a frame, its louvres turning with the tilt (the position for a pergola without one), the sun
  // passing between them by day; the LED strip under the frame lights the terrace while its light is on.
  pergola: (u) => `<defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5c636e"/><stop offset="1" stop-color="#343a40"/></linearGradient></defs>
    <path d="M2 112H98" stroke="#b9bfc6" stroke-width="2"/>
    <g class="rays">${range(8, (i) => `<path d="M${17 + i * 9.6} 31l-6 79" stroke="#ffd43b" stroke-width="4"/>`)}</g>
    <g class="led"><path d="M13 31H87L80 110H20Z" fill="#ffd57a" opacity=".28"/><rect x="11" y="29.5" width="78" height="2" rx="1" fill="#ffe8a3"/></g>
    <ellipse cx="50" cy="89" rx="17" ry="2.8" fill="#a47148"/><rect x="48.5" y="91" width="3" height="21" fill="#7f5539"/>
    <path d="M24 82c0-4 8-4 8 0v11h-8zM68 82c0-4 8-4 8 0v11h-8z" fill="#e9ecef" stroke="#adb5bd" stroke-width=".6"/>
    <path d="M25 93v19M31 93v19M69 93v19M75 93v19" stroke="#868e96" stroke-width="1.5"/>
    <path d="M55 87c2-6 6-6 8-4" stroke="#2f9e44" stroke-width="2" fill="none"/><rect x="54" y="84" width="6" height="4" rx="1" fill="#fff"/>
    <rect x="7" y="22" width="6" height="90" fill="url(#${u}p)"/><rect x="87" y="22" width="6" height="90" fill="url(#${u}p)"/>
    <rect x="4" y="18" width="92" height="3" rx="1" fill="url(#${u}p)"/><rect x="4" y="27" width="92" height="3" rx="1" fill="url(#${u}p)"/>
    ${range(9, (i) => `<rect class="louvre" x="${11.5 + i * 8.6}" y="22.7" width="9.2" height="3.6" rx="1" fill="url(#${u}s)" stroke="#9aa0a6" stroke-width=".4"/>`)}`,
  // Door: wooden leaf swinging inward (narrower as it opens), lamp above it.
  door: (u) => `<rect x="20" y="14" width="60" height="98" rx="2" fill="url(#${u}f)" stroke="#c4c5c2"/>
    <rect x="25" y="19" width="50" height="93" fill="#2b2f36"/><path d="M25 112l10-8h30l10 8" fill="#3b4048"/>
    <g class="leaf"><g class="bob"><rect x="25" y="19" width="50" height="93" fill="url(#${u}w)" stroke="#7a5238"/>
      <rect x="31" y="26" width="38" height="34" rx="2" fill="none" stroke="#7a5238" stroke-width="1.4"/>
      <rect x="31" y="68" width="38" height="36" rx="2" fill="none" stroke="#7a5238" stroke-width="1.4"/>
      <circle cx="67" cy="64" r="2.6" fill="url(#${u}m)"/></g></g>
    ${lamp(50, 8)}<path d="M8 112H92" stroke="#b9bfc6" stroke-width="2"/>`,
  // Roof window in the tiles: the sash tilts out from its top hinge, showing the opening under it.
  window: (u) => `<rect x="0" y="4" width="100" height="112" rx="4" fill="#b5654a"/>
    <path d="${range(7, (i) => `M0 ${18 + i * 15}H100`)}" stroke="#94503a" stroke-width="2"/>
    <rect x="16" y="16" width="68" height="90" rx="3" fill="#5f6368"/><rect x="20" y="20" width="60" height="82" fill="#2b2f36"/>
    <g class="sash"><g class="bob"><rect x="18" y="18" width="64" height="86" rx="2" fill="#d0d3d6" stroke="#9aa0a6"/>
      <rect x="23" y="23" width="54" height="76" fill="url(#${u}g)"/><path d="M28 36l16-10M28 52l30-22" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <rect x="40" y="97" width="20" height="4" rx="2" fill="#8a9097"/></g></g>`,
  // Damper in a round duct: the blade turns edge-on as it opens, the air flows through.
  damper: (u) => `<circle cx="50" cy="62" r="44" fill="url(#${u}m)"/><circle cx="50" cy="62" r="37" fill="#2b2f36"/>
    <path class="air" d="M20 46H80M16 62H84M20 78H80" stroke="#8fd3ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 7"/>
    <g class="blade"><ellipse cx="50" cy="62" rx="36" ry="36" fill="url(#${u}s)" stroke="#8a9097"/></g>
    <path d="M10 62H90" stroke="#6f747a" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="62" r="4" fill="url(#${u}m)"/>`,
};

// The position slider runs the way the moving edge of the scene runs, so that dragging the picture drags that
// edge: up for what rises (shutter, blind, shade, garage door; door, roof window and damper by convention), down
// for the awning, whose valance goes down as it unrolls, and across for curtains and a sliding gate, which open
// sideways. `from` and `len` are the run of the rail in the viewBox (100 × 120); a horizontal rail lies under the
// picture, a vertical one on its right.
export const AXES = {
  up: { from: 18, len: 88, open: -1 },
  down: { from: 20, len: 54, open: 1 },
  across: { from: 14, len: 72, open: 1 },
};
export const ACROSS = new Set(["curtain", "gate", "swing", "hinged", "pergola"]);
export const axisOf = (cls) => (ACROSS.has(cls) ? "across" : cls === "awning" ? "down" : "up");
// Where position `p` lies along the rail of `axis`, in viewBox units.
export const railAt = (axis, p) => {
  const a = AXES[axis];
  return a.from + ((a.open < 0 ? 100 - p : p) * a.len) / 100;
};

// Rail and knob of the position slider; `target` marks a position being reached.
export const rail = (axis, target) => {
  const a = AXES[axis];
  const mark = target === null || target === undefined ? null : (railAt(axis, target) - 0.75).toFixed(2);
  if (axis === "across")
    return `<rect class="rail" x="${a.from}" y="114.5" width="${a.len}" height="3" rx="1.5"/>
   ${mark === null ? "" : `<rect class="target" x="${mark}" y="112" width="1.5" height="8" rx=".75"/>`}
   <g class="knob"><circle class="handle" cx="${a.from}" cy="116" r="4.2"/></g>`;
  return `<rect class="rail" x="94.5" y="${a.from}" width="3" height="${a.len}" rx="1.5"/>
   ${mark === null ? "" : `<rect class="target" x="92" y="${mark}" width="8" height="1.5" rx=".75"/>`}
   <g class="knob"><circle class="handle" cx="96" cy="${a.from}" r="4.2"/></g>`;
};

export let PIC_UID = 0;
export const coverSvg = (cls, { slider = false, target = null } = {}) => {
  const u = `cc${(PIC_UID = (PIC_UID + 1) % 1e6)}`;
  return `<svg class="scene ${cls}" viewBox="0 0 100 120" aria-hidden="true">${DEFS(u)}${(SCENES[cls] || SCENES.shutter)(u)}${slider ? rail(axisOf(cls), target) : ""}</svg>`;
};

// Moving parts of the scenes. --p is the position (0 closed, 100 open) and --t the tilt, both unitless.
export const SCENE_STYLE = `
  .scene { width: 100%; height: 100%; display: block; overflow: visible; }
  .scene * { transform-box: fill-box; }
  .shift { transform-box: view-box; transform: translateY(calc(var(--p) * var(--k) * 1px)); }
  .scene { --k: -0.88; } .scene.garage { --k: -0.66; }
  .gate .shift { transform: translateX(calc(var(--p) * 0.7px)); }
  .slat { transform-origin: center; transform: scaleY(calc(1 - var(--t) * 0.0078)); }
  .panel.left { transform-origin: left center; transform: scaleX(calc(0.16 + (100 - var(--p)) * 0.0084)); }
  .panel.right { transform-origin: right center; transform: scaleX(calc(0.16 + (100 - var(--p)) * 0.0084)); }
  .sway { transform-origin: top center; }
  .fabric { transform-origin: top center; transform: scaleY(calc(var(--p) / 100)); }
  .valance { transform-box: view-box; transform: translateY(calc(var(--p) * 0.54px)); }
  .flutter { transform-origin: top center; }
  .leaf { transform-origin: left center; transform: scaleX(calc(1 - var(--p) * 0.0072)); }
  .leaf-l { transform-origin: left center; transform: scaleX(calc(1 - var(--p) * 0.0076)); }
  .leaf-r { transform-origin: right center; transform: scaleX(calc(1 - var(--p) * 0.0076)); }
  /* Hinged shutters fold out on the outer edges of the window: closed over the glass, open flat against the wall. */
  .hl { transform-origin: left center; transform: scaleX(calc(1 - var(--p) * 0.0194)); }
  .hr { transform-origin: right center; transform: scaleX(calc(1 - var(--p) * 0.0194)); }
  .warm { fill: #ffc65c; opacity: 0; }
  .barrier .arm { transform-box: view-box; transform-origin: 20px 80px; transform: rotate(calc(var(--p) * -0.84deg)); }
  .barrier .lamp-glow { fill: #ff4d4d; }
  .louvre { transform-origin: center; transform: rotate(calc(var(--t) * 0.8deg)); }
  .pergola .rays { opacity: calc(var(--t) * .0032); }
  .led { opacity: 0; }
  .lit .pergola .led { opacity: 1; }
  .sash { transform-origin: top center; transform: scaleY(calc(1 - var(--p) * 0.0042)); }
  .blade { transform-origin: center; transform: scaleY(calc(1 - var(--p) * 0.0094)); }
  .air { opacity: calc(var(--p) / 100); }
  .lamp { fill: #6f747a; } .lamp-glow { fill: #ffb300; opacity: 0; transform-origin: center; }
  .rail { fill: color-mix(in srgb, var(--primary-text-color, #212121) 18%, transparent); }
  .target { fill: var(--cc-accent); }
  .knob { transform-box: view-box; transform: translateY(calc((100 - var(--p)) * 0.88px)); }
  .awning .knob { transform: translateY(calc(var(--p) * 0.54px)); }
  .curtain .knob, .gate .knob, .swing .knob, .hinged .knob, .pergola .knob { transform: translateX(calc(var(--p) * 0.72px)); }
  .handle { fill: var(--card-background-color, #fff); stroke: var(--c, var(--cc-accent)); stroke-width: 2.4; }
  /* Moving: the slats roll and the edge steps toward where the cover goes, the bottom bar, folds and valance sway,
     the warning lamps blink, the air flows and the knob pulses. */
  .moving .roll { animation: cc-roll .5s linear infinite; }
  .closing .roll { animation-direction: reverse; }
  .opening .shift { animation: cc-rise 1.6s ease-in-out infinite; }
  .closing .shift { animation: cc-fall 1.6s ease-in-out infinite; }
  .gate.scene .shift { animation: none; }
  /* A swing gate on the move: its leaves swing a step further on their hinges, the way it goes. */
  .opening .swing .leaf-l, .opening .swing .leaf-r { animation: cc-swing-open 1.6s ease-in-out infinite; }
  .closing .swing .leaf-l, .closing .swing .leaf-r { animation: cc-swing-close 1.6s ease-in-out infinite; }
  /* Hinged shutters, a barrier's arm and a pergola's louvres on the move: a step further the way they go. */
  .opening .hinged .hl, .opening .hinged .hr { animation: cc-hinge-open 1.6s ease-in-out infinite; }
  .closing .hinged .hl, .closing .hinged .hr { animation: cc-hinge-close 1.6s ease-in-out infinite; }
  .opening .barrier .arm { animation: cc-arm-up 1.6s ease-in-out infinite; }
  .closing .barrier .arm { animation: cc-arm-down 1.6s ease-in-out infinite; }
  .opening .pergola .louvre { animation: cc-louvre-open 1.6s ease-in-out infinite; }
  .closing .pergola .louvre { animation: cc-louvre-close 1.6s ease-in-out infinite; }
  .moving .barrier .lamp { fill: #ff3b30; }
  .moving .bob { animation: cc-bob .5s ease-in-out infinite alternate; }
  .moving .sway { animation: cc-sway .8s ease-in-out infinite alternate; }
  .moving .flutter { animation: cc-sway .4s ease-in-out infinite alternate; }
  .moving .lamp { fill: #ffb300; animation: cc-blink 1s steps(1) infinite; }
  .moving .lamp-glow { animation: cc-glow 1s ease-out infinite; }
  .moving .air { animation: cc-air .5s linear infinite; }
  .moving .handle { animation: cc-pulse 1s ease-in-out infinite alternate; }
  @keyframes cc-roll { from { transform: translateY(0); } to { transform: translateY(-5px); } }
  @keyframes cc-rise { 0%, 15% { transform: translateY(calc(var(--p) * var(--k) * 1px)); } 85%, 100% { transform: translateY(calc(var(--p) * var(--k) * 1px - 8px)); } }
  @keyframes cc-swing-open { 0%, 15% { transform: scaleX(calc(1 - var(--p) * 0.0076)); } 85%, 100% { transform: scaleX(calc(1 - min(100, var(--p) + 14) * 0.0076)); } }
  @keyframes cc-swing-close { 0%, 15% { transform: scaleX(calc(1 - var(--p) * 0.0076)); } 85%, 100% { transform: scaleX(calc(1 - max(0, var(--p) - 14) * 0.0076)); } }
  @keyframes cc-hinge-open { 0%, 15% { transform: scaleX(calc(1 - var(--p) * 0.0194)); } 85%, 100% { transform: scaleX(calc(1 - min(100, var(--p) + 16) * 0.0194)); } }
  @keyframes cc-hinge-close { 0%, 15% { transform: scaleX(calc(1 - var(--p) * 0.0194)); } 85%, 100% { transform: scaleX(calc(1 - max(0, var(--p) - 16) * 0.0194)); } }
  @keyframes cc-arm-up { 0%, 15% { transform: rotate(calc(var(--p) * -0.84deg)); } 85%, 100% { transform: rotate(calc(min(100, var(--p) + 18) * -0.84deg)); } }
  @keyframes cc-arm-down { 0%, 15% { transform: rotate(calc(var(--p) * -0.84deg)); } 85%, 100% { transform: rotate(calc(max(0, var(--p) - 18) * -0.84deg)); } }
  @keyframes cc-louvre-open { 0%, 15% { transform: rotate(calc(var(--t) * 0.8deg)); } 85%, 100% { transform: rotate(calc(min(100, var(--t) + 20) * 0.8deg)); } }
  @keyframes cc-louvre-close { 0%, 15% { transform: rotate(calc(var(--t) * 0.8deg)); } 85%, 100% { transform: rotate(calc(max(0, var(--t) - 20) * 0.8deg)); } }
  @keyframes cc-fall { 0%, 15% { transform: translateY(calc(var(--p) * var(--k) * 1px)); } 85%, 100% { transform: translateY(calc(var(--p) * var(--k) * 1px + 8px)); } }
  @keyframes cc-bob { from { transform: translateY(0); } to { transform: translateY(-1.2px); } }
  @keyframes cc-sway { from { transform: skewX(-2deg); } to { transform: skewX(2deg); } }
  @keyframes cc-blink { 0% { opacity: 1; } 50% { opacity: .25; } }
  @keyframes cc-glow { from { transform: scale(.5); opacity: .7; } to { transform: scale(1.4); opacity: 0; } }
  @keyframes cc-air { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -15; } }
  @keyframes cc-pulse { from { stroke-width: 2.4; } to { stroke-width: 4; } }
  .off .scene { filter: grayscale(1); opacity: .5; }
  @media (prefers-reduced-motion: reduce) { .scene *, .scene *::before { animation: none !important; } }
`;
