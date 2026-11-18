// Mock Home Assistant registries and states for the screenshots and the tests: covers of every device class, in
// neutral areas of a home, from no integration in particular (the cards only read the cover domain).
export const states = {};
export const entities = {};
export const devices = {};
export const areas = {};

for (const [area_id, name] of [
  ["living_room", "Living room"],
  ["office", "Office"],
  ["bedroom", "Bedroom"],
  ["kitchen", "Kitchen"],
  ["terrace", "Terrace"],
  ["garage", "Garage"],
  ["garden", "Garden"],
  ["attic", "Attic"],
  ["hall", "Hall"],
  ["utility", "Utility room"],
])
  areas[area_id] = { area_id, name };

// supported_features: open 1, close 2, set position 4, stop 8, open tilt 16, close tilt 32, stop tilt 64, set tilt 128.
const POSITION = 1 | 2 | 4 | 8;
const TILT = 16 | 32 | 64 | 128;

const cover = (entity_id, area_id, name, device_class, state, attributes = {}) => {
  const device_id = `dev_${entity_id.split(".")[1]}`;
  devices[device_id] = { id: device_id, name, area_id, name_by_user: null };
  entities[entity_id] = { entity_id, device_id, area_id: null, platform: "template", hidden: false, entity_category: null };
  states[entity_id] = { entity_id, state, attributes: { friendly_name: name, device_class, supported_features: POSITION, ...attributes } };
};

cover("cover.living_room_bay_window", "living_room", "Bay window", "shutter", "open", { current_position: 60 });
cover("cover.living_room_patio_door", "living_room", "Patio door", "shutter", "closed", { current_position: 0 });
cover("cover.living_room_side_window", "living_room", "Side window", "shutter", "open", { current_position: 100 });
cover("cover.office_blind", "office", "Office blind", "blind", "open", { current_position: 15, current_tilt_position: 45, supported_features: POSITION | TILT });
cover("cover.bedroom_curtains", "bedroom", "Bedroom curtains", "curtain", "open", { current_position: 35 });
cover("cover.kitchen_shade", "kitchen", "Kitchen shade", "shade", "open", { current_position: 50 });
cover("cover.terrace_awning", "terrace", "Terrace awning", "awning", "open", { current_position: 80 });
cover("cover.garage_door", "garage", "Garage door", "garage", "closed", { supported_features: 1 | 2 | 8 });
cover("cover.driveway_gate", "garden", "Driveway gate", "gate", "open", { supported_features: 1 | 2 | 8 });
cover("cover.swing_gate", "garden", "Swing gate", "gate", "open", { current_position: 55 });
// The swing gate's pedestrian button, on the gate's own device (the card finds it there by its name).
entities["button.swing_gate_pedestrian"] = { entity_id: "button.swing_gate_pedestrian", device_id: "dev_swing_gate", area_id: null, platform: "template", hidden: false, entity_category: null };
states["button.swing_gate_pedestrian"] = { entity_id: "button.swing_gate_pedestrian", state: "unknown", attributes: { friendly_name: "Swing gate Pedestrian opening" } };
// A barrier (found by its name), hinged shutters (found by their name) and a bioclimatic pergola whose louvres only
// tilt, with the LED strip under its frame.
cover("cover.car_park_barrier", "garden", "Car park barrier", "gate", "open", { supported_features: 1 | 2 | 8 });
cover("cover.hinged_shutters", "bedroom", "Hinged shutters", "shutter", "open", { current_position: 80 });
cover("cover.terrace_pergola", "terrace", "Terrace pergola", "awning", "open", { current_tilt_position: 55, supported_features: TILT });
entities["light.terrace_pergola_led"] = { entity_id: "light.terrace_pergola_led", device_id: "dev_terrace_pergola", area_id: null, platform: "template", hidden: false, entity_category: null };
states["light.terrace_pergola_led"] = { entity_id: "light.terrace_pergola_led", state: "on", attributes: { friendly_name: "Terrace pergola LED" } };
cover("cover.front_door", "hall", "Front door", "door", "closed", { supported_features: 1 | 2 });
cover("cover.attic_window", "attic", "Attic window", "window", "open", { current_position: 30 });
cover("cover.utility_damper", "utility", "Air damper", "damper", "open", { current_position: 70, supported_features: 1 | 2 | 4 });
// The automatic schedule of the bay window: the opening of the day as a timestamp sensor, the closing as a template
// sensor giving the time alone, the next opening (tomorrow's), and its condition turned off (a day off at home).
const sensor = (entity_id, state, attributes = {}) => (states[entity_id] = { entity_id, state, attributes });
sensor("sensor.bay_window_opening", "2026-06-15T07:42:00+00:00", { friendly_name: "Bay window opening", device_class: "timestamp" });
sensor("sensor.bay_window_closing", "18:05", { friendly_name: "Bay window closing" });
sensor("sensor.bay_window_next_opening", "08:12", { friendly_name: "Bay window next opening" });
sensor("input_boolean.covers_auto_open", "off", { friendly_name: "Open the covers automatically" });
cover("cover.guest_room_shutter", "bedroom", "Guest room shutter", "shutter", "unavailable", { supported_features: POSITION });
