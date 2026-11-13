# Changelog

## 1.0.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the unfolded covers, the popup and the detailed view of the mini card stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state: covers folded, popup closed, mini card compact.
- **Clicks lost under an update**: Home Assistant updates the card several times a second. When an update rewrote the card between the press and the release, the element pressed was replaced and the click landed on the card itself, doing nothing (a cover row, a group button or a favorite that did not react; the sliders were already protected). The card is no longer rewritten while a press is in progress; the pending update is drawn right after the click, or after the release when no click follows.
- **Focus ring after a mouse click**: the focus was put back on the clicked element after each update, which drew the focus ring. It is now kept across updates for the keyboard only.

## 1.0.0 - 2026-11-13

### Features
- **Cover Card** (`custom:cover-card`) and **Cover Mini Card** (`custom:cover-mini-card`) for the `cover` domain, whatever the integration: one cover, a list of covers or every cover of an area.
- A drawn scene per device class (roller shutter, venetian blind, roller shade, curtains, awning, garage door, sliding gate, door, roof window, damper) that follows the position and the tilt, and is itself the position slider (pointer and keyboard), dragged the way the cover opens: up, down for an awning, sideways for curtains and a sliding gate.
- An animation per kind of cover while it opens or closes (rolling slats, swaying folds and valance, blinking warning lamps, flowing air), with the target position marked on the rail; `prefers-reduced-motion` honoured.
- Tilt slider and buttons, Open / Stop / Close buttons, favorite positions (position, tilt or both), group buttons and foldable rows, all following each cover's `supported_features`.
- Confirmation before opening, closing or moving a garage door, a gate or a door (`confirm: true` for every cover, `false` never), unavailable covers greyed with disabled controls, mini card detail button, visual editors, Sections view sizes.
- 22 languages; English in the bundle, every other language loaded on demand.
