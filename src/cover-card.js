/*
 * Cover Card for Home Assistant
 * https://github.com/juju35/ha-cover-card
 *
 * Lovelace cards for the `cover` domain, whatever the integration: roller shutters, blinds, shades, curtains,
 * awnings, garage doors, gates, doors, roof windows and dampers. The picture follows the device class and the
 * position, and is itself the position slider; tilt, favorite positions and group actions follow the features
 * each cover reports (supported_features).
 */

const VERSION = "__VERSION__";

// CoverEntityFeature (homeassistant/components/cover/__init__.py)
const F = { OPEN: 1, CLOSE: 2, SET_POSITION: 4, STOP: 8, OPEN_TILT: 16, CLOSE_TILT: 32, STOP_TILT: 64, SET_TILT_POSITION: 128 };
const TILT_FEATURES = F.OPEN_TILT | F.CLOSE_TILT | F.STOP_TILT | F.SET_TILT_POSITION;

// Device classes of the cover domain; a cover without one is drawn as a roller shutter.
const CLASSES = ["shutter", "blind", "shade", "curtain", "awning", "garage", "gate", "door", "window", "damper"];
// Open is worth a warning for these (an open garage door, gate, door or window), not for a shutter or a blind.
// The pictures the card draws: the device classes, and pictures found by the cover's name (or forced by
// `device_class`): hinged shutters, whose two leaves fold out on their hinges where a roller shutter rolls up; a
// pergola, whose louvres turn; a swing gate, whose two leaves open on their hinges where a sliding gate's leaf slides;
// a barrier, whose arm lifts.
const PICTURES = ["shutter", "hinged", ...CLASSES.slice(1, 5), "pergola", ...CLASSES.slice(5, 7), "swing", "barrier", ...CLASSES.slice(7)];
const GUARDED = new Set(["garage", "gate", "swing", "barrier", "door", "window"]);
// Moving these lets someone in or closes on someone: unless `confirm` says otherwise, opening, closing or setting
// their position asks first.
const SECURED = new Set(["garage", "gate", "swing", "barrier", "door"]);
// Gates whose pedestrian opening the card looks for on their device.
const GATES = new Set(["gate", "swing"]);

// Material Design Icons (Apache 2.0, https://pictogrammers.com): [closed, open] per device class, and the buttons.
const ICONS = {
  shutter: [
    "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z",
    "M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9Z",
  ],
  blind: [
    "M3,2H21A1,1 0 0,1 22,3V5A1,1 0 0,1 21,6H20V13A1,1 0 0,1 19,14H13V16.17C14.17,16.58 15,17.69 15,19A3,3 0 0,1 12,22A3,3 0 0,1 9,19C9,17.69 9.83,16.58 11,16.17V14H5A1,1 0 0,1 4,13V6H3A1,1 0 0,1 2,5V3A1,1 0 0,1 3,2M12,18A1,1 0 0,0 11,19A1,1 0 0,0 12,20A1,1 0 0,0 13,19A1,1 0 0,0 12,18Z",
    "M3 2H21C21.55 2 22 2.45 22 3V5C22 5.55 21.55 6 21 6H20V7C20 7.55 19.55 8 19 8H13V10.17C14.17 10.58 15 11.7 15 13C15 14.66 13.66 16 12 16C10.34 16 9 14.66 9 13C9 11.69 9.84 10.58 11 10.17V8H5C4.45 8 4 7.55 4 7V6H3C2.45 6 2 5.55 2 5V3C2 2.45 2.45 2 3 2M12 12C11.45 12 11 12.45 11 13C11 13.55 11.45 14 12 14C12.55 14 13 13.55 13 13C13 12.45 12.55 12 12 12Z",
  ],
  shade: [
    "M20 19V3H4V19H2V21H10.25C10.25 21.97 11.03 22.75 12 22.75S13.75 21.97 13.75 21H22V19H20M6 19V17H11V19H6M13 19V17H18V19H13Z",
    "M20 19V3H4V19H2V21H22V19H20M6 19V13H11V14.8C10.6 15.1 10.2 15.6 10.2 16.2C10.2 17.2 11 18 12 18S13.8 17.2 13.8 16.2C13.8 15.6 13.5 15.1 13 14.8V13H18V19H6Z",
  ],
  curtain: [
    "M23 3H1V1H23V3M2 22H11V4H2V22M22 4H13V22H22V4Z",
    "M23 3H1V1H23V3M2 22H6C6 19 4 17 4 17C10 13 11 4 11 4H2V22M22 4H13C13 4 14 13 20 17C20 17 18 19 18 22H22V4Z",
  ],
  // Closed is the retracted cassette, open the unrolled fabric, the way the scene draws it (open = extended).
  awning: [
    "M5.06 7C4.63 7 4.22 7.14 3.84 7.42C3.46 7.7 3.24 8.06 3.14 8.5L2.11 12.91C1.86 14 2.06 14.92 2.69 15.73C2.81 15.85 2.93 15.97 3.04 16.07C3.63 16.64 4.28 17 5.22 17C6.16 17 6.91 16.59 7.47 16.05C8.1 16.67 8.86 17 9.8 17C10.64 17 11.44 16.63 12 16.07C12.68 16.7 13.45 17 14.3 17C15.17 17 15.91 16.67 16.54 16.05C17.11 16.62 17.86 17 18.81 17C19.76 17 20.43 16.65 21 16.06C21.09 15.97 21.18 15.87 21.28 15.77C21.94 14.95 22.14 14 21.89 12.91L20.86 8.5C20.73 8.06 20.5 7.7 20.13 7.42C19.77 7.14 19.38 7 18.94 7H5.06Z",
    "M5.06 7C4.63 7 4.22 7.14 3.84 7.42C3.46 7.7 3.24 8.06 3.14 8.5L2.11 12.91C1.86 14 2.06 14.92 2.69 15.73C2.81 15.85 2.93 15.97 3.04 16.07C3.63 16.64 4.28 17 5.22 17C6.16 17 6.91 16.59 7.47 16.05C8.1 16.67 8.86 17 9.8 17C10.64 17 11.44 16.63 12 16.07C12.68 16.7 13.45 17 14.3 17C15.17 17 15.91 16.67 16.54 16.05C17.11 16.62 17.86 17 18.81 17C19.76 17 20.43 16.65 21 16.06C21.09 15.97 21.18 15.87 21.28 15.77C21.94 14.95 22.14 14 21.89 12.91L20.86 8.5C20.73 8.06 20.5 7.7 20.13 7.42C19.77 7.14 19.38 7 18.94 7H5.06M18.89 8.97L19.97 13.38C20.06 13.81 19.97 14.2 19.69 14.55C19.44 14.86 19.13 15 18.75 15C18.44 15 18.17 14.9 17.95 14.66C17.73 14.43 17.61 14.16 17.58 13.84L16.97 9L18.89 8.97M5.06 9H7.03L6.42 13.84C6.3 14.63 5.91 15 5.25 15C4.84 15 4.53 14.86 4.31 14.55C4.03 14.2 3.94 13.81 4.03 13.38L5.06 9M9.05 9H11V13.7C11 14.05 10.89 14.35 10.64 14.62C10.39 14.88 10.08 15 9.7 15C9.36 15 9.07 14.88 8.84 14.59C8.61 14.3 8.5 14 8.5 13.66V13.5L9.05 9M13 9H14.95L15.5 13.5C15.58 13.92 15.5 14.27 15.21 14.57C14.95 14.87 14.61 15 14.2 15C13.89 15 13.61 14.88 13.36 14.62C13.11 14.35 13 14.05 13 13.7V9Z",
  ],
  garage: [
    "M19,20H17V11H7V20H5V9L12,5L19,9V20M8,12H16V14H8V12M8,15H16V17H8V15M16,18V20H8V18H16Z",
    "M19,20H17V11H7V20H5V9L12,5L19,9V20M8,12H16V14H8V12Z",
  ],
  gate: [
    "M9 6V11H7V7H5V11H3V9H1V21H3V19H5V21H7V19H9V21H11V19H13V21H15V19H17V21H19V19H21V21H23V9H21V11H19V7H17V11H15V6H13V11H11V6H9M3 13H5V17H3V13M7 13H9V17H7V13M11 13H13V17H11V13M15 13H17V17H15V13M19 13H21V17H19V13Z",
    "M7 21V7H5V11H3V9H1V21H3V19H5V21H7M3 17V13H5V17H3M21 9V11H19V7H17V21H19V19H21V21H23V9H21M21 17H19V13H21V17Z",
  ],
  door: [
    "M16,11H18V13H16V11M12,3H19C20.11,3 21,3.89 21,5V19H22V21H2V19H10V5C10,3.89 10.89,3 12,3M12,5V19H19V5H12Z",
    "M12,3C10.89,3 10,3.89 10,5H3V19H2V21H22V19H21V5C21,3.89 20.11,3 19,3H12M12,5H19V19H12V5M5,11H7V13H5V11Z",
  ],
  window: [
    "M6,11H10V9H14V11H18V4H6V11M18,13H6V20H18V13M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2Z",
    "M6,8H10V6H14V8H18V4H6V8M18,10H6V15H18V10M6,20H18V17H6V20M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2Z",
  ],
  damper: [
    "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
    "M12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5M12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4Z",
  ],
  walk: "M14.12,10H19V8.2H15.38L13.38,4.87C13.08,4.37 12.54,4.03 11.92,4.03C11.74,4.03 11.58,4.06 11.42,4.11L6,5.8V11H7.8V7.33L9.91,6.67L6,22H7.8L10.67,13.89L13,17V22H14.8V15.59L12.31,11.05L13.04,8.18M14,3.8C15,3.8 15.8,3 15.8,2C15.8,1 15,0.2 14,0.2C13,0.2 12.2,1 12.2,2C12.2,3 13,3.8 14,3.8Z",
  open: "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z",
  close: "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z",
  stop: "M18,18H6V6H18V18Z",
  tilt_open: "M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z",
  tilt_close: "M19,6.41L17.59,5L7,15.59V9H5V19H15V17H8.41L19,6.41Z",
  tilt: "M20,19H4.09L14.18,4.43L15.82,5.57L11.28,12.13C12.89,12.96 14,14.62 14,16.54C14,16.7 14,16.85 13.97,17H20V19M7.91,17H11.96C12,16.85 12,16.7 12,16.54C12,15.28 11.24,14.22 10.14,13.78L7.91,17Z",
  // mdi:arrow-collapse-up / mdi:arrow-collapse-down: the automatic opening and closing of the schedule.
  sch_open: "M4.08,11.92L12,4L19.92,11.92L18.5,13.33L13,7.83V22H11V7.83L5.5,13.33L4.08,11.92M12,4H22V2H2V4H12Z",
  sch_close: "M19.92,12.08L12,20L4.08,12.08L5.5,10.67L11,16.17V2H13V16.17L18.5,10.66L19.92,12.08M12,20H2V22H22V20H12Z",
  star: "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z",
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  // mdi:arrow-expand and mdi:arrow-collapse (mini card detail button)
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
};
// A swing gate shows the gate icons; mdi:boom-gate / boom-gate-up for a barrier, mdi:window-closed-variant /
// window-open-variant for hinged shutters, and a pergola drawn the same way (roof closed / louvres open).
ICONS.swing = ICONS.gate;
ICONS.barrier = [
  "M20,9H8.22C7.11,7.77 5.21,7.68 4,8.8C3.36,9.36 3,10.16 3,11V20A1,1 0 0,0 2,21V22H10V21A1,1 0 0,0 9,20V13H20A2,2 0 0,0 22,11A2,2 0 0,0 20,9M6,12.5A1.5,1.5 0 0,1 4.5,11A1.5,1.5 0 0,1 6,9.5A1.5,1.5 0 0,1 7.5,11A1.5,1.5 0 0,1 6,12.5M10.5,12L9,10H10.5L12,12H10.5M14.5,12L13,10H14.5L16,12H14.5M18.5,12L17,10H18.5L20,12H18.5Z",
  "M19.9 3C19.3 2 18.1 1.7 17.2 2.3L6.9 8.2C6.6 8.1 6.3 8 6 8C4.3 8 3 9.3 3 11V20C2.4 20 2 20.4 2 21V22H10V21C10 20.4 9.6 20 9 20V11.6L19.1 5.8C20.1 5.2 20.4 4 19.9 3M6 12.5C5.2 12.5 4.5 11.8 4.5 11S5.2 9.5 6 9.5 7.5 10.2 7.5 11 6.8 12.5 6 12.5M10.4 9.6L8.1 8.6L9.4 7.8L11.7 8.8L10.4 9.6M13.9 7.6L11.6 6.6L12.9 5.8L15.2 6.8L13.9 7.6M17.3 5.6L15 4.6L16.3 3.8L18.6 4.8L17.3 5.6",
];
ICONS.hinged = [
  "M21 20V2H3V20H1V23H23V20M19 4V11H13V4M5 4H11V11H5M5 20V13H11V20M13 20V13H19V20Z",
  "M21 20V2H3V20H1V23H23V20M19 4V11H17V4M5 4H7V11H5M5 20V13H7V20M9 20V4H15V20M17 20V13H19V20Z",
];
ICONS.pergola = [
  "M2 3H22V5H20V21H18V5H6V21H4V5H2V3M6 6H18V8.5H6V6Z",
  "M2 3H22V5H20V21H18V5H6V21H4V5H2V3M7 6.2L8.2 5.5L9.6 7.8L8.4 8.5L7 6.2M10.4 6.2L11.6 5.5L13 7.8L11.8 8.5L10.4 6.2M13.8 6.2L15 5.5L16.4 7.8L15.2 8.5L13.8 6.2Z",
];
const STRINGS = {
  en: {
    covers: "Covers",
    open: "Open",
    close: "Close",
    stop: "Stop",
    open_all: "Open all",
    close_all: "Close all",
    tilt: "Tilt",
    tilt_open: "Open the slats",
    tilt_close: "Close the slats",
    tilt_stop: "Stop the slats",
    position_of: "Position of {name}",
    tilt_of: "Tilt of {name}",
    move: "Move",
    move_to: "Move to {to}",
    cancel: "Cancel",
    partly_open: "Partly open",
    s_open: "Open",
    s_closed: "Closed",
    s_opening: "Opening",
    s_closing: "Closing",
    s_unavailable: "Unavailable",
    s_unknown: "Unknown",
    all_open: "All open",
    all_closed: "All closed",
    n_open: "{n} open",
    n_moving: "{n} moving",
    n_covers: "{n} covers",
    average: "average {pct}",
    c_shutter: "Roller shutter",
    c_blind: "Blind",
    c_shade: "Shade",
    c_curtain: "Curtain",
    c_awning: "Awning",
    c_garage: "Garage door",
    c_gate: "Gate",
    c_swing: "Swing gate",
    c_barrier: "Barrier",
    c_hinged: "Hinged shutters",
    c_pergola: "Pergola",
    c_door: "Door",
    c_window: "Window",
    c_damper: "Damper",
    pedestrian: "Pedestrian",
    confirm_open: "Open {name}?",
    confirm_close: "Close {name}?",
    confirm_open_all: "Open all {n} covers?",
    confirm_close_all: "Close all {n} covers?",
    confirm_move: "Move {name} to {to}?",
    confirm_move_all: "Move {n} covers to {to}?",
    confirm_pedestrian: "Open {name} for a pedestrian?",
    not_found: "Entity not found",
    no_entities: "Choose at least one cover: entity, entities or area.",
    unknown_area: "Area not found: {area}",
    empty_area: "No cover in the area {area}.",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    lang_auto: "Automatic",
    class_auto: "Automatic (device class)",
    e_entities: "Covers",
    e_area: "Area",
    e_title: "Title (optional)",
    e_device_class: "Picture",
    e_favorites: "Favorite positions (%)",
    e_show_title: "Show title",
    e_show_subtitle: "Show subtitle",
    e_show_controls: "Show open / stop / close buttons",
    e_show_group_controls: "Show the buttons for all covers",
    e_show_tilt: "Show tilt",
    e_show_favorites: "Show favorite positions",
    e_expanded: "Unfold every cover",
    e_confirm: "Ask before opening or closing",
    e_pedestrian: "Pedestrian opening",
    e_light: "Pergola light",
    e_columns: "Columns",
    e_zoom: "Detail button",
    e_language: "Language",
    h_area: "Adds every cover of this area to the list",
    h_favorites: "Pick or type positions; each becomes a button",
    h_device_class: "Drawn picture, when the device class of the covers does not match",
    h_pedestrian: "A position in % (e.g. 30), or a button, script or switch to press; else the gate's own pedestrian button, when its device has one",
    h_light: "The pergola's light (LED strip), drawn lit under its louvres while on",
    h_columns: "With several covers: 1 shows foldable rows, 2 or 3 a grid of unfolded tiles",
    h_zoom: "Button at the top right that switches the mini card to the full card and back",
    confirm_auto: "Garage doors, gates and doors",
    confirm_always: "Always",
    confirm_never: "Never",
    e_invert: "Invert position",
    h_invert: "For a cover whose integration reports the position the wrong way round (often an awning)",
    e_no_feedback: "No state feedback",
    h_no_feedback: "For a cover that never reports its state back (a radio RTS motor): draw it closed at rest",
    e_illustration: "Animated illustration",
    e_illustration_theme: "Illustration theme",
    theme_auto: "Automatic: night with a dark theme, day with a light theme",
    theme_day: "Day",
    theme_night: "Night",
    sch_title: "Automatic schedule",
    sch_opens: "Opens",
    sch_closes: "Closes",
    sch_opened: "Opened",
    sch_closed: "Closed",
    sch_tomorrow: "tomorrow",
    sch_in: "in {d}",
    sch_skipped: "skipped",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Automatic opening time",
    e_close_time: "Automatic closing time",
    e_open_condition: "Automatic opening enabled",
    e_close_condition: "Automatic closing enabled",
    e_show_schedule: "Show the automatic schedule",
    h_open_time: "A sensor or input_datetime holding the time (HH:MM) or the date and time of the next automatic opening",
    h_close_time: "A sensor or input_datetime holding the time (HH:MM) or the date and time of the next automatic closing",
    h_open_condition: "An on/off entity (input_boolean, binary_sensor, schedule…): while it is off, the opening is shown as skipped",
    h_close_condition: "An on/off entity (input_boolean, binary_sensor, schedule…): while it is off, the closing is shown as skipped",
  },
  fr: {
    covers: "Ouvrants",
    open: "Ouvrir",
    close: "Fermer",
    stop: "Stop",
    open_all: "Tout ouvrir",
    close_all: "Tout fermer",
    tilt: "Inclinaison",
    tilt_open: "Ouvrir les lames",
    tilt_close: "Fermer les lames",
    tilt_stop: "Arrêter les lames",
    position_of: "Position de {name}",
    tilt_of: "Inclinaison de {name}",
    move: "Déplacer",
    move_to: "Aller à {to}",
    cancel: "Annuler",
    partly_open: "Partiellement ouvert",
    s_open: "Ouvert",
    s_closed: "Fermé",
    s_opening: "Ouverture",
    s_closing: "Fermeture",
    s_unavailable: "Indisponible",
    s_unknown: "Inconnu",
    all_open: "Tout ouvert",
    all_closed: "Tout fermé",
    n_open: "Ouverts : {n}",
    n_moving: "En mouvement : {n}",
    n_covers: "{n} ouvrants",
    average: "moyenne {pct}",
    c_shutter: "Volet roulant",
    c_blind: "Store vénitien",
    c_shade: "Store enrouleur",
    c_curtain: "Rideau",
    c_awning: "Store banne",
    c_garage: "Porte de garage",
    c_gate: "Portail",
    c_swing: "Portail battant",
    c_barrier: "Barrière levante",
    c_hinged: "Volets battants",
    c_pergola: "Pergola",
    c_door: "Porte",
    c_window: "Fenêtre",
    c_damper: "Clapet",
    pedestrian: "Piéton",
    confirm_open: "Ouvrir {name} ?",
    confirm_close: "Fermer {name} ?",
    confirm_open_all: "Ouvrir les {n} ouvrants ?",
    confirm_close_all: "Fermer les {n} ouvrants ?",
    confirm_move: "Déplacer {name} à {to} ?",
    confirm_move_all: "Déplacer {n} ouvrants à {to} ?",
    confirm_pedestrian: "Ouvrir {name} pour un piéton ?",
    not_found: "Entité introuvable",
    no_entities: "Choisissez au moins un ouvrant : entity, entities ou area.",
    unknown_area: "Pièce introuvable : {area}",
    empty_area: "Aucun ouvrant dans la pièce {area}.",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    lang_auto: "Automatique",
    class_auto: "Automatique (classe d'appareil)",
    e_entities: "Ouvrants",
    e_area: "Pièce",
    e_title: "Titre (facultatif)",
    e_device_class: "Illustration",
    e_favorites: "Positions favorites (%)",
    e_show_title: "Afficher le titre",
    e_show_subtitle: "Afficher le sous-titre",
    e_show_controls: "Afficher les boutons ouvrir / stop / fermer",
    e_show_group_controls: "Afficher les boutons pour tous les ouvrants",
    e_show_tilt: "Afficher l'inclinaison",
    e_show_favorites: "Afficher les positions favorites",
    e_expanded: "Déplier chaque ouvrant",
    e_confirm: "Demander avant d'ouvrir ou de fermer",
    e_pedestrian: "Ouverture piéton",
    e_light: "Éclairage de la pergola",
    e_columns: "Colonnes",
    e_zoom: "Bouton détail",
    e_language: "Langue",
    h_area: "Ajoute à la liste tous les ouvrants de cette pièce",
    h_favorites: "Choisissez ou saisissez des positions ; chacune devient un bouton",
    h_device_class: "Illustration dessinée, quand la classe d'appareil des ouvrants ne convient pas",
    h_pedestrian: "Une position en % (ex. 30), ou un bouton, script ou interrupteur à actionner ; sinon le bouton piéton du portail, si son appareil en a un",
    h_light: "L'éclairage de la pergola (ruban LED), dessiné allumé sous ses lames quand il est allumé",
    h_columns: "Avec plusieurs ouvrants : 1 affiche des lignes repliables, 2 ou 3 une grille de vignettes dépliées",
    h_zoom: "Bouton en haut à droite qui passe la mini-carte en carte complète et inversement",
    confirm_auto: "Portes de garage, portails et portes",
    confirm_always: "Toujours",
    confirm_never: "Jamais",
    e_invert: "Inverser la position",
    h_invert: "Pour un ouvrant dont l'intégration remonte la position à l'envers (souvent un store banne)",
    e_no_feedback: "Aucun retour d'état",
    h_no_feedback: "Pour un ouvrant qui ne remonte jamais son état (un moteur radio RTS) : dessiné fermé au repos",
    e_illustration: "Illustration animée",
    e_illustration_theme: "Thème de l’illustration",
    theme_auto: "Automatique : nuit avec un thème sombre, jour avec un thème clair",
    theme_day: "Jour",
    theme_night: "Nuit",
    sch_title: "Horaires automatiques",
    sch_opens: "Ouverture",
    sch_closes: "Fermeture",
    sch_opened: "Ouvert",
    sch_closed: "Fermé",
    sch_tomorrow: "demain",
    sch_in: "dans {d}",
    sch_skipped: "sautée",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m}",
    e_open_time: "Heure d'ouverture automatique",
    e_close_time: "Heure de fermeture automatique",
    e_open_condition: "Ouverture automatique active",
    e_close_condition: "Fermeture automatique active",
    e_show_schedule: "Afficher les horaires automatiques",
    h_open_time: "Un capteur ou input_datetime donnant l'heure (HH:MM) ou la date et l'heure de la prochaine ouverture automatique",
    h_close_time: "Un capteur ou input_datetime donnant l'heure (HH:MM) ou la date et l'heure de la prochaine fermeture automatique",
    h_open_condition: "Une entité on/off (input_boolean, binary_sensor, schedule…) : tant qu'elle est à off, l'ouverture est affichée comme sautée",
    h_close_condition: "Une entité on/off (input_boolean, binary_sensor, schedule…) : tant qu'elle est à off, la fermeture est affichée comme sautée",
  },
  de: {
    covers: "Abdeckungen",
    open: "Öffnen",
    close: "Schließen",
    stop: "Stopp",
    open_all: "Alle öffnen",
    close_all: "Alle schließen",
    tilt: "Neigung",
    tilt_open: "Lamellen öffnen",
    tilt_close: "Lamellen schließen",
    tilt_stop: "Lamellen stoppen",
    position_of: "Position von {name}",
    tilt_of: "Neigung von {name}",
    move: "Bewegen",
    move_to: "Auf {to} fahren",
    cancel: "Abbrechen",
    partly_open: "Teilweise offen",
    s_open: "Offen",
    s_closed: "Geschlossen",
    s_opening: "Öffnet",
    s_closing: "Schließt",
    s_unavailable: "Nicht verfügbar",
    s_unknown: "Unbekannt",
    all_open: "Alle offen",
    all_closed: "Alle geschlossen",
    n_open: "Offen: {n}",
    n_moving: "In Bewegung: {n}",
    n_covers: "{n} Abdeckungen",
    average: "Durchschnitt {pct}",
    c_shutter: "Rollladen",
    c_blind: "Jalousie",
    c_shade: "Rollo",
    c_curtain: "Vorhang",
    c_awning: "Markise",
    c_garage: "Garagentor",
    c_gate: "Tor",
    c_swing: "Flügeltor",
    c_barrier: "Schranke",
    c_hinged: "Klappläden",
    c_pergola: "Pergola",
    c_door: "Tür",
    c_window: "Fenster",
    c_damper: "Klappe",
    pedestrian: "Fußgänger",
    confirm_open: "{name} öffnen?",
    confirm_close: "{name} schließen?",
    confirm_open_all: "Alle {n} Abdeckungen öffnen?",
    confirm_close_all: "Alle {n} Abdeckungen schließen?",
    confirm_move: "{name} auf {to} fahren?",
    confirm_move_all: "{n} Abdeckungen auf {to} fahren?",
    confirm_pedestrian: "{name} für Fußgänger öffnen?",
    not_found: "Entität nicht gefunden",
    no_entities: "Wähle mindestens eine Abdeckung: entity, entities oder area.",
    unknown_area: "Bereich nicht gefunden: {area}",
    empty_area: "Keine Abdeckung im Bereich {area}.",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zur kompakten Ansicht zurückkehren",
    lang_auto: "Automatisch",
    class_auto: "Automatisch (Geräteklasse)",
    e_entities: "Abdeckungen",
    e_area: "Bereich",
    e_title: "Titel (optional)",
    e_device_class: "Bild",
    e_favorites: "Lieblingspositionen (%)",
    e_show_title: "Titel anzeigen",
    e_show_subtitle: "Untertitel anzeigen",
    e_show_controls: "Schaltflächen Öffnen / Stopp / Schließen anzeigen",
    e_show_group_controls: "Schaltflächen für alle Abdeckungen anzeigen",
    e_show_tilt: "Neigung anzeigen",
    e_show_favorites: "Lieblingspositionen anzeigen",
    e_expanded: "Jede Abdeckung aufklappen",
    e_confirm: "Vor dem Öffnen oder Schließen nachfragen",
    e_pedestrian: "Fußgängeröffnung",
    e_light: "Pergola-Beleuchtung",
    e_columns: "Spalten",
    e_zoom: "Detail-Schaltfläche",
    e_language: "Sprache",
    h_area: "Fügt alle Abdeckungen dieses Bereichs zur Liste hinzu",
    h_favorites: "Positionen wählen oder eingeben; jede wird zu einer Schaltfläche",
    h_device_class: "Gezeichnetes Bild, wenn die Geräteklasse der Abdeckungen nicht passt",
    h_pedestrian: "Eine Position in % (z. B. 30) oder eine Taste, ein Skript oder ein Schalter; sonst die Fußgängertaste des Tors, wenn sein Gerät eine hat",
    h_light: "Die Beleuchtung der Pergola (LED-Streifen), unter den Lamellen leuchtend gezeichnet, solange sie an ist",
    h_columns: "Bei mehreren Abdeckungen: 1 zeigt einklappbare Zeilen, 2 oder 3 ein Raster aufgeklappter Kacheln",
    h_zoom: "Schaltfläche oben rechts, um zwischen kompakter und vollständiger Kartenansicht zu wechseln",
    confirm_auto: "Garagentore, Tore und Türen",
    confirm_always: "Immer",
    confirm_never: "Nie",
    e_invert: "Position umkehren",
    h_invert: "Für eine Abdeckung, deren Integration die Position umgekehrt meldet (oft eine Markise)",
    e_no_feedback: "Keine Statusrückmeldung",
    h_no_feedback: "Für eine Abdeckung, die ihren Zustand nie zurückmeldet (ein RTS-Funkmotor): im Ruhezustand geschlossen gezeichnet",
    e_illustration: "Animierte Illustration",
    e_illustration_theme: "Thema der Illustration",
    theme_auto: "Automatisch: Nacht bei dunklem Thema, Tag bei hellem Thema",
    theme_day: "Tag",
    theme_night: "Nacht",
    sch_title: "Automatischer Zeitplan",
    sch_opens: "Öffnet",
    sch_closes: "Schließt",
    sch_opened: "Geöffnet",
    sch_closed: "Geschlossen",
    sch_tomorrow: "morgen",
    sch_in: "in {d}",
    sch_skipped: "übersprungen",
    dur_m: "{m} Min.",
    dur_h: "{h} Std.",
    dur_hm: "{h} Std. {m} Min.",
    e_open_time: "Automatische Öffnungszeit",
    e_close_time: "Automatische Schließzeit",
    e_open_condition: "Automatisches Öffnen aktiv",
    e_close_condition: "Automatisches Schließen aktiv",
    e_show_schedule: "Automatischen Zeitplan anzeigen",
    h_open_time: "Ein Sensor oder input_datetime mit der Uhrzeit (HH:MM) oder Datum und Uhrzeit des nächsten automatischen Öffnens",
    h_close_time: "Ein Sensor oder input_datetime mit der Uhrzeit (HH:MM) oder Datum und Uhrzeit des nächsten automatischen Schließens",
    h_open_condition: "Eine Ein/Aus-Entität (input_boolean, binary_sensor, schedule…): solange sie aus ist, wird das Öffnen als übersprungen angezeigt",
    h_close_condition: "Eine Ein/Aus-Entität (input_boolean, binary_sensor, schedule…): solange sie aus ist, wird das Schließen als übersprungen angezeigt",
  },
  es: {
    covers: "Cerramientos",
    open: "Abrir",
    close: "Cerrar",
    stop: "Detener",
    open_all: "Abrir todo",
    close_all: "Cerrar todo",
    tilt: "Inclinación",
    tilt_open: "Abrir las lamas",
    tilt_close: "Cerrar las lamas",
    tilt_stop: "Detener las lamas",
    position_of: "Posición de {name}",
    tilt_of: "Inclinación de {name}",
    move: "Mover",
    move_to: "Ir a {to}",
    cancel: "Cancelar",
    partly_open: "Parcialmente abierto",
    s_open: "Abierto",
    s_closed: "Cerrado",
    s_opening: "Abriendo",
    s_closing: "Cerrando",
    s_unavailable: "No disponible",
    s_unknown: "Desconocido",
    all_open: "Todo abierto",
    all_closed: "Todo cerrado",
    n_open: "Abiertos: {n}",
    n_moving: "En movimiento: {n}",
    n_covers: "{n} cerramientos",
    average: "media {pct}",
    c_shutter: "Persiana enrollable",
    c_blind: "Persiana veneciana",
    c_shade: "Estor enrollable",
    c_curtain: "Cortina",
    c_awning: "Toldo",
    c_garage: "Puerta de garaje",
    c_gate: "Portón",
    c_swing: "Puerta batiente",
    c_barrier: "Barrera",
    c_hinged: "Contraventanas",
    c_pergola: "Pérgola",
    c_door: "Puerta",
    c_window: "Ventana",
    c_damper: "Compuerta",
    pedestrian: "Peatonal",
    confirm_open: "¿Abrir {name}?",
    confirm_close: "¿Cerrar {name}?",
    confirm_open_all: "¿Abrir los {n} cerramientos?",
    confirm_close_all: "¿Cerrar los {n} cerramientos?",
    confirm_move: "¿Mover {name} a {to}?",
    confirm_move_all: "¿Mover {n} cerramientos a {to}?",
    confirm_pedestrian: "¿Abrir {name} en modo peatonal?",
    not_found: "Entidad no encontrada",
    no_entities: "Elige al menos un cerramiento: entity, entities o area.",
    unknown_area: "Área no encontrada: {area}",
    empty_area: "Ningún cerramiento en el área {area}.",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    lang_auto: "Automático",
    class_auto: "Automático (clase de dispositivo)",
    e_entities: "Cerramientos",
    e_area: "Área",
    e_title: "Título (opcional)",
    e_device_class: "Ilustración",
    e_favorites: "Posiciones favoritas (%)",
    e_show_title: "Mostrar el título",
    e_show_subtitle: "Mostrar el subtítulo",
    e_show_controls: "Mostrar los botones abrir / detener / cerrar",
    e_show_group_controls: "Mostrar los botones para todos los cerramientos",
    e_show_tilt: "Mostrar la inclinación",
    e_show_favorites: "Mostrar las posiciones favoritas",
    e_expanded: "Desplegar cada cerramiento",
    e_confirm: "Preguntar antes de abrir o cerrar",
    e_pedestrian: "Apertura peatonal",
    e_light: "Luz de la pérgola",
    e_columns: "Columnas",
    e_zoom: "Botón de detalle",
    e_language: "Idioma",
    h_area: "Añade a la lista todos los cerramientos de esta área",
    h_favorites: "Elige o escribe posiciones; cada una se convierte en un botón",
    h_device_class: "Ilustración dibujada, cuando la clase de dispositivo no corresponde",
    h_pedestrian: "Una posición en % (p. ej. 30), o un botón, script o interruptor; si no, el botón peatonal de la puerta, si su dispositivo tiene uno",
    h_light: "La luz de la pérgola (tira LED), dibujada encendida bajo sus lamas mientras está encendida",
    h_columns: "Con varios cerramientos: 1 muestra filas plegables, 2 o 3 una cuadrícula de mosaicos desplegados",
    h_zoom: "Botón arriba a la derecha que cambia la minitarjeta a la tarjeta completa y viceversa",
    confirm_auto: "Puertas de garaje, portones y puertas",
    confirm_always: "Siempre",
    confirm_never: "Nunca",
    e_invert: "Invertir la posición",
    h_invert: "Para una cubierta cuya integración informa la posición al revés (a menudo un toldo)",
    e_no_feedback: "Sin información de estado",
    h_no_feedback: "Para una cubierta que nunca informa su estado (un motor de radio RTS): dibujada cerrada en reposo",
    e_illustration: "Ilustración animada",
    e_illustration_theme: "Tema de la ilustración",
    theme_auto: "Automático: noche con un tema oscuro, día con un tema claro",
    theme_day: "Día",
    theme_night: "Noche",
    sch_title: "Horario automático",
    sch_opens: "Abre",
    sch_closes: "Cierra",
    sch_opened: "Abierta",
    sch_closed: "Cerrada",
    sch_tomorrow: "mañana",
    sch_in: "en {d}",
    sch_skipped: "omitida",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Hora de apertura automática",
    e_close_time: "Hora de cierre automático",
    e_open_condition: "Apertura automática activa",
    e_close_condition: "Cierre automático activo",
    e_show_schedule: "Mostrar el horario automático",
    h_open_time: "Un sensor o input_datetime con la hora (HH:MM) o la fecha y hora de la próxima apertura automática",
    h_close_time: "Un sensor o input_datetime con la hora (HH:MM) o la fecha y hora del próximo cierre automático",
    h_open_condition: "Una entidad on/off (input_boolean, binary_sensor, schedule…): mientras esté en off, la apertura se muestra como omitida",
    h_close_condition: "Una entidad on/off (input_boolean, binary_sensor, schedule…): mientras esté en off, el cierre se muestra como omitido",
  },
  sr: {
    covers: "Затварачи",
    open: "Отвори",
    close: "Затвори",
    stop: "Стоп",
    open_all: "Отвори све",
    close_all: "Затвори све",
    tilt: "Нагиб",
    tilt_open: "Отвори ламеле",
    tilt_close: "Затвори ламеле",
    tilt_stop: "Заустави ламеле",
    position_of: "Положај: {name}",
    tilt_of: "Нагиб: {name}",
    move: "Помери",
    move_to: "Помери на {to}",
    cancel: "Откажи",
    partly_open: "Делимично отворено",
    s_open: "Отворено",
    s_closed: "Затворено",
    s_opening: "Отвара се",
    s_closing: "Затвара се",
    s_unavailable: "Недоступно",
    s_unknown: "Непознато",
    all_open: "Све отворено",
    all_closed: "Све затворено",
    n_open: "Отворено: {n}",
    n_moving: "У покрету: {n}",
    n_covers: "Затварача: {n}",
    average: "просек {pct}",
    c_shutter: "Ролетна",
    c_blind: "Венецијанер",
    c_shade: "Роло завеса",
    c_curtain: "Завеса",
    c_awning: "Тенда",
    c_garage: "Гаражна врата",
    c_gate: "Капија",
    c_swing: "Крилна капија",
    c_barrier: "Рампа",
    c_hinged: "Капци",
    c_pergola: "Пергола",
    c_door: "Врата",
    c_window: "Прозор",
    c_damper: "Клапна",
    pedestrian: "Пешачки",
    confirm_open: "Отворити {name}?",
    confirm_close: "Затворити {name}?",
    confirm_open_all: "Отворити све затвараче ({n})?",
    confirm_close_all: "Затворити све затвараче ({n})?",
    confirm_move: "Померити {name} на {to}?",
    confirm_move_all: "Померити затвараче ({n}) на {to}?",
    confirm_pedestrian: "Отворити {name} за пешака?",
    not_found: "Ентитет није пронађен",
    no_entities: "Изаберите бар један затварач: entity, entities или area.",
    unknown_area: "Простор није пронађен: {area}",
    empty_area: "Нема затварача у простору {area}.",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на компактни приказ",
    lang_auto: "Аутоматски",
    class_auto: "Аутоматски (класа уређаја)",
    e_entities: "Затварачи",
    e_area: "Простор",
    e_title: "Наслов (опционо)",
    e_device_class: "Илустрација",
    e_favorites: "Омиљени положаји (%)",
    e_show_title: "Прикажи наслов",
    e_show_subtitle: "Прикажи поднаслов",
    e_show_controls: "Прикажи дугмад отвори / стоп / затвори",
    e_show_group_controls: "Прикажи дугмад за све затвараче",
    e_show_tilt: "Прикажи нагиб",
    e_show_favorites: "Прикажи омиљене положаје",
    e_expanded: "Прошири сваки затварач",
    e_confirm: "Питај пре отварања или затварања",
    e_pedestrian: "Пешачко отварање",
    e_light: "Светло перголе",
    e_columns: "Колоне",
    e_zoom: "Дугме за детаље",
    e_language: "Језик",
    h_area: "Додаје на листу све затвараче овог простора",
    h_favorites: "Изаберите или унесите положаје; сваки постаје дугме",
    h_device_class: "Нацртана илустрација, када класа уређаја не одговара",
    h_pedestrian: "Положај у % (нпр. 30) или дугме, скрипта или прекидач; иначе пешачко дугме капије, ако га уређај има",
    h_light: "Светло перголе (LED трака), нацртано упаљено испод ламела док је укључено",
    h_columns: "Са више затварача: 1 приказује редове који се скупљају, 2 или 3 мрежу проширених плочица",
    h_zoom: "Дугме горе десно које пребацује мини картицу на пуну картицу и назад",
    confirm_auto: "Гаражна врата, капије и врата",
    confirm_always: "Увек",
    confirm_never: "Никад",
    e_invert: "Обрни положај",
    h_invert: "За застор чија интеграција пријављује положај обрнуто (често тенда)",
    e_no_feedback: "Без повратне информације о стању",
    h_no_feedback: "За застор који никада не пријављује своје стање (радио RTS мотор): нацртан затворено у мировању",
    e_illustration: "Анимирана илустрација",
    e_illustration_theme: "Тема илустрације",
    theme_auto: "Аутоматски: ноћ уз тамну тему, дан уз светлу тему",
    theme_day: "Дан",
    theme_night: "Ноћ",
    sch_title: "Аутоматски распоред",
    sch_opens: "Отвара се",
    sch_closes: "Затвара се",
    sch_opened: "Отворено",
    sch_closed: "Затворено",
    sch_tomorrow: "сутра",
    sch_in: "за {d}",
    sch_skipped: "прескочено",
    dur_m: "{m} мин",
    dur_h: "{h} ч",
    dur_hm: "{h} ч {m} мин",
    e_open_time: "Време аутоматског отварања",
    e_close_time: "Време аутоматског затварања",
    e_open_condition: "Аутоматско отварање укључено",
    e_close_condition: "Аутоматско затварање укључено",
    e_show_schedule: "Прикажи аутоматски распоред",
    h_open_time: "Сензор или input_datetime са временом (HH:MM) или датумом и временом следећег аутоматског отварања",
    h_close_time: "Сензор или input_datetime са временом (HH:MM) или датумом и временом следећег аутоматског затварања",
    h_open_condition: "Ентитет укључено/искључено (input_boolean, binary_sensor, schedule…): док је искључен, отварање се приказује као прескочено",
    h_close_condition: "Ентитет укључено/искључено (input_boolean, binary_sensor, schedule…): док је искључен, затварање се приказује као прескочено",
  },
  "sr-Latn": {
    covers: "Zatvarači",
    open: "Otvori",
    close: "Zatvori",
    stop: "Stop",
    open_all: "Otvori sve",
    close_all: "Zatvori sve",
    tilt: "Nagib",
    tilt_open: "Otvori lamele",
    tilt_close: "Zatvori lamele",
    tilt_stop: "Zaustavi lamele",
    position_of: "Položaj: {name}",
    tilt_of: "Nagib: {name}",
    move: "Pomeri",
    move_to: "Pomeri na {to}",
    cancel: "Otkaži",
    partly_open: "Delimično otvoreno",
    s_open: "Otvoreno",
    s_closed: "Zatvoreno",
    s_opening: "Otvara se",
    s_closing: "Zatvara se",
    s_unavailable: "Nedostupno",
    s_unknown: "Nepoznato",
    all_open: "Sve otvoreno",
    all_closed: "Sve zatvoreno",
    n_open: "Otvoreno: {n}",
    n_moving: "U pokretu: {n}",
    n_covers: "Zatvarača: {n}",
    average: "prosek {pct}",
    c_shutter: "Roletna",
    c_blind: "Venecijaner",
    c_shade: "Rolo zavesa",
    c_curtain: "Zavesa",
    c_awning: "Tenda",
    c_garage: "Garažna vrata",
    c_gate: "Kapija",
    c_swing: "Krilna kapija",
    c_barrier: "Rampa",
    c_hinged: "Kapci",
    c_pergola: "Pergola",
    c_door: "Vrata",
    c_window: "Prozor",
    c_damper: "Klapna",
    pedestrian: "Pešački",
    confirm_open: "Otvoriti {name}?",
    confirm_close: "Zatvoriti {name}?",
    confirm_open_all: "Otvoriti sve zatvarače ({n})?",
    confirm_close_all: "Zatvoriti sve zatvarače ({n})?",
    confirm_move: "Pomeriti {name} na {to}?",
    confirm_move_all: "Pomeriti zatvarače ({n}) na {to}?",
    confirm_pedestrian: "Otvoriti {name} za pešaka?",
    not_found: "Entitet nije pronađen",
    no_entities: "Izaberite bar jedan zatvarač: entity, entities ili area.",
    unknown_area: "Prostor nije pronađen: {area}",
    empty_area: "Nema zatvarača u prostoru {area}.",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na kompaktni prikaz",
    lang_auto: "Automatski",
    class_auto: "Automatski (klasa uređaja)",
    e_entities: "Zatvarači",
    e_area: "Prostor",
    e_title: "Naslov (opciono)",
    e_device_class: "Ilustracija",
    e_favorites: "Omiljeni položaji (%)",
    e_show_title: "Prikaži naslov",
    e_show_subtitle: "Prikaži podnaslov",
    e_show_controls: "Prikaži dugmad otvori / stop / zatvori",
    e_show_group_controls: "Prikaži dugmad za sve zatvarače",
    e_show_tilt: "Prikaži nagib",
    e_show_favorites: "Prikaži omiljene položaje",
    e_expanded: "Proširi svaki zatvarač",
    e_confirm: "Pitaj pre otvaranja ili zatvaranja",
    e_pedestrian: "Pešačko otvaranje",
    e_light: "Svetlo pergole",
    e_columns: "Kolone",
    e_zoom: "Dugme za detalje",
    e_language: "Jezik",
    h_area: "Dodaje na listu sve zatvarače ovog prostora",
    h_favorites: "Izaberite ili unesite položaje; svaki postaje dugme",
    h_device_class: "Nacrtana ilustracija, kada klasa uređaja ne odgovara",
    h_pedestrian: "Položaj u % (npr. 30) ili dugme, skripta ili prekidač; inače pešačko dugme kapije, ako ga uređaj ima",
    h_light: "Svetlo pergole (LED traka), nacrtano upaljeno ispod lamela dok je uključeno",
    h_columns: "Sa više zatvarača: 1 prikazuje redove koji se skupljaju, 2 ili 3 mrežu proširenih pločica",
    h_zoom: "Dugme gore desno koje prebacuje mini karticu na punu karticu i nazad",
    confirm_auto: "Garažna vrata, kapije i vrata",
    confirm_always: "Uvek",
    confirm_never: "Nikad",
    e_invert: "Obrni položaj",
    h_invert: "Za zastor čija integracija prijavljuje položaj obrnuto (često tenda)",
    e_no_feedback: "Bez povratne informacije o stanju",
    h_no_feedback: "Za zastor koji nikada ne prijavljuje svoje stanje (radio RTS motor): nacrtan zatvoreno u mirovanju",
    e_illustration: "Animirana ilustracija",
    e_illustration_theme: "Tema ilustracije",
    theme_auto: "Automatski: noć uz tamnu temu, dan uz svetlu temu",
    theme_day: "Dan",
    theme_night: "Noć",
    sch_title: "Automatski raspored",
    sch_opens: "Otvara se",
    sch_closes: "Zatvara se",
    sch_opened: "Otvoreno",
    sch_closed: "Zatvoreno",
    sch_tomorrow: "sutra",
    sch_in: "za {d}",
    sch_skipped: "preskočeno",
    dur_m: "{m} min",
    dur_h: "{h} č",
    dur_hm: "{h} č {m} min",
    e_open_time: "Vreme automatskog otvaranja",
    e_close_time: "Vreme automatskog zatvaranja",
    e_open_condition: "Automatsko otvaranje uključeno",
    e_close_condition: "Automatsko zatvaranje uključeno",
    e_show_schedule: "Prikaži automatski raspored",
    h_open_time: "Senzor ili input_datetime sa vremenom (HH:MM) ili datumom i vremenom sledećeg automatskog otvaranja",
    h_close_time: "Senzor ili input_datetime sa vremenom (HH:MM) ili datumom i vremenom sledećeg automatskog zatvaranja",
    h_open_condition: "Entitet uključeno/isključeno (input_boolean, binary_sensor, schedule…): dok je isključen, otvaranje se prikazuje kao preskočeno",
    h_close_condition: "Entitet uključeno/isključeno (input_boolean, binary_sensor, schedule…): dok je isključen, zatvaranje se prikazuje kao preskočeno",
  },
  it: {
    covers: "Coperture",
    open: "Apri",
    close: "Chiudi",
    stop: "Stop",
    open_all: "Apri tutto",
    close_all: "Chiudi tutto",
    tilt: "Inclinazione",
    tilt_open: "Apri le lamelle",
    tilt_close: "Chiudi le lamelle",
    tilt_stop: "Ferma le lamelle",
    position_of: "Posizione di {name}",
    tilt_of: "Inclinazione di {name}",
    move: "Sposta",
    move_to: "Vai a {to}",
    cancel: "Annulla",
    partly_open: "Parzialmente aperto",
    s_open: "Aperto",
    s_closed: "Chiuso",
    s_opening: "In apertura",
    s_closing: "In chiusura",
    s_unavailable: "Non disponibile",
    s_unknown: "Sconosciuto",
    all_open: "Tutto aperto",
    all_closed: "Tutto chiuso",
    n_open: "Aperte: {n}",
    n_moving: "In movimento: {n}",
    n_covers: "{n} coperture",
    average: "media {pct}",
    c_shutter: "Tapparella",
    c_blind: "Veneziana",
    c_shade: "Tenda a rullo",
    c_curtain: "Tenda",
    c_awning: "Tenda da sole",
    c_garage: "Porta del garage",
    c_gate: "Cancello",
    c_swing: "Cancello a battente",
    c_barrier: "Sbarra",
    c_hinged: "Persiane a battente",
    c_pergola: "Pergola",
    c_door: "Porta",
    c_window: "Finestra",
    c_damper: "Serranda",
    pedestrian: "Pedonale",
    confirm_open: "Aprire {name}?",
    confirm_close: "Chiudere {name}?",
    confirm_open_all: "Aprire tutte le {n} coperture?",
    confirm_close_all: "Chiudere tutte le {n} coperture?",
    confirm_move: "Spostare {name} a {to}?",
    confirm_move_all: "Spostare {n} coperture a {to}?",
    confirm_pedestrian: "Aprire {name} in modalità pedonale?",
    not_found: "Entità non trovata",
    no_entities: "Scegli almeno una copertura: entity, entities o area.",
    unknown_area: "Area non trovata: {area}",
    empty_area: "Nessuna copertura nell'area {area}.",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    lang_auto: "Automatico",
    class_auto: "Automatico (classe del dispositivo)",
    e_entities: "Coperture",
    e_area: "Area",
    e_title: "Titolo (facoltativo)",
    e_device_class: "Illustrazione",
    e_favorites: "Posizioni preferite (%)",
    e_show_title: "Mostra il titolo",
    e_show_subtitle: "Mostra il sottotitolo",
    e_show_controls: "Mostra i pulsanti apri / stop / chiudi",
    e_show_group_controls: "Mostra i pulsanti per tutte le coperture",
    e_show_tilt: "Mostra l'inclinazione",
    e_show_favorites: "Mostra le posizioni preferite",
    e_expanded: "Espandi ogni copertura",
    e_confirm: "Chiedi prima di aprire o chiudere",
    e_pedestrian: "Apertura pedonale",
    e_light: "Luce della pergola",
    e_columns: "Colonne",
    e_zoom: "Pulsante dettagli",
    e_language: "Lingua",
    h_area: "Aggiunge all'elenco tutte le coperture di quest'area",
    h_favorites: "Scegli o scrivi posizioni; ognuna diventa un pulsante",
    h_device_class: "Illustrazione disegnata, quando la classe del dispositivo non corrisponde",
    h_pedestrian: "Una posizione in % (es. 30), oppure un pulsante, script o interruttore; altrimenti il pulsante pedonale del cancello, se il dispositivo ne ha uno",
    h_light: "La luce della pergola (striscia LED), disegnata accesa sotto le lamelle quando è accesa",
    h_columns: "Con più coperture: 1 mostra righe richiudibili, 2 o 3 una griglia di riquadri espansi",
    h_zoom: "Pulsante in alto a destra che passa dalla mini scheda alla scheda completa e viceversa",
    confirm_auto: "Porte del garage, cancelli e porte",
    confirm_always: "Sempre",
    confirm_never: "Mai",
    e_invert: "Inverti la posizione",
    h_invert: "Per una copertura la cui integrazione segnala la posizione al contrario (spesso una tenda da sole)",
    e_no_feedback: "Nessun ritorno di stato",
    h_no_feedback: "Per una copertura che non segnala mai il suo stato (un motore radio RTS): disegnata chiusa a riposo",
    e_illustration: "Illustrazione animata",
    e_illustration_theme: "Tema dell’illustrazione",
    theme_auto: "Automatico: notte con un tema scuro, giorno con un tema chiaro",
    theme_day: "Giorno",
    theme_night: "Notte",
    sch_title: "Orari automatici",
    sch_opens: "Apre",
    sch_closes: "Chiude",
    sch_opened: "Aperta",
    sch_closed: "Chiusa",
    sch_tomorrow: "domani",
    sch_in: "tra {d}",
    sch_skipped: "saltata",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Ora di apertura automatica",
    e_close_time: "Ora di chiusura automatica",
    e_open_condition: "Apertura automatica attiva",
    e_close_condition: "Chiusura automatica attiva",
    e_show_schedule: "Mostra gli orari automatici",
    h_open_time: "Un sensore o input_datetime con l'ora (HH:MM) o la data e l'ora della prossima apertura automatica",
    h_close_time: "Un sensore o input_datetime con l'ora (HH:MM) o la data e l'ora della prossima chiusura automatica",
    h_open_condition: "Un'entità on/off (input_boolean, binary_sensor, schedule…): finché è off, l'apertura appare come saltata",
    h_close_condition: "Un'entità on/off (input_boolean, binary_sensor, schedule…): finché è off, la chiusura appare come saltata",
  },
  nl: {
    covers: "Afdekkingen",
    open: "Openen",
    close: "Sluiten",
    stop: "Stop",
    open_all: "Alles openen",
    close_all: "Alles sluiten",
    tilt: "Kanteling",
    tilt_open: "Lamellen openen",
    tilt_close: "Lamellen sluiten",
    tilt_stop: "Lamellen stoppen",
    position_of: "Positie van {name}",
    tilt_of: "Kanteling van {name}",
    move: "Verplaatsen",
    move_to: "Naar {to}",
    cancel: "Annuleren",
    partly_open: "Gedeeltelijk open",
    s_open: "Open",
    s_closed: "Gesloten",
    s_opening: "Gaat open",
    s_closing: "Gaat dicht",
    s_unavailable: "Niet beschikbaar",
    s_unknown: "Onbekend",
    all_open: "Alles open",
    all_closed: "Alles gesloten",
    n_open: "Open: {n}",
    n_moving: "In beweging: {n}",
    n_covers: "{n} afdekkingen",
    average: "gemiddeld {pct}",
    c_shutter: "Rolluik",
    c_blind: "Jaloezie",
    c_shade: "Rolgordijn",
    c_curtain: "Gordijn",
    c_awning: "Zonnescherm",
    c_garage: "Garagedeur",
    c_gate: "Poort",
    c_swing: "Draaipoort",
    c_barrier: "Slagboom",
    c_hinged: "Luiken",
    c_pergola: "Pergola",
    c_door: "Deur",
    c_window: "Raam",
    c_damper: "Klep",
    pedestrian: "Voetganger",
    confirm_open: "{name} openen?",
    confirm_close: "{name} sluiten?",
    confirm_open_all: "Alle {n} afdekkingen openen?",
    confirm_close_all: "Alle {n} afdekkingen sluiten?",
    confirm_move: "{name} naar {to} verplaatsen?",
    confirm_move_all: "{n} afdekkingen naar {to} verplaatsen?",
    confirm_pedestrian: "{name} openen voor een voetganger?",
    not_found: "Entiteit niet gevonden",
    no_entities: "Kies minstens één afdekking: entity, entities of area.",
    unknown_area: "Ruimte niet gevonden: {area}",
    empty_area: "Geen afdekking in de ruimte {area}.",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    lang_auto: "Automatisch",
    class_auto: "Automatisch (apparaatklasse)",
    e_entities: "Afdekkingen",
    e_area: "Ruimte",
    e_title: "Titel (optioneel)",
    e_device_class: "Afbeelding",
    e_favorites: "Favoriete posities (%)",
    e_show_title: "Titel tonen",
    e_show_subtitle: "Ondertitel tonen",
    e_show_controls: "Knoppen openen / stop / sluiten tonen",
    e_show_group_controls: "Knoppen voor alle afdekkingen tonen",
    e_show_tilt: "Kanteling tonen",
    e_show_favorites: "Favoriete posities tonen",
    e_expanded: "Elke afdekking uitklappen",
    e_confirm: "Vragen voor openen of sluiten",
    e_pedestrian: "Voetgangersopening",
    e_light: "Pergolaverlichting",
    e_columns: "Kolommen",
    e_zoom: "Detailknop",
    e_language: "Taal",
    h_area: "Voegt alle afdekkingen van deze ruimte aan de lijst toe",
    h_favorites: "Kies of typ posities; elke positie wordt een knop",
    h_device_class: "Getekende afbeelding, als de apparaatklasse niet past",
    h_pedestrian: "Een positie in % (bijv. 30), of een knop, script of schakelaar; anders de voetgangersknop van de poort, als het apparaat er een heeft",
    h_light: "De verlichting van de pergola (ledstrip), aan getekend onder de lamellen zolang ze aan is",
    h_columns: "Bij meerdere afdekkingen: 1 toont inklapbare rijen, 2 of 3 een raster van uitgeklapte tegels",
    h_zoom: "Knop rechtsboven die de minikaart naar de volledige kaart schakelt en terug",
    confirm_auto: "Garagedeuren, poorten en deuren",
    confirm_always: "Altijd",
    confirm_never: "Nooit",
    e_invert: "Positie omkeren",
    h_invert: "Voor een afdekking waarvan de integratie de positie omgekeerd doorgeeft (vaak een zonnescherm)",
    e_no_feedback: "Geen statusterugkoppeling",
    h_no_feedback: "Voor een afdekking die haar status nooit terugmeldt (een RTS-radiomotor): in rust gesloten getekend",
    e_illustration: "Geanimeerde illustratie",
    e_illustration_theme: "Thema van de illustratie",
    theme_auto: "Automatisch: nacht met een donker thema, dag met een licht thema",
    theme_day: "Dag",
    theme_night: "Nacht",
    sch_title: "Automatisch schema",
    sch_opens: "Opent",
    sch_closes: "Sluit",
    sch_opened: "Geopend",
    sch_closed: "Gesloten",
    sch_tomorrow: "morgen",
    sch_in: "over {d}",
    sch_skipped: "overgeslagen",
    dur_m: "{m} min",
    dur_h: "{h} u",
    dur_hm: "{h} u {m} min",
    e_open_time: "Tijd automatisch openen",
    e_close_time: "Tijd automatisch sluiten",
    e_open_condition: "Automatisch openen actief",
    e_close_condition: "Automatisch sluiten actief",
    e_show_schedule: "Automatisch schema tonen",
    h_open_time: "Een sensor of input_datetime met de tijd (HH:MM) of de datum en tijd van het volgende automatisch openen",
    h_close_time: "Een sensor of input_datetime met de tijd (HH:MM) of de datum en tijd van het volgende automatisch sluiten",
    h_open_condition: "Een aan/uit-entiteit (input_boolean, binary_sensor, schedule…): zolang die uit staat, wordt het openen als overgeslagen getoond",
    h_close_condition: "Een aan/uit-entiteit (input_boolean, binary_sensor, schedule…): zolang die uit staat, wordt het sluiten als overgeslagen getoond",
  },
  pt: {
    covers: "Estores",
    open: "Abrir",
    close: "Fechar",
    stop: "Parar",
    open_all: "Abrir tudo",
    close_all: "Fechar tudo",
    tilt: "Inclinação",
    tilt_open: "Abrir as lâminas",
    tilt_close: "Fechar as lâminas",
    tilt_stop: "Parar as lâminas",
    position_of: "Posição de {name}",
    tilt_of: "Inclinação de {name}",
    move: "Mover",
    move_to: "Ir para {to}",
    cancel: "Cancelar",
    partly_open: "Parcialmente aberto",
    s_open: "Aberto",
    s_closed: "Fechado",
    s_opening: "A abrir",
    s_closing: "A fechar",
    s_unavailable: "Indisponível",
    s_unknown: "Desconhecido",
    all_open: "Tudo aberto",
    all_closed: "Tudo fechado",
    n_open: "Abertos: {n}",
    n_moving: "Em movimento: {n}",
    n_covers: "{n} estores",
    average: "média {pct}",
    c_shutter: "Estore de rolo",
    c_blind: "Persiana veneziana",
    c_shade: "Estore enrolável",
    c_curtain: "Cortina",
    c_awning: "Toldo",
    c_garage: "Porta de garagem",
    c_gate: "Portão",
    c_swing: "Portão de batente",
    c_barrier: "Cancela",
    c_hinged: "Portadas",
    c_pergola: "Pérgola",
    c_door: "Porta",
    c_window: "Janela",
    c_damper: "Registo",
    pedestrian: "Pedonal",
    confirm_open: "Abrir {name}?",
    confirm_close: "Fechar {name}?",
    confirm_open_all: "Abrir os {n} estores?",
    confirm_close_all: "Fechar os {n} estores?",
    confirm_move: "Mover {name} para {to}?",
    confirm_move_all: "Mover {n} estores para {to}?",
    confirm_pedestrian: "Abrir {name} para um peão?",
    not_found: "Entidade não encontrada",
    no_entities: "Escolha pelo menos um estore: entity, entities ou area.",
    unknown_area: "Divisão não encontrada: {area}",
    empty_area: "Nenhum estore na divisão {area}.",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    lang_auto: "Automático",
    class_auto: "Automático (classe do dispositivo)",
    e_entities: "Estores",
    e_area: "Divisão",
    e_title: "Título (opcional)",
    e_device_class: "Ilustração",
    e_favorites: "Posições favoritas (%)",
    e_show_title: "Mostrar o título",
    e_show_subtitle: "Mostrar o subtítulo",
    e_show_controls: "Mostrar os botões abrir / parar / fechar",
    e_show_group_controls: "Mostrar os botões para todos os estores",
    e_show_tilt: "Mostrar a inclinação",
    e_show_favorites: "Mostrar as posições favoritas",
    e_expanded: "Expandir cada estore",
    e_confirm: "Perguntar antes de abrir ou fechar",
    e_pedestrian: "Abertura pedonal",
    e_light: "Luz da pérgola",
    e_columns: "Colunas",
    e_zoom: "Botão de detalhe",
    e_language: "Idioma",
    h_area: "Adiciona à lista todos os estores desta divisão",
    h_favorites: "Escolha ou escreva posições; cada uma torna-se um botão",
    h_device_class: "Ilustração desenhada, quando a classe do dispositivo não corresponde",
    h_pedestrian: "Uma posição em % (ex. 30), ou um botão, script ou interruptor; caso contrário o botão pedonal do portão, se o dispositivo tiver um",
    h_light: "A luz da pérgola (fita LED), desenhada acesa sob as lâminas enquanto está ligada",
    h_columns: "Com vários estores: 1 mostra linhas recolhíveis, 2 ou 3 uma grelha de mosaicos expandidos",
    h_zoom: "Botão no canto superior direito que alterna o mini cartão para o cartão completo e vice-versa",
    confirm_auto: "Portas de garagem, portões e portas",
    confirm_always: "Sempre",
    confirm_never: "Nunca",
    e_invert: "Inverter a posição",
    h_invert: "Para um estore cuja integração indica a posição ao contrário (muitas vezes um toldo)",
    e_no_feedback: "Sem retorno de estado",
    h_no_feedback: "Para um estore que nunca comunica o seu estado (um motor de rádio RTS): desenhado fechado em repouso",
    e_illustration: "Ilustração animada",
    e_illustration_theme: "Tema da ilustração",
    theme_auto: "Automático: noite com um tema escuro, dia com um tema claro",
    theme_day: "Dia",
    theme_night: "Noite",
    sch_title: "Horário automático",
    sch_opens: "Abre",
    sch_closes: "Fecha",
    sch_opened: "Aberto",
    sch_closed: "Fechado",
    sch_tomorrow: "amanhã",
    sch_in: "daqui a {d}",
    sch_skipped: "ignorada",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Hora de abertura automática",
    e_close_time: "Hora de fecho automático",
    e_open_condition: "Abertura automática ativa",
    e_close_condition: "Fecho automático ativo",
    e_show_schedule: "Mostrar o horário automático",
    h_open_time: "Um sensor ou input_datetime com a hora (HH:MM) ou a data e hora da próxima abertura automática",
    h_close_time: "Um sensor ou input_datetime com a hora (HH:MM) ou a data e hora do próximo fecho automático",
    h_open_condition: "Uma entidade on/off (input_boolean, binary_sensor, schedule…): enquanto estiver off, a abertura aparece como ignorada",
    h_close_condition: "Uma entidade on/off (input_boolean, binary_sensor, schedule…): enquanto estiver off, o fecho aparece como ignorado",
  },
  pl: {
    covers: "Osłony",
    open: "Otwórz",
    close: "Zamknij",
    stop: "Stop",
    open_all: "Otwórz wszystkie",
    close_all: "Zamknij wszystkie",
    tilt: "Nachylenie",
    tilt_open: "Otwórz lamele",
    tilt_close: "Zamknij lamele",
    tilt_stop: "Zatrzymaj lamele",
    position_of: "Pozycja: {name}",
    tilt_of: "Nachylenie: {name}",
    move: "Przesuń",
    move_to: "Przesuń na {to}",
    cancel: "Anuluj",
    partly_open: "Częściowo otwarte",
    s_open: "Otwarte",
    s_closed: "Zamknięte",
    s_opening: "Otwieranie",
    s_closing: "Zamykanie",
    s_unavailable: "Niedostępne",
    s_unknown: "Nieznany",
    all_open: "Wszystkie otwarte",
    all_closed: "Wszystkie zamknięte",
    n_open: "Otwarte: {n}",
    n_moving: "W ruchu: {n}",
    n_covers: "Osłony: {n}",
    average: "średnio {pct}",
    c_shutter: "Roleta zewnętrzna",
    c_blind: "Żaluzja",
    c_shade: "Roleta",
    c_curtain: "Zasłona",
    c_awning: "Markiza",
    c_garage: "Brama garażowa",
    c_gate: "Brama",
    c_swing: "Brama skrzydłowa",
    c_barrier: "Szlaban",
    c_hinged: "Okiennice",
    c_pergola: "Pergola",
    c_door: "Drzwi",
    c_window: "Okno",
    c_damper: "Przepustnica",
    pedestrian: "Dla pieszych",
    confirm_open: "Otworzyć {name}?",
    confirm_close: "Zamknąć {name}?",
    confirm_open_all: "Otworzyć wszystkie osłony ({n})?",
    confirm_close_all: "Zamknąć wszystkie osłony ({n})?",
    confirm_move: "Przesunąć {name} na {to}?",
    confirm_move_all: "Przesunąć osłony ({n}) na {to}?",
    confirm_pedestrian: "Otworzyć {name} dla pieszego?",
    not_found: "Nie znaleziono encji",
    no_entities: "Wybierz co najmniej jedną osłonę: entity, entities lub area.",
    unknown_area: "Nie znaleziono obszaru: {area}",
    empty_area: "Brak osłon w obszarze {area}.",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    lang_auto: "Automatycznie",
    class_auto: "Automatycznie (klasa urządzenia)",
    e_entities: "Osłony",
    e_area: "Obszar",
    e_title: "Tytuł (opcjonalnie)",
    e_device_class: "Ilustracja",
    e_favorites: "Ulubione pozycje (%)",
    e_show_title: "Pokaż tytuł",
    e_show_subtitle: "Pokaż podtytuł",
    e_show_controls: "Pokaż przyciski otwórz / stop / zamknij",
    e_show_group_controls: "Pokaż przyciski dla wszystkich osłon",
    e_show_tilt: "Pokaż nachylenie",
    e_show_favorites: "Pokaż ulubione pozycje",
    e_expanded: "Rozwiń każdą osłonę",
    e_confirm: "Pytaj przed otwarciem lub zamknięciem",
    e_pedestrian: "Otwarcie dla pieszych",
    e_light: "Oświetlenie pergoli",
    e_columns: "Kolumny",
    e_zoom: "Przycisk szczegółów",
    e_language: "Język",
    h_area: "Dodaje do listy wszystkie osłony tego obszaru",
    h_favorites: "Wybierz lub wpisz pozycje; każda staje się przyciskiem",
    h_device_class: "Rysowana ilustracja, gdy klasa urządzenia nie pasuje",
    h_pedestrian: "Pozycja w % (np. 30) albo przycisk, skrypt lub przełącznik; w przeciwnym razie przycisk dla pieszych bramy, jeśli urządzenie go ma",
    h_light: "Oświetlenie pergoli (taśma LED), rysowane jako włączone pod lamelami, gdy jest włączone",
    h_columns: "Przy kilku osłonach: 1 pokazuje zwijane wiersze, 2 lub 3 siatkę rozwiniętych kafelków",
    h_zoom: "Przycisk w prawym górnym rogu, który przełącza mini kartę na pełną kartę i z powrotem",
    confirm_auto: "Bramy garażowe, bramy i drzwi",
    confirm_always: "Zawsze",
    confirm_never: "Nigdy",
    e_invert: "Odwróć pozycję",
    h_invert: "Dla osłony, której integracja podaje pozycję odwrotnie (często markiza)",
    e_no_feedback: "Brak informacji o stanie",
    h_no_feedback: "Dla osłony, która nigdy nie zgłasza swojego stanu (radiowy silnik RTS): rysowana jako zamknięta w spoczynku",
    e_illustration: "Animowana ilustracja",
    e_illustration_theme: "Motyw ilustracji",
    theme_auto: "Automatycznie: noc przy ciemnym motywie, dzień przy jasnym motywie",
    theme_day: "Dzień",
    theme_night: "Noc",
    sch_title: "Harmonogram automatyczny",
    sch_opens: "Otwarcie",
    sch_closes: "Zamknięcie",
    sch_opened: "Otwarto",
    sch_closed: "Zamknięto",
    sch_tomorrow: "jutro",
    sch_in: "za {d}",
    sch_skipped: "pominięte",
    dur_m: "{m} min",
    dur_h: "{h} godz.",
    dur_hm: "{h} godz. {m} min",
    e_open_time: "Godzina automatycznego otwarcia",
    e_close_time: "Godzina automatycznego zamknięcia",
    e_open_condition: "Automatyczne otwieranie włączone",
    e_close_condition: "Automatyczne zamykanie włączone",
    e_show_schedule: "Pokaż harmonogram automatyczny",
    h_open_time: "Czujnik lub input_datetime z godziną (HH:MM) albo datą i godziną następnego automatycznego otwarcia",
    h_close_time: "Czujnik lub input_datetime z godziną (HH:MM) albo datą i godziną następnego automatycznego zamknięcia",
    h_open_condition: "Encja wł./wył. (input_boolean, binary_sensor, schedule…): gdy jest wyłączona, otwarcie jest pokazane jako pominięte",
    h_close_condition: "Encja wł./wył. (input_boolean, binary_sensor, schedule…): gdy jest wyłączona, zamknięcie jest pokazane jako pominięte",
  },
  ro: {
    covers: "Jaluzele",
    open: "Deschide",
    close: "Închide",
    stop: "Stop",
    open_all: "Deschide tot",
    close_all: "Închide tot",
    tilt: "Înclinare",
    tilt_open: "Deschide lamelele",
    tilt_close: "Închide lamelele",
    tilt_stop: "Oprește lamelele",
    position_of: "Poziția: {name}",
    tilt_of: "Înclinarea: {name}",
    move: "Mută",
    move_to: "Mută la {to}",
    cancel: "Anulează",
    partly_open: "Parțial deschis",
    s_open: "Deschis",
    s_closed: "Închis",
    s_opening: "Se deschide",
    s_closing: "Se închide",
    s_unavailable: "Indisponibil",
    s_unknown: "Necunoscut",
    all_open: "Toate deschise",
    all_closed: "Toate închise",
    n_open: "Deschise: {n}",
    n_moving: "În mișcare: {n}",
    n_covers: "Jaluzele: {n}",
    average: "medie {pct}",
    c_shutter: "Rulou exterior",
    c_blind: "Jaluzea venețiană",
    c_shade: "Rulou",
    c_curtain: "Perdea",
    c_awning: "Copertină",
    c_garage: "Ușă de garaj",
    c_gate: "Poartă",
    c_swing: "Poartă batantă",
    c_barrier: "Barieră",
    c_hinged: "Obloane",
    c_pergola: "Pergolă",
    c_door: "Ușă",
    c_window: "Fereastră",
    c_damper: "Clapetă",
    pedestrian: "Pietonal",
    confirm_open: "Deschizi {name}?",
    confirm_close: "Închizi {name}?",
    confirm_open_all: "Deschizi toate jaluzelele ({n})?",
    confirm_close_all: "Închizi toate jaluzelele ({n})?",
    confirm_move: "Muți {name} la {to}?",
    confirm_move_all: "Muți jaluzelele ({n}) la {to}?",
    confirm_pedestrian: "Deschideți {name} pentru un pieton?",
    not_found: "Entitate negăsită",
    no_entities: "Alege cel puțin o jaluzea: entity, entities sau area.",
    unknown_area: "Zonă negăsită: {area}",
    empty_area: "Nicio jaluzea în zona {area}.",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    lang_auto: "Automat",
    class_auto: "Automat (clasa dispozitivului)",
    e_entities: "Jaluzele",
    e_area: "Zonă",
    e_title: "Titlu (opțional)",
    e_device_class: "Ilustrație",
    e_favorites: "Poziții favorite (%)",
    e_show_title: "Afișează titlul",
    e_show_subtitle: "Afișează subtitlul",
    e_show_controls: "Afișează butoanele deschide / stop / închide",
    e_show_group_controls: "Afișează butoanele pentru toate jaluzelele",
    e_show_tilt: "Afișează înclinarea",
    e_show_favorites: "Afișează pozițiile favorite",
    e_expanded: "Extinde fiecare jaluzea",
    e_confirm: "Întreabă înainte de deschidere sau închidere",
    e_pedestrian: "Deschidere pietonală",
    e_light: "Iluminatul pergolei",
    e_columns: "Coloane",
    e_zoom: "Buton de detalii",
    e_language: "Limbă",
    h_area: "Adaugă în listă toate jaluzelele din această zonă",
    h_favorites: "Alege sau scrie poziții; fiecare devine un buton",
    h_device_class: "Ilustrație desenată, când clasa dispozitivului nu se potrivește",
    h_pedestrian: "O poziție în % (ex. 30) sau un buton, script ori comutator; altfel butonul pietonal al porții, dacă dispozitivul are unul",
    h_light: "Iluminatul pergolei (bandă LED), desenat aprins sub lamele cât timp este pornit",
    h_columns: "Cu mai multe jaluzele: 1 afișează rânduri pliabile, 2 sau 3 o grilă de plăci extinse",
    h_zoom: "Buton în dreapta sus care comută mini cardul la cardul complet și înapoi",
    confirm_auto: "Uși de garaj, porți și uși",
    confirm_always: "Întotdeauna",
    confirm_never: "Niciodată",
    e_invert: "Inversează poziția",
    h_invert: "Pentru un element a cărui integrare raportează poziția invers (adesea o copertină)",
    e_no_feedback: "Fără feedback de stare",
    h_no_feedback: "Pentru un element care nu își raportează niciodată starea (un motor radio RTS): desenat închis în repaus",
    e_illustration: "Ilustrație animată",
    e_illustration_theme: "Tema ilustrației",
    theme_auto: "Automat: noapte cu o temă întunecată, zi cu o temă luminoasă",
    theme_day: "Zi",
    theme_night: "Noapte",
    sch_title: "Program automat",
    sch_opens: "Se deschide",
    sch_closes: "Se închide",
    sch_opened: "Deschis",
    sch_closed: "Închis",
    sch_tomorrow: "mâine",
    sch_in: "în {d}",
    sch_skipped: "omisă",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Ora deschiderii automate",
    e_close_time: "Ora închiderii automate",
    e_open_condition: "Deschidere automată activă",
    e_close_condition: "Închidere automată activă",
    e_show_schedule: "Afișează programul automat",
    h_open_time: "Un senzor sau input_datetime cu ora (HH:MM) sau data și ora următoarei deschideri automate",
    h_close_time: "Un senzor sau input_datetime cu ora (HH:MM) sau data și ora următoarei închideri automate",
    h_open_condition: "O entitate on/off (input_boolean, binary_sensor, schedule…): cât timp este off, deschiderea apare ca omisă",
    h_close_condition: "O entitate on/off (input_boolean, binary_sensor, schedule…): cât timp este off, închiderea apare ca omisă",
  },
  da: {
    covers: "Afskærmninger",
    open: "Åbn",
    close: "Luk",
    stop: "Stop",
    open_all: "Åbn alle",
    close_all: "Luk alle",
    tilt: "Vipning",
    tilt_open: "Åbn lamellerne",
    tilt_close: "Luk lamellerne",
    tilt_stop: "Stop lamellerne",
    position_of: "Position for {name}",
    tilt_of: "Vipning for {name}",
    move: "Flyt",
    move_to: "Flyt til {to}",
    cancel: "Annuller",
    partly_open: "Delvist åben",
    s_open: "Åben",
    s_closed: "Lukket",
    s_opening: "Åbner",
    s_closing: "Lukker",
    s_unavailable: "Ikke tilgængelig",
    s_unknown: "Ukendt",
    all_open: "Alle åbne",
    all_closed: "Alle lukkede",
    n_open: "Åbne: {n}",
    n_moving: "I bevægelse: {n}",
    n_covers: "{n} afskærmninger",
    average: "gennemsnit {pct}",
    c_shutter: "Rulleskodde",
    c_blind: "Persienne",
    c_shade: "Rullegardin",
    c_curtain: "Gardin",
    c_awning: "Markise",
    c_garage: "Garageport",
    c_gate: "Låge",
    c_swing: "Fløjlåge",
    c_barrier: "Bom",
    c_hinged: "Skodder",
    c_pergola: "Pergola",
    c_door: "Dør",
    c_window: "Vindue",
    c_damper: "Spjæld",
    pedestrian: "Fodgænger",
    confirm_open: "Åbn {name}?",
    confirm_close: "Luk {name}?",
    confirm_open_all: "Åbn alle {n} afskærmninger?",
    confirm_close_all: "Luk alle {n} afskærmninger?",
    confirm_move: "Flyt {name} til {to}?",
    confirm_move_all: "Flyt {n} afskærmninger til {to}?",
    confirm_pedestrian: "Åbn {name} for en fodgænger?",
    not_found: "Enhed ikke fundet",
    no_entities: "Vælg mindst én afskærmning: entity, entities eller area.",
    unknown_area: "Område ikke fundet: {area}",
    empty_area: "Ingen afskærmning i området {area}.",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til kompakt visning",
    lang_auto: "Automatisk",
    class_auto: "Automatisk (enhedsklasse)",
    e_entities: "Afskærmninger",
    e_area: "Område",
    e_title: "Titel (valgfri)",
    e_device_class: "Illustration",
    e_favorites: "Favoritpositioner (%)",
    e_show_title: "Vis titel",
    e_show_subtitle: "Vis undertitel",
    e_show_controls: "Vis knapperne åbn / stop / luk",
    e_show_group_controls: "Vis knapperne for alle afskærmninger",
    e_show_tilt: "Vis vipning",
    e_show_favorites: "Vis favoritpositioner",
    e_expanded: "Fold hver afskærmning ud",
    e_confirm: "Spørg før åbning eller lukning",
    e_pedestrian: "Fodgængeråbning",
    e_light: "Pergolalys",
    e_columns: "Kolonner",
    e_zoom: "Detaljeknap",
    e_language: "Sprog",
    h_area: "Føjer alle afskærmninger i dette område til listen",
    h_favorites: "Vælg eller skriv positioner; hver bliver en knap",
    h_device_class: "Tegnet illustration, når enhedsklassen ikke passer",
    h_pedestrian: "En position i % (f.eks. 30) eller en knap, et script eller en kontakt; ellers lågens fodgængerknap, hvis enheden har en",
    h_light: "Pergolaens lys (LED-strip), tegnet tændt under lamellerne, mens det er tændt",
    h_columns: "Med flere afskærmninger: 1 viser sammenfoldelige rækker, 2 eller 3 et gitter af udfoldede felter",
    h_zoom: "Knap øverst til højre, der skifter minikortet til hele kortet og tilbage",
    confirm_auto: "Garageporte, låger og døre",
    confirm_always: "Altid",
    confirm_never: "Aldrig",
    e_invert: "Vend positionen",
    h_invert: "For en afskærmning, hvis integration melder positionen omvendt (ofte en markise)",
    e_no_feedback: "Ingen tilstandsrespons",
    h_no_feedback: "For en afskærmning, der aldrig melder sin tilstand tilbage (en RTS-radiomotor): tegnet lukket i hvile",
    e_illustration: "Animeret illustration",
    e_illustration_theme: "Illustrationens tema",
    theme_auto: "Automatisk: nat med et mørkt tema, dag med et lyst tema",
    theme_day: "Dag",
    theme_night: "Nat",
    sch_title: "Automatisk tidsplan",
    sch_opens: "Åbner",
    sch_closes: "Lukker",
    sch_opened: "Åbnet",
    sch_closed: "Lukket",
    sch_tomorrow: "i morgen",
    sch_in: "om {d}",
    sch_skipped: "sprunget over",
    dur_m: "{m} min",
    dur_h: "{h} t",
    dur_hm: "{h} t {m} min",
    e_open_time: "Tidspunkt for automatisk åbning",
    e_close_time: "Tidspunkt for automatisk lukning",
    e_open_condition: "Automatisk åbning aktiv",
    e_close_condition: "Automatisk lukning aktiv",
    e_show_schedule: "Vis den automatiske tidsplan",
    h_open_time: "En sensor eller input_datetime med tidspunktet (HH:MM) eller dato og tid for næste automatiske åbning",
    h_close_time: "En sensor eller input_datetime med tidspunktet (HH:MM) eller dato og tid for næste automatiske lukning",
    h_open_condition: "En til/fra-entitet (input_boolean, binary_sensor, schedule…): mens den er fra, vises åbningen som sprunget over",
    h_close_condition: "En til/fra-entitet (input_boolean, binary_sensor, schedule…): mens den er fra, vises lukningen som sprunget over",
  },
  sv: {
    covers: "Skydd",
    open: "Öppna",
    close: "Stäng",
    stop: "Stopp",
    open_all: "Öppna alla",
    close_all: "Stäng alla",
    tilt: "Lutning",
    tilt_open: "Öppna lamellerna",
    tilt_close: "Stäng lamellerna",
    tilt_stop: "Stoppa lamellerna",
    position_of: "Position för {name}",
    tilt_of: "Lutning för {name}",
    move: "Flytta",
    move_to: "Flytta till {to}",
    cancel: "Avbryt",
    partly_open: "Delvis öppen",
    s_open: "Öppen",
    s_closed: "Stängd",
    s_opening: "Öppnas",
    s_closing: "Stängs",
    s_unavailable: "Inte tillgänglig",
    s_unknown: "Okänd",
    all_open: "Alla öppna",
    all_closed: "Alla stängda",
    n_open: "Öppna: {n}",
    n_moving: "I rörelse: {n}",
    n_covers: "{n} skydd",
    average: "medel {pct}",
    c_shutter: "Rulljalusi",
    c_blind: "Persienn",
    c_shade: "Rullgardin",
    c_curtain: "Gardin",
    c_awning: "Markis",
    c_garage: "Garageport",
    c_gate: "Grind",
    c_swing: "Slagrind",
    c_barrier: "Bom",
    c_hinged: "Fönsterluckor",
    c_pergola: "Pergola",
    c_door: "Dörr",
    c_window: "Fönster",
    c_damper: "Spjäll",
    pedestrian: "Gående",
    confirm_open: "Öppna {name}?",
    confirm_close: "Stäng {name}?",
    confirm_open_all: "Öppna alla {n} skydd?",
    confirm_close_all: "Stäng alla {n} skydd?",
    confirm_move: "Flytta {name} till {to}?",
    confirm_move_all: "Flytta {n} skydd till {to}?",
    confirm_pedestrian: "Öppna {name} för en gående?",
    not_found: "Entiteten hittades inte",
    no_entities: "Välj minst ett skydd: entity, entities eller area.",
    unknown_area: "Området hittades inte: {area}",
    empty_area: "Inget skydd i området {area}.",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    lang_auto: "Automatiskt",
    class_auto: "Automatiskt (enhetsklass)",
    e_entities: "Skydd",
    e_area: "Område",
    e_title: "Titel (valfri)",
    e_device_class: "Illustration",
    e_favorites: "Favoritpositioner (%)",
    e_show_title: "Visa titel",
    e_show_subtitle: "Visa undertitel",
    e_show_controls: "Visa knapparna öppna / stopp / stäng",
    e_show_group_controls: "Visa knapparna för alla skydd",
    e_show_tilt: "Visa lutning",
    e_show_favorites: "Visa favoritpositioner",
    e_expanded: "Fäll ut varje skydd",
    e_confirm: "Fråga innan öppning eller stängning",
    e_pedestrian: "Gångöppning",
    e_light: "Pergolabelysning",
    e_columns: "Kolumner",
    e_zoom: "Detaljknapp",
    e_language: "Språk",
    h_area: "Lägger till alla skydd i detta område i listan",
    h_favorites: "Välj eller skriv positioner; var och en blir en knapp",
    h_device_class: "Ritad illustration, när enhetsklassen inte stämmer",
    h_pedestrian: "En position i % (t.ex. 30) eller en knapp, ett skript eller en brytare; annars grindens gångknapp, om enheten har en",
    h_light: "Pergolans belysning (LED-list), ritad tänd under lamellerna när den är på",
    h_columns: "Med flera skydd: 1 visar hopfällbara rader, 2 eller 3 ett rutnät av utfällda rutor",
    h_zoom: "Knapp uppe till höger som växlar minikortet till hela kortet och tillbaka",
    confirm_auto: "Garageportar, grindar och dörrar",
    confirm_always: "Alltid",
    confirm_never: "Aldrig",
    e_invert: "Invertera positionen",
    h_invert: "För en täckning vars integration rapporterar positionen omvänt (ofta en markis)",
    e_no_feedback: "Ingen statusåterkoppling",
    h_no_feedback: "För en täckning som aldrig rapporterar sitt tillstånd (en RTS-radiomotor): ritas stängd i viloläge",
    e_illustration: "Animerad illustration",
    e_illustration_theme: "Illustrationens tema",
    theme_auto: "Automatiskt: natt med ett mörkt tema, dag med ett ljust tema",
    theme_day: "Dag",
    theme_night: "Natt",
    sch_title: "Automatiskt schema",
    sch_opens: "Öppnas",
    sch_closes: "Stängs",
    sch_opened: "Öppnad",
    sch_closed: "Stängd",
    sch_tomorrow: "i morgon",
    sch_in: "om {d}",
    sch_skipped: "hoppas över",
    dur_m: "{m} min",
    dur_h: "{h} tim",
    dur_hm: "{h} tim {m} min",
    e_open_time: "Tid för automatisk öppning",
    e_close_time: "Tid för automatisk stängning",
    e_open_condition: "Automatisk öppning aktiv",
    e_close_condition: "Automatisk stängning aktiv",
    e_show_schedule: "Visa det automatiska schemat",
    h_open_time: "En sensor eller input_datetime med tiden (HH:MM) eller datum och tid för nästa automatiska öppning",
    h_close_time: "En sensor eller input_datetime med tiden (HH:MM) eller datum och tid för nästa automatiska stängning",
    h_open_condition: "En på/av-entitet (input_boolean, binary_sensor, schedule…): så länge den är av visas öppningen som överhoppad",
    h_close_condition: "En på/av-entitet (input_boolean, binary_sensor, schedule…): så länge den är av visas stängningen som överhoppad",
  },
  bg: {
    covers: "Щори",
    open: "Отвори",
    close: "Затвори",
    stop: "Стоп",
    open_all: "Отвори всички",
    close_all: "Затвори всички",
    tilt: "Наклон",
    tilt_open: "Отвори ламелите",
    tilt_close: "Затвори ламелите",
    tilt_stop: "Спри ламелите",
    position_of: "Позиция: {name}",
    tilt_of: "Наклон: {name}",
    move: "Премести",
    move_to: "Премести на {to}",
    cancel: "Отказ",
    partly_open: "Частично отворено",
    s_open: "Отворено",
    s_closed: "Затворено",
    s_opening: "Отваря се",
    s_closing: "Затваря се",
    s_unavailable: "Недостъпно",
    s_unknown: "Неизвестно",
    all_open: "Всички отворени",
    all_closed: "Всички затворени",
    n_open: "Отворени: {n}",
    n_moving: "В движение: {n}",
    n_covers: "Щори: {n}",
    average: "средно {pct}",
    c_shutter: "Ролетна щора",
    c_blind: "Венецианска щора",
    c_shade: "Ролетна завеса",
    c_curtain: "Завеса",
    c_awning: "Сенник",
    c_garage: "Гаражна врата",
    c_gate: "Порта",
    c_swing: "Двукрила порта",
    c_barrier: "Бариера",
    c_hinged: "Капаци",
    c_pergola: "Пергола",
    c_door: "Врата",
    c_window: "Прозорец",
    c_damper: "Клапа",
    pedestrian: "Пешеходно",
    confirm_open: "Да се отвори ли {name}?",
    confirm_close: "Да се затвори ли {name}?",
    confirm_open_all: "Да се отворят ли всички щори ({n})?",
    confirm_close_all: "Да се затворят ли всички щори ({n})?",
    confirm_move: "Да се премести ли {name} на {to}?",
    confirm_move_all: "Да се преместят ли щорите ({n}) на {to}?",
    confirm_pedestrian: "Да се отвори ли {name} за пешеходец?",
    not_found: "Обектът не е намерен",
    no_entities: "Изберете поне една щора: entity, entities или area.",
    unknown_area: "Зоната не е намерена: {area}",
    empty_area: "Няма щори в зоната {area}.",
    zoom_in: "Покажи пълната карта",
    zoom_out: "Обратно към компактния изглед",
    lang_auto: "Автоматично",
    class_auto: "Автоматично (клас на устройството)",
    e_entities: "Щори",
    e_area: "Зона",
    e_title: "Заглавие (по избор)",
    e_device_class: "Илюстрация",
    e_favorites: "Любими позиции (%)",
    e_show_title: "Покажи заглавието",
    e_show_subtitle: "Покажи подзаглавието",
    e_show_controls: "Покажи бутоните отвори / стоп / затвори",
    e_show_group_controls: "Покажи бутоните за всички щори",
    e_show_tilt: "Покажи наклона",
    e_show_favorites: "Покажи любимите позиции",
    e_expanded: "Разгъни всяка щора",
    e_confirm: "Питай преди отваряне или затваряне",
    e_pedestrian: "Пешеходно отваряне",
    e_light: "Осветление на перголата",
    e_columns: "Колони",
    e_zoom: "Бутон за подробности",
    e_language: "Език",
    h_area: "Добавя в списъка всички щори от тази зона",
    h_favorites: "Изберете или въведете позиции; всяка става бутон",
    h_device_class: "Нарисувана илюстрация, когато класът на устройството не съвпада",
    h_pedestrian: "Позиция в % (напр. 30) или бутон, скрипт или превключвател; иначе пешеходният бутон на портата, ако устройството има такъв",
    h_light: "Осветлението на перголата (LED лента), нарисувано светнало под ламелите, докато е включено",
    h_columns: "При няколко щори: 1 показва сгъваеми редове, 2 или 3 мрежа от разгънати плочки",
    h_zoom: "Бутон горе вдясно, който превключва мини картата към пълната карта и обратно",
    confirm_auto: "Гаражни врати, порти и врати",
    confirm_always: "Винаги",
    confirm_never: "Никога",
    e_invert: "Обръщане на позицията",
    h_invert: "За покритие, чиято интеграция докладва позицията обратно (често сенник)",
    e_no_feedback: "Без обратна връзка за състоянието",
    h_no_feedback: "За покритие, което никога не докладва състоянието си (радио RTS мотор): нарисувано затворено в покой",
    e_illustration: "Анимирана илюстрация",
    e_illustration_theme: "Тема на илюстрацията",
    theme_auto: "Автоматично: нощ с тъмна тема, ден със светла тема",
    theme_day: "Ден",
    theme_night: "Нощ",
    sch_title: "Автоматичен график",
    sch_opens: "Отваря",
    sch_closes: "Затваря",
    sch_opened: "Отворено",
    sch_closed: "Затворено",
    sch_tomorrow: "утре",
    sch_in: "след {d}",
    sch_skipped: "пропуснато",
    dur_m: "{m} мин",
    dur_h: "{h} ч",
    dur_hm: "{h} ч {m} мин",
    e_open_time: "Час на автоматично отваряне",
    e_close_time: "Час на автоматично затваряне",
    e_open_condition: "Автоматичното отваряне е активно",
    e_close_condition: "Автоматичното затваряне е активно",
    e_show_schedule: "Показване на автоматичния график",
    h_open_time: "Сензор или input_datetime с часа (HH:MM) или датата и часа на следващото автоматично отваряне",
    h_close_time: "Сензор или input_datetime с часа (HH:MM) или датата и часа на следващото автоматично затваряне",
    h_open_condition: "Обект вкл./изкл. (input_boolean, binary_sensor, schedule…): докато е изключен, отварянето се показва като пропуснато",
    h_close_condition: "Обект вкл./изкл. (input_boolean, binary_sensor, schedule…): докато е изключен, затварянето се показва като пропуснато",
  },
  ru: {
    covers: "Шторы",
    open: "Открыть",
    close: "Закрыть",
    stop: "Стоп",
    open_all: "Открыть все",
    close_all: "Закрыть все",
    tilt: "Наклон",
    tilt_open: "Открыть ламели",
    tilt_close: "Закрыть ламели",
    tilt_stop: "Остановить ламели",
    position_of: "Положение: {name}",
    tilt_of: "Наклон: {name}",
    move: "Переместить",
    move_to: "Переместить на {to}",
    cancel: "Отмена",
    partly_open: "Частично открыто",
    s_open: "Открыто",
    s_closed: "Закрыто",
    s_opening: "Открывается",
    s_closing: "Закрывается",
    s_unavailable: "Недоступно",
    s_unknown: "Неизвестно",
    all_open: "Все открыты",
    all_closed: "Все закрыты",
    n_open: "Открыто: {n}",
    n_moving: "В движении: {n}",
    n_covers: "Штор: {n}",
    average: "в среднем {pct}",
    c_shutter: "Рольставня",
    c_blind: "Жалюзи",
    c_shade: "Рулонная штора",
    c_curtain: "Штора",
    c_awning: "Маркиза",
    c_garage: "Гаражные ворота",
    c_gate: "Ворота",
    c_swing: "Распашные ворота",
    c_barrier: "Шлагбаум",
    c_hinged: "Ставни",
    c_pergola: "Пергола",
    c_door: "Дверь",
    c_window: "Окно",
    c_damper: "Заслонка",
    pedestrian: "Для пешехода",
    confirm_open: "Открыть {name}?",
    confirm_close: "Закрыть {name}?",
    confirm_open_all: "Открыть все шторы ({n})?",
    confirm_close_all: "Закрыть все шторы ({n})?",
    confirm_move: "Переместить {name} на {to}?",
    confirm_move_all: "Переместить шторы ({n}) на {to}?",
    confirm_pedestrian: "Открыть {name} для пешехода?",
    not_found: "Объект не найден",
    no_entities: "Выберите хотя бы одну штору: entity, entities или area.",
    unknown_area: "Пространство не найдено: {area}",
    empty_area: "Нет штор в пространстве {area}.",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    lang_auto: "Автоматически",
    class_auto: "Автоматически (класс устройства)",
    e_entities: "Шторы",
    e_area: "Пространство",
    e_title: "Заголовок (необязательно)",
    e_device_class: "Иллюстрация",
    e_favorites: "Избранные положения (%)",
    e_show_title: "Показывать заголовок",
    e_show_subtitle: "Показывать подзаголовок",
    e_show_controls: "Показывать кнопки открыть / стоп / закрыть",
    e_show_group_controls: "Показывать кнопки для всех штор",
    e_show_tilt: "Показывать наклон",
    e_show_favorites: "Показывать избранные положения",
    e_expanded: "Разворачивать каждую штору",
    e_confirm: "Спрашивать перед открытием или закрытием",
    e_pedestrian: "Открытие для пешехода",
    e_light: "Подсветка перголы",
    e_columns: "Столбцы",
    e_zoom: "Кнопка подробностей",
    e_language: "Язык",
    h_area: "Добавляет в список все шторы этого пространства",
    h_favorites: "Выберите или введите положения; каждое станет кнопкой",
    h_device_class: "Нарисованная иллюстрация, если класс устройства не подходит",
    h_pedestrian: "Положение в % (например, 30) или кнопка, скрипт или выключатель; иначе пешеходная кнопка ворот, если она есть у устройства",
    h_light: "Подсветка перголы (LED-лента), нарисованная включённой под ламелями, пока она горит",
    h_columns: "Для нескольких штор: 1 — сворачиваемые строки, 2 или 3 — сетка развёрнутых плиток",
    h_zoom: "Кнопка в правом верхнем углу, переключающая мини-карточку на полную и обратно",
    confirm_auto: "Гаражные ворота, ворота и двери",
    confirm_always: "Всегда",
    confirm_never: "Никогда",
    e_invert: "Инвертировать положение",
    h_invert: "Для шторы, чья интеграция сообщает положение наоборот (часто маркиза)",
    e_no_feedback: "Нет обратной связи о состоянии",
    h_no_feedback: "Для шторы, которая никогда не сообщает своё состояние (радиомотор RTS): отрисовывается закрытой в покое",
    e_illustration: "Анимированная иллюстрация",
    e_illustration_theme: "Тема иллюстрации",
    theme_auto: "Автоматически: ночь при тёмной теме, день при светлой теме",
    theme_day: "День",
    theme_night: "Ночь",
    sch_title: "Автоматическое расписание",
    sch_opens: "Открытие",
    sch_closes: "Закрытие",
    sch_opened: "Открыто",
    sch_closed: "Закрыто",
    sch_tomorrow: "завтра",
    sch_in: "через {d}",
    sch_skipped: "пропущено",
    dur_m: "{m} мин",
    dur_h: "{h} ч",
    dur_hm: "{h} ч {m} мин",
    e_open_time: "Время автоматического открытия",
    e_close_time: "Время автоматического закрытия",
    e_open_condition: "Автоматическое открытие включено",
    e_close_condition: "Автоматическое закрытие включено",
    e_show_schedule: "Показывать автоматическое расписание",
    h_open_time: "Датчик или input_datetime со временем (ЧЧ:ММ) или датой и временем следующего автоматического открытия",
    h_close_time: "Датчик или input_datetime со временем (ЧЧ:ММ) или датой и временем следующего автоматического закрытия",
    h_open_condition: "Объект вкл./выкл. (input_boolean, binary_sensor, schedule…): пока он выключен, открытие показано как пропущенное",
    h_close_condition: "Объект вкл./выкл. (input_boolean, binary_sensor, schedule…): пока он выключен, закрытие показано как пропущенное",
  },
  uk: {
    covers: "Штори",
    open: "Відкрити",
    close: "Закрити",
    stop: "Стоп",
    open_all: "Відкрити всі",
    close_all: "Закрити всі",
    tilt: "Нахил",
    tilt_open: "Відкрити ламелі",
    tilt_close: "Закрити ламелі",
    tilt_stop: "Зупинити ламелі",
    position_of: "Положення: {name}",
    tilt_of: "Нахил: {name}",
    move: "Перемістити",
    move_to: "Перемістити на {to}",
    cancel: "Скасувати",
    partly_open: "Частково відчинено",
    s_open: "Відкрито",
    s_closed: "Закрито",
    s_opening: "Відкривається",
    s_closing: "Закривається",
    s_unavailable: "Недоступно",
    s_unknown: "Невідомо",
    all_open: "Усі відкриті",
    all_closed: "Усі закриті",
    n_open: "Відкрито: {n}",
    n_moving: "У русі: {n}",
    n_covers: "Штор: {n}",
    average: "у середньому {pct}",
    c_shutter: "Ролета",
    c_blind: "Жалюзі",
    c_shade: "Рулонна штора",
    c_curtain: "Штора",
    c_awning: "Маркіза",
    c_garage: "Гаражні ворота",
    c_gate: "Ворота",
    c_swing: "Розпашні ворота",
    c_barrier: "Шлагбаум",
    c_hinged: "Віконниці",
    c_pergola: "Пергола",
    c_door: "Двері",
    c_window: "Вікно",
    c_damper: "Заслінка",
    pedestrian: "Для пішохода",
    confirm_open: "Відкрити {name}?",
    confirm_close: "Закрити {name}?",
    confirm_open_all: "Відкрити всі штори ({n})?",
    confirm_close_all: "Закрити всі штори ({n})?",
    confirm_move: "Перемістити {name} на {to}?",
    confirm_move_all: "Перемістити штори ({n}) на {to}?",
    confirm_pedestrian: "Відчинити {name} для пішохода?",
    not_found: "Об'єкт не знайдено",
    no_entities: "Виберіть принаймні одну штору: entity, entities або area.",
    unknown_area: "Простір не знайдено: {area}",
    empty_area: "Немає штор у просторі {area}.",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    lang_auto: "Автоматично",
    class_auto: "Автоматично (клас пристрою)",
    e_entities: "Штори",
    e_area: "Простір",
    e_title: "Заголовок (необов'язково)",
    e_device_class: "Ілюстрація",
    e_favorites: "Улюблені положення (%)",
    e_show_title: "Показувати заголовок",
    e_show_subtitle: "Показувати підзаголовок",
    e_show_controls: "Показувати кнопки відкрити / стоп / закрити",
    e_show_group_controls: "Показувати кнопки для всіх штор",
    e_show_tilt: "Показувати нахил",
    e_show_favorites: "Показувати улюблені положення",
    e_expanded: "Розгортати кожну штору",
    e_confirm: "Питати перед відкриттям або закриттям",
    e_pedestrian: "Відчинення для пішохода",
    e_light: "Підсвітка перголи",
    e_columns: "Стовпці",
    e_zoom: "Кнопка подробиць",
    e_language: "Мова",
    h_area: "Додає до списку всі штори цього простору",
    h_favorites: "Виберіть або введіть положення; кожне стане кнопкою",
    h_device_class: "Намальована ілюстрація, якщо клас пристрою не підходить",
    h_pedestrian: "Положення у % (наприклад, 30) або кнопка, скрипт чи вимикач; інакше пішохідна кнопка воріт, якщо вона є в пристрою",
    h_light: "Підсвітка перголи (LED-стрічка), намальована увімкненою під ламелями, поки вона світить",
    h_columns: "Для кількох штор: 1 — згортані рядки, 2 або 3 — сітка розгорнутих плиток",
    h_zoom: "Кнопка у правому верхньому куті, що перемикає міні-картку на повну і назад",
    confirm_auto: "Гаражні ворота, ворота та двері",
    confirm_always: "Завжди",
    confirm_never: "Ніколи",
    e_invert: "Інвертувати положення",
    h_invert: "Для штори, чия інтеграція повідомляє положення навпаки (часто маркіза)",
    e_no_feedback: "Немає зворотного зв'язку про стан",
    h_no_feedback: "Для штори, яка ніколи не повідомляє свій стан (радіомотор RTS): малюється закритою у спокої",
    e_illustration: "Анімована ілюстрація",
    e_illustration_theme: "Тема ілюстрації",
    theme_auto: "Автоматично: ніч з темною темою, день зі світлою темою",
    theme_day: "День",
    theme_night: "Ніч",
    sch_title: "Автоматичний розклад",
    sch_opens: "Відкриття",
    sch_closes: "Закриття",
    sch_opened: "Відкрито",
    sch_closed: "Закрито",
    sch_tomorrow: "завтра",
    sch_in: "через {d}",
    sch_skipped: "пропущено",
    dur_m: "{m} хв",
    dur_h: "{h} год",
    dur_hm: "{h} год {m} хв",
    e_open_time: "Час автоматичного відкриття",
    e_close_time: "Час автоматичного закриття",
    e_open_condition: "Автоматичне відкриття увімкнено",
    e_close_condition: "Автоматичне закриття увімкнено",
    e_show_schedule: "Показувати автоматичний розклад",
    h_open_time: "Датчик або input_datetime з часом (ГГ:ХХ) або датою й часом наступного автоматичного відкриття",
    h_close_time: "Датчик або input_datetime з часом (ГГ:ХХ) або датою й часом наступного автоматичного закриття",
    h_open_condition: "Об'єкт увімк./вимк. (input_boolean, binary_sensor, schedule…): поки він вимкнений, відкриття показано як пропущене",
    h_close_condition: "Об'єкт увімк./вимк. (input_boolean, binary_sensor, schedule…): поки він вимкнений, закриття показано як пропущене",
  },
  hu: {
    covers: "Árnyékolók",
    open: "Nyitás",
    close: "Zárás",
    stop: "Állj",
    open_all: "Összes nyitása",
    close_all: "Összes zárása",
    tilt: "Dőlésszög",
    tilt_open: "Lamellák nyitása",
    tilt_close: "Lamellák zárása",
    tilt_stop: "Lamellák megállítása",
    position_of: "Pozíció: {name}",
    tilt_of: "Dőlésszög: {name}",
    move: "Mozgatás",
    move_to: "Mozgatás ide: {to}",
    cancel: "Mégse",
    partly_open: "Részben nyitva",
    s_open: "Nyitva",
    s_closed: "Zárva",
    s_opening: "Nyílik",
    s_closing: "Záródik",
    s_unavailable: "Nem elérhető",
    s_unknown: "Ismeretlen",
    all_open: "Mind nyitva",
    all_closed: "Mind zárva",
    n_open: "Nyitva: {n}",
    n_moving: "Mozgásban: {n}",
    n_covers: "Árnyékolók: {n}",
    average: "átlag {pct}",
    c_shutter: "Redőny",
    c_blind: "Reluxa",
    c_shade: "Roló",
    c_curtain: "Függöny",
    c_awning: "Napellenző",
    c_garage: "Garázskapu",
    c_gate: "Kapu",
    c_swing: "Nyíló kapu",
    c_barrier: "Sorompó",
    c_hinged: "Zsalugáterek",
    c_pergola: "Pergola",
    c_door: "Ajtó",
    c_window: "Ablak",
    c_damper: "Csappantyú",
    pedestrian: "Gyalogos",
    confirm_open: "Kinyitod: {name}?",
    confirm_close: "Bezárod: {name}?",
    confirm_open_all: "Kinyitod mind a(z) {n} árnyékolót?",
    confirm_close_all: "Bezárod mind a(z) {n} árnyékolót?",
    confirm_move: "Mozgatod: {name} → {to}?",
    confirm_move_all: "Mozgatsz {n} árnyékolót ide: {to}?",
    confirm_pedestrian: "Kinyitja gyalogosnak: {name}?",
    not_found: "Entitás nem található",
    no_entities: "Válassz legalább egy árnyékolót: entity, entities vagy area.",
    unknown_area: "Terület nem található: {area}",
    empty_area: "Nincs árnyékoló ezen a területen: {area}.",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    lang_auto: "Automatikus",
    class_auto: "Automatikus (eszközosztály)",
    e_entities: "Árnyékolók",
    e_area: "Terület",
    e_title: "Cím (nem kötelező)",
    e_device_class: "Illusztráció",
    e_favorites: "Kedvenc pozíciók (%)",
    e_show_title: "Cím megjelenítése",
    e_show_subtitle: "Alcím megjelenítése",
    e_show_controls: "Nyitás / állj / zárás gombok megjelenítése",
    e_show_group_controls: "Gombok megjelenítése az összes árnyékolóhoz",
    e_show_tilt: "Dőlésszög megjelenítése",
    e_show_favorites: "Kedvenc pozíciók megjelenítése",
    e_expanded: "Minden árnyékoló kibontása",
    e_confirm: "Kérdezzen nyitás vagy zárás előtt",
    e_pedestrian: "Gyalogos nyitás",
    e_light: "Pergola világítása",
    e_columns: "Oszlopok",
    e_zoom: "Részletek gomb",
    e_language: "Nyelv",
    h_area: "A terület összes árnyékolóját hozzáadja a listához",
    h_favorites: "Válassz vagy írj be pozíciókat; mindegyik gomb lesz",
    h_device_class: "Rajzolt illusztráció, ha az eszközosztály nem megfelelő",
    h_pedestrian: "Pozíció %-ban (pl. 30), vagy egy gomb, szkript vagy kapcsoló; különben a kapu gyalogos gombja, ha az eszköznek van",
    h_light: "A pergola világítása (LED-szalag), a lamellák alatt égve rajzolva, amíg be van kapcsolva",
    h_columns: "Több árnyékolónál: 1 összecsukható sorokat mutat, 2 vagy 3 kibontott csempék rácsát",
    h_zoom: "Jobb felső gomb, amely a mini kártyát teljes kártyára váltja és vissza",
    confirm_auto: "Garázskapuk, kapuk és ajtók",
    confirm_always: "Mindig",
    confirm_never: "Soha",
    e_invert: "Pozíció megfordítása",
    h_invert: "Olyan árnyékolóhoz, amelynek integrációja fordítva jelzi a pozíciót (gyakran napellenző)",
    e_no_feedback: "Nincs állapot-visszajelzés",
    h_no_feedback: "Olyan árnyékolóhoz, amely soha nem jelzi vissza az állapotát (RTS rádiómotor): nyugalmi helyzetben zárva rajzolva",
    e_illustration: "Animált illusztráció",
    e_illustration_theme: "Az illusztráció témája",
    theme_auto: "Automatikus: éjszaka sötét témával, nappal világos témával",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
    sch_title: "Automatikus ütemezés",
    sch_opens: "Nyitás",
    sch_closes: "Zárás",
    sch_opened: "Kinyitva",
    sch_closed: "Bezárva",
    sch_tomorrow: "holnap",
    sch_in: "{d} múlva",
    sch_skipped: "kihagyva",
    dur_m: "{m} perc",
    dur_h: "{h} óra",
    dur_hm: "{h} óra {m} perc",
    e_open_time: "Automatikus nyitás ideje",
    e_close_time: "Automatikus zárás ideje",
    e_open_condition: "Automatikus nyitás engedélyezve",
    e_close_condition: "Automatikus zárás engedélyezve",
    e_show_schedule: "Automatikus ütemezés megjelenítése",
    h_open_time: "Érzékelő vagy input_datetime a következő automatikus nyitás idejével (ÓÓ:PP) vagy dátumával és idejével",
    h_close_time: "Érzékelő vagy input_datetime a következő automatikus zárás idejével (ÓÓ:PP) vagy dátumával és idejével",
    h_open_condition: "Be/ki entitás (input_boolean, binary_sensor, schedule…): amíg ki van kapcsolva, a nyitás kihagyottként jelenik meg",
    h_close_condition: "Be/ki entitás (input_boolean, binary_sensor, schedule…): amíg ki van kapcsolva, a zárás kihagyottként jelenik meg",
  },
  sk: {
    covers: "Clony",
    open: "Otvoriť",
    close: "Zatvoriť",
    stop: "Stop",
    open_all: "Otvoriť všetky",
    close_all: "Zatvoriť všetky",
    tilt: "Naklonenie",
    tilt_open: "Otvoriť lamely",
    tilt_close: "Zatvoriť lamely",
    tilt_stop: "Zastaviť lamely",
    position_of: "Poloha: {name}",
    tilt_of: "Naklonenie: {name}",
    move: "Presunúť",
    move_to: "Presunúť na {to}",
    cancel: "Zrušiť",
    partly_open: "Čiastočne otvorené",
    s_open: "Otvorené",
    s_closed: "Zatvorené",
    s_opening: "Otvára sa",
    s_closing: "Zatvára sa",
    s_unavailable: "Nedostupné",
    s_unknown: "Neznáme",
    all_open: "Všetky otvorené",
    all_closed: "Všetky zatvorené",
    n_open: "Otvorené: {n}",
    n_moving: "V pohybe: {n}",
    n_covers: "Clony: {n}",
    average: "priemer {pct}",
    c_shutter: "Vonkajšia roleta",
    c_blind: "Žalúzia",
    c_shade: "Roleta",
    c_curtain: "Záves",
    c_awning: "Markíza",
    c_garage: "Garážová brána",
    c_gate: "Brána",
    c_swing: "Krídlová brána",
    c_barrier: "Závora",
    c_hinged: "Okenice",
    c_pergola: "Pergola",
    c_door: "Dvere",
    c_window: "Okno",
    c_damper: "Klapka",
    pedestrian: "Pre chodca",
    confirm_open: "Otvoriť {name}?",
    confirm_close: "Zatvoriť {name}?",
    confirm_open_all: "Otvoriť všetky clony ({n})?",
    confirm_close_all: "Zatvoriť všetky clony ({n})?",
    confirm_move: "Presunúť {name} na {to}?",
    confirm_move_all: "Presunúť clony ({n}) na {to}?",
    confirm_pedestrian: "Otvoriť {name} pre chodca?",
    not_found: "Entita sa nenašla",
    no_entities: "Vyberte aspoň jednu clonu: entity, entities alebo area.",
    unknown_area: "Oblasť sa nenašla: {area}",
    empty_area: "V oblasti {area} nie je žiadna clona.",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    lang_auto: "Automaticky",
    class_auto: "Automaticky (trieda zariadenia)",
    e_entities: "Clony",
    e_area: "Oblasť",
    e_title: "Názov (voliteľné)",
    e_device_class: "Ilustrácia",
    e_favorites: "Obľúbené polohy (%)",
    e_show_title: "Zobraziť názov",
    e_show_subtitle: "Zobraziť podnázov",
    e_show_controls: "Zobraziť tlačidlá otvoriť / stop / zatvoriť",
    e_show_group_controls: "Zobraziť tlačidlá pre všetky clony",
    e_show_tilt: "Zobraziť naklonenie",
    e_show_favorites: "Zobraziť obľúbené polohy",
    e_expanded: "Rozbaliť každú clonu",
    e_confirm: "Pýtať sa pred otvorením alebo zatvorením",
    e_pedestrian: "Otvorenie pre chodcov",
    e_light: "Osvetlenie pergoly",
    e_columns: "Stĺpce",
    e_zoom: "Tlačidlo podrobností",
    e_language: "Jazyk",
    h_area: "Pridá do zoznamu všetky clony tejto oblasti",
    h_favorites: "Vyberte alebo zadajte polohy; každá sa stane tlačidlom",
    h_device_class: "Kreslená ilustrácia, keď trieda zariadenia nesedí",
    h_pedestrian: "Poloha v % (napr. 30) alebo tlačidlo, skript či vypínač; inak tlačidlo pre chodcov brány, ak ho zariadenie má",
    h_light: "Osvetlenie pergoly (LED pás), nakreslené rozsvietené pod lamelami, kým svieti",
    h_columns: "Pri viacerých clonách: 1 zobrazí zbaliteľné riadky, 2 alebo 3 mriežku rozbalených dlaždíc",
    h_zoom: "Tlačidlo vpravo hore, ktoré prepína mini kartu na celú kartu a späť",
    confirm_auto: "Garážové brány, brány a dvere",
    confirm_always: "Vždy",
    confirm_never: "Nikdy",
    e_invert: "Obrátiť polohu",
    h_invert: "Pre kryt, ktorého integrácia hlási polohu opačne (často markíza)",
    e_no_feedback: "Žiadna spätná väzba o stave",
    h_no_feedback: "Pre kryt, ktorý nikdy nehlási svoj stav (rádiový motor RTS): v pokoji vykreslený zatvorený",
    e_illustration: "Animovaná ilustrácia",
    e_illustration_theme: "Téma ilustrácie",
    theme_auto: "Automaticky: noc s tmavou témou, deň so svetlou témou",
    theme_day: "Deň",
    theme_night: "Noc",
    sch_title: "Automatický rozvrh",
    sch_opens: "Otvorenie",
    sch_closes: "Zatvorenie",
    sch_opened: "Otvorené",
    sch_closed: "Zatvorené",
    sch_tomorrow: "zajtra",
    sch_in: "o {d}",
    sch_skipped: "preskočené",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Čas automatického otvorenia",
    e_close_time: "Čas automatického zatvorenia",
    e_open_condition: "Automatické otváranie zapnuté",
    e_close_condition: "Automatické zatváranie zapnuté",
    e_show_schedule: "Zobraziť automatický rozvrh",
    h_open_time: "Senzor alebo input_datetime s časom (HH:MM) alebo dátumom a časom ďalšieho automatického otvorenia",
    h_close_time: "Senzor alebo input_datetime s časom (HH:MM) alebo dátumom a časom ďalšieho automatického zatvorenia",
    h_open_condition: "Entita zap./vyp. (input_boolean, binary_sensor, schedule…): kým je vypnutá, otvorenie sa zobrazí ako preskočené",
    h_close_condition: "Entita zap./vyp. (input_boolean, binary_sensor, schedule…): kým je vypnutá, zatvorenie sa zobrazí ako preskočené",
  },
  cs: {
    covers: "Clony",
    open: "Otevřít",
    close: "Zavřít",
    stop: "Stop",
    open_all: "Otevřít vše",
    close_all: "Zavřít vše",
    tilt: "Náklon",
    tilt_open: "Otevřít lamely",
    tilt_close: "Zavřít lamely",
    tilt_stop: "Zastavit lamely",
    position_of: "Poloha: {name}",
    tilt_of: "Náklon: {name}",
    move: "Přesunout",
    move_to: "Přesunout na {to}",
    cancel: "Zrušit",
    partly_open: "Částečně otevřeno",
    s_open: "Otevřeno",
    s_closed: "Zavřeno",
    s_opening: "Otevírá se",
    s_closing: "Zavírá se",
    s_unavailable: "Nedostupné",
    s_unknown: "Neznámé",
    all_open: "Vše otevřeno",
    all_closed: "Vše zavřeno",
    n_open: "Otevřeno: {n}",
    n_moving: "V pohybu: {n}",
    n_covers: "Clony: {n}",
    average: "průměr {pct}",
    c_shutter: "Venkovní roleta",
    c_blind: "Žaluzie",
    c_shade: "Roleta",
    c_curtain: "Závěs",
    c_awning: "Markýza",
    c_garage: "Garážová vrata",
    c_gate: "Brána",
    c_swing: "Křídlová brána",
    c_barrier: "Závora",
    c_hinged: "Okenice",
    c_pergola: "Pergola",
    c_door: "Dveře",
    c_window: "Okno",
    c_damper: "Klapka",
    pedestrian: "Pro pěší",
    confirm_open: "Otevřít {name}?",
    confirm_close: "Zavřít {name}?",
    confirm_open_all: "Otevřít všechny clony ({n})?",
    confirm_close_all: "Zavřít všechny clony ({n})?",
    confirm_move: "Přesunout {name} na {to}?",
    confirm_move_all: "Přesunout clony ({n}) na {to}?",
    confirm_pedestrian: "Otevřít {name} pro pěší?",
    not_found: "Entita nenalezena",
    no_entities: "Vyberte alespoň jednu clonu: entity, entities nebo area.",
    unknown_area: "Oblast nenalezena: {area}",
    empty_area: "V oblasti {area} není žádná clona.",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    lang_auto: "Automaticky",
    class_auto: "Automaticky (třída zařízení)",
    e_entities: "Clony",
    e_area: "Oblast",
    e_title: "Název (volitelné)",
    e_device_class: "Ilustrace",
    e_favorites: "Oblíbené polohy (%)",
    e_show_title: "Zobrazit název",
    e_show_subtitle: "Zobrazit podnázev",
    e_show_controls: "Zobrazit tlačítka otevřít / stop / zavřít",
    e_show_group_controls: "Zobrazit tlačítka pro všechny clony",
    e_show_tilt: "Zobrazit náklon",
    e_show_favorites: "Zobrazit oblíbené polohy",
    e_expanded: "Rozbalit každou clonu",
    e_confirm: "Ptát se před otevřením nebo zavřením",
    e_pedestrian: "Otevření pro pěší",
    e_light: "Osvětlení pergoly",
    e_columns: "Sloupce",
    e_zoom: "Tlačítko podrobností",
    e_language: "Jazyk",
    h_area: "Přidá do seznamu všechny clony této oblasti",
    h_favorites: "Vyberte nebo zadejte polohy; každá se stane tlačítkem",
    h_device_class: "Kreslená ilustrace, když třída zařízení neodpovídá",
    h_pedestrian: "Poloha v % (např. 30) nebo tlačítko, skript či vypínač; jinak tlačítko pro pěší brány, pokud ho zařízení má",
    h_light: "Osvětlení pergoly (LED pásek), nakreslené rozsvícené pod lamelami, dokud svítí",
    h_columns: "U více clon: 1 zobrazí sbalitelné řádky, 2 nebo 3 mřížku rozbalených dlaždic",
    h_zoom: "Tlačítko vpravo nahoře, které přepíná mini kartu na celou kartu a zpět",
    confirm_auto: "Garážová vrata, brány a dveře",
    confirm_always: "Vždy",
    confirm_never: "Nikdy",
    e_invert: "Obrátit polohu",
    h_invert: "Pro kryt, jehož integrace hlásí polohu obráceně (často markýza)",
    e_no_feedback: "Bez zpětné vazby o stavu",
    h_no_feedback: "Pro kryt, který nikdy nehlásí svůj stav (rádiový motor RTS): v klidu vykreslen zavřený",
    e_illustration: "Animovaná ilustrace",
    e_illustration_theme: "Motiv ilustrace",
    theme_auto: "Automaticky: noc s tmavým motivem, den se světlým motivem",
    theme_day: "Den",
    theme_night: "Noc",
    sch_title: "Automatický rozvrh",
    sch_opens: "Otevření",
    sch_closes: "Zavření",
    sch_opened: "Otevřeno",
    sch_closed: "Zavřeno",
    sch_tomorrow: "zítra",
    sch_in: "za {d}",
    sch_skipped: "přeskočeno",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Čas automatického otevření",
    e_close_time: "Čas automatického zavření",
    e_open_condition: "Automatické otevírání zapnuto",
    e_close_condition: "Automatické zavírání zapnuto",
    e_show_schedule: "Zobrazit automatický rozvrh",
    h_open_time: "Senzor nebo input_datetime s časem (HH:MM) nebo datem a časem příštího automatického otevření",
    h_close_time: "Senzor nebo input_datetime s časem (HH:MM) nebo datem a časem příštího automatického zavření",
    h_open_condition: "Entita zap./vyp. (input_boolean, binary_sensor, schedule…): dokud je vypnutá, otevření se zobrazí jako přeskočené",
    h_close_condition: "Entita zap./vyp. (input_boolean, binary_sensor, schedule…): dokud je vypnutá, zavření se zobrazí jako přeskočené",
  },
  sl: {
    covers: "Senčila",
    open: "Odpri",
    close: "Zapri",
    stop: "Ustavi",
    open_all: "Odpri vse",
    close_all: "Zapri vse",
    tilt: "Nagib",
    tilt_open: "Odpri lamele",
    tilt_close: "Zapri lamele",
    tilt_stop: "Ustavi lamele",
    position_of: "Položaj: {name}",
    tilt_of: "Nagib: {name}",
    move: "Premakni",
    move_to: "Premakni na {to}",
    cancel: "Prekliči",
    partly_open: "Delno odprto",
    s_open: "Odprto",
    s_closed: "Zaprto",
    s_opening: "Odpiranje",
    s_closing: "Zapiranje",
    s_unavailable: "Ni na voljo",
    s_unknown: "Neznano",
    all_open: "Vse odprto",
    all_closed: "Vse zaprto",
    n_open: "Odprto: {n}",
    n_moving: "V gibanju: {n}",
    n_covers: "Senčila: {n}",
    average: "povprečje {pct}",
    c_shutter: "Rolete",
    c_blind: "Žaluzije",
    c_shade: "Senčilo",
    c_curtain: "Zavesa",
    c_awning: "Markiza",
    c_garage: "Garažna vrata",
    c_gate: "Vrata dvorišča",
    c_swing: "Krilna vrata",
    c_barrier: "Zapornica",
    c_hinged: "Polkna",
    c_pergola: "Pergola",
    c_door: "Vrata",
    c_window: "Okno",
    c_damper: "Loputa",
    pedestrian: "Za pešce",
    confirm_open: "Odprem {name}?",
    confirm_close: "Zaprem {name}?",
    confirm_open_all: "Odprem vsa senčila ({n})?",
    confirm_close_all: "Zaprem vsa senčila ({n})?",
    confirm_move: "Premaknem {name} na {to}?",
    confirm_move_all: "Premaknem senčila ({n}) na {to}?",
    confirm_pedestrian: "Odprem {name} za pešca?",
    not_found: "Entiteta ni najdena",
    no_entities: "Izberite vsaj eno senčilo: entity, entities ali area.",
    unknown_area: "Območje ni najdeno: {area}",
    empty_area: "V območju {area} ni senčil.",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    lang_auto: "Samodejno",
    class_auto: "Samodejno (razred naprave)",
    e_entities: "Senčila",
    e_area: "Območje",
    e_title: "Naslov (neobvezno)",
    e_device_class: "Ilustracija",
    e_favorites: "Priljubljeni položaji (%)",
    e_show_title: "Prikaži naslov",
    e_show_subtitle: "Prikaži podnaslov",
    e_show_controls: "Prikaži gumbe odpri / ustavi / zapri",
    e_show_group_controls: "Prikaži gumbe za vsa senčila",
    e_show_tilt: "Prikaži nagib",
    e_show_favorites: "Prikaži priljubljene položaje",
    e_expanded: "Razširi vsako senčilo",
    e_confirm: "Vprašaj pred odpiranjem ali zapiranjem",
    e_pedestrian: "Odpiranje za pešce",
    e_light: "Osvetlitev pergole",
    e_columns: "Stolpci",
    e_zoom: "Gumb za podrobnosti",
    e_language: "Jezik",
    h_area: "Na seznam doda vsa senčila tega območja",
    h_favorites: "Izberite ali vpišite položaje; vsak postane gumb",
    h_device_class: "Narisana ilustracija, ko razred naprave ne ustreza",
    h_pedestrian: "Položaj v % (npr. 30) ali gumb, skript ali stikalo; sicer gumb za pešce na vratih, če ga naprava ima",
    h_light: "Osvetlitev pergole (LED trak), narisana prižgana pod lamelami, dokler sveti",
    h_columns: "Pri več senčilih: 1 prikaže zložljive vrstice, 2 ali 3 mrežo razširjenih ploščic",
    h_zoom: "Gumb zgoraj desno, ki preklopi mini kartico na celotno kartico in nazaj",
    confirm_auto: "Garažna vrata, dvoriščna vrata in vrata",
    confirm_always: "Vedno",
    confirm_never: "Nikoli",
    e_invert: "Obrni položaj",
    h_invert: "Za senčilo, katerega integracija sporoča položaj obratno (pogosto tenda)",
    e_no_feedback: "Brez povratne informacije o stanju",
    h_no_feedback: "Za senčilo, ki nikoli ne sporoči svojega stanja (radijski motor RTS): v mirovanju narisano zaprto",
    e_illustration: "Animirana ilustracija",
    e_illustration_theme: "Tema ilustracije",
    theme_auto: "Samodejno: noč s temno temo, dan s svetlo temo",
    theme_day: "Dan",
    theme_night: "Noč",
    sch_title: "Samodejni urnik",
    sch_opens: "Odpiranje",
    sch_closes: "Zapiranje",
    sch_opened: "Odprto",
    sch_closed: "Zaprto",
    sch_tomorrow: "jutri",
    sch_in: "čez {d}",
    sch_skipped: "preskočeno",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Čas samodejnega odpiranja",
    e_close_time: "Čas samodejnega zapiranja",
    e_open_condition: "Samodejno odpiranje vklopljeno",
    e_close_condition: "Samodejno zapiranje vklopljeno",
    e_show_schedule: "Prikaži samodejni urnik",
    h_open_time: "Senzor ali input_datetime s časom (HH:MM) ali datumom in časom naslednjega samodejnega odpiranja",
    h_close_time: "Senzor ali input_datetime s časom (HH:MM) ali datumom in časom naslednjega samodejnega zapiranja",
    h_open_condition: "Entiteta vklop/izklop (input_boolean, binary_sensor, schedule…): dokler je izklopljena, je odpiranje prikazano kot preskočeno",
    h_close_condition: "Entiteta vklop/izklop (input_boolean, binary_sensor, schedule…): dokler je izklopljena, je zapiranje prikazano kot preskočeno",
  },
  lv: {
    covers: "Aizsegi",
    open: "Atvērt",
    close: "Aizvērt",
    stop: "Apturēt",
    open_all: "Atvērt visus",
    close_all: "Aizvērt visus",
    tilt: "Slīpums",
    tilt_open: "Atvērt lameles",
    tilt_close: "Aizvērt lameles",
    tilt_stop: "Apturēt lameles",
    position_of: "Pozīcija: {name}",
    tilt_of: "Slīpums: {name}",
    move: "Pārvietot",
    move_to: "Pārvietot uz {to}",
    cancel: "Atcelt",
    partly_open: "Daļēji atvērts",
    s_open: "Atvērts",
    s_closed: "Aizvērts",
    s_opening: "Atveras",
    s_closing: "Aizveras",
    s_unavailable: "Nav pieejams",
    s_unknown: "Nezināms",
    all_open: "Visi atvērti",
    all_closed: "Visi aizvērti",
    n_open: "Atvērti: {n}",
    n_moving: "Kustībā: {n}",
    n_covers: "Aizsegi: {n}",
    average: "vidēji {pct}",
    c_shutter: "Rullo slēģi",
    c_blind: "Žalūzijas",
    c_shade: "Rullo žalūzijas",
    c_curtain: "Aizkars",
    c_awning: "Markīze",
    c_garage: "Garāžas vārti",
    c_gate: "Vārti",
    c_swing: "Vērtņu vārti",
    c_barrier: "Barjera",
    c_hinged: "Slēģi",
    c_pergola: "Pergola",
    c_door: "Durvis",
    c_window: "Logs",
    c_damper: "Vārsts",
    pedestrian: "Gājējam",
    confirm_open: "Atvērt {name}?",
    confirm_close: "Aizvērt {name}?",
    confirm_open_all: "Atvērt visus aizsegus ({n})?",
    confirm_close_all: "Aizvērt visus aizsegus ({n})?",
    confirm_move: "Pārvietot {name} uz {to}?",
    confirm_move_all: "Pārvietot aizsegus ({n}) uz {to}?",
    confirm_pedestrian: "Atvērt {name} gājējam?",
    not_found: "Vienība nav atrasta",
    no_entities: "Izvēlieties vismaz vienu aizsegu: entity, entities vai area.",
    unknown_area: "Apgabals nav atrasts: {area}",
    empty_area: "Apgabalā {area} nav aizsegu.",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    lang_auto: "Automātiski",
    class_auto: "Automātiski (ierīces klase)",
    e_entities: "Aizsegi",
    e_area: "Apgabals",
    e_title: "Virsraksts (neobligāts)",
    e_device_class: "Ilustrācija",
    e_favorites: "Iecienītās pozīcijas (%)",
    e_show_title: "Rādīt virsrakstu",
    e_show_subtitle: "Rādīt apakšvirsrakstu",
    e_show_controls: "Rādīt pogas atvērt / apturēt / aizvērt",
    e_show_group_controls: "Rādīt pogas visiem aizsegiem",
    e_show_tilt: "Rādīt slīpumu",
    e_show_favorites: "Rādīt iecienītās pozīcijas",
    e_expanded: "Izvērst katru aizsegu",
    e_confirm: "Jautāt pirms atvēršanas vai aizvēršanas",
    e_pedestrian: "Atvēršana gājējiem",
    e_light: "Pergolas apgaismojums",
    e_columns: "Kolonnas",
    e_zoom: "Detaļu poga",
    e_language: "Valoda",
    h_area: "Pievieno sarakstam visus šī apgabala aizsegus",
    h_favorites: "Izvēlieties vai ierakstiet pozīcijas; katra kļūst par pogu",
    h_device_class: "Zīmēta ilustrācija, ja ierīces klase neatbilst",
    h_pedestrian: "Pozīcija % (piem., 30) vai poga, skripts vai slēdzis; citādi vārtu gājēju poga, ja ierīcei tāda ir",
    h_light: "Pergolas apgaismojums (LED lente), attēlots iedegts zem lamelēm, kamēr tas ir ieslēgts",
    h_columns: "Ar vairākiem aizsegiem: 1 rāda sakļaujamas rindas, 2 vai 3 izvērstu flīžu režģi",
    h_zoom: "Poga augšējā labajā stūrī, kas pārslēdz mini karti uz pilno karti un atpakaļ",
    confirm_auto: "Garāžas vārti, vārti un durvis",
    confirm_always: "Vienmēr",
    confirm_never: "Nekad",
    e_invert: "Apvērst pozīciju",
    h_invert: "Pārsegam, kura integrācija ziņo pozīciju otrādi (bieži markīze)",
    e_no_feedback: "Nav stāvokļa atgriezeniskās saites",
    h_no_feedback: "Pārsegam, kas nekad nepaziņo savu stāvokli (RTS radio motors): miera stāvoklī zīmēts aizvērts",
    e_illustration: "Animēta ilustrācija",
    e_illustration_theme: "Ilustrācijas motīvs",
    theme_auto: "Automātiski: nakts ar tumšu tēmu, diena ar gaišu tēmu",
    theme_day: "Diena",
    theme_night: "Nakts",
    sch_title: "Automātiskais grafiks",
    sch_opens: "Atvēršana",
    sch_closes: "Aizvēršana",
    sch_opened: "Atvērts",
    sch_closed: "Aizvērts",
    sch_tomorrow: "rīt",
    sch_in: "pēc {d}",
    sch_skipped: "izlaists",
    dur_m: "{m} min",
    dur_h: "{h} h",
    dur_hm: "{h} h {m} min",
    e_open_time: "Automātiskās atvēršanas laiks",
    e_close_time: "Automātiskās aizvēršanas laiks",
    e_open_condition: "Automātiskā atvēršana ieslēgta",
    e_close_condition: "Automātiskā aizvēršana ieslēgta",
    e_show_schedule: "Rādīt automātisko grafiku",
    h_open_time: "Sensors vai input_datetime ar nākamās automātiskās atvēršanas laiku (HH:MM) vai datumu un laiku",
    h_close_time: "Sensors vai input_datetime ar nākamās automātiskās aizvēršanas laiku (HH:MM) vai datumu un laiku",
    h_open_condition: "Ieslēgšanas/izslēgšanas vienība (input_boolean, binary_sensor, schedule…): kamēr tā ir izslēgta, atvēršana tiek rādīta kā izlaista",
    h_close_condition: "Ieslēgšanas/izslēgšanas vienība (input_boolean, binary_sensor, schedule…): kamēr tā ir izslēgta, aizvēršana tiek rādīta kā izlaista",
  },
  el: {
    covers: "Σκιάστρα",
    open: "Άνοιγμα",
    close: "Κλείσιμο",
    stop: "Διακοπή",
    open_all: "Άνοιγμα όλων",
    close_all: "Κλείσιμο όλων",
    tilt: "Κλίση",
    tilt_open: "Άνοιγμα περσίδων",
    tilt_close: "Κλείσιμο περσίδων",
    tilt_stop: "Διακοπή περσίδων",
    position_of: "Θέση: {name}",
    tilt_of: "Κλίση: {name}",
    move: "Μετακίνηση",
    move_to: "Μετακίνηση στο {to}",
    cancel: "Άκυρο",
    partly_open: "Μερικώς ανοιχτό",
    s_open: "Ανοιχτό",
    s_closed: "Κλειστό",
    s_opening: "Ανοίγει",
    s_closing: "Κλείνει",
    s_unavailable: "Μη διαθέσιμο",
    s_unknown: "Άγνωστο",
    all_open: "Όλα ανοιχτά",
    all_closed: "Όλα κλειστά",
    n_open: "Ανοιχτά: {n}",
    n_moving: "Σε κίνηση: {n}",
    n_covers: "Σκιάστρα: {n}",
    average: "μέσος όρος {pct}",
    c_shutter: "Ρολό",
    c_blind: "Περσίδα",
    c_shade: "Στόρι",
    c_curtain: "Κουρτίνα",
    c_awning: "Τέντα",
    c_garage: "Γκαραζόπορτα",
    c_gate: "Αυλόπορτα",
    c_swing: "Ανοιγόμενη αυλόπορτα",
    c_barrier: "Μπάρα",
    c_hinged: "Παντζούρια",
    c_pergola: "Πέργκολα",
    c_door: "Πόρτα",
    c_window: "Παράθυρο",
    c_damper: "Διάφραγμα",
    pedestrian: "Πεζός",
    confirm_open: "Άνοιγμα: {name};",
    confirm_close: "Κλείσιμο: {name};",
    confirm_open_all: "Άνοιγμα όλων των σκιάστρων ({n});",
    confirm_close_all: "Κλείσιμο όλων των σκιάστρων ({n});",
    confirm_move: "Μετακίνηση {name} στο {to};",
    confirm_move_all: "Μετακίνηση σκιάστρων ({n}) στο {to};",
    confirm_pedestrian: "Άνοιγμα {name} για πεζό;",
    not_found: "Η οντότητα δεν βρέθηκε",
    no_entities: "Επιλέξτε τουλάχιστον ένα σκιάστρο: entity, entities ή area.",
    unknown_area: "Η περιοχή δεν βρέθηκε: {area}",
    empty_area: "Κανένα σκιάστρο στην περιοχή {area}.",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    lang_auto: "Αυτόματα",
    class_auto: "Αυτόματα (κλάση συσκευής)",
    e_entities: "Σκιάστρα",
    e_area: "Περιοχή",
    e_title: "Τίτλος (προαιρετικό)",
    e_device_class: "Εικόνα",
    e_favorites: "Αγαπημένες θέσεις (%)",
    e_show_title: "Εμφάνιση τίτλου",
    e_show_subtitle: "Εμφάνιση υπότιτλου",
    e_show_controls: "Εμφάνιση κουμπιών άνοιγμα / διακοπή / κλείσιμο",
    e_show_group_controls: "Εμφάνιση κουμπιών για όλα τα σκιάστρα",
    e_show_tilt: "Εμφάνιση κλίσης",
    e_show_favorites: "Εμφάνιση αγαπημένων θέσεων",
    e_expanded: "Ανάπτυξη κάθε σκιάστρου",
    e_confirm: "Ερώτηση πριν από άνοιγμα ή κλείσιμο",
    e_pedestrian: "Άνοιγμα για πεζούς",
    e_light: "Φωτισμός πέργκολας",
    e_columns: "Στήλες",
    e_zoom: "Κουμπί λεπτομερειών",
    e_language: "Γλώσσα",
    h_area: "Προσθέτει στη λίστα όλα τα σκιάστρα αυτής της περιοχής",
    h_favorites: "Επιλέξτε ή πληκτρολογήστε θέσεις· η καθεμία γίνεται κουμπί",
    h_device_class: "Σχεδιασμένη εικόνα, όταν η κλάση συσκευής δεν ταιριάζει",
    h_pedestrian: "Θέση σε % (π.χ. 30) ή κουμπί, σενάριο ή διακόπτης· αλλιώς το κουμπί πεζών της αυλόπορτας, αν η συσκευή έχει",
    h_light: "Ο φωτισμός της πέργκολας (ταινία LED), σχεδιασμένος αναμμένος κάτω από τις περσίδες όσο είναι ανοιχτός",
    h_columns: "Με πολλά σκίαστρα: 1 δείχνει πτυσσόμενες γραμμές, 2 ή 3 πλέγμα αναπτυγμένων πλακιδίων",
    h_zoom: "Κουμπί πάνω δεξιά που αλλάζει τη μίνι κάρτα σε πλήρη κάρτα και πίσω",
    confirm_auto: "Γκαραζόπορτες, αυλόπορτες και πόρτες",
    confirm_always: "Πάντα",
    confirm_never: "Ποτέ",
    e_invert: "Αντιστροφή θέσης",
    h_invert: "Για κάλυμμα του οποίου η ενσωμάτωση αναφέρει τη θέση ανάποδα (συχνά τέντα)",
    e_no_feedback: "Χωρίς ανατροφοδότηση κατάστασης",
    h_no_feedback: "Για ένα κάλυμμα που δεν αναφέρει ποτέ την κατάστασή του (ραδιοκινητήρας RTS): σχεδιάζεται κλειστό σε ηρεμία",
    e_illustration: "Κινούμενη εικονογράφηση",
    e_illustration_theme: "Θέμα εικονογράφησης",
    theme_auto: "Αυτόματο: νύχτα με σκούρο θέμα, μέρα με ανοιχτό θέμα",
    theme_day: "Ημέρα",
    theme_night: "Νύχτα",
    sch_title: "Αυτόματο πρόγραμμα",
    sch_opens: "Άνοιγμα",
    sch_closes: "Κλείσιμο",
    sch_opened: "Άνοιξε",
    sch_closed: "Έκλεισε",
    sch_tomorrow: "αύριο",
    sch_in: "σε {d}",
    sch_skipped: "παραλείπεται",
    dur_m: "{m} λεπ.",
    dur_h: "{h} ώρ.",
    dur_hm: "{h} ώρ. {m} λεπ.",
    e_open_time: "Ώρα αυτόματου ανοίγματος",
    e_close_time: "Ώρα αυτόματου κλεισίματος",
    e_open_condition: "Αυτόματο άνοιγμα ενεργό",
    e_close_condition: "Αυτόματο κλείσιμο ενεργό",
    e_show_schedule: "Εμφάνιση του αυτόματου προγράμματος",
    h_open_time: "Αισθητήρας ή input_datetime με την ώρα (ΩΩ:ΛΛ) ή την ημερομηνία και ώρα του επόμενου αυτόματου ανοίγματος",
    h_close_time: "Αισθητήρας ή input_datetime με την ώρα (ΩΩ:ΛΛ) ή την ημερομηνία και ώρα του επόμενου αυτόματου κλεισίματος",
    h_open_condition: "Οντότητα on/off (input_boolean, binary_sensor, schedule…): όσο είναι off, το άνοιγμα εμφανίζεται ως παραλειπόμενο",
    h_close_condition: "Οντότητα on/off (input_boolean, binary_sensor, schedule…): όσο είναι off, το κλείσιμο εμφανίζεται ως παραλειπόμενο",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language option, else Home Assistant's full locale when its base matches the card
// language (keeps pt-BR, de-CH…). A bare "pt" (Home Assistant's European Portuguese) becomes "pt-PT".
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Whole percentages, written the way of the language ("45 %" in French, "45%" in English).
const PCT_FMT = {};
const fmtPct = (v, locale) =>
  v === null || v === undefined
    ? "—"
    : (PCT_FMT[locale] ??= new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })).format(Math.round(v) / 100);

const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

// ---------------------------------------------------------------------------
// Automatic schedule: the next automatic opening and closing, read from entities (or written as times)
// ---------------------------------------------------------------------------

const SCHEDULE_KEYS = ["open_time", "close_time", "open_condition", "close_condition"];
// The words of a tile: to come, then gone by.
const SCHEDULE_WORDS = { open: ["sch_opens", "sch_opened"], close: ["sch_closes", "sch_closed"] };

// The schedule options of a cover (its own, else the card's when `card` is given), or null when it has no time.
const scheduleOf = (own, card) => {
  const src = own && (own.open_time || own.close_time) ? own : card;
  if (!src || (!src.open_time && !src.close_time)) return null;
  return Object.fromEntries(SCHEDULE_KEYS.map((k) => [k, typeof src[k] === "string" ? src[k] : null]));
};

// When a time happens, as a Date, from an entity's state or a time written in the option itself:
// - a time alone ("07:42", "07:42:00": a template sensor, a time-only input_datetime) is its next occurrence, today
//   or tomorrow when already past;
// - a date and time (a timestamp sensor, "2026-11-19 07:42:00" of an input_datetime) is taken as it is, past or not.
const TIME_RE = /^\s*(\d{1,2})[:h](\d{2})(?::(\d{2}))?\s*$/;
const whenOf = (value, now) => {
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
const dayDiff = (a, b) => Math.round((new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0)) / 86400000);

// Hours and minutes as Home Assistant shows them: its time format (12 / 24 h), else the language's; like Home
// Assistant, two-digit hours on a 24-hour clock ("07:42"), not on a 12-hour one ("7:42 AM").
const TIME_FMT = {};
const fmtTime = (date, locale, format) => {
  const key = `${locale}|${format}`;
  if (!TIME_FMT[key]) {
    const h12 =
      format === "12" || (format !== "24" && ["h11", "h12"].includes(new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle));
    TIME_FMT[key] = new Intl.DateTimeFormat(locale, { hour: h12 ? "numeric" : "2-digit", minute: "2-digit", hourCycle: h12 ? "h12" : "h23" });
  }
  return TIME_FMT[key].format(date);
};

// A position attribute as a whole number from 0 to 100, or null when the cover does not report it.
const numAttr = (s, key) => {
  const v = s?.attributes?.[key];
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? clamp(Math.round(n)) : null;
};

// 0 = closed, 100 = open (Home Assistant's convention). A cover without a position is fully open or closed by
// its state; while it moves without one, the position is unknown (null).
const positionOf = (s) => {
  const p = numAttr(s, "current_position");
  if (p !== null) return p;
  if (s?.state === "closed") return 0;
  if (s?.state === "open") return 100;
  return null;
};
const tiltOf = (s) => numAttr(s, "current_tilt_position");

// Features of a cover. Without supported_features (an old template cover), what its attributes tell.
const featuresOf = (s) => {
  const f = s?.attributes?.supported_features;
  if (f !== undefined && f !== null && Number.isFinite(Number(f))) return Number(f);
  const a = s?.attributes || {};
  return F.OPEN | F.CLOSE | F.STOP | (a.current_position !== undefined ? F.SET_POSITION : 0) | (a.current_tilt_position !== undefined ? TILT_FEATURES : 0);
};
const has = (s, feature) => (featuresOf(s) & feature) !== 0;
const hasTilt = (s) => (featuresOf(s) & TILT_FEATURES) !== 0;

const isOffline = (s) => !s || s.state === "unavailable";
const isMoving = (s) => s?.state === "opening" || s?.state === "closing";

// A gate whose name says it swings (two leaves on hinges) in any of the card's languages.
const SWING_RE = /swing|battant|batant|fl[uü]gel|drehtor|batiente|battente|draai|batente|skrzyd|kr[ií]dl|k[rř][ií]dl|krilna|крил|распаш|розпаш|ny[ií]l[oó]|двукрил|slagrind|fløj|vērtņ|ανοιγ/i;
// A barrier (a gate, or a cover without a device class, whose name says so: a lifting arm), a pergola (louvres
// turning on a frame, whatever its device class but a door, gate or damper) and hinged shutters (a shutter, or a
// cover without a device class, whose two leaves fold out), in any of the card's languages.
const BARRIER_RE = /barri[eè]r|barier|barrera|barjera|schranke|sbarra|slagboom|cancela|szlaban|z[aá]vor|zapornic|sorompó|shlagbaum|шлагбаум|бариер|рампа|\brampa\b|μπάρα|\bbom\b|boom gate/i;
const PERGOLA_RE = /pergol|πέργκολ|περγκολ|пергол|louvre|louver|bioclim|lamellendach/i;
const HINGED_RE = /hinged|battant|klappl|fensterl[aä]d|contravent|postigo|battente|\bscur|luik|portada|okiennic|oblon|skodde|fönsterluck|kapci|капци|капаци|ставн|віконниц|zsalug|okenic|polkn|slēģ|παντζ/i;
const classOf = (s, override) => {
  if (PICTURES.includes(override)) return override;
  const dc = s?.attributes?.device_class;
  const name = s?.attributes?.friendly_name || s?.entity_id || "";
  if ((dc === "gate" || !dc) && BARRIER_RE.test(name)) return "barrier";
  if (dc === "gate" && SWING_RE.test(name)) return "swing";
  if (!["door", "gate", "garage", "damper"].includes(dc) && PERGOLA_RE.test(name)) return "pergola";
  if ((dc === "shutter" || !dc) && HINGED_RE.test(name)) return "hinged";
  return CLASSES.includes(dc) ? dc : "shutter";
};

// The pedestrian opening of a gate: `pedestrian` (the cover's, else the card's) as a position in % or an entity to
// press (button, script, switch), `false` for none; unset, the gate's own pedestrian button or switch, found on its
// device by its name. Returns { position } or { entity }, or null.
const PEDESTRIAN_RE = /pedestrian|pi[eé]ton|fu(ss|ß)g|peat[oó]n|pedonal|voetg|piesz|pietonal|g[aå]ende|fodg|chodc|pě[sš]|pe[sš]c|pe[sš]ak|gājēj|πεζ|пешех|пешач|пішох|gyalog|wicket/i;
const pedestrianOf = (hass, id, cls, own) => {
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
const stateClass = (s, cls) => {
  if (isOffline(s)) return "crit";
  if (isMoving(s)) return "active";
  if (s.state === "open") return GUARDED.has(cls) ? "warn" : "ok";
  return "idle";
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

// Covers of an area: the entity's own area, else its device's; hidden entities and entity categories left out.
const areaOf = (hass, id) => {
  const e = hass?.entities?.[id];
  if (!e) return null;
  return e.area_id || hass.devices?.[e.device_id]?.area_id || null;
};
const findArea = (hass, ref) => {
  if (!ref || !hass?.areas) return null;
  if (hass.areas[ref]) return hass.areas[ref];
  const low = String(ref).toLowerCase();
  return Object.values(hass.areas).find((a) => String(a.name || "").toLowerCase() === low) || null;
};
const coversOfArea = (hass, areaId) =>
  Object.keys(hass?.states || {})
    .filter((id) => id.startsWith("cover.") && areaOf(hass, id) === areaId && !hass.entities[id]?.hidden && !hass.entities[id]?.entity_category)
    .sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b)));

const nameOf = (hass, id, own) => own || hass?.states?.[id]?.attributes?.friendly_name || id;

// The covers a card shows, as { entity, name, device_class, favorites }: `entity`, then `entities` (ids or objects),
// then the covers of `area` not listed already.
const itemsOf = (hass, config) => {
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
const favoritesOf = (list) =>
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

// ---------------------------------------------------------------------------
// Pictures: one drawn scene per device class, set by --p (position) and --t (tilt), animated while it moves
// ---------------------------------------------------------------------------

// The pictures are inline SVG (in the card's shadow root): their moving parts follow the CSS variables --p and --t
// of the picture, so dragging the picture moves them at once, without a redraw. Gradient ids carry a prefix per
// picture (`u`), as every picture of the card shares one shadow root.
const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");

const DEFS = (u) => `<defs>
  <linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfa"/><stop offset="1" stop-color="#d9dad7"/></linearGradient>
  <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe9fb"/><stop offset=".55" stop-color="#eef7fd"/><stop offset="1" stop-color="#b7dcf5"/></linearGradient>
  <linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ecef"/><stop offset="1" stop-color="#b9bfc6"/></linearGradient>
  <linearGradient id="${u}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa0a6"/><stop offset=".5" stop-color="#e6e8ea"/><stop offset="1" stop-color="#8a9097"/></linearGradient>
  <linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f73a0"/><stop offset=".5" stop-color="#7d9cc4"/><stop offset="1" stop-color="#4f73a0"/></linearGradient>
  <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a62"/><stop offset="1" stop-color="#8a6043"/></linearGradient>
</defs>`;

// A window: white frame, sky glass, mullions.
const windowFrame = (u) =>
  `<rect x="10" y="14" width="80" height="96" rx="3" fill="url(#${u}f)" stroke="#c4c5c2"/>
   <rect x="14" y="18" width="72" height="88" fill="url(#${u}g)"/>
   <path d="M50 18V106M14 62H86" stroke="#d9dad7" stroke-width="2.5"/>
   <path d="M20 30l14-10M20 44l26-20" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
// Clips its content to the glass of the window (a nested viewport clips, no id needed).
const glass = (inner) => `<svg x="14" y="18" width="72" height="88" viewBox="14 18 72 88">${inner}</svg>`;
// Warning lamp of a motorized door or gate, which blinks while it moves.
const lamp = (x, y) => `<circle class="lamp" cx="${x}" cy="${y}" r="3.2"/><circle class="lamp-glow" cx="${x}" cy="${y}" r="7"/>`;

const SCENES = {
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
const AXES = {
  up: { from: 18, len: 88, open: -1 },
  down: { from: 20, len: 54, open: 1 },
  across: { from: 14, len: 72, open: 1 },
};
const ACROSS = new Set(["curtain", "gate", "swing", "hinged", "pergola"]);
const axisOf = (cls) => (ACROSS.has(cls) ? "across" : cls === "awning" ? "down" : "up");
// Where position `p` lies along the rail of `axis`, in viewBox units.
const railAt = (axis, p) => {
  const a = AXES[axis];
  return a.from + ((a.open < 0 ? 100 - p : p) * a.len) / 100;
};

// Rail and knob of the position slider; `target` marks a position being reached.
const rail = (axis, target) => {
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

let PIC_UID = 0;
const coverSvg = (cls, { slider = false, target = null } = {}) => {
  const u = `cc${(PIC_UID = (PIC_UID + 1) % 1e6)}`;
  return `<svg class="scene ${cls}" viewBox="0 0 100 120" aria-hidden="true">${DEFS(u)}${(SCENES[cls] || SCENES.shutter)(u)}${slider ? rail(axisOf(cls), target) : ""}</svg>`;
};

// Moving parts of the scenes. --p is the position (0 closed, 100 open) and --t the tilt, both unitless.
const SCENE_STYLE = `
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

// ---------------------------------------------------------------------------
// Styles (same language as the other ha-* cards: tinted 40 px badge, state chip, smoked-glass buttons)
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --cc-ok: var(--success-color, #43a047); --cc-warn: var(--warning-color, #ffa600); --cc-crit: var(--error-color, #db4437);
          --cc-idle: var(--disabled-text-color, #9e9e9e); --cc-active: var(--info-color, #039be5); --cc-accent: var(--primary-color, #03a9f4); }
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
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 160px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

const FULL_STYLE = `
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
  .tile { container-type: inline-size; min-width: 0; border-radius: 12px; background: var(--secondary-background-color, rgba(127,127,127,.08));
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

const MINI_STYLE = `
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
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);

// True for a click outside `card` that is not in a dialog opened from it (more-info, say).
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};
// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event. `tap(ev)` (press and release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
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
const CONFIRM_GUARD_MS = 400;
// After a position is sent, the picture keeps it until the cover reports a new state (or for this long), instead of
// jumping back to the old position meanwhile.
const HOLD_MS = 3000;
// Keyboard on a slider: the value is sent once the keys have rested this long.
const KEY_COMMIT_MS = 700;
// The mark of a position being reached stays this long at most.
const TARGET_MS = 120000;

// Elements a click acts on, and how one is told from the others across renders.
const FOCUS_SELECTOR = "[data-action], [data-entity], [data-slider]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset }).filter(([k]) => k !== "label");
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// Services of the buttons.
const SERVICES = {
  open: ["open_cover", F.OPEN],
  close: ["close_cover", F.CLOSE],
  stop: ["stop_cover", F.STOP],
  tilt_open: ["open_cover_tilt", F.OPEN_TILT],
  tilt_close: ["close_cover_tilt", F.CLOSE_TILT],
  tilt_stop: ["stop_cover_tilt", F.STOP_TILT],
};
const GROUP_ACTIONS = { open_all: "open", close_all: "close", stop_all: "stop" };

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Illustrated header ("banner"): 90 px, a facade wall, the covers' own pictures, a pavement strip
// ---------------------------------------------------------------------------

// Covers drawn in the banner at most (fewer on a narrow card, see BANNER_STYLE).
const BANNER_MAX = 3;

// Night picture: forced by illustration_theme, else the sun below the horizon or Home Assistant's dark theme.
// The width of an element's whole text in fractional pixels, even while it is cut with an ellipsis (0 when hidden).
const textWidth = (el) => {
  if (!el?.getClientRects?.().length || typeof document.createRange !== "function") return 0;
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
const isNight = (hass, config) => {
  if (config?.illustration_theme === "night") return true;
  if (config?.illustration_theme === "day") return false;
  return Boolean(hass?.themes?.darkMode);
};

// A potted plant against the wall, standing on the pavement.
const PLANT = `<svg class="plant" viewBox="0 0 18 30" aria-hidden="true"><path class="leaf" d="M9 20C3 18 1 11 3 6c3 3 5 7 6 12 1-6 3-11 7-14 1 6-1 13-7 16Z"/><rect class="pot" x="2" y="19" width="14" height="11" rx="1"/><rect class="rim" x="1" y="18" width="16" height="3" rx="1"/></svg>`;

// The banner: wall colour and siding at the left fading in under the pictures, text colours, state-colored icon,
// the covers on the right at 84 px high (100 × 120 pictures), lowered so that floor-standing ones (garage door,
// gate, door, whose ground line is y 112) stand on the 10 px pavement strip.
const BANNER_STYLE = `
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
  /* At night the window behind hinged shutters glows warm, a barrier's lamp shines red and a pergola lets no sun in. */
  .night .bv .hinged .warm { opacity: .8; }
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

class CoverBase extends HTMLElement {
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
      return {
        id: i.entity,
        s,
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
    if (this._confirm) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    }
    if (html === this._html) return;
    const focused = this._confirm && this.shadowRoot.activeElement?.dataset?.action;
    // The focus is kept across a rewrite for the keyboard only: after a mouse click, it would draw the focus ring.
    const kept = this._confirm || this._byPointer ? null : this._focusedSpot();
    this._html = html;
    this.shadowRoot.innerHTML = html;
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
    const cls = [base, stateClass(s, item.cls), isMoving(s) ? `moving ${s.state}` : "", off ? "off" : "", lit].filter(Boolean).join(" ");
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
const columnsOf = (config) => {
  const n = Number(config?.columns);
  return n === 2 || n === 3 ? n : 1;
};

// CSS.escape where it exists (browsers); the test sandbox has none, and entity ids need no escaping there.
const CSS_ESCAPE = (v) => (globalThis.CSS?.escape ? globalThis.CSS.escape(v) : String(v).replace(/["\\]/g, "\\$&"));

class CoverCard extends CoverBase {
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
class CoverMiniCard extends CoverCard {
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

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
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
const FAVORITE_PRESETS = ["10", "25", "50", "75", "90"];
// The `columns` option in the editor, as strings (a select); 1 is the default and stays out of the YAML.
const COLUMN_CHOICES = ["1", "2", "3"];
// The `confirm` option in the editor: unset (garage doors, gates and doors), true or false.
const CONFIRM_MODES = [
  ["auto", undefined],
  ["always", true],
  ["never", false],
];

// Editor form data ↔ card config: the cover list holds ids in the form (objects keep their own options), the
// favorites strings (objects are kept as they are), and options left at their default stay out of the YAML.
const toForm = (config, toggles) => {
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

const fromForm = (value, previous, toggles) => {
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

class CoverEditorBase extends HTMLElement {
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
const CARD_TOGGLES = [
  ["illustration", true],
  ["show_title", true],
  ["show_subtitle", true],
  ["show_controls", true],
  ["show_group_controls", true],
  ["show_tilt", true],
  ["show_favorites", true],
  ["show_schedule", true],
  ["expanded", false],
];

class CoverCardEditor extends CoverEditorBase {
  static get toggles() {
    return CARD_TOGGLES;
  }
}

class CoverMiniCardEditor extends CoverEditorBase {
  static get toggles() {
    return [...CARD_TOGGLES, ["zoom", true]];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("cover-card", CoverCard);
define("cover-mini-card", CoverMiniCard);
define("cover-card-editor", CoverCardEditor);
define("cover-mini-card-editor", CoverMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "cover-card",
    name: "Cover Card",
    description: "Control one or several covers (shutters, blinds, shades, curtains, awnings, garage doors, gates, windows): animated picture as position slider, tilt, favorite positions.",
  },
  {
    type: "cover-mini-card",
    name: "Cover Mini Card",
    description: "Compact view of a group of covers (an area, a list) with open, stop and close buttons for all of them.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-cover-card" });
}

console.info(
  `%c COVER-CARD %c v${VERSION} `,
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;",
);
