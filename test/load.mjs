// Evaluates src/cover-card.js (a classic script, bundled as is by scripts/build.mjs) in a sandbox with minimal DOM
// stand-ins and returns the names the tests need. No dependency, no browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { areas, devices, entities, states } from "../scripts/mock-states.mjs";

const source = readFileSync(new URL("../src/cover-card.js", import.meta.url), "utf8");

// Shadow root stand-in: keeps the HTML it is given and the listeners it gets.
const fakeRoot = () => ({
  innerHTML: "",
  listeners: {},
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
});

export const load = () => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = fakeRoot();
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    appendChild() {}
    toggleAttribute(name, on) {
      (this.attrs ||= {})[name] = !!on;
    }
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  const docListeners = {};
  const sandbox = {
    HTMLElement,
    CustomEvent,
    Intl,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    document: {
      createElement: (t) => (registry.has(t) ? new (registry.get(t))() : { tagName: t.toUpperCase(), appendChild() {}, addEventListener() {} }),
      addEventListener: (type, fn) => (docListeners[type] ||= new Set()).add(fn),
      removeEventListener: (type, fn) => docListeners[type]?.delete(fn),
    },
    setTimeout,
    clearTimeout,
  };
  // document-level listeners, fired by hand with fireDocument(type, ev).
  sandbox.fireDocument = (type, ev) => {
    for (const fn of [...(docListeners[type] || [])]) fn(ev);
  };
  const winListeners = {};
  sandbox.addEventListener = (type, fn) => (winListeners[type] ||= new Set()).add(fn);
  sandbox.removeEventListener = (type, fn) => winListeners[type]?.delete(fn);
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return vm.runInContext(
    `${source}
    ({ STRINGS, F, CLASSES, ICONS, esc, lang, t, fmtPct, positionOf, tiltOf, featuresOf, stateClass, classOf, itemsOf, favoritesOf, toForm, fromForm, columnsOf,
       coverSvg, SCENES, CoverCard: customElements.get("cover-card"), CoverMiniCard: customElements.get("cover-mini-card"),
       CoverCardEditor: customElements.get("cover-card-editor"), CoverMiniCardEditor: customElements.get("cover-mini-card-editor"), window, document })`,
    sandbox,
  );
};

// A mock hass recording its service calls; `patch` changes states ({ id: "state" } or { id: { state, …attributes } }).
export const makeHass = (patch = {}, language = "en") => {
  const st = { ...states };
  for (const [id, p] of Object.entries(patch)) {
    if (p === null) {
      delete st[id];
      continue;
    }
    const { state, ...attributes } = typeof p === "string" ? { state: p } : p;
    st[id] = { ...states[id], entity_id: id, state: state ?? states[id]?.state, attributes: { ...states[id]?.attributes, ...attributes } };
  }
  const calls = [];
  return { calls, states: st, entities, devices, areas, language, locale: { language }, callService: (...a) => calls.push(a) };
};

export const newCard = (Card, config, hass = makeHass()) => {
  const card = new Card();
  card.setConfig(config);
  card.hass = hass;
  return card;
};

// A click as the shadow root receives it, on an element with these data attributes.
export const click = (card, dataset) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {} });

// Objects made in the sandbox have its own prototypes: compared as plain data.
export const plain = (v) => JSON.parse(JSON.stringify(v));
