// The cards in parents outside the native views (layout-card, a grid or a flex row, an inline-block): they neither
// fall to their borders where they are sized by their content nor overflow a "1fr 1fr" grid on a phone.
// Rendered in Chromium when Playwright and its browser are installed (`npx playwright install chromium`, or
// CHROMIUM_PATH); skipped otherwise.
import assert from "node:assert/strict";
import { test } from "node:test";
import { areas, devices, entities, states } from "../scripts/mock-states.mjs";
import { source } from "./source.mjs";


let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {}
const browser = await chromium?.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}).catch(() => null);

const HA_CARD = `customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;border:1px solid #ddd;overflow:hidden}</style><slot></slot>"; } });`;

const CONTEXTS = [];
for (const w of [320, 600]) {
  CONTEXTS.push([`inline-block ${w}`, w, "display:inline-block", 1]);
  CONTEXTS.push([`grid auto ${w}`, w, "display:grid;grid-template-columns:auto;justify-content:start", 1]);
}
for (const w of [320, 500]) CONTEXTS.push([`grid 1fr 1fr ${w}`, w, "display:grid;grid-template-columns:1fr 1fr;gap:8px", 2]);

for (const [type, config, natural] of [
  ["cover-card", { entity: "cover.office_blind" }, 360],
  ["cover-mini-card", { area: "living_room" }, 300],
]) {
  test(`${type} keeps a width and stays inside shrink-to-fit and grid parents`, { skip: !browser && "no Chromium" }, async () => {
    const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    try {
      await page.setContent('<!doctype html><body style="margin:0;font-family:Arial,sans-serif"></body>');
      await page.addScriptTag({ content: HA_CARD });
      await page.addScriptTag({ content: source });
      const results = await page.evaluate(
        async ({ type, config, CONTEXTS, states, entities, devices, areas }) => {
          const hass = { states, entities, devices, areas, language: "en", locale: { language: "en" }, themes: {}, callService() {} };
          const runs = [];
          for (const [name, width, parentStyle, count] of CONTEXTS) {
            const outer = document.body.appendChild(document.createElement("div"));
            outer.style.width = `${width}px`;
            const parent = outer.appendChild(document.createElement("div"));
            parent.style.cssText = parentStyle;
            const cards = [];
            for (let i = 0; i < count; i++) {
              const card = document.createElement(type);
              card.setConfig({ type: `custom:${type}`, ...config });
              card.hass = hass;
              parent.appendChild(card);
              cards.push(card);
            }
            runs.push({ name, outer, cards });
          }
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          return runs.map(({ name, outer, cards }) => {
            const box = outer.getBoundingClientRect();
            return {
              name,
              cards: cards.map((card) => {
                const haCard = card.shadowRoot.querySelector("ha-card").getBoundingClientRect();
                let inside = 0;
                for (const e of card.shadowRoot.querySelectorAll("ha-card *")) {
                  if (e.closest("svg") || e.tagName === "STYLE") continue;
                  const r = e.getBoundingClientRect();
                  if (r.width) inside = Math.max(inside, Math.round(r.right - haCard.right));
                }
                return { width: Math.round(haCard.width), overflow: Math.round(haCard.right - box.right), inside };
              }),
            };
          });
        },
        { type, config, CONTEXTS, states, entities, devices, areas },
      );
      for (const { name, cards } of results) {
        for (const { width, overflow, inside } of cards) {
          assert.ok(overflow <= 0, `${name}: overflows its parent by ${overflow} px`);
          assert.ok(width >= 100, `${name}: falls to ${width} px`);
          assert.ok(inside <= 0, `${name}: content ${inside} px outside the card`);
        }
        if (/^(inline-block|grid auto) 600/.test(name)) assert.equal(cards[0].width, natural, name);
      }
    } finally {
      await page.close();
    }
  });
}

// The state pill, on the banner and on the classic header (`illustration: false`), full and mini card: right after the
// title on its line (8 px gap), or on its own line under it when the row runs short; its whole label from 245 to
// 500 px, never more than about half of the title block; only its dot at 200 px or less.
test("the state pill sits right after the title, with its whole label", { skip: !browser && "no Chromium" }, async () => {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  try {
    await page.setContent('<!doctype html><body style="margin:0;font-family:Arial,sans-serif"></body>');
    await page.addScriptTag({ content: HA_CARD });
    await page.addScriptTag({ content: source });
    const bad = await page.evaluate(
      async ({ states, entities, devices, areas }) => {
        const hass = { states, entities, devices, areas, language: "en", locale: { language: "en" }, themes: {}, callService() {} };
        const out = [];
        for (const [type, config] of [["cover-card", { entity: "cover.office_blind" }], ["cover-mini-card", { area: "living_room" }]])
          for (const illustration of [true, false])
            for (const width of [180, 245, 300, 400, 500]) {
              document.body.innerHTML = "";
              const outer = document.body.appendChild(document.createElement("div"));
              outer.style.width = `${width}px`;
              const card = outer.appendChild(document.createElement(type));
              card.setConfig({ type: `custom:${type}`, ...config, illustration });
              card.hass = hass;
              await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
              const sr = card.shadowRoot;
              const where = `${type} ${illustration ? "banner" : "classic"} ${width}px`;
              const pill = sr.querySelector(".titles .chip");
              const name = sr.querySelector(".titles .name");
              if (!pill || !name) {
                out.push(`${where}: no pill in the titles`);
                continue;
              }
              const p = pill.getBoundingClientRect();
              const n = name.getBoundingClientRect();
              const t = pill.querySelector(".t");
              const sameLine = Math.abs(p.top + p.height / 2 - (n.top + n.height / 2)) < 3;
              if (sameLine && Math.abs(p.left - n.right - 8) > 1) out.push(`${where}: pill ${Math.round(p.left - n.right)} px after the title`);
              if (!sameLine && p.top < n.bottom - 0.5) out.push(`${where}: pill neither after the title nor under it`);
              if (width <= 200 && t.getBoundingClientRect().width > 0) out.push(`${where}: label shown`);
              if (width >= 245 && (!t.getBoundingClientRect().width || t.scrollWidth > t.clientWidth + 0.5)) out.push(`${where}: label cut`);
              const block = sr.querySelector(".titles").getBoundingClientRect().width;
              if (sameLine && p.width > block * 0.51 + 1) out.push(`${where}: pill wider than half the title block`);
              if (n.width < 20) out.push(`${where}: title crushed (${Math.round(n.width)} px)`);
            }
        return out;
      },
      { states, entities, devices, areas },
    );
    assert.deepEqual(bad, []);
  } finally {
    await page.close();
  }
});

test.after(() => browser?.close());
