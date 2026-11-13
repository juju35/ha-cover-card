# Changelog

## 1.0.0 - 2026-11-13

### Features
- **Cover Card** (`custom:cover-card`) and **Cover Mini Card** (`custom:cover-mini-card`) for the `cover` domain, whatever the integration: one cover, a list of covers or every cover of an area.
- A drawn scene per device class (roller shutter, venetian blind, roller shade, curtains, awning, garage door, sliding gate, door, roof window, damper) that follows the position and the tilt, and is itself the position slider (pointer and keyboard), dragged the way the cover opens: up, down for an awning, sideways for curtains and a sliding gate.
- An animation per kind of cover while it opens or closes (rolling slats, swaying folds and valance, blinking warning lamps, flowing air), with the target position marked on the rail; `prefers-reduced-motion` honoured.
- Tilt slider and buttons, Open / Stop / Close buttons, favorite positions (position, tilt or both), group buttons and foldable rows, all following each cover's `supported_features`.
- Confirmation before opening, closing or moving a garage door, a gate or a door (`confirm: true` for every cover, `false` never), unavailable covers greyed with disabled controls, mini card detail button, visual editors, Sections view sizes.
- 22 languages; English in the bundle, every other language loaded on demand.
