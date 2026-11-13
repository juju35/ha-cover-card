import assert from "node:assert/strict";
import { test } from "node:test";
import { click, load, makeHass, newCard, plain } from "./load.mjs";

const cc = load();
// The card's markup, without its style sheets (whose selectors name the same attributes).
const html = (card) => card.shadowRoot.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const BAY = "cover.living_room_bay_window";
const BLIND = "cover.office_blind";
const GARAGE = "cover.garage_door";

test("position and tilt follow Home Assistant's convention, whole numbers from 0 to 100", () => {
  assert.equal(cc.positionOf({ state: "open", attributes: { current_position: 42.6 } }), 43);
  assert.equal(cc.positionOf({ state: "open", attributes: { current_position: 140 } }), 100);
  assert.equal(cc.positionOf({ state: "closed", attributes: {} }), 0);
  assert.equal(cc.positionOf({ state: "open", attributes: {} }), 100);
  assert.equal(cc.positionOf({ state: "opening", attributes: {} }), null);
  assert.equal(cc.positionOf({ state: "open", attributes: { current_position: null } }), 100);
  assert.equal(cc.tiltOf({ state: "open", attributes: {} }), null);
  assert.equal(cc.tiltOf({ state: "open", attributes: { current_tilt_position: "45" } }), 45);
});

test("percentages are whole and written the way of the language", () => {
  assert.equal(cc.fmtPct(42.4, "en"), "42%");
  assert.equal(cc.fmtPct(42.6, "fr").replace(/\s/g, " "), "43 %");
  assert.equal(cc.fmtPct(null, "en"), "—");
});

test("features: supported_features, else what the attributes tell", () => {
  assert.equal(cc.featuresOf({ attributes: { supported_features: 11 } }), 11);
  const old = cc.featuresOf({ attributes: { current_position: 10 } });
  assert.ok(old & cc.F.SET_POSITION && old & cc.F.OPEN && !(old & cc.F.OPEN_TILT));
});

test("device class picks the scene, a cover without one is a shutter, an override wins", () => {
  assert.equal(cc.classOf({ attributes: { device_class: "garage" } }), "garage");
  assert.equal(cc.classOf({ attributes: {} }), "shutter");
  assert.equal(cc.classOf({ attributes: { device_class: "garage" } }, "gate"), "gate");
  for (const c of cc.CLASSES) {
    assert.ok(cc.SCENES[c], c);
    assert.equal(cc.ICONS[c].length, 2, c);
    assert.match(cc.coverSvg(c, { slider: true, target: 30 }), /^<svg class="scene [a-z]+" viewBox="0 0 100 120"[\s\S]*class="target"[\s\S]*<\/svg>$/);
  }
});

test("open is green for a shutter but a warning for a garage door, gate, door or window", () => {
  assert.equal(cc.stateClass({ state: "open" }, "shutter"), "ok");
  for (const c of ["garage", "gate", "door", "window"]) assert.equal(cc.stateClass({ state: "open" }, c), "warn");
  assert.equal(cc.stateClass({ state: "closing" }, "shutter"), "active");
  assert.equal(cc.stateClass({ state: "closed" }, "shutter"), "idle");
  assert.equal(cc.stateClass({ state: "unavailable" }, "shutter"), "crit");
  assert.equal(cc.stateClass(undefined, "shutter"), "crit");
});

test("covers come from entity, entities (ids or objects) and area, without duplicates", () => {
  const hass = makeHass();
  const { items } = cc.itemsOf(hass, { entity: BAY, entities: [BAY, { entity: BLIND, name: "Blind" }], area: "Living room" });
  assert.deepEqual(
    plain(items.map((i) => i.entity)),
    [BAY, BLIND, "cover.living_room_patio_door", "cover.living_room_side_window"],
  );
  assert.equal(items[1].name, "Blind");
  // The area by its id or its name, case aside; its covers by name.
  assert.deepEqual(
    cc.itemsOf(hass, { area: "living_room" }).items.map((i) => i.entity),
    cc.itemsOf(hass, { area: "LIVING ROOM" }).items.map((i) => i.entity),
  );
});

test("favorites: numbers or objects, invalid ones dropped", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(cc.favoritesOf([25, "50", { name: "Shade", position: 30, tilt: 120 }, { name: "x" }, "a", null]))), [
    { name: "", position: 25, tilt: null },
    { name: "", position: 50, tilt: null },
    { name: "Shade", position: 30, tilt: 100 },
  ]);
});

test("one cover: header, position, state, picture slider and buttons", () => {
  const card = newCard(cc.CoverCard, { entity: BAY });
  const h = html(card);
  assert.match(h, /<div class="name">Bay window<\/div>/);
  assert.match(h, /<div class="sub">Roller shutter · Living room<\/div>/);
  assert.match(h, /class="chip ok[^"]*"[^>]*><span class="dot"><\/span><span class="t">Open<\/span>/);
  assert.match(h, /class="badge ok/);
  assert.match(h, />60%</);
  assert.match(h, /role="slider" tabindex="0" aria-orientation="vertical"[^>]*aria-valuenow="60"/);
  assert.match(h, /style="--p:60;--t:50"/);
  for (const a of ["open", "stop", "close"]) assert.match(h, new RegExp(`data-action="${a}" data-entity="${BAY}"`));
  // No tilt for a shutter without tilt features.
  assert.doesNotMatch(h, /tilt-row/);
});

test("buttons call the cover services; open is disabled when fully open, close when fully closed", () => {
  const hass = makeHass({ [BAY]: { current_position: 100 } });
  const card = newCard(cc.CoverCard, { entity: BAY }, hass);
  assert.match(html(card), /data-action="open"[^>]*disabled/);
  assert.doesNotMatch(html(card), /data-action="close"[^>]*disabled/);
  click(card, { action: "close", entity: BAY });
  click(card, { action: "stop", entity: BAY });
  assert.deepEqual(plain(hass.calls), [
    ["cover", "close_cover", { entity_id: BAY }],
    ["cover", "stop_cover", { entity_id: BAY }],
  ]);
});

test("the button of the way the cover moves is lit, and stays usable", () => {
  const card = newCard(cc.CoverCard, { entity: BAY }, makeHass({ [BAY]: "closing" }));
  assert.match(html(card), /class="btn close on" data-action="close"(?![^>]*disabled)/);
  assert.match(html(card), /class="visual active moving closing"/);
  assert.match(html(card), /<span class="t">Closing<\/span>/);
});

test("unsupported features get no button, no slider and no tilt", () => {
  const card = newCard(cc.CoverCard, { entity: "cover.front_door" });
  const h = html(card);
  assert.doesNotMatch(h, /data-action="stop"/);
  assert.doesNotMatch(h, /role="slider"/);
  // Without a position, the state is written in big.
  assert.match(h, /class="pos word idle clickable"[^>]*>Closed</);
});

test("tilt: slider and buttons when supported, set_cover_tilt_position on commit", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entity: BLIND }, hass);
  const h = html(card);
  assert.match(h, /data-slider="tilt" data-entity="cover.office_blind"/);
  assert.match(h, /aria-orientation="horizontal"[^>]*aria-valuenow="45"/);
  for (const a of ["tilt_open", "tilt_stop", "tilt_close"]) assert.match(h, new RegExp(`data-action="${a}"`));
  card._commit(BLIND, "tilt", 70);
  card._commit(BLIND, "pos", 30);
  click(card, { action: "tilt_open", entity: BLIND });
  assert.deepEqual(plain(hass.calls), [
    ["cover", "set_cover_tilt_position", { entity_id: BLIND, tilt_position: 70 }],
    ["cover", "set_cover_position", { entity_id: BLIND, position: 30 }],
    ["cover", "open_cover_tilt", { entity_id: BLIND }],
  ]);
  const off = newCard(cc.CoverCard, { entity: BLIND, show_tilt: false });
  assert.doesNotMatch(html(off), /tilt-row/);
});

test("a position sent shows its target on the rail while the cover gets there", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entity: BAY }, hass);
  card._commit(BAY, "pos", 20);
  card._hold = null;
  card.hass = makeHass({ [BAY]: { state: "closing", current_position: 55 } });
  assert.match(html(card), /class="target" x="92" y="87\.65"/);
  // Reached: the mark goes.
  card.hass = makeHass({ [BAY]: { state: "open", current_position: 20 } });
  assert.doesNotMatch(html(card), /class="target"/);
});

test("the keyboard moves a slider and sends the value once the keys rest", async () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entity: BAY }, hass);
  const el = { dataset: { slider: "pos", entity: BAY }, getAttribute: (a) => (a === "aria-valuenow" ? "60" : null) };
  let prevented = 0;
  const key = (k) => card._onSliderKey({ key: k, preventDefault: () => prevented++ }, el);
  key("ArrowUp");
  key("ArrowUp");
  key("PageDown");
  assert.equal(card._kbd.value, 45);
  key("Tab");
  assert.equal(prevented, 3);
  await new Promise((r) => setTimeout(r, 800));
  assert.deepEqual(plain(hass.calls), [["cover", "set_cover_position", { entity_id: BAY, position: 45 }]]);
  key("End");
  assert.equal(card._kbd.value, 100);
  clearTimeout(card._kbd.timer);
});

test("favorites: the reached one is lit, a click sets position and tilt", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entity: BLIND, favorites: [{ name: "Reading", position: 15, tilt: 45 }, 60] }, hass);
  const h = html(card);
  assert.match(h, /class="btn on" data-action="fav" data-entity="cover.office_blind" data-index="0"[^>]*><svg[\s\S]*?<span>Reading<\/span>/);
  assert.match(h, /class="btn" data-action="fav"[^>]*data-index="1"[^>]*aria-label="Move to 60%"/);
  click(card, { action: "fav", entity: BLIND, index: "0" });
  assert.deepEqual(plain(hass.calls), [
    ["cover", "set_cover_position", { entity_id: BLIND, position: 15 }],
    ["cover", "set_cover_tilt_position", { entity_id: BLIND, tilt_position: 45 }],
  ]);
  // Hidden with show_favorites: false, and none for a cover that cannot be set to a position.
  assert.doesNotMatch(html(newCard(cc.CoverCard, { entity: BLIND, favorites: [50], show_favorites: false })), /data-action="fav"/);
  assert.doesNotMatch(html(newCard(cc.CoverCard, { entity: GARAGE, favorites: [50] })), /data-action="fav"/);
});

test("confirm: opening asks first, Cancel does nothing, OK sends; stop never asks", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entity: GARAGE, confirm: true }, hass);
  click(card, { action: "open", entity: GARAGE });
  assert.match(html(card), /<ha-card class="dialog-open">[\s\S]*Open Garage door\?[\s\S]*data-action="confirm_ok"/);
  click(card, { action: "confirm_cancel" });
  assert.deepEqual(plain(hass.calls), []);
  card._confirmClosedAt = 0;
  click(card, { action: "open", entity: GARAGE });
  click(card, { action: "confirm_ok" });
  card._confirmClosedAt = 0;
  click(card, { action: "stop", entity: GARAGE });
  assert.deepEqual(plain(hass.calls), [
    ["cover", "open_cover", { entity_id: GARAGE }],
    ["cover", "stop_cover", { entity_id: GARAGE }],
  ]);
});

test("several covers: group buttons, foldable rows, folded back by a click elsewhere", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { area: "living_room" }, hass);
  let h = html(card);
  assert.match(h, /<div class="name">Living room<\/div>/);
  assert.match(h, /3 covers · average 53%/);
  assert.match(h, /<span class="t">2 open<\/span>/);
  assert.equal((h.match(/aria-expanded="false"/g) || []).length, 3);
  assert.doesNotMatch(h, /class="hero"/);
  click(card, { action: "toggle", entity: BAY });
  h = html(card);
  assert.match(h, /data-entity="cover.living_room_bay_window" aria-expanded="true"/);
  assert.equal((h.match(/class="hero"/g) || []).length, 1);
  // The row carries the buttons: the unfolded detail does not repeat them.
  assert.equal((h.match(/data-action="open" data-entity="cover.living_room_bay_window"/g) || []).length, 1);
  card.connectedCallback();
  card._outside.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(card), /aria-expanded="true"/);
  // Group actions go to the covers that support them.
  click(card, { action: "close_all" });
  assert.deepEqual(plain(hass.calls), [["cover", "close_cover", { entity_id: ["cover.living_room_bay_window", "cover.living_room_patio_door", "cover.living_room_side_window"] }]]);
  card.disconnectedCallback();
});

test("expanded unfolds every cover; show_group_controls and show_controls hide buttons", () => {
  assert.equal((html(newCard(cc.CoverCard, { area: "living_room", expanded: true })).match(/class="hero"/g) || []).length, 3);
  assert.doesNotMatch(html(newCard(cc.CoverCard, { area: "living_room", show_group_controls: false })), /data-action="open_all"/);
  const bare = html(newCard(cc.CoverCard, { area: "living_room", show_controls: false }));
  assert.doesNotMatch(bare, /data-action="(open|close|stop|open_all)"/);
});

test("columns: 2 or 3 show every cover as an unfolded tile with its own buttons, 1 or anything else foldable rows", () => {
  assert.equal(cc.columnsOf({ columns: 2 }), 2);
  assert.equal(cc.columnsOf({ columns: "3" }), 3);
  for (const columns of [undefined, 1, 4, 0, "x"]) assert.equal(cc.columnsOf({ columns }), 1, String(columns));
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { area: "living_room", columns: 2 }, hass);
  const h = html(card);
  assert.match(h, /<div class="items grid" style="--cc-columns:2">/);
  assert.equal((h.match(/class="tile"/g) || []).length, 3);
  assert.equal((h.match(/class="hero"/g) || []).length, 3);
  assert.doesNotMatch(h, /aria-expanded=/);
  // Each tile has its open / stop / close buttons with their labels (not the small round ones of a row).
  assert.match(h, /<button class="btn open[^"]*" data-action="open" data-entity="cover.living_room_patio_door"[^>]*>[\s\S]*?<span>Open<\/span><\/button>/);
  assert.doesNotMatch(h, /class="btn round small (open|close)/);
  // The group buttons stay above the tiles; a tile's name opens the more-info dialog.
  assert.match(h, /data-action="open_all"[\s\S]*class="items grid"/);
  click(card, { entity: BAY });
  assert.equal(card.events.at(-1).type, "hass-more-info");
  click(card, { action: "close", entity: BAY });
  assert.deepEqual(plain(hass.calls), [["cover", "close_cover", { entity_id: BAY }]]);
  assert.match(html(newCard(cc.CoverCard, { area: "living_room", columns: 3 })), /--cc-columns:3/);
  // One cover: the full card as before, whatever columns says.
  assert.doesNotMatch(html(newCard(cc.CoverCard, { entity: BAY, columns: 2 })), /class="tile"/);
  assert.match(html(newCard(cc.CoverCard, { area: "living_room", columns: 1 })), /aria-expanded="false"/);
  // The card asks for more height in a grid of tiles than with folded rows.
  assert.ok(newCard(cc.CoverCard, { area: "living_room", columns: 2 }).getCardSize() > newCard(cc.CoverCard, { area: "living_room" }).getCardSize());
});

test("editor: columns is a choice of 1, 2 or 3, left out of the YAML at 1", () => {
  const toggles = cc.CoverCardEditor.toggles;
  assert.equal(cc.toForm({ entity: BAY }, toggles).columns, "1");
  assert.equal(cc.toForm({ entity: BAY, columns: 3 }, toggles).columns, "3");
  assert.deepEqual(plain(cc.fromForm({ entities: [BAY, BLIND], columns: "2" }, {}, toggles)), { entities: [BAY, BLIND], columns: 2 });
  assert.deepEqual(plain(cc.fromForm({ entities: [BAY, BLIND], columns: "1" }, {}, toggles)), { entities: [BAY, BLIND] });
  const ed = new cc.CoverCardEditor();
  const form = { appendChild() {}, addEventListener() {} };
  cc.document.createElement = () => form;
  ed.appendChild = () => {};
  ed.setConfig({ entity: BAY, language: "fr" });
  ed.hass = makeHass();
  assert.ok(form.schema.some((s) => s.name === "columns"));
  assert.equal(form.computeLabel({ name: "columns" }), "Colonnes");
  assert.match(form.computeHelper({ name: "columns" }), /vignettes/);
});

test("card favorites of several covers move all of them that can take a position", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entities: [BAY, GARAGE, "cover.living_room_patio_door"], favorites: [50] }, hass);
  click(card, { action: "fav_all", index: "0" });
  assert.deepEqual(plain(hass.calls), [["cover", "set_cover_position", { entity_id: [BAY, "cover.living_room_patio_door"], position: 50 }]]);
});

test("mini card: a picture per cover, group buttons, detail button switching to the full card", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverMiniCard, { area: "living_room" }, hass);
  let h = html(card);
  assert.equal((h.match(/class="thumb /g) || []).length, 3);
  assert.match(h, /data-action="open_all"[^>]*><svg[\s\S]*?<span>Open all<\/span>/);
  assert.match(h, /class="zoom" data-action="zoom"/);
  // The thumbnails are no sliders: a click opens more-info.
  assert.doesNotMatch(h, /role="slider"/);
  click(card, { entity: BAY });
  assert.equal(card.events.at(-1).type, "hass-more-info");
  click(card, { action: "zoom" });
  h = html(card);
  assert.match(h, /class="items"/);
  assert.equal(card.getGridOptions().columns, 12);
  card.connectedCallback();
  card._unzoom.tap({ composedPath: () => [] });
  assert.equal(card._zoomed, false);
  card.disconnectedCallback();
  assert.doesNotMatch(html(newCard(cc.CoverMiniCard, { area: "living_room", zoom: false })), /data-action="zoom"/);
  assert.deepEqual(plain(card.getGridOptions()), { columns: 6, min_columns: 6, rows: "auto" });
});

test("a mini card of one cover labels its buttons Open / Close", () => {
  const h = html(newCard(cc.CoverMiniCard, { entity: BAY }));
  assert.match(h, /<span>Open<\/span>/);
  assert.doesNotMatch(h, /Open all/);
});

test("configuration errors are shown in the card", () => {
  assert.match(html(newCard(cc.CoverCard, {})), /Choose at least one cover/);
  assert.match(html(newCard(cc.CoverCard, { area: "nowhere" })), /Area not found: nowhere/);
  const hass = makeHass();
  hass.areas = { ...hass.areas, empty: { area_id: "empty", name: "Empty room" } };
  assert.match(html(newCard(cc.CoverCard, { area: "empty" }, hass)), /No cover in the area Empty room\./);
  assert.throws(() => new cc.CoverCard().setConfig(null));
  assert.throws(() => new cc.CoverCard().setConfig({ entities: "cover.x" }));
});

test("stub configs: the first cover, the area with most covers", () => {
  const hass = makeHass();
  assert.deepEqual({ ...cc.CoverCard.getStubConfig(hass) }, { entity: BAY });
  assert.deepEqual({ ...cc.CoverMiniCard.getStubConfig(hass) }, { area: "living_room" });
  assert.deepEqual({ ...cc.CoverCard.getStubConfig({ states: {} }) }, {});
});

test("the card is only redrawn when one of its covers changes", () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { entity: BAY }, hass);
  let renders = 0;
  const orig = card._render.bind(card);
  card._render = () => {
    renders++;
    return orig();
  };
  card.hass = { ...hass, states: { ...hass.states, "light.other": { state: "on" } } };
  assert.equal(renders, 0);
  card.hass = makeHass({ [BAY]: { current_position: 10 } });
  assert.equal(renders, 1);
});

test("the language option and Home Assistant's language translate the card", () => {
  assert.match(html(newCard(cc.CoverCard, { entity: BAY, language: "fr" })), /Volet roulant · Living room/);
  assert.match(html(newCard(cc.CoverCard, { entity: BAY }, makeHass({}, "de"))), /<span class="t">Offen<\/span>/);
  assert.match(html(newCard(cc.CoverCard, { entity: BAY }, makeHass({}, "pt-BR"))), /Estore de rolo/);
});

test("every language has every text, with the same placeholders", () => {
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  const en = cc.STRINGS.en;
  const langs = Object.keys(cc.STRINGS);
  assert.deepEqual(langs.sort(), ["bg", "cs", "da", "de", "el", "en", "es", "fr", "hu", "it", "lv", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sr", "sr-Latn", "sv", "uk"]);
  for (const l of langs) {
    assert.deepEqual(Object.keys(cc.STRINGS[l]).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.equal(ph(cc.STRINGS[l][k]), ph(en[k]), `${l}.${k}`);
  }
});

test("editor: form data and config, minimal YAML", () => {
  const toggles = cc.CoverCardEditor.toggles;
  const form = cc.toForm({ entities: [BAY, { entity: BLIND, name: "B" }], favorites: [25, { name: "x", position: 10 }] }, toggles);
  assert.deepEqual([...form.entities], [BAY, BLIND]);
  assert.deepEqual([...form.favorites], ["25"]);
  assert.equal(form.device_class, "auto");
  assert.equal(form.show_controls, true);
  const prev = { entities: [BAY, { entity: BLIND, name: "B" }], favorites: [25, { name: "x", position: 10 }] };
  const config = cc.fromForm({ ...form, favorites: ["75", "25", "abc"], show_tilt: false, title: "" }, prev, toggles);
  assert.deepEqual(JSON.parse(JSON.stringify(config)), {
    entities: [BAY, { entity: BLIND, name: "B" }],
    favorites: [25, 75, { name: "x", position: 10 }],
    show_tilt: false,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(cc.fromForm({ entities: [BAY], device_class: "garage" }, {}, toggles))), { entity: BAY, device_class: "garage" });
});

test("editor: labels and helpers in the card's language", () => {
  const ed = new cc.CoverCardEditor();
  const form = { appendChild() {}, addEventListener() {} };
  cc.document.createElement = () => form;
  ed.appendChild = () => {};
  ed.setConfig({ entity: BAY, language: "fr" });
  ed.hass = makeHass();
  assert.equal(form.computeLabel({ name: "show_tilt" }), "Afficher l'inclinaison");
  assert.equal(form.computeHelper({ name: "title" }), undefined);
  assert.match(form.computeHelper({ name: "area" }), /pièce/);
  assert.deepEqual([...form.data.entities], [BAY]);
  assert.ok(form.schema.some((s) => s.name === "device_class"));
});

test("the position slider runs the way the scene opens: up, down for an awning, across for curtains and a gate", () => {
  const hass = makeHass({ "cover.driveway_gate": { current_position: 40, supported_features: 15 } });
  const tag = (entity) => html(newCard(cc.CoverCard, { entity }, hass)).match(/<div [^>]*data-slider="pos"[^>]*>/)[0];
  assert.match(tag(BAY), /aria-orientation="vertical"[\s\S]*data-axis="up"/);
  assert.match(tag("cover.terrace_awning"), /aria-orientation="vertical"[\s\S]*data-axis="down"/);
  assert.match(tag("cover.bedroom_curtains"), /aria-orientation="horizontal"[\s\S]*data-axis="across"/);
  assert.match(tag("cover.driveway_gate"), /aria-orientation="horizontal"[\s\S]*data-axis="across"/);
  // The pointer maps the run of the rail (viewBox 100 × 120 drawn at 100 × 120 px here).
  const card = newCard(cc.CoverCard, { entity: BAY }, hass);
  const at = (axis, clientX, clientY) =>
    card._valueAt({ dataset: { slider: "pos", axis }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 120 }) }, { clientX, clientY });
  assert.equal(at("up", 0, 18), 100);
  assert.equal(at("up", 0, 106), 0);
  assert.equal(at("down", 0, 20), 0);
  assert.equal(at("down", 0, 74), 100);
  assert.equal(at("across", 14, 0), 0);
  assert.equal(at("across", 86, 0), 100);
  assert.equal(at("across", 50, 0), 50);
});

test("a garage door, a gate or a door asks before moving unless confirm: false; other covers only with confirm: true", () => {
  const hass = makeHass({ "cover.driveway_gate": { current_position: 40, supported_features: 15 } });
  const garage = newCard(cc.CoverCard, { entity: GARAGE }, hass);
  click(garage, { action: "open", entity: GARAGE });
  assert.match(html(garage), /Open Garage door\?/);
  assert.deepEqual(plain(hass.calls), []);
  // Dragging the gate asks too; OK sends the position and marks it on the rail.
  const gate = newCard(cc.CoverCard, { entity: "cover.driveway_gate" }, hass);
  gate._commit("cover.driveway_gate", "pos", 90);
  assert.match(html(gate), /Move Driveway gate to 90%\?/);
  click(gate, { action: "confirm_ok" });
  assert.deepEqual(plain(hass.calls), [["cover", "set_cover_position", { entity_id: "cover.driveway_gate", position: 90 }]]);
  assert.match(html(gate), /class="target"/);
  // confirm: false never asks; a shutter does not ask by default.
  const free = newCard(cc.CoverCard, { entity: GARAGE, confirm: false }, hass);
  click(free, { action: "open", entity: GARAGE });
  const shutter = newCard(cc.CoverCard, { entity: BAY }, hass);
  click(shutter, { action: "close", entity: BAY });
  assert.deepEqual(plain(hass.calls.slice(1)), [
    ["cover", "open_cover", { entity_id: GARAGE }],
    ["cover", "close_cover", { entity_id: BAY }],
  ]);
  // A group holding a garage door asks before opening all of them.
  const group = newCard(cc.CoverCard, { entities: [BAY, GARAGE] }, hass);
  click(group, { action: "open_all" });
  assert.match(html(group), /Open all 2 covers\?/);
});

test("a dropped slider that sends nothing redraws the picture where the cover is", () => {
  const card = newCard(cc.CoverCard, { entity: BAY, confirm: true });
  // Gradient ids change with every drawing.
  const drawn = () => card._html.replace(/cc\d+/g, "cc");
  const before = drawn();
  card._commit(BAY, "pos", 10);
  click(card, { action: "confirm_cancel" });
  assert.equal(drawn(), before);
  assert.deepEqual(plain(card.hass.calls), []);
  card._html = "stale";
  card._commit(BAY, "tilt", 10);
  assert.equal(drawn(), before);
});

test("a cover that assumes its state keeps Open and Close usable", () => {
  const h = html(newCard(cc.CoverCard, { entity: BAY }, makeHass({ [BAY]: { current_position: 100, assumed_state: true } })));
  assert.doesNotMatch(h, /data-action="open"[^>]*disabled/);
});

test("editor: the confirm option is a choice of auto, always and never", () => {
  const toggles = cc.CoverCardEditor.toggles;
  assert.equal(cc.toForm({ entity: BAY }, toggles).confirm, "auto");
  assert.equal(cc.toForm({ entity: BAY, confirm: true }, toggles).confirm, "always");
  assert.equal(cc.toForm({ entity: BAY, confirm: false }, toggles).confirm, "never");
  const yaml = (confirm) => plain(cc.fromForm({ entities: [BAY], confirm }, {}, toggles));
  assert.deepEqual(yaml("auto"), { entity: BAY });
  assert.deepEqual(yaml("always"), { entity: BAY, confirm: true });
  assert.deepEqual(yaml("never"), { entity: BAY, confirm: false });
});

test("folding: a tap elsewhere (pointer), not a press inside released outside; leaving the page folds back", () => {
  const card = newCard(cc.CoverCard, { area: "living_room" });
  card.connectedCallback();
  click(card, { action: "toggle", entity: BAY });
  // Pressed in the card (a slider dragged out of it): nothing folds.
  card._outside.tap({ composedPath: () => [card] });
  assert.match(html(card), /aria-expanded="true"/);
  // A tap on a spot that sends no click (iOS): the pointer alone folds it.
  card._outside.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(card), /aria-expanded="true"/);
  // Left with a cover unfolded and back: folded.
  click(card, { action: "toggle", entity: BAY });
  card.disconnectedCallback();
  card.connectedCallback();
  assert.doesNotMatch(html(card), /aria-expanded="true"/);
  card.disconnectedCallback();
  // The mini card comes back compact.
  const mini = newCard(cc.CoverMiniCard, { area: "living_room" });
  mini.connectedCallback();
  click(mini, { action: "zoom" });
  assert.equal(mini._zoomed, true);
  mini.disconnectedCallback();
  mini.connectedCallback();
  assert.equal(mini._zoomed, false);
  assert.match(html(mini), /data-action="zoom"/);
  mini.disconnectedCallback();
});

test("no rewrite under a press: the click renders at once, a release without a click draws what was held", async () => {
  const hass = makeHass();
  const card = newCard(cc.CoverCard, { area: "living_room" }, hass);
  card.connectedCallback();
  const moved = (pos) => ({ ...hass, states: { ...hass.states, [BAY]: { ...hass.states[BAY], attributes: { ...hass.states[BAY].attributes, current_position: pos } } } });
  const before = html(card);
  card.shadowRoot.listeners.pointerdown({ target: {}, composedPath: () => [] });
  card.hass = moved(12);
  assert.equal(html(card), before, "no rewrite under the pointer");
  click(card, { action: "toggle", entity: BAY });
  assert.notEqual(html(card), before, "the click renders at once");
  assert.match(html(card), /aria-expanded="true"/);
  // Pressed and released elsewhere (no click): the held update is drawn after the release.
  const held = html(card);
  card.shadowRoot.listeners.pointerdown({ target: {}, composedPath: () => [] });
  card.hass = moved(88);
  assert.equal(html(card), held);
  card._onPressEnd();
  await new Promise((r) => setTimeout(r, 0));
  assert.notEqual(html(card), held);
  card.disconnectedCallback();
});
