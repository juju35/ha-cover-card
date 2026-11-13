// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture, "-light" for a dark one) that shows
// exactly the same state: only the theme differs (checked by test/screenshots.test.mjs).

const LIVING = ["cover.living_room_bay_window", "cover.living_room_patio_door", "cover.living_room_side_window"];
const ALL = [
  "cover.living_room_bay_window",
  "cover.office_blind",
  "cover.kitchen_shade",
  "cover.bedroom_curtains",
  "cover.terrace_awning",
  "cover.garage_door",
  "cover.driveway_gate",
  "cover.front_door",
  "cover.attic_window",
  "cover.utility_damper",
];

const twins = (list) => list.flatMap(({ file, theme = "light", ...s }) => [
  { file, theme, ...s },
  { file: `${file}-${theme === "light" ? "dark" : "light"}`, theme: theme === "light" ? "dark" : "light", ...s },
]);

export const shots = twins([
  { file: "card", type: "cover-card", width: 420, config: { entity: "cover.living_room_bay_window", favorites: [25, 50, 75] } },
  { file: "card-blind", type: "cover-card", width: 420, config: { entity: "cover.office_blind", favorites: [{ name: "Reading", position: 15, tilt: 45 }, { name: "Privacy", position: 0, tilt: 10 }] } },
  { file: "card-area", type: "cover-card", width: 420, config: { area: "living_room", favorites: [0, 50, 100] }, clicks: ['[data-action="toggle"][data-entity="cover.living_room_bay_window"]'] },
  { file: "card-garage", type: "cover-card", width: 420, config: { entity: "cover.garage_door" }, clicks: ['[data-action="open"]'] },
  { file: "card-unavailable", type: "cover-card", width: 420, config: { entity: "cover.guest_room_shutter" } },
  { file: "mini-card", type: "cover-mini-card", width: 400, config: { area: "living_room" } },
  { file: "mini-card-all", type: "cover-mini-card", width: 460, config: { title: "Every kind of cover", entities: ALL } },
  { file: "mini-card-zoomed", type: "cover-mini-card", width: 420, config: { entities: LIVING, title: "Living room" }, clicks: ['[data-action="zoom"]', '[data-action="toggle"][data-entity="cover.living_room_patio_door"]'] },
]);

// One animation per kind of motion: every picture moves its own way while its cover opens or closes.
const moving = (file, entity, state, extra = {}) => ({
  file,
  type: "cover-card",
  width: 420,
  config: { entity, show_favorites: false },
  overrides: { [entity]: { state, ...extra } },
});

export const gifs = twins([
  moving("shutter-closing", "cover.living_room_bay_window", "closing"),
  moving("shutter-opening", "cover.living_room_patio_door", "opening", { current_position: 20 }),
  moving("blind-opening", "cover.office_blind", "opening", { current_position: 40 }),
  moving("shade-closing", "cover.kitchen_shade", "closing"),
  moving("curtain-opening", "cover.bedroom_curtains", "opening"),
  moving("awning-opening", "cover.terrace_awning", "opening", { current_position: 50 }),
  moving("garage-opening", "cover.garage_door", "opening"),
  moving("gate-closing", "cover.driveway_gate", "closing"),
  moving("door-opening", "cover.front_door", "opening"),
  moving("window-opening", "cover.attic_window", "opening"),
  moving("damper-opening", "cover.utility_damper", "opening"),
]);
