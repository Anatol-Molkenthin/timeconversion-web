# Story 1.1: Project Setup & Working Shell

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the 5 project files created with correct scaffolding and CDN dependencies loading,
so that the tech stack is verified and subsequent stories have a working foundation to build on.

## Acceptance Criteria

**AC1 — Page loads without errors:**
- **Given** the project directory exists
- **When** the developer opens `index.html` via Zed Live Server
- **Then** the page loads without any console errors
- **And** Pico.css styles are visible (Inter font, clean typography, neutral background)
- **And** a teal hero zone section is visible at the top
- **And** an input field is visible below the hero zone
- **And** 7 unit pill buttons (Sec, Min, Hr, Day, Wk, Mo, Yr) are visible in a row
- **And** `<script type="module" src="js/ui.js">` is the only script tag in the HTML

**AC2 — Module imports resolve correctly:**
- **Given** the page has loaded
- **When** the developer opens the browser console and runs:
  `import { convert, UNIT_KEYS } from './js/conversion.js'`
- **Then** it resolves without error
- **And** `import { state, HERO_STATES } from './js/state.js'` also resolves without error
- **And** `UNIT_KEYS` returns `['seconds','minutes','hours','days','weeks','months','years']`
- **And** `state.selectedUnit` returns `'minutes'`
- **And** `state.heroState` returns `'empty'`

## Tasks / Subtasks

- [x] Task 1: Create `js/` directory and `js/conversion.js` scaffold (AC: #2)
  - [x] Create `js/` folder in project root
  - [x] Export `UNIT_KEYS` array (7 canonical strings in exact order)
  - [x] Export `UNIT_LABELS` object mapping unit keys to pill labels
  - [x] Export `convert()` function stub that returns `null` for all inputs
  - [x] Define internal `MS_PER_UNIT` constants (not exported) as a placeholder
  - [x] Use named exports only — NO default exports

- [x] Task 2: Create `js/state.js` (AC: #2)
  - [x] Export `HERO_STATES` enum object with 4 keys: EMPTY, DEMO, RESULT, ERROR
  - [x] Export `state` object with `currentValue`, `selectedUnit`, `lastConversion`, `heroState`
  - [x] Set `selectedUnit` default to `'minutes'`
  - [x] Set `heroState` default to `'empty'`
  - [x] Use named exports only — NO default exports

- [x] Task 3: Create `index.html` (AC: #1)
  - [x] Add `<!DOCTYPE html>` and `lang="en"`
  - [x] Add Pico.css CDN `<link>` in `<head>` (exact URL from architecture doc)
  - [x] Add Google Fonts Inter CDN `<link>` in `<head>`
  - [x] Add `<link rel="stylesheet" href="custom.css">` AFTER the Pico CDN link
  - [x] Add `<main>` landmark wrapping all content
  - [x] Add `<section id="hero-zone">` with `role="region"`, `aria-label="Conversion result"`, `aria-live="polite"`
  - [x] Hero zone shows placeholder text "Enter a decimal time value above" in its initial state
  - [x] Add `<input type="text" id="value-input" ...>` with placeholder `"e.g. 2.5"`
  - [x] Add `<div role="radiogroup" aria-label="Select time unit" id="pill-row">` wrapping all 7 pills
  - [x] Add 7 `<button>` elements with `role="radio"`, `data-unit="[canonical-key]"`, and display labels
  - [x] Set the "Min" pill with `aria-checked="true"` (default selected); all others `aria-checked="false"`
  - [x] Add `<script type="module" src="js/ui.js"></script>` as the ONLY script tag (before `</body>`)
  - [x] Verify: NO inline JS, NO other script tags

- [x] Task 4: Create `custom.css` (AC: #1)
  - [x] Define all `--tc-*` CSS custom properties in `:root` (see Dev Notes for full list)
  - [x] Style `#hero-zone` with teal gradient background, min-height, padding, teal text colour
  - [x] Style `.pill` buttons: border-radius 999px, border 1.5px, min 44×44px touch target
  - [x] Style `.pill[aria-checked="true"]` as active: teal bg, white text
  - [x] Add focus-visible ring: `2px solid var(--tc-primary)` with `2px` offset
  - [x] Mobile-first base styles (full width single column)

- [x] Task 5: Create `js/ui.js` entry point (AC: #1)
  - [x] Add imports at top: `import { convert, UNIT_KEYS, UNIT_LABELS } from './conversion.js';`
  - [x] Add import: `import { state, HERO_STATES } from './state.js';`
  - [x] Add `document.addEventListener('DOMContentLoaded', init);`
  - [x] In `init()`: auto-focus `#value-input`
  - [x] In `init()`: verify pills are rendered and "Min" is visually active
  - [x] No exports from ui.js (it is the entry point, not a module)

- [x] Task 6: Create `.gitignore` at project root
  - [x] Include: `.DS_Store`, `.zed/`, `Thumbs.db`, `*.log`, `node_modules/` (precautionary)

- [x] Task 7: Manual browser verification
  - [x] Open `index.html` via Zed Live Server
  - [x] Confirm zero console errors
  - [x] Confirm Inter font loaded (check Network tab — fonts.googleapis.com)
  - [x] Confirm Pico.css loaded (check Network tab — cdn.jsdelivr.net)
  - [x] Confirm teal hero zone visible
  - [x] Confirm 7 pills visible, "Min" active
  - [x] Confirm `UNIT_KEYS` in console returns correct array

## Dev Notes

### Critical Architecture Rules — READ BEFORE WRITING A SINGLE LINE

These rules come from the architecture document. Violating any of them will cause failures in subsequent stories.

#### Module Boundary Enforcement

| File | What it owns | What it NEVER contains |
|---|---|---|
| `conversion.js` | Math, unit definitions, ms constants | DOM access, `document.*`, `state` object |
| `state.js` | State object, HERO_STATES enum | DOM access, conversion math |
| `ui.js` | DOM queries, event listeners | Conversion math, direct `state.*` writes (except via intended mutations) |
| `custom.css` | Design tokens, overrides | JS logic, inline styles |
| `index.html` | Structure, ARIA, CDN links, module import | Inline JS, inline styles |

**If you find yourself writing DOM code in `conversion.js` or math code in `ui.js` — STOP. You are in the wrong file.**

#### Naming Rules

- **JavaScript:** camelCase for variables/functions, `UPPER_SNAKE_CASE` for constants. NO snake_case, NO PascalCase for non-classes (and there are no classes).
- **CSS:** All custom properties MUST be prefixed `--tc-`. Never use `--primary` or other unprefixed vars — they will clash with Pico's `--pico-*` variables.
- **DOM targeting:** Use `data-*` attributes for JS, CSS classes for styling. NEVER query CSS classes in JS.

```js
// ✅ CORRECT
document.getElementById('hero-zone')
document.querySelector('[data-unit="minutes"]')
document.querySelectorAll('[data-unit]')

// ❌ WRONG — CSS class in JS
document.querySelector('.pill--active')
```

#### Export Style

Named exports ONLY. No default exports anywhere.

```js
// ✅ CORRECT
export const UNIT_KEYS = [...];
export function convert(decimal, unitKey) { ... }

// ❌ WRONG
export default function convert() { ... }
```

---

### Exact File Scaffolds

#### `js/conversion.js` — Complete scaffold for this story

```js
// conversion.js — Pure math: unit definitions, conversion engine
// No DOM access. No state reads. Pure functions only.

export const UNIT_KEYS = [
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years'
];

export const UNIT_LABELS = {
  seconds: 'Sec',
  minutes: 'Min',
  hours:   'Hr',
  days:    'Day',
  weeks:   'Wk',
  months:  'Mo',
  years:   'Yr'
};

// Internal constants — not exported
// These will be filled in Story 1.2
const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR   = 3_600_000;
const MS_PER_DAY    = 86_400_000;
const MS_PER_WEEK   = 604_800_000;
const MS_PER_MONTH  = 2_629_746_000; // Average Gregorian month
const MS_PER_YEAR   = 31_556_952_000; // Average Gregorian year

/**
 * Convert a decimal time value to a human-readable breakdown.
 * @param {number} decimal - Positive decimal number
 * @param {string} unitKey - Canonical unit key from UNIT_KEYS
 * @returns {object|null} Result object, or null on invalid input
 */
export function convert(decimal, unitKey) {
  // Story 1.2 will implement the full conversion engine.
  // Stub: return null for all inputs for now.
  return null;
}
```

#### `js/state.js` — Complete scaffold for this story

```js
// state.js — Application state and hero zone enum
// No DOM access. No conversion math.

export const HERO_STATES = {
  EMPTY:  'empty',
  DEMO:   'demo',
  RESULT: 'result',
  ERROR:  'error'
};

export const state = {
  currentValue:    null,       // Parsed float or null
  selectedUnit:    'minutes',  // Default unit — MVP default
  lastConversion:  null,       // Last result from convert(), or null
  heroState:       'empty'     // Initial state
};
```

#### `index.html` — Semantic structure scaffold

Key requirements:
- Pico.css CDN: `https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css`
  (Use version @2 for pinning stability)
- Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap`
- Hero zone: `<section id="hero-zone" role="region" aria-label="Conversion result" aria-live="polite">`
- Input: `<input type="text" id="value-input" aria-label="Enter decimal time value" placeholder="e.g. 2.5" autocomplete="off">`
- Pill container: `<div id="pill-row" role="radiogroup" aria-label="Select time unit">`
- Each pill: `<button class="pill" role="radio" data-unit="[key]" aria-checked="false">Label</button>`
  — "Min" pill gets `aria-checked="true"` as the default
- Only script tag: `<script type="module" src="js/ui.js"></script>`

Pill order and labels (must match UNIT_KEYS order):

| data-unit | Display |
|---|---|
| `seconds` | Sec |
| `minutes` | Min |
| `hours` | Hr |
| `days` | Day |
| `weeks` | Wk |
| `months` | Mo |
| `years` | Yr |

#### `custom.css` — Design tokens and layout scaffold

```css
/* custom.css — All project-specific styles and Pico.css overrides */
/* RULE: All custom properties MUST be prefixed --tc- */

:root {
  /* Primary brand colour */
  --tc-primary:        #0D9488;  /* teal-600 */
  --tc-primary-hover:  #0F766E;  /* teal-700 */
  --tc-primary-dark:   #2DD4BF;  /* teal-400 — used in dark mode */

  /* Hero zone */
  --tc-hero-bg-from:   #0D9488;
  --tc-hero-bg-to:     #0F766E;
  --tc-hero-min-height: 160px;
  --tc-hero-text:      #FFFFFF;

  /* Pill states */
  --tc-pill-border:    #E5E7EB;  /* neutral-200 */
  --tc-pill-text:      #374151;  /* neutral-700 */
  --tc-pill-active-bg: #0D9488;
  --tc-pill-active-text: #FFFFFF;

  /* Override Pico's primary color */
  --pico-primary: #0D9488;
  --pico-primary-hover: #0F766E;
}

/* Hero zone */
#hero-zone {
  background: linear-gradient(135deg, var(--tc-hero-bg-from), var(--tc-hero-bg-to));
  min-height: var(--tc-hero-min-height);
  padding: 2rem 1.5rem;
  color: var(--tc-hero-text);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Unit pill row */
#pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 1rem;
}

/* Individual pill */
.pill {
  border-radius: 999px;
  border: 1.5px solid var(--tc-pill-border);
  color: var(--tc-pill-text);
  background: transparent;
  min-height: 44px;
  min-width: 44px;
  padding: 0.25rem 0.75rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 100ms ease, background 100ms ease, color 100ms ease;
}

/* Active pill */
.pill[aria-checked="true"] {
  background: var(--tc-pill-active-bg);
  color: var(--tc-pill-active-text);
  border-color: var(--tc-pill-active-bg);
}

/* Hover — only on pointer devices (not touch) */
@media (hover: hover) {
  .pill:hover {
    border-color: var(--tc-primary);
    color: var(--tc-primary);
  }
  .pill[aria-checked="true"]:hover {
    background: var(--tc-primary-hover);
    color: var(--tc-pill-active-text);
    border-color: var(--tc-primary-hover);
  }
}

/* Focus ring */
.pill:focus-visible,
#value-input:focus-visible {
  outline: 2px solid var(--tc-primary);
  outline-offset: 2px;
}

/* prefers-reduced-motion: zero all transitions */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

#### `js/ui.js` — Entry point scaffold

```js
// ui.js — DOM wiring: events, render functions, input parsing
// No math here. No direct state mutations except via intended patterns.
// No exports — this is the entry point.

import { convert, UNIT_KEYS, UNIT_LABELS } from './conversion.js';
import { state, HERO_STATES } from './state.js';

function init() {
  // Auto-focus input on load
  const input = document.getElementById('value-input');
  if (input) input.focus();

  // Story 1.3 will wire up event listeners for pill clicks and Enter key.
  // For now, the scaffold just verifies imports resolve and input is focused.
}

document.addEventListener('DOMContentLoaded', init);
```

---

### Project Structure Notes

**File creation order (dependency order — DO NOT deviate):**
1. `js/conversion.js` — no dependencies
2. `js/state.js` — no dependencies
3. `index.html` — references js/ui.js (which must exist before browser parses the script tag)
4. `custom.css` — overrides Pico (Pico must be in index.html first)
5. `js/ui.js` — imports from conversion.js and state.js

**Final directory tree for this story:**
```
timeconversion-web/
├── index.html
├── custom.css
├── js/
│   ├── conversion.js
│   ├── state.js
│   └── ui.js
└── .gitignore
```

**Note:** `README.md` is optional per architecture doc. Do NOT create it unless asked.

**Alignment with architecture:**
- All patterns directly mirror the architecture document's "Complete Project Directory Structure" section
- No deviation from the specified CDN URLs, module boundary rules, or naming conventions

### References

- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- File creation order: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Handoff]
- Module boundaries table: [Source: _bmad-output/planning-artifacts/architecture.md#Module Responsibility Boundaries]
- CDN URLs: [Source: _bmad-output/planning-artifacts/architecture.md#Integration Boundaries]
- State object shape: [Source: _bmad-output/planning-artifacts/architecture.md#State Object Shape]
- HERO_STATES enum: [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundaries & Exports]
- UNIT_KEYS canonical strings: [Source: _bmad-output/planning-artifacts/architecture.md#Canonical Unit Keys]
- CSS custom property naming: [Source: _bmad-output/planning-artifacts/architecture.md#CSS Naming]
- Pill ARIA pattern: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Unit Pill Row]
- Hero zone ARIA: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Hero Zone]
- Color tokens: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- Typography: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System]
- Touch targets 44x44px: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design]
- prefers-reduced-motion: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Interaction Timing]
- hover-only hover styles: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Mobile-specific rules]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — no errors encountered during implementation.

### Completion Notes List

- ✅ Created `js/conversion.js` with UNIT_KEYS (7 canonical keys), UNIT_LABELS, convert() stub returning null, and internal MS_PER_UNIT constants. Named exports only.
- ✅ Created `js/state.js` with HERO_STATES enum and state object. Defaults: selectedUnit='minutes', heroState='empty'. Named exports only.
- ✅ Created `index.html` with Pico.css @2 CDN, Google Fonts Inter CDN, semantic `<main>`, hero zone section with full ARIA attributes (role="region", aria-label, aria-live="polite"), input with aria-label, pill radiogroup with 7 pills (data-unit attributes, aria-checked). Single module script tag only.
- ✅ Created `custom.css` with all --tc-* design tokens, dark mode token overrides via prefers-color-scheme, hero zone teal gradient, pill styles with 44×44px min touch targets, focus-visible rings, hover-only @media (hover: hover) rule, and prefers-reduced-motion zeroing.
- ✅ Created `js/ui.js` entry point importing from conversion.js and state.js. DOMContentLoaded → init() → auto-focuses #value-input. No exports.
- ✅ Updated `.gitignore` to add `.zed/` (was missing from the BMAD scaffold default).
- ✅ Verified via agent-browser: zero console errors, teal hero zone visible, all 7 pills visible, "Min" pill active (aria-checked="true" + teal background), input field present.
- Note: No formal test framework — architecture doc specifies manual browser testing for MVP. Formal tests deferred to V1.0+.

### File List

- `js/conversion.js` (new)
- `js/state.js` (new)
- `index.html` (new)
- `custom.css` (new)
- `js/ui.js` (new)
- `.gitignore` (modified — added .zed/)
