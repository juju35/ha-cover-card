// Keyboard access: every clickable element can be reached and used from the keyboard, sliders tell their value,
// foldable rows tell whether they are unfolded.
import assert from "node:assert/strict";
import { test } from "node:test";
import { load, newCard } from "./load.mjs";

const cc = load();

const clickables = (html) => html.match(/<[a-z-]+\b[^>]*\bdata-(?:entity|action)="[^"]*"[^>]*>/g) || [];

test("every clickable element of the full and mini cards is a button or has the button role", () => {
  const cards = [
    newCard(cc.CoverCard, { entity: "cover.office_blind", favorites: [50] }),
    newCard(cc.CoverCard, { area: "living_room", expanded: true, favorites: [50] }),
    newCard(cc.CoverMiniCard, { area: "living_room" }),
  ];
  for (const card of cards) {
    const tags = clickables(card.shadowRoot.innerHTML);
    assert.ok(tags.length > 5);
    for (const tag of tags) {
      if (tag.startsWith("<button")) continue;
      if (/role="slider"/.test(tag)) {
        assert.match(tag, /tabindex="0"/, tag);
        continue;
      }
      assert.match(tag, /\brole="button"/, tag);
      assert.match(tag, /\btabindex="0"/, tag);
    }
  }
});

test("sliders carry their orientation, range, value and name", () => {
  const html = newCard(cc.CoverCard, { entity: "cover.office_blind" }).shadowRoot.innerHTML;
  const sliders = html.match(/<div [^>]*role="slider"[^>]*>/g) || [];
  assert.equal(sliders.length, 2);
  for (const s of sliders) {
    for (const a of ["aria-orientation", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-label"]) assert.match(s, new RegExp(`${a}="[^"]+"`), s);
  }
  assert.match(sliders[0], /aria-label="Position of Office blind"/);
  assert.match(sliders[1], /aria-label="Tilt of Office blind"/);
});

test("Enter and Space activate an element with the button role", () => {
  const card = newCard(cc.CoverCard, { entity: "cover.office_blind" });
  let clicks = 0;
  let prevented = 0;
  const el = { dataset: {}, getAttribute: (a) => (a === "role" ? "button" : null), click: () => clicks++ };
  for (const key of ["Enter", " ", "a"]) card.shadowRoot.listeners.keydown({ key, target: el, preventDefault: () => prevented++ });
  assert.equal(clicks, 2);
  assert.equal(prevented, 2);
});

test("icon-only buttons have a name", () => {
  const html = newCard(cc.CoverCard, { area: "living_room", expanded: true }).shadowRoot.innerHTML;
  for (const b of html.match(/<button [^>]*>/g) || []) assert.match(b, /aria-label="[^"]+"/, b);
});

test("animations stop with prefers-reduced-motion", () => {
  const html = newCard(cc.CoverCard, { entity: "cover.office_blind" }).shadowRoot.innerHTML;
  assert.match(html, /@media \(prefers-reduced-motion: reduce\) \{ \*, \*::before, \*::after \{ transition: none !important; animation: none !important; \} \}/);
});
