---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-24'
project_name: 'timeconversion-web'
user_name: 'Yo'
date: '2026-02-24'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (52 total):**
MVP scope (FR1–FR34) covers: decimal conversion for all 7 time units, hybrid natural-language + pill-selector input, 4 output formats (standard/compact/verbose/total), copy-to-clipboard, keyboard navigation, screen reader support, and responsive layout. V1.0 (FR41–FR43) adds dark mode and LocalStorage persistence. V2.0+ (FR44–FR52) adds URL sharing, multilingual, and batch/history features.

**Non-Functional Requirements:**
- Performance: <200KB total, <1s page load on 3G, conversions <100ms
- Accessibility: WCAG 2.1 Level AA — full keyboard navigation, screen reader support (NVDA/VoiceOver/TalkBack)
- Browser: Chrome/Firefox/Safari/Edge 120+, iOS Safari 17+, Android Chrome 120+
- Responsive: 320px–2560px+, mobile-first, 44×44px min touch targets
- Code quality: W3C-valid HTML/CSS, zero console errors, separation of concerns, pure functions

**Scale & Complexity:**

- Primary domain: Frontend / Static Web
- Complexity level: Low
- Estimated architectural components: 5 (conversion engine, state manager, UI controller, hero zone, pill row)

### Technical Constraints & Dependencies

- **No build system** — files must work as-is (opened as `file://` or served statically). No npm, no bundler for MVP.
- **CDN-only external dependencies** — Pico.css and Google Fonts loaded at runtime; requires internet connection during development (acceptable trade-off for zero-config simplicity).
- **ES6+ only** — target browsers all support ES6 modules, CSS Grid/Flexbox, LocalStorage, CSS Custom Properties. No polyfills needed.
- **Technology stack is fixed** — Vanilla HTML5, CSS3, JavaScript (ES6+). No frameworks. Decided in PRD.
- **Single HTML file MVP** — later phases may split into multiple files for SEO; architecture must not couple content to structure.

### Cross-Cutting Concerns Identified

- **Accessibility** — ARIA attributes in HTML, focus styles in CSS, and keyboard handling in JS must all coordinate. A change to the hero zone state machine touches all three layers.
- **`prefers-reduced-motion`** — CSS transitions must be zero-duration and JS animated demo must be skipped entirely. Affects both CSS and JS modules.
- **Error handling** — Validation logic in conversion.js surfaces via ui.js into the hero zone. Error display and ARIA live region announcement must stay in sync.
- **Responsive design** — Mobile-first CSS affects pill row wrapping, touch target sizing, hero zone height, and input font size (≥16px to prevent iOS zoom).
- **Phase boundaries** — V1.0 features (LocalStorage, animated demo) and V2.0+ features (URL params, multilingual) must be architecturally accommodated without requiring rewrites.

## Starter Template Evaluation

### Primary Technology Domain

Static frontend web application — vanilla HTML/CSS/JS with no framework or build toolchain.

### Starter Options Considered

- **HTML5 Boilerplate** — rejected. Includes Gulp/Webpack build tooling that conflicts with the no-build-system constraint from PRD. Adds complexity that must be immediately removed.
- **CLI generator (Vite, CRA, etc.)** — rejected. All framework scaffolders produce framework-dependent output. The PRD explicitly requires vanilla HTML5 with no framework for MVP.
- **Manual file creation** — selected. For a zero-dependency static file project, the correct "starter" is creating the initial files directly. No overhead, no stripping required.

### Selected Starter: Manual File Creation

**Rationale:** The project is intentionally dependency-free. Any existing starter template adds infrastructure that would need to be removed before work begins. Creating the files directly is faster, cleaner, and exactly matches the project constraints.

**Initialization: Create the following files**

```
timeconversion-web/
├── index.html          # Single HTML entry point (MVP = entire app)
├── custom.css          # Pico.css overrides and project-specific styles
├── js/
│   ├── conversion.js   # Pure conversion math functions (no side effects)
│   ├── ui.js           # DOM manipulation and event handling
│   └── state.js        # LocalStorage and application state (V1.0+)
└── README.md           # Optional: brief project notes
```

**Architectural Decisions Established by File Structure:**

**Language & Runtime:**
Vanilla JavaScript (ES6+). Script files loaded via `<script type="module">` to enable ES6 import/export between modules without a bundler.

**Styling Solution:**
Pico.css loaded via CDN `<link>` in `<head>`. Single `custom.css` file for all overrides, using CSS custom properties (`:root` variables) for theming. No preprocessor.

**Build Tooling:**
None. Files are served as-is. Development: open `index.html` in browser or use `npx serve .` for a local static server with live reload if desired.

**Testing Framework:**
Manual browser testing for MVP. `agent-browser` snapshot for visual verification. Formal test framework deferred to V1.0+ if needed.

**Code Organization:**
Separation of concerns enforced by file: `conversion.js` (pure math), `ui.js` (DOM/events), `state.js` (persistence). Functions in `conversion.js` must be pure (no DOM access, no side effects) so they remain independently testable.

**Development Experience:**
No hot reload in MVP (browser refresh). For V1.0+, `npx serve .` or VS Code Live Server provides auto-refresh on file save.

**Note:** Project initialization (creating these files) will be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Module communication pattern: ES6 modules with explicit imports
- State object shape: defined below
- Conversion math strategy: integer-first arithmetic

**Important Decisions (Shape Architecture):**
- Local development: Zed Live Server extension
- Deployment target: Netlify (V2.0+, details TBD)

**Deferred Decisions (Post-MVP):**
- Netlify deployment configuration (reviewed at V2.0+ phase)
- LocalStorage persistence implementation (V1.0)
- Animated demo sequence (V1.0)

---

### Frontend Architecture

#### Module Communication Pattern

**Decision:** ES6 modules with explicit imports via `<script type="module">`.

Each file declares exactly what it exposes. `ui.js` imports pure functions from `conversion.js`. `ui.js` reads/writes state via `state.js`. No globals.

**Rationale:** Target browsers (Chrome 120+, Firefox 121+, Safari 17+) all support ES6 modules natively. Explicit imports make each file's dependencies visible — AI agents modifying one file can see exactly what it depends on without reading the whole codebase.

**Rule for AI agents:** Every function used across files MUST be exported from its source file and imported at the top of the consuming file. No implicit globals.

---

#### State Object Shape

**Decision:** Single state object in `state.js`, exported as a named export.

```js
// js/state.js
export const state = {
  currentValue: null,       // Parsed decimal number (float) or null if no valid input
  selectedUnit: 'minutes',  // Active unit key — MVP default; persisted via LocalStorage in V1.0
  lastConversion: null,     // Result object returned by conversion.js, or null
  heroState: 'empty'        // 'empty' | 'demo' | 'result' | 'error'
};
```

Valid unit keys: `'seconds'` | `'minutes'` | `'hours'` | `'days'` | `'weeks'` | `'months'` | `'years'`

**Rationale:** Centralizing all mutable state in one named object prevents `ui.js` and `state.js` from holding conflicting copies of truth. `heroState` as an explicit enum prevents UI logic scattered across conditions like `if (hasResult && !hasError)`.

**Rule for AI agents:** All state changes go through `state.js`. `ui.js` reads from `state` and calls state-updating functions — it does not hold its own copies of current value or selected unit.

---

#### Conversion Math Precision Strategy

**Decision:** Integer-first arithmetic — convert input to total milliseconds before any breakdown calculation.

**Approach:**
1. Parse input decimal to float
2. Multiply by the unit's millisecond equivalent to get total milliseconds (integer)
3. Cascade integer division downward: years → months → days → hours → minutes → seconds → ms
4. Each step uses `Math.floor()` on integers — no floating-point accumulation

**Rationale:** FR8 requires mathematical precision with no rounding errors. Floating-point operations accumulate error across cascading division steps. Integer milliseconds as the intermediate representation eliminates this — `Math.floor` on integers is exact.

**Rule for AI agents:** `conversion.js` functions must NEVER operate directly on the raw decimal float across multiple steps. Always convert to ms integer first, then cascade down.

---

### Infrastructure & Deployment

#### Local Development

**Decision:** Zed Live Server extension (already installed).

Open `index.html` via Zed's Live Server. Browser auto-refreshes on file save. No terminal command required.

**Note:** ES6 modules require HTTP (not `file://`). Live Server provides this automatically.

#### Deployment Target

**Decision:** Netlify (V2.0+).

Free tier. Static file deploy. Detailed configuration (branch deploys, custom domain, environment, redirects) to be decided at V2.0+ phase.

**Rationale:** Netlify's drag-and-drop and CLI deploy are well-suited to a zero-build static site. No build command needed — deploy the folder as-is.

---

### Decision Impact Analysis

**Implementation Sequence (dependency order):**
1. `conversion.js` — pure functions, no dependencies, implement and verify first
2. `state.js` — state object and mutator functions, depends on nothing
3. `index.html` — semantic structure, ARIA attributes, CDN links, module script tags
4. `custom.css` — Pico overrides, design tokens, responsive rules
5. `ui.js` — imports from conversion.js and state.js, wires DOM to logic

**Cross-Component Dependencies:**
- `ui.js` depends on both `conversion.js` and `state.js`
- `conversion.js` and `state.js` are independent of each other and of the DOM
- `custom.css` depends on Pico.css (loaded first via CDN)
- Hero zone state machine lives in `ui.js` — reads `state.heroState`, writes DOM

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

6 areas where AI agents could make different, incompatible choices:
1. JS naming conventions (camelCase vs snake_case vs PascalCase)
2. CSS custom property naming (which prefix/format)
3. Canonical unit key strings (what's the single source of truth?)
4. Conversion result object shape (what does conversion.js return?)
5. State mutation approach (direct vs setters)
6. DOM querying strategy (which selector pattern)

---

### Naming Patterns

#### JavaScript Naming

| Construct | Convention | Example |
|---|---|---|
| Functions | camelCase | `convertToMilliseconds()` |
| Variables | camelCase | `selectedUnit`, `totalMs` |
| Constants (fixed values) | UPPER_SNAKE_CASE | `MS_PER_MINUTE = 60_000` |
| Files | camelCase | `conversion.js`, `ui.js` |

**No classes, no PascalCase** — MVP uses plain functions and objects only.

**Rule for AI agents:** `snake_case` is NEVER used in JavaScript. No exceptions.

#### CSS Naming

- Pico.css classes: use as-is, never override class names directly
- Custom CSS classes (for JS hooks): `data-*` attributes only — CSS classes are for styling, `data-*` attributes are for JavaScript targeting

  ```html
  <!-- CORRECT: JS targets data attribute, CSS targets class -->
  <button class="pill" data-unit="minutes" aria-checked="false">Min</button>

  <!-- WRONG: JS targets CSS class — couples styling to behaviour -->
  <button class="pill pill--minutes js-unit-btn">Min</button>
  ```

- Custom CSS properties: prefix ALL project variables with `--tc-` to avoid clashing with Pico's `--pico-*` variables

  ```css
  /* CORRECT */
  :root { --tc-primary: #0D9488; --tc-hero-min-height: 160px; }

  /* WRONG — no prefix, could clash with Pico */
  :root { --primary: #0D9488; }
  ```

---

### Structure Patterns

#### Module Responsibility Boundaries

This is the most critical structural rule — AI agents must NEVER put logic in the wrong file.

| File | Owns | Never contains |
|---|---|---|
| `conversion.js` | Math, unit definitions, ms constants | DOM access, `document.*`, `state` |
| `state.js` | State object, state mutator functions | DOM access, conversion math |
| `ui.js` | DOM queries, event listeners, render functions | Conversion math, direct state.* writes |
| `custom.css` | Design tokens, layout overrides, component styles | JS logic, inline styles |
| `index.html` | Document structure, ARIA attributes, CDN links | Inline JS (beyond module import), inline styles |

**Rule for AI agents:** If you are writing DOM code in `conversion.js` or math code in `ui.js`, you are in the wrong file. Stop and move the code.

#### Export Style

**Named exports only.** No default exports anywhere.

```js
// CORRECT — named export
export function convertMinutes(decimal) { ... }
export const UNITS = { ... };

// WRONG — default export
export default function convertMinutes(decimal) { ... }
```

**Rationale:** Named exports make it explicit what each module provides. Default exports allow AI agents to import with arbitrary names, creating inconsistency.

---

### Format Patterns

#### Canonical Unit Keys

These exact strings are the single source of truth. Used in `state.selectedUnit`, `data-unit` attributes, and `conversion.js` unit definitions.

```
'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
```

**Rule for AI agents:** NEVER use abbreviations ('min', 'hr', 'sec') or singular forms ('minute', 'hour') as unit keys. Only the full lowercase plural form above.

#### Conversion Result Object Shape

`conversion.js` returns this exact shape on success, or `null` on failure:

```js
// Returned by conversion.js convert() function
{
  input: {
    raw: 2.5,           // Original float input
    unit: 'minutes'     // Canonical unit key
  },
  breakdown: {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 2,
    seconds: 30,
    milliseconds: 0
  },
  formats: {
    standard: '2 min 30 sec',          // Human label form
    compact: '2:30',                    // Colon-separated
    verbose: '2 minutes, 30 seconds',  // Full word form
    total: '150 seconds'               // Total in smallest meaningful unit
  }
}
```

**Rule for AI agents:** `convert()` returns `null` for invalid/empty input — never throws. Callers in `ui.js` must handle `null` by setting `state.heroState = 'error'`.

#### Error Message Format

Error messages are plain strings. They live in `ui.js` as constants, not in `conversion.js`. `conversion.js` never produces user-facing strings.

```js
// In ui.js
const ERROR_MESSAGES = {
  empty: "Try entering a number first — like 2.5",
  invalid: "That doesn't look like a number. Try something like 2.5 or 0.75",
  negative: "Time values must be positive. Try a number greater than 0"
};
```

---

### Communication Patterns

#### State Mutation

Direct property mutation on the `state` object. No setter functions, no events, no proxies for MVP.

```js
// CORRECT — direct mutation in ui.js
import { state } from './state.js';
state.selectedUnit = 'hours';
state.heroState = 'result';

// WRONG — unnecessary wrapper
setState({ selectedUnit: 'hours' });  // Don't create this
```

**Rationale:** For a 5-function app with one user, the simplicity of direct mutation outweighs the benefits of encapsulation. Setters are a V1.0 refactor if needed.

#### DOM Query Strategy

Query by `data-*` attribute or `id`. Never by CSS class in JavaScript.

```js
// CORRECT
document.getElementById('hero-zone')
document.querySelector('[data-unit="minutes"]')
document.querySelectorAll('[data-unit]')

// WRONG — CSS class in JS query couples styling to behaviour
document.querySelector('.pill--active')
document.querySelectorAll('.unit-pill')
```

All interactive elements that JavaScript needs to target MUST have either an `id` or a `data-*` attribute defined in `index.html`.

---

### Process Patterns

#### Input Parsing & Validation Ownership

```
Raw string input (e.g. "2.5 min")
  → ui.js: parse natural language → extract float + unit key
  → ui.js: validate (non-empty, positive number, recognisable unit)
  → conversion.js: receive (float, unitKey) → return result object or null
  → ui.js: render result or error state
```

**Rule for AI agents:** `conversion.js` receives ONLY a validated float and a canonical unit key string. It NEVER receives raw user input strings.

#### Hero Zone State Transitions

Only `ui.js` writes to `state.heroState`. Valid transitions:

```
'empty' → 'demo'    (page load, input is empty, first visit)
'empty' → 'result'  (user converts with valid input)
'empty' → 'error'   (user triggers conversion with empty/invalid input)
'demo'  → 'result'  (demo completes, user converts)
'result'→ 'result'  (new conversion)
'result'→ 'error'   (user clears input then converts)
'error' → 'result'  (user corrects input and converts)
'error' → 'empty'   (user clears input without converting — V1.0)
```

After every `state.heroState` write, `ui.js` MUST immediately call `renderHeroZone()` to keep DOM in sync.

#### Loading States

No async operations in MVP — all conversions are synchronous. No loading states needed. If a future version adds async features, loading state pattern will be defined at that time.

---

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `data-*` attributes for JS DOM targeting, never CSS classes
- Use full lowercase plural unit keys only (`'minutes'`, not `'min'`)
- Keep `conversion.js` free of DOM access and state reads
- Return `null` from `convert()` on failure — never throw, never return undefined
- Prefix all CSS custom properties with `--tc-`
- Use named exports only
- Write `state.heroState` only from `ui.js`, and always follow with `renderHeroZone()`

**Anti-Patterns (reject in code review):**

```js
// ❌ snake_case variable
const selected_unit = 'minutes';

// ❌ Abbreviation unit key
state.selectedUnit = 'min';

// ❌ DOM access in conversion.js
export function convert(val, unit) {
  const input = document.getElementById('input').value; // WRONG
}

// ❌ Default export
export default function convert() { ... }

// ❌ CSS class in JS query
document.querySelector('.pill--active');

// ❌ CSS property without --tc- prefix
:root { --primary-color: teal; }
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
timeconversion-web/
├── index.html           # App entry, semantic structure, ARIA, CDN links, module script
├── custom.css           # --tc-* design tokens, Pico overrides, layout, responsive, hero zone
├── js/
│   ├── conversion.js    # Pure math: UNIT_KEYS, UNIT_LABELS, convert(), unit constants
│   ├── ui.js            # DOM wiring: events, renderHeroZone(), renderPills(), input parsing
│   └── state.js         # state object, HERO_STATES enum
├── .gitignore           # OS files, editor files (.DS_Store, .zed/, etc.)
└── README.md            # Brief project notes
```

**V1.0 additions (no new files, extended functions):**
- `js/state.js` — gains `loadFromStorage()` and `saveToStorage()` for LocalStorage persistence
- `js/ui.js` — gains `runAnimatedDemo()` function

**V2.0+ additions (new files added at that phase):**
```
├── minutes.html         # Dedicated SEO page for "decimal minutes" searches
├── hours.html           # Dedicated SEO page for "decimal hours" searches
├── (one per unit...)
├── js/
│   └── i18n.js          # Multilingual string table and locale detection
├── sitemap.xml          # Search engine sitemap
├── robots.txt           # Crawler directives
└── netlify.toml         # Netlify deploy configuration (redirects, headers)
```

---

### Functional Requirements → File Mapping

| FR Category | FRs | Primary file | Secondary file |
|---|---|---|---|
| Conversion math | FR1–FR8 | `conversion.js` | — |
| Input handling | FR9–FR16 | `ui.js` (parsing/validation) | `index.html` (input element) |
| Output & display | FR17–FR23 | `ui.js` (render functions) | `index.html` (output element) |
| Error handling | FR24–FR27 | `ui.js` (error render + messages) | `conversion.js` (returns null) |
| UI & navigation | FR28–FR34 | `ui.js` (keyboard events) | `index.html` + `custom.css` |
| Accessibility | FR35–FR40 | `index.html` (ARIA attrs) | `ui.js` (live region updates) + `custom.css` (focus rings) |
| V1.0 customization | FR41–FR43 | `state.js` (LocalStorage) | `custom.css` (dark mode tokens) |
| V2.0 SEO | FR44–FR46 | `index.html` (meta, schema.org) | Per-unit HTML files |
| V2.0 multilingual | FR47–FR49 | `js/i18n.js` | — |
| V2.0 advanced | FR50–FR52 | `js/history.js` (future) | — |

---

### Architectural Boundaries

#### Component Boundaries & Exports

**`js/conversion.js` — exports:**
```js
export const UNIT_KEYS   // ['seconds','minutes','hours','days','weeks','months','years']
export const UNIT_LABELS // { seconds: 'Sec', minutes: 'Min', hours: 'Hr', ... }
export function convert(decimal, unitKey)  // → result object | null
```
Internal only (not exported): `toMilliseconds()`, `cascadeBreakdown()`, format helpers.

**`js/state.js` — exports:**
```js
export const HERO_STATES  // { EMPTY:'empty', DEMO:'demo', RESULT:'result', ERROR:'error' }
export const state        // { currentValue, selectedUnit, lastConversion, heroState }
```

**`js/ui.js` — exports:** none. It is the entry point.
Internal functions: `parseNaturalLanguage()`, `validateInput()`, `renderHeroZone()`,
`renderPills()`, `handlePillClick()`, `handleEnterKey()`, `handleCopy()`.

**`index.html` — single script tag:**
```html
<script type="module" src="js/ui.js"></script>
```
`ui.js` imports what it needs. HTML imports nothing else.

---

#### Integration Boundaries

**CDN boundary** (runtime, requires internet):
- Pico.css: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico/css/pico.min.css">`
- Google Fonts Inter: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap">`

**No other external integrations** in MVP or V1.0.

---

### Data Flow

```
User types "2.5" → clicks [Min] pill
  │
  ▼
ui.js: handlePillClick(event)
  │   reads: document.getElementById('value-input').value → "2.5"
  │   reads: event.currentTarget.dataset.unit → "minutes"
  │   calls: parseNaturalLanguage("2.5") → { value: 2.5, unit: null }
  │   resolves unit: pill unit wins when no unit in text → "minutes"
  │   calls: validateInput(2.5, "minutes") → valid
  │
  ▼
conversion.js: convert(2.5, "minutes")
  │   converts 2.5 min → 150,000 ms (integer)
  │   cascades: 0yr, 0mo, 0wk, 0d, 0hr, 2min, 30sec, 0ms
  │   builds formats: standard, compact, verbose, total
  │   returns: result object
  │
  ▼
ui.js: receives result object
  │   writes: state.lastConversion = result
  │   writes: state.heroState = HERO_STATES.RESULT
  │   calls: renderHeroZone()
  │
  ▼
DOM updated: hero zone shows "2 min 30 sec" + secondary formats + copy buttons
```

**Error path:**
```
User clicks pill with empty input
  │
ui.js: validateInput(null, "minutes") → invalid
  │   writes: state.heroState = HERO_STATES.ERROR
  │   calls: renderHeroZone()
  │   sets: focus back to #value-input after 100ms
  │
DOM updated: hero zone shows error message, ARIA live region fires
```

---

### File Organization Patterns

**Configuration files:** None for MVP. `.gitignore` at root. `netlify.toml` added at V2.0+.

**Static assets:** None for MVP. Fonts and Pico loaded via CDN. If icons needed (V1.0+ error state SVG), add `assets/icons/` directory.

**No `node_modules`, no `package.json`, no `dist/`** — the project root IS the deployment artifact.

---

### Development Workflow Integration

**Development:** Open project in Zed → start Live Server → edit files → browser auto-refreshes.

**Testing:** Open browser DevTools → manual test against FR acceptance criteria → `agent-browser snapshot` for visual verification.

**Deployment (V2.0+):** Drag-and-drop the project root folder to Netlify dashboard, or `netlify deploy --dir .` via CLI. No build step. What you see locally is what deploys.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are compatible. ES6 modules work natively in all target browsers without a bundler. `const state` + direct property mutation is valid JavaScript. Pico.css dark mode and `--tc-*` CSS custom properties coexist without conflict.

**Pattern Consistency:** All naming, structure, and communication patterns are internally consistent and non-contradictory.

**Structure Alignment:** Single `<script type="module" src="js/ui.js">` entry point creates a clean, acyclic dependency graph. `conversion.js` has no browser API dependencies.

---

### Requirements Coverage Validation ✅

**MVP FRs (FR1–FR40):** All 40 MVP functional requirements are architecturally supported. Each FR category maps to a specific file with defined functions and responsibilities.

**V1.0–V2.0+ FRs (FR41–FR52):** Deferred appropriately. File structure and module boundaries accommodate all future phases without requiring architectural rewrites.

**NFRs:** Performance (<200KB, <100ms conversions), accessibility (WCAG 2.1 AA), code quality (zero console errors, W3C valid HTML, separation of concerns) — all architecturally addressed.

---

### Gap Analysis

**Critical gaps:** None.

**Minor implementation notes (not architectural gaps):**
1. `renderHeroZone()` must implement the UX spec's "Smart precision display" table — which breakdown fields to show per input unit. Reference: UX design specification, Form Patterns section.
2. `parseNaturalLanguage()` requires a unit alias table mapping abbreviations to canonical unit keys. This should be a named constant in `ui.js` defined in the first implementation story.
3. `formats.compact` for days+ units (e.g., "1d 3:27:45") — format implementer decides; document the chosen format as a comment in `conversion.js`.

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low — static frontend)
- [x] Technical constraints identified (no build system, CDN deps, ES6+)
- [x] Cross-cutting concerns mapped (accessibility, reduced-motion, responsive, errors)

**✅ Architectural Decisions**
- [x] Critical decisions documented (modules, state shape, math strategy)
- [x] Technology stack fully specified (vanilla HTML/CSS/JS, Pico.css, Google Fonts)
- [x] Integration patterns defined (ES6 named imports, CDN boundary)
- [x] Performance considerations addressed (<200KB, synchronous conversions)

**✅ Implementation Patterns**
- [x] Naming conventions established (camelCase, UPPER_SNAKE_CASE, --tc- prefix)
- [x] Structure patterns defined (module boundaries, export style, data-* targeting)
- [x] Communication patterns specified (direct state mutation, null return contract)
- [x] Process patterns documented (input flow, hero zone transitions, error handling)

**✅ Project Structure**
- [x] Complete directory structure defined (MVP + V1.0 + V2.0+ phases)
- [x] Component boundaries established (conversion.js / state.js / ui.js contracts)
- [x] Integration points mapped (CDN, module imports, data flow diagram)
- [x] Requirements to structure mapping complete (all 52 FRs mapped to files)

---

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High** — stack is minimal, decisions are unambiguous, patterns are specific with examples, anti-patterns are documented, data flow is fully traced.

**Key Strengths:**
- Zero-ambiguity module boundaries — no agent can accidentally put code in the wrong file without violating an explicit rule
- Conversion result object shape fully specified — no agent will invent a different format
- Integer-first math decision eliminates the most common source of bugs in this domain
- `HERO_STATES` enum prevents magic string proliferation across ui.js

**Areas for Future Enhancement (post-MVP):**
- Setter functions in `state.js` for V1.0 LocalStorage integration
- Formal unit test setup (Vitest or similar) when `conversion.js` grows in complexity
- Netlify configuration (`netlify.toml`, redirects, cache headers) at V2.0+

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented — no improvisation
- Use implementation patterns consistently — refer to the anti-patterns list before writing
- Respect module boundaries — conversion.js never touches the DOM
- Refer to this document for all architectural questions before inventing solutions

**First Implementation Priority:**
Create the 5 files in this order (dependency order from Step 4):
1. `js/conversion.js` — pure math, no dependencies
2. `js/state.js` — state object and HERO_STATES enum
3. `index.html` — semantic structure, ARIA, CDN links, module script tag
4. `custom.css` — design tokens and layout
5. `js/ui.js` — wires everything together
