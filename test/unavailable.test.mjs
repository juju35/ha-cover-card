// A cover that is unavailable (or missing) gets no command: its buttons and sliders are disabled, a click on them
// calls no service, and the picture is greyed.
import assert from "node:assert/strict";
import { test } from "node:test";
import { click, load, makeHass, newCard, plain } from "./load.mjs";

const cc = load();
const GUEST = "cover.guest_room_shutter";

for (const [name, Card] of [
  ["full", cc.CoverCard],
  ["mini", cc.CoverMiniCard],
]) {
  test(`${name} card: an unavailable cover has disabled buttons, a red chip and a greyed picture`, () => {
    const hass = makeHass();
    const card = newCard(Card, { entity: GUEST, favorites: [50] }, hass);
    const html = card.shadowRoot.innerHTML;
    assert.match(html, /class="chip crit[^"]*"[^>]*><span class="dot"><\/span><span class="t">Unavailable<\/span>/);
    assert.match(html, /class="visual crit off"/);
    const buttons = html.match(/<button [^>]*data-action="(?:open|close|stop|open_all|close_all|stop_all)[^"]*"[^>]*>/g) || [];
    assert.ok(buttons.length >= 3, "the buttons are still drawn");
    for (const b of buttons) assert.match(b, /\bdisabled\b/, b);
    for (const action of ["open", "close", "stop"]) click(card, { action, entity: GUEST });
    for (const action of ["open_all", "close_all", "stop_all"]) click(card, { action });
    click(card, { action: "fav", entity: GUEST, index: "0" });
    card._commit(GUEST, "pos", 40);
    assert.deepEqual(plain(hass.calls), []);
  });
}

test("the position slider of an unavailable cover is disabled", () => {
  const html = newCard(cc.CoverCard, { entity: GUEST }).shadowRoot.innerHTML;
  assert.match(html, /role="slider"[^>]*aria-disabled="true"/);
  assert.match(html, /class="pos word crit clickable"[^>]*>Unavailable</);
});

test("a missing entity is shown as not found, among available ones in a group", () => {
  const hass = makeHass({ "cover.ghost": null });
  const card = newCard(cc.CoverCard, { entities: ["cover.ghost", "cover.living_room_bay_window"] }, hass);
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /<div class="istate">Entity not found<\/div>/);
  click(card, { action: "open_all" });
  assert.deepEqual(plain(hass.calls), [["cover", "open_cover", { entity_id: ["cover.living_room_bay_window"] }]]);
});

test("a group of unavailable covers says so", () => {
  const hass = makeHass({ "cover.living_room_bay_window": "unavailable" });
  const html = newCard(cc.CoverMiniCard, { entities: ["cover.living_room_bay_window", "cover.guest_room_shutter"] }, hass).shadowRoot.innerHTML;
  assert.match(html, /class="chip crit"[^>]*><span class="dot"><\/span><span class="t">Unavailable<\/span>/);
});
