// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { CoverCard, CoverMiniCard } from "./illustrated-header.js";
import { CoverCardEditor, CoverMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
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
