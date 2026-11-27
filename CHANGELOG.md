# Changelog

## 1.11.5 - 2026-11-27

### Fixes
- Updates of Home Assistant no longer rewrite the whole card: it is brought up to date in place, so the page no longer jumps under you, the animations no longer start over and the focus, hover and inner scroll stay.
- An update that changes nothing on the card no longer redraws it.

## 1.11.4 - 2026-11-27

### Fixes
- Idle states use the theme's secondary text colour (`--secondary-text-color`), like every ha-* card.
- Tiles have the 10 px corner radius shared by the ha-* cards.

## 1.11.3 - 2026-11-24

### Maintenance
- The card source is split into ES modules: `src/` (entry `src/index.js`), cut at its sections, with the translations in one file per language (`i18n/<lang>.js`). `scripts/bundle.mjs` concatenates them back, in their original order, into the same single file and per-language files as before; the tests evaluate that bundle.

## 1.11.2 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.11.1 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.11.0 - 2026-11-21

### Features
- A cover of device class `blind` whose slats do not tilt (no tilt feature: a zip screen, a roller blind reported as `blind`, such as Somfy's ExteriorScreen on Overkiz) is drawn as a roller shade instead of a venetian blind, as Home Assistant's more-info dialog tells them apart (#38). A `device_class` set on the card or the cover still draws the picture asked for.

## 1.10.0 - 2026-11-20

### Features
- `show_state` and `center_value` are in the visual editor of both cards (they were YAML only).

### Performance
- A card set on an `area` finds its covers from the entity registry once per registry change, instead of walking every state of Home Assistant on each state change.

## 1.9.0 - 2026-11-18

### Features
- **Automatic schedule** (#33): the time of the next automatic opening and closing, as two tiles under the picture (small ones on the mini card; on a card of several covers, the card's schedule once above them). New options `open_time` and `close_time`, per cover or for the card: a sensor or an `input_datetime` giving a time (`HH:MM`, its next occurrence) or a date and time (a timestamp sensor), or a fixed time. The next action is in the accent colour with its countdown, one gone by is dimmed. `open_condition` / `close_condition` (an on/off entity: `input_boolean`, `binary_sensor`, `schedule`…) strike an action through as *skipped* while off. `show_schedule: false` hides it; all of them are in the visual editors, times follow Home Assistant's 12/24 h format, translated in every language of the card.

### Maintenance
- The commitlint config is loaded as an ES module: the `commit-msg` hook failed on every commit, the package being `"type": "module"`.
- The screenshot test only flags orphan captures, so that a capture just added does not fail the branch's first push before the Screenshots workflow renders it.

## 1.8.0 - 2026-11-18

### Features
- **Barrier**: a new picture, a yellow cabinet whose striped arm lifts on its pivot with the position (in the card, the illustrated header and the mini card), red lamp blinking while it moves and glowing at night in the header. A gate (or a cover without a device class) named *Barrier*, *Barrière*, *Schranke*, *Barrera*… in every language of the card is drawn so, or set `device_class: barrier`; it asks before moving, like a gate.
- **Hinged shutters**: two louvred leaves folding out on their hinges with the position, dragged sideways; the window glows warm behind them at night in the header. A shutter named *Hinged shutters*, *Volets battants*, *Klappläden*, *Contraventanas*… is drawn so, or set `device_class: hinged`.
- **Pergola**: posts and a frame whose louvres turn with the tilt (or with the position, for a pergola reporting the louvres' angle as one), the sun shining between them by day. A cover named *Pergola*, *Louvre*, *Bioclimatic*, *Lamellendach*… is drawn so, or set `device_class: pergola`. A pergola that only tilts shows the louvres' angle as its value, and its tilt buttons on the mini card. New option `light` (per cover or for the card, in the visual editor): its LED strip, drawn lit under the frame while it is on.

## 1.7.0 - 2026-11-18

### Features
- **Swing gate**: a new picture with two leaves swinging open on their hinges between two pillars (in the card, the illustrated header and the mini card), dragged sideways along the rail under it, warning lamp blinking while it moves. A gate cover whose name says it swings (*Swing gate*, *Portail battant*, *Flügeltor*… in every language of the card) is drawn so, or set `device_class: swing`.
- **Pedestrian opening** of a gate: a *Pedestrian* button next to Open, asking first like the other buttons. It presses the gate's own pedestrian button or switch, found on its device by its name, or follows `pedestrian`: a position in % (lit while the gate stands there), a button, script or switch to press, or `false` for none; per cover or for the card, and in the visual editor.
- **Mini card of one cover**: no more lone thumbnail; its position and state on the left and its buttons as round ones on the right (pedestrian included), like the other mini cards. The banner still draws the cover.

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
