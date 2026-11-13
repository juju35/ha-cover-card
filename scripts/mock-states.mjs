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
cover("cover.front_door", "hall", "Front door", "door", "closed", { supported_features: 1 | 2 });
cover("cover.attic_window", "attic", "Attic window", "window", "open", { current_position: 30 });
cover("cover.utility_damper", "utility", "Air damper", "damper", "open", { current_position: 70, supported_features: 1 | 2 | 4 });
cover("cover.guest_room_shutter", "bedroom", "Guest room shutter", "shutter", "unavailable", { supported_features: POSITION });
