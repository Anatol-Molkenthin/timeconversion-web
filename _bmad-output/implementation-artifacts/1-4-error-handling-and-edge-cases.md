# Story 1.4: Error Handling & Edge Cases

Status: done

## Story

As a user,
I want to receive a clear, helpful message when I enter invalid input,
So that I know exactly what to fix and am never left confused or stuck.

## Acceptance Criteria

**AC1 — Empty input error:**
- **Given** the input field is empty
- **When** the user clicks any pill or presses Enter
- **Then** the hero zone background shifts from teal to neutral (200ms transition)
- **And** the hero zone displays: `"Try entering a number first — like 2.5"`
- **And** `state.heroState` is `'error'`
- **And** the input field regains focus within 100ms

**AC2 — Non-numeric input error:**
- **Given** the input contains only letters (e.g. `"abc"`)
- **When** the user triggers conversion
- **Then** a friendly error message appears: `"That doesn't look like a number. Try something like 2.5 or 0.75"`

**AC3 — Negative number error:**
- **Given** the input contains a negative number (e.g. `"-2.5"`)
- **When** the user triggers conversion
- **Then** a friendly error message appears: `"Time values must be positive. Try a number greater than 0"`

**AC4 — Error recovery:**
- **Given** an error state is showing
- **When** the user types a valid value and clicks a pill
- **Then** the hero zone transitions back to the result state with the correct conversion
- **And** the teal background is restored

**AC5 — Zero console errors:**
- **Given** any interaction or conversion
- **When** checking the browser console
- **Then** zero errors or warnings are present

**AC6 — Clear-to-empty transition:**
- **Given** the user manually clears the input field
- **When** the field becomes empty and focus leaves it (blur event)
- **Then** the hero zone returns to the `'empty'` state (teal background, "Enter a decimal time value above")

## Tasks / Subtasks

- [x] Task 1: Add `ERROR_MESSAGES` constant and `validateInput()` to `ui.js` (AC: #1, #2, #3)
  - [x] Define `ERROR_MESSAGES` as a module-level named constant (not exported)
  - [x] Define exactly 3 keys: `empty`, `invalid`, `negative` with verbatim strings from the ACs
  - [x] Write `validateInput(parsedValue, rawInput)` — returns `{ valid: true }` OR `{ valid: false, message: string }`
  - [x] Empty rule: `parsedValue === null` AND `rawInput.trim() === ''` → `ERROR_MESSAGES.empty`
  - [x] Invalid rule: `parsedValue === null` AND `rawInput.trim() !== ''` → `ERROR_MESSAGES.invalid`
  - [x] Negative rule: `parsedValue !== null` AND `parsedValue <= 0` → `ERROR_MESSAGES.negative`
  - [x] Valid rule: `parsedValue > 0` → `{ valid: true }`

- [x] Task 2: Update `handlePillClick` to use `validateInput` and auto-refocus (AC: #1, #2, #3, #4, #5)
  - [x] Replace both `state.errorMessage = 'Invalid input'; // Story 1.4 expands this` stubs
  - [x] After `parseNaturalLanguage(rawInput)`, call `validateInput(value, rawInput)`
  - [x] If `!valid`: set `state.heroState = HERO_STATES.ERROR`, `state.errorMessage = message`, call `renderPills` + `renderHeroZone`, then `setTimeout(() => document.getElementById('value-input').focus(), 100)` — **return early, do NOT call `convert()`**
  - [x] If `valid`: call `convert(value, resolvedUnit)` as before; if convert returns null (unit issue), set generic fallback error

- [x] Task 3: Update `handleEnterKey` identically to `handlePillClick` (AC: #1, #2, #3, #4, #5)
  - [x] Same validateInput pattern as Task 2 — same early-return on invalid
  - [x] Same 100ms auto-refocus on error

- [x] Task 4: Update `renderHeroZone()` to stamp `data-state` on `#hero-zone` (AC: #1, #4, #6)
  - [x] Immediately after `const zone = document.getElementById('hero-zone')`, add: `zone.setAttribute('data-state', state.heroState)`
  - [x] This single line drives all CSS state styling (error overlay, future states)
  - [x] Verify: result clears the error overlay because `data-state="result"` removes `data-state="error"`

- [x] Task 5: Add blur-to-empty listener in `init()` (AC: #6)
  - [x] Add `input.addEventListener('blur', handleInputBlur)` in `init()`
  - [x] Define `handleInputBlur`: if `input.value.trim() === ''` → `state.heroState = HERO_STATES.EMPTY` → `renderHeroZone()`
  - [x] Only transition to empty — do NOT change heroState if input has content on blur

- [x] Task 6: Add error state CSS to `custom.css` (AC: #1, #4)
  - [x] Add `--tc-error-bg: #4B5563` (neutral-600) to `:root` design tokens
  - [x] Add `--tc-error-bg: #1F2937` (neutral-800) to `@media (prefers-color-scheme: dark)` override block
  - [x] Add `position: relative; overflow: hidden` to `#hero-zone` rule
  - [x] Add `#hero-zone::after` pseudo-element: absolute-fill overlay, `background-color: var(--tc-error-bg)`, `opacity: 0`, `transition: opacity 200ms ease`, `pointer-events: none`, `border-radius: inherit`, `z-index: 0`
  - [x] Add `#hero-zone[data-state="error"]::after { opacity: 1; }` to activate overlay
  - [x] Add `#hero-zone > * { position: relative; z-index: 1; }` to keep content above overlay
  - [x] Add `transition: opacity 200ms ease` to the `@media (prefers-reduced-motion: reduce)` block: `transition-duration: 0ms !important` already covers this

- [x] Task 7: Manual browser verification (AC: #1–#6)
  - [x] **AC1:** Click Min with empty input → neutral background fades in, "Try entering a number first — like 2.5", input cursor back in field within 100ms
  - [x] **AC2:** Type `abc`, click Min → "That doesn't look like a number. Try something like 2.5 or 0.75"
  - [x] **AC3:** Type `-2.5`, click Min → "Time values must be positive. Try a number greater than 0"
  - [x] **AC4:** After any error, type `2.5`, click Min → teal background restored, "2 min 30 sec" result shows
  - [x] **AC5:** Open DevTools Console throughout all tests above — zero errors or warnings
  - [x] **AC6:** Show a result with `2.5 min`, then clear input, click outside the field → hero zone returns to teal "Enter a decimal time value above"

## Dev Notes

### SCOPE — Files Modified in This Story

- `js/ui.js` — **targeted expansions only** (add `ERROR_MESSAGES`, `validateInput`, `handleInputBlur`; expand the two stub lines; update `renderHeroZone` to stamp `data-state`; add blur listener in `init`)
- `custom.css` — **additions only** (error state overlay CSS, `--tc-error-bg` tokens)

**DO NOT TOUCH:** `js/conversion.js`, `js/state.js`, `index.html`

---

### Architecture Rules — MANDATORY

**Source: [_bmad-output/planning-artifacts/architecture.md#Module Responsibility Boundaries]**

| Rule | Requirement |
|---|---|
| DOM targeting | Always use `id` or `data-*` attributes — **NEVER CSS class selectors in JS** |
| Error messages | Live in `ui.js` as a named constant `ERROR_MESSAGES` — **NEVER in `conversion.js`** |
| State mutations | Direct mutation on `state` object — no setter wrappers |
| `state.heroState` | Every write MUST be immediately followed by `renderHeroZone()` |
| CSS properties | All custom properties prefixed `--tc-` |
| Hero zone CSS state | Use `data-state` attribute (set by JS on `#hero-zone`) — **NEVER a CSS class set by JS** |
| `validateInput()` | Must run **before** `convert()` — do not rely on `convert()` returning null to distinguish error types |

---

### `ERROR_MESSAGES` Constant — Exact Strings

These strings must match the acceptance criteria verbatim:

```js
// Module-level constant in ui.js — not exported
const ERROR_MESSAGES = {
  empty:    "Try entering a number first — like 2.5",
  invalid:  "That doesn't look like a number. Try something like 2.5 or 0.75",
  negative: "Time values must be positive. Try a number greater than 0"
};
```

---

### `validateInput(parsedValue, rawInput)` Algorithm

```js
// Returns { valid: true } or { valid: false, message: string }
function validateInput(parsedValue, rawInput) {
  const trimmed = rawInput ? rawInput.trim() : '';
  if (trimmed === '') return { valid: false, message: ERROR_MESSAGES.empty };
  if (parsedValue === null) return { valid: false, message: ERROR_MESSAGES.invalid };
  if (parsedValue <= 0) return { valid: false, message: ERROR_MESSAGES.negative };
  return { valid: true };
}
```

**Important:** `parseNaturalLanguage("-2.5")` returns `{ value: -2.5, unit: null }` — the regex `^([+-]?\d+\.?\d*)` matches signed numbers. So `parsedValue` will be `-2.5` (not null), which hits the `<= 0` check. Verify this against the existing `parseNaturalLanguage` in `ui.js` before implementing.

---

### Updated `handlePillClick` Logic Flow

Replace this **stub** in the current `handlePillClick`:
```js
// BEFORE (Story 1.3 stub):
} else {
  state.heroState = HERO_STATES.ERROR;
  state.errorMessage = 'Invalid input'; // Story 1.4 expands this
}
```

**New logic:**
```js
function handlePillClick(pillEl) {
  const rawInput = document.getElementById('value-input').value;
  const clickedUnit = pillEl.dataset.unit;
  const { value, unit: parsedUnit } = parseNaturalLanguage(rawInput);

  // Validate BEFORE calling convert()
  const validation = validateInput(value, rawInput);
  if (!validation.valid) {
    state.heroState = HERO_STATES.ERROR;
    state.errorMessage = validation.message;
    renderPills(state.selectedUnit);
    renderHeroZone();
    setTimeout(() => document.getElementById('value-input').focus(), 100);
    return;
  }

  const resolvedUnit = parsedUnit ?? clickedUnit;
  state.selectedUnit = resolvedUnit;
  state.currentValue = value;

  const result = convert(value, resolvedUnit);
  if (result !== null) {
    state.lastConversion = result;
    state.heroState = HERO_STATES.RESULT;
  } else {
    // convert() returned null despite valid input — unit resolution edge case
    state.heroState = HERO_STATES.ERROR;
    state.errorMessage = ERROR_MESSAGES.invalid;
    setTimeout(() => document.getElementById('value-input').focus(), 100);
  }

  renderPills(state.selectedUnit);
  renderHeroZone();
}
```

Apply identical logic to `handleEnterKey` (use `state.selectedUnit` as the unit fallback instead of `clickedUnit`).

---

### `renderHeroZone()` Change — One Line Addition

Add `data-state` stamp at the very start of the function body (after the null guard):

```js
function renderHeroZone() {
  const zone = document.getElementById('hero-zone');
  if (!zone) return;
  zone.setAttribute('data-state', state.heroState);  // ← ADD THIS LINE
  // ... rest of function unchanged
}
```

This is the only change to `renderHeroZone()` for this story.

---

### `handleInputBlur` Function

```js
function handleInputBlur() {
  const input = document.getElementById('value-input');
  if (input && input.value.trim() === '') {
    state.heroState = HERO_STATES.EMPTY;
    renderHeroZone();
  }
}
```

Wire it in `init()` after the existing focus call:
```js
if (input) {
  input.focus();
  input.addEventListener('blur', handleInputBlur);
}
```

---

### CSS Error State — Pseudo-Element Overlay Approach

**Why pseudo-element instead of changing `background` directly:**

CSS cannot smoothly transition between `background: linear-gradient(...)` and `background: solid-color`. A `::after` overlay with `opacity` transition achieves the 200ms fade specified in AC1 while preserving the teal gradient underneath.

**CSS to add to `custom.css` (after the existing `#hero-zone` rule):**

```css
/* ── Design Token (add to :root block) ─────── */
--tc-error-bg: #4B5563;  /* neutral-600 — sufficient contrast with white text */

/* ── Dark mode (add to @media prefers-color-scheme: dark block) ─── */
--tc-error-bg: #1F2937;  /* neutral-800 */

/* ── Hero Zone Error State ──────────────────────────────────────────── */
/* Add to the existing #hero-zone rule: */
#hero-zone {
  /* existing properties... */
  position: relative;
  overflow: hidden;
}

/* Neutral overlay — fades in over teal gradient on error */
#hero-zone::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--tc-error-bg);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}

#hero-zone[data-state="error"]::after {
  opacity: 1;
}

/* Keep hero zone content above the overlay */
#hero-zone > * {
  position: relative;
  z-index: 1;
}
```

The existing `@media (prefers-reduced-motion: reduce)` block already covers `transition-duration: 0ms !important` on all elements including `#hero-zone::after` — no extra code needed there.

---

### What's Already Done (from Story 1.3)

- `parseNaturalLanguage()` in `ui.js` already parses signed numbers — confirm `-2.5` returns `{ value: -2.5, unit: null }`
- `renderHeroZone()` already renders `state.errorMessage` in the error branch
- `handlePillClick` and `handleEnterKey` already have the correct structure — only the `else` branches and the new early-return pattern need changing
- `custom.css` already has `@media (prefers-reduced-motion: reduce)` block — no changes needed there

**AC6 bug in conversion.js (Story 1.3 fix):**
The `buildStandardFormat` `"0 sec {X}ms"` guard was already applied. Do not modify `conversion.js`.

---

### Negative Number Parsing — Verification Step

Before writing `validateInput`, confirm that `parseNaturalLanguage('-2.5')` returns `{ value: -2.5, unit: null }` (not `null`). The existing regex is:

```
/^([+-]?\d+\.?\d*)\s*([a-zA-Z]*)$/
```

The `[+-]?` prefix means `-2.5` WILL parse to `value: -2.5`. The `validateInput` negative check (`parsedValue <= 0`) correctly catches this. If for any reason `parseNaturalLanguage` changes its regex in a future story, this validation would also need updating.

---

### Hero Zone State Machine Transitions Added

This story adds two new transition paths:

```
'empty' → 'error'   ← already existed; now shows specific messages
'result' → 'error'  ← already existed; now shows specific messages
'error'  → 'empty'  ← NEW: blur with empty input (AC6)
```

All other transitions remain as documented in architecture.md.

---

### References

- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- Error message constants: [Source: _bmad-output/planning-artifacts/architecture.md#Error Message Format]
- Module boundaries: [Source: _bmad-output/planning-artifacts/architecture.md#Module Responsibility Boundaries]
- Hero zone state transitions: [Source: _bmad-output/planning-artifacts/architecture.md#Hero Zone State Transitions]
- Error state UX: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Hero Zone]
- Error state color tokens: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- Input validation flow: [Source: _bmad-output/planning-artifacts/architecture.md#Input Parsing & Validation Ownership]
- FR24, FR26, FR27: [Source: _bmad-output/planning-artifacts/prd.md]
- Previous story: [Source: _bmad-output/implementation-artifacts/1-3-input-unit-selection-and-results-display.md#Dev Agent Record]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No debug issues encountered. `parseNaturalLanguage('-2.5')` confirmed to return `{ value: -2.5, unit: null }` via regex `[+-]?\d+\.?\d*` — negative check in `validateInput` handles this correctly.

### Completion Notes List

- Added `ERROR_MESSAGES` constant (3 keys, verbatim AC strings) to `ui.js` at module level
- Added `validateInput(parsedValue, rawInput)` — called before `convert()` in both `handlePillClick` and `handleEnterKey`
- Both handlers now early-return with error state + 100ms auto-refocus on invalid input
- `renderHeroZone()` now stamps `data-state` attribute on `#hero-zone` driving all CSS error styling
- Added `handleInputBlur()` function + blur event listener in `init()` for AC6 empty-on-blur transition
- Added `--tc-error-bg` design token to `:root` and dark mode override; added `::after` pseudo-element overlay with `opacity` transition for smooth 200ms error fade; no changes to reduced-motion block needed (covered by existing `*::after` selector)
- Browser verification: AC1–AC4, AC6 all PASS with exact message strings confirmed

### File List

- `js/ui.js`
- `custom.css`

### Senior Developer Review (AI)

**Reviewer:** AI Code Review · 2026-02-27
**Outcome:** Changes Requested → Fixed

#### Issues Found & Fixed

| ID | Severity | Location | Issue | Resolution |
|----|----------|----------|-------|------------|
| H1 | 🔴 HIGH | `ui.js:init()` | `input.addEventListener('keydown', handleEnterKey)` was outside the `if (input)` null guard — potential TypeError if `#value-input` absent from DOM | Moved inside the `if (input)` block alongside the blur and focus calls |
| M3 | 🟡 MEDIUM | `ui.js:handlePillClick` `ui.js:handleEnterKey` | `state.selectedUnit` and `state.currentValue` were mutated before `convert()` result was checked — if convert returned null, selectedUnit/lastConversion were desynchronized | Deferred both mutations to inside the `if (result !== null)` branch |

#### Process Notes (no code fix required)

- **M1** — `js/conversion.js` appears in `git diff` but Story 1.4 did not touch it. This is Story 1.3's uncommitted AC6 bug-fix (`buildStandardFormat` guard). Story 1.3 correctly documents it in its File List and Completion Notes. Root cause: Stories 1.3 and 1.4 were implemented in the same working session without an intermediate commit. **Recommendation:** commit Story 1.3's changes atomically before committing Story 1.4.
- **M2** — `custom.css` diff also shows Story 1.3 result-state CSS (`.result-primary`, `.copy-btn`, etc.). Same cause as M1 — no intermediate commit. Story 1.3 File List correctly documents this. No documentation fix required.

#### Low-severity notes (not fixed)

- **L1** — `handleInputBlur` re-queries `document.getElementById('value-input')` on every blur; minor DOM redundancy, harmless.
- **L2** — `ERROR_MESSAGES.empty` uses `\u2014` escape for em-dash; functionally correct, slightly harder to verify against AC verbatim string.
- **L3** — `handleEnterKey` error path calls `setTimeout(focus, 100)` but input is already focused on keydown; redundant but harmless.

### Change Log

- 2026-02-27: Story 1.4 implemented — error handling, input validation, CSS error state overlay (AC1–AC6)
- 2026-02-27: AI code review — fixed H1 (keydown listener null guard) and M3 (defer state mutation until convert succeeds)
