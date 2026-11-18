# Changelog

## 1.6.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.6.0 - 2026-11-17

### Features
- **Illustrated header** on the full and mini cards (90 px): the title on a facade wall, the covers drawn big at the right with their own pictures (per device class), at their position and animated while they move, standing on a 10 px pavement strip edge to edge. The round icon takes the state colour (moving, open, open garage door/gate/door/window, closed, unavailable) and the line under the title gives the state and summary. Night picture after sunset (`sun.sun`) or with the dark theme, forced with `illustration_theme: day | night`; `illustration: false` keeps the classic header. Both options are in the visual editors.
- **State pill on the title line** of the illustrated header (full and mini cards): right after the title, in the round icon's state colour, only when the whole title and its whole label fit there, otherwise on its own line under the subtitle (then kept to one line), and only its dot when even that does not fit in the banner or the card is 200 px wide or less; measured on the rendered card, so that it fits in every language (the subtitle no longer repeats the state). The mini card's expand/collapse button is a 24 px frosted round button in the banner's top-right corner.
- The classic header (`illustration: false`) puts its state pill in the same place, right after the title (under the subtitle when the whole title and label do not fit side by side, only its dot at 200 px or less), instead of at the far right.
- Night picture with the dark theme even while the sun is up

### Fixes
- One cover: the body no longer repeats the header pill. Under the position, "Partly open" for a cover between 0 and 100 % (the pill says "Open"); otherwise the state line, and the big state of a cover without a position, are left to the pill and come back only when the pill keeps just its dot.

## 1.5.1 - 2026-11-16

### Fixes
- The card header badge now uses the project accent colour instead of the aggregated cover state; the status chip in the header still carries the state.

## 1.5.0 - 2026-11-15

### Features
- **No state feedback** (`no_feedback: true`, in the visual editor too): for a cover that never reports its real state — a radio **RTS** motor and the like — the picture and badge now show it **closed** at rest instead of trusting an assumed open; it still animates while it moves and keeps its Open / Stop / Close buttons enabled. Set it per cover or for the whole card ([#21](https://github.com/juju35/ha-cover-card/issues/21), suggested by @mielikki33).

### Fixes
- **Tile button alignment**: in a grid of tiles (`columns: 2` or `3`), the Open / Stop / Close rows now line up across tiles even when one cover shows a position and another only a word ([#21](https://github.com/juju35/ha-cover-card/issues/21), reported by @mielikki33).

## 1.4.0 - 2026-11-15

### Features
- The folded row's Open / Stop / Close buttons are now larger (32 px instead of 30 px), an easier touch target on phones ([#19](https://github.com/juju35/ha-cover-card/issues/19), suggested by @mielikki33).

## 1.3.0 - 2026-11-15

### Features
- **Invert the position** (`invert: true`, in the visual editor too): reverses the position axis for covers whose integration reports it the wrong way round — often awnings that read 100 % when retracted. The picture, the slider and the percentage use `100 − current_position`, and `set_cover_position` is sent reversed; set it per cover or for the whole card. The Open / Stop / Close buttons are unchanged ([#15](https://github.com/juju35/ha-cover-card/issues/15), reported by @ctournayre).

### Fixes
- **Awning badge**: the small icon was the retracted cassette when the awning was open and the unrolled fabric when it was closed, the opposite of the drawn picture. It now opens with the unrolled fabric, like the scene ([#15](https://github.com/juju35/ha-cover-card/issues/15), reported by @ctournayre).

## 1.2.0 - 2026-11-15

### Features
- **Centre the position value** (`center_value: true`): the big opening percentage and its state line are centred under the picture instead of left-aligned ([#12](https://github.com/juju35/ha-cover-card/issues/12), suggested by @thomasfav28).
- **Hide the state line** (`show_state: false`): removes the coloured dot and state text shown next to the position value, when the folded row already shows the state ([#12](https://github.com/juju35/ha-cover-card/issues/12), suggested by @thomasfav28).
- A foldable row now leaves a little more room around its position slider (left padding and a wider gap), so it is easier to reach ([#12](https://github.com/juju35/ha-cover-card/issues/12), suggested by @thomasfav28).

## 1.1.1 - 2026-11-14

### Fixes
- **Mini card visual editor**: `show_group_controls` (Open all / Stop / Close all buttons) can now be set in the mini card's editor too, since its detailed view shows the full card with them; the README lists it for both cards.

## 1.1.0 - 2026-11-13

### Features
- **Grid of tiles** (`columns: 2` or `3`, in the visual editor too): a card of several covers shows them as unfolded tiles side by side instead of foldable rows, each with its picture and position slider, its state, full-size Open / Stop / Close buttons, its tilt and its favorites; the tiles go one per line when the card is too narrow. `columns: 1` (the default) keeps the foldable rows. On the mini card it applies to its detailed view ([#7](https://github.com/juju35/ha-cover-card/issues/7), suggested by @mielikki33).

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
