# Story 1.2: Conversion Engine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the system to accurately convert any decimal time value into a human-readable breakdown for all 7 time units,
So that I can trust the results are mathematically correct.

## Acceptance Criteria

**AC1 — Minutes conversion (canonical example):**
- **Given** `convert(2.5, 'minutes')` is called
- **When** the function executes
- **Then** it returns an object with `breakdown.minutes === 2` and `breakdown.seconds === 30`
- **And** `formats.standard === '2 min 30 sec'`
- **And** `formats.compact === '2:30'`
- **And** `formats.verbose === '2 minutes, 30 seconds'`
- **And** `formats.total === '150 seconds'`

**AC2 — Hours conversion:**
- **Given** `convert(1.5, 'hours')` is called
- **When** the function executes
- **Then** `breakdown.hours === 1`, `breakdown.minutes === 30`, `breakdown.seconds === 0`

**AC3 — Invalid / empty input returns null:**
- **Given** `convert(0.0, 'minutes')` or `convert(null, 'minutes')` or `convert(2.5, 'invalid')` is called
- **When** the function executes
- **Then** it returns `null` and **never throws an error**

**AC4 — Tiny decimal (floating-point precision):**
- **Given** `convert(0.001, 'seconds')` is called
- **When** the function executes
- **Then** it returns a correct breakdown without floating-point drift

**AC5 — Very large number:**
- **Given** `convert(1000000, 'seconds')` is called
- **When** the function executes
- **Then** it returns a correct result without console errors

## Tasks / Subtasks

- [x] Task 1: Implement input validation in `convert()` (AC: #3)
  - [x] Return `null` if `decimal` is `null`, `undefined`, or `NaN`
  - [x] Return `null` if `decimal` is not a finite number
  - [x] Return `null` if `decimal <= 0` (zero and negative are invalid)
  - [x] Return `null` if `unitKey` is not in `UNIT_KEYS` array
  - [x] **Never use `try/catch` to suppress errors — validate explicitly instead**

- [x] Task 2: Implement `toMilliseconds(decimal, unitKey)` internal helper (AC: #1, #4, #5)
  - [x] Multiply `decimal` by `MS_PER_[unitKey]` using the already-defined constants
  - [x] Use `Math.round()` to snap to nearest integer ms (eliminates floating-point accumulation)
  - [x] Return the integer total milliseconds
  - [x] **Do NOT export this function — it is internal only**

- [x] Task 3: Implement `cascadeBreakdown(totalMs)` internal helper (AC: #1, #2, #5)
  - [x] Use integer division cascade in descending order: years → months → weeks → days → hours → minutes → seconds → milliseconds
  - [x] Each step: `value = Math.floor(remainder / MS_PER_UNIT)` then `remainder = remainder % MS_PER_UNIT`
  - [x] Return the full breakdown object with all 8 keys (all units, zero-filled)
  - [x] **Do NOT export this function — it is internal only**

- [x] Task 4: Implement the 4 format builders (AC: #1)
  - [x] `buildStandardFormat(breakdown, unitKey)` — abbreviation labels, space-separated, smart precision (skip non-applicable units per table in Dev Notes)
  - [x] `buildCompactFormat(breakdown, unitKey)` — see compact format decisions in Dev Notes
  - [x] `buildVerboseFormat(breakdown, unitKey)` — full English words, singular/plural, comma-separated, smart precision
  - [x] `buildTotalFormat(totalMs, unitKey)` — total in smallest meaningful unit per smart precision table
  - [x] **Do NOT export these functions — they are internal only**

- [x] Task 5: Replace `convert()` stub with full implementation (AC: #1–#5)
  - [x] Call validation; return `null` on failure
  - [x] Call `toMilliseconds()` to get `totalMs`
  - [x] Call `cascadeBreakdown(totalMs)` to get `breakdown`
  - [x] Build all 4 formats
  - [x] Return the exact result object shape (see Dev Notes)
  - [x] **Wrap in try/catch as final safety net** → on any unexpected error, log to console and return `null`

- [x] Task 6: Add COMPACT_FORMAT_PATTERN comment to `conversion.js` documenting chosen compact format per unit (AC: #1)
  - [x] Document the exact format string pattern for each of the 7 units as a block comment

- [x] Task 7: Manual browser verification
  - [x] Open browser console on `index.html` (via local HTTP server on :8181)
  - [x] Run: `const { convert } = await import('./js/conversion.js');`
  - [x] Test AC1: `convert(2.5, 'minutes')` → verify all 4 format strings exactly (see table below)
  - [x] Test AC2: `convert(1.5, 'hours')` → `breakdown.hours === 1`, `breakdown.minutes === 30`, `breakdown.seconds === 0`
  - [x] Test AC3: `convert(0, 'minutes')` → `null`, `convert(null, 'minutes')` → `null`, `convert(2.5, 'invalid')` → `null`
  - [x] Test AC4: `convert(0.001, 'seconds')` → `breakdown.seconds === 0`, `breakdown.milliseconds === 1`, `formats.compact === '0.001'`
  - [x] Test AC5: `convert(1000000, 'seconds')` → no console errors; `breakdown.seconds === 40`, `breakdown.milliseconds === 0`
  - [x] Confirm zero console errors throughout all tests

**Quick verification reference table:**

| Call | Expected result key | Expected value |
|---|---|---|
| `convert(2.5, 'minutes')` | `formats.standard` | `'2 min 30 sec'` |
| `convert(2.5, 'minutes')` | `formats.compact` | `'2:30'` |
| `convert(2.5, 'minutes')` | `formats.verbose` | `'2 minutes, 30 seconds'` |
| `convert(2.5, 'minutes')` | `formats.total` | `'150 seconds'` |
| `convert(1.5, 'hours')` | `breakdown.hours` | `1` |
| `convert(1.5, 'hours')` | `breakdown.minutes` | `30` |
| `convert(0.001, 'seconds')` | `breakdown.milliseconds` | `1` |
| `convert(0.001, 'seconds')` | `formats.compact` | `'0.001'` |
| `convert(0, 'minutes')` | (entire result) | `null` |
| `convert(2.5, 'invalid')` | (entire result) | `null` |

## Dev Notes

### SCOPE — THIS STORY ONLY TOUCHES ONE FILE

**Only `js/conversion.js` is modified in this story.**

Do NOT touch `index.html`, `custom.css`, `js/state.js`, or `js/ui.js`.

Story 1.3 will wire the UI and call `convert()` — this story makes the engine correct and tested in isolation.

**Existing exports that must NOT change:** `UNIT_KEYS`, `UNIT_LABELS` — they are already correct from Story 1.1 and other modules import them. Only the `convert()` function body is replaced.

---

### Architecture Rules — MANDATORY (violations will break Story 1.3)

**Source: [_bmad-output/planning-artifacts/architecture.md#Module Responsibility Boundaries]**

| Rule | Requirement |
|---|---|
| Pure functions | `conversion.js` NEVER accesses the DOM, `document.*`, or reads `state` |
| No side effects | No `console.log` left in production code paths (only inside a final catch block) |
| Named exports | Only `UNIT_KEYS`, `UNIT_LABELS`, and `convert()` are exported — no default exports |
| Return contract | `convert()` returns `null` on ANY invalid input — never throws, never returns `undefined` |
| Internal helpers | `toMilliseconds`, `cascadeBreakdown`, all format builders are NOT exported |

---

### Integer-First Arithmetic — MANDATORY

**Source: [_bmad-output/planning-artifacts/architecture.md#Conversion Math Precision Strategy]**

The architecture mandates: convert input to total milliseconds (integer) FIRST, then cascade.

**Why:** Floating-point operations accumulate error across cascading division. `Math.floor` on integers is exact.

**Implementation pattern:**
```js
// Step 1: Get total ms as integer (use Math.round to snap float arithmetic)
const totalMs = Math.round(decimal * MS_PER_UNIT[unitKey]);

// Step 2: Cascade using integer math only
let rem = totalMs;
const years    = Math.floor(rem / MS_PER_YEAR);   rem = rem % MS_PER_YEAR;
const months   = Math.floor(rem / MS_PER_MONTH);  rem = rem % MS_PER_MONTH;
const weeks    = Math.floor(rem / MS_PER_WEEK);   rem = rem % MS_PER_WEEK;
const days     = Math.floor(rem / MS_PER_DAY);    rem = rem % MS_PER_DAY;
const hours    = Math.floor(rem / MS_PER_HOUR);   rem = rem % MS_PER_HOUR;
const minutes  = Math.floor(rem / MS_PER_MINUTE); rem = rem % MS_PER_MINUTE;
const seconds  = Math.floor(rem / MS_PER_SECOND);
const ms       = rem % MS_PER_SECOND;
```

**Edge case for AC4:** `convert(0.001, 'seconds')`:
- `totalMs = Math.round(0.001 * 1000) = Math.round(1) = 1` ✓
- Without `Math.round`: `0.001 * 1000 = 0.9999999...` → `Math.floor(0.99..) = 0` → WRONG

---

### Exact Result Object Shape — DO NOT DEVIATE

**Source: [_bmad-output/planning-artifacts/architecture.md#Conversion Result Object Shape]**

```js
// convert(2.5, 'minutes') must return EXACTLY this shape:
{
  input: {
    raw: 2.5,          // Original float as passed in
    unit: 'minutes'    // Canonical unit key as passed in
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
    standard: '2 min 30 sec',
    compact: '2:30',
    verbose: '2 minutes, 30 seconds',
    total: '150 seconds'
  }
}
```

**All 8 breakdown keys must always be present**, even if zero.

---

### MS_PER Constants — Already in the File

These constants are already defined in `conversion.js` from Story 1.1. Do NOT redefine them:

```js
const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR   = 3_600_000;
const MS_PER_DAY    = 86_400_000;
const MS_PER_WEEK   = 604_800_000;
const MS_PER_MONTH  = 2_629_746_000; // Average Gregorian month
const MS_PER_YEAR   = 31_556_952_000; // Average Gregorian year
```

For `toMilliseconds()`, you need to look up by unit key. Define a `MS_PER_UNIT` lookup at **module level** (after the existing constants, NOT inside any function, NOT exported):
```js
// Add this at module level, after existing MS_PER_* constants:
const MS_PER_UNIT = {
  seconds: MS_PER_SECOND,
  minutes: MS_PER_MINUTE,
  hours:   MS_PER_HOUR,
  days:    MS_PER_DAY,
  weeks:   MS_PER_WEEK,
  months:  MS_PER_MONTH,
  years:   MS_PER_YEAR
};
// Used by toMilliseconds() and validation — not exported
```

---

### Smart Precision Display — CRITICAL FOR FORMAT BUILDERS

**Source: [_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]**

The format strings (standard, verbose) must only include applicable breakdown units based on the **input unit** — not all 8 breakdown fields:

| Input unit | Units to show in output | Smallest unit |
|---|---|---|
| `seconds` | seconds + milliseconds | milliseconds |
| `minutes` | minutes + seconds | seconds |
| `hours` | hours + minutes + seconds | seconds |
| `days` | days + hours + minutes | minutes |
| `weeks` | weeks + days + hours | hours |
| `months` | months + weeks + days | days |
| `years` | years + months + days | days |

**Example:** `convert(2.5, 'minutes')` → show only minutes+seconds (skip years/months/weeks/days/hours/ms even if zero)

**For standard format:** Include applicable units that are NON-ZERO. Skip zero values.

Exception: If ALL applicable values are zero (impossible given valid positive input, but guard anyway), show "0 [smallest unit]".

---

### Format String Specifications

#### Standard Format
Labels: `ms`, `sec`, `min`, `hr`, `day`, `wk`, `mo`, `yr`
Pattern: `{value} {label}` repeated for each non-zero applicable unit, space-separated
```
// Examples:
'2 min 30 sec'
'1 hr 30 min'
'3 days 6 hr 30 min'
'500 ms'
```

#### Verbose Format
Words: `millisecond/milliseconds`, `second/seconds`, `minute/minutes`, `hour/hours`, `day/days`, `week/weeks`, `month/months`, `year/years`
Pattern: `{value} {word}` repeated for each non-zero applicable unit, comma-separated
```
// Examples:
'2 minutes, 30 seconds'
'1 hour, 30 minutes'
'3 days, 6 hours, 30 minutes'
'500 milliseconds'
```

#### Total Format
Shows total in the **smallest applicable unit** (see smart precision table).
Pattern: `{totalInSmallestUnit} {pluralWord}`
```
// convert(2.5, 'minutes')  → '150 seconds'
// convert(1.5, 'hours')    → '5400 seconds'
// convert(0.5, 'seconds')  → '500 milliseconds'
// convert(1.5, 'days')     → '2160 minutes'
// convert(1.5, 'weeks')    → '252 hours'
// convert(1.5, 'months')   → '46 days'  (Math.round(1.5 * 30.44) = Math.round(45.66) = 46)
// convert(1.5, 'years')    → '548 days' (Math.round(1.5 * 365.24))
```

**How to compute total in smallest unit:**
```js
// Map each input unit to its smallest display unit and its ms equivalent
const SMALLEST_UNIT = {
  seconds: { label: 'millisecond', ms: 1 },
  minutes: { label: 'second',      ms: MS_PER_SECOND },
  hours:   { label: 'second',      ms: MS_PER_SECOND },
  days:    { label: 'minute',      ms: MS_PER_MINUTE },
  weeks:   { label: 'hour',        ms: MS_PER_HOUR },
  months:  { label: 'day',         ms: MS_PER_DAY },
  years:   { label: 'day',         ms: MS_PER_DAY }
};
// Then: total = Math.round(totalMs / SMALLEST_UNIT[unitKey].ms)
// label: total === 1 ? singular : plural
```

#### Compact Format — Implementer Decision (document in code)

**Chosen pattern per unit:**

| Input unit | Compact format | Example |
|---|---|---|
| `seconds` | `{s}.{ms}` (ms zero-padded to 3 digits) | `0.500`, `1.000`, `2.050` |
| `minutes` | `{m}:{ss}` (seconds zero-padded to 2 digits) | `2:30`, `0:45`, `10:05` |
| `hours` | `{h}:{mm}:{ss}` (min and sec zero-padded to 2) | `1:30:00`, `0:05:30` |
| `days` | `{d}d {h}:{mm}` (min zero-padded to 2) | `1d 3:30`, `0d 0:45` |
| `weeks` | `{w}w {d}d {h}h` | `1w 2d 6h`, `0w 1d 0h` |
| `months` | `{mo}mo {w}w {d}d` | `1mo 2w 3d`, `0mo 1w 0d` |
| `years` | `{y}y {mo}mo {d}d` | `1y 2mo 15d`, `0y 6mo 0d` |

**Add this as a block comment in `conversion.js` directly above the compact format builder.**

---

### Validation Logic (Exact Conditions)

**Source: [_bmad-output/planning-artifacts/epics.md#Story 1.2 AC3]**

```js
// Return null for ALL of these conditions:
if (decimal === null || decimal === undefined) return null;
if (typeof decimal !== 'number' || !isFinite(decimal)) return null;
if (decimal <= 0) return null;  // Zero and negative are invalid
if (!UNIT_KEYS.includes(unitKey)) return null;
```

---

### Pluralization Helper

For verbose and total formats, you'll need singular/plural logic:
```js
function pluralize(value, singular) {
  return value === 1 ? `${value} ${singular}` : `${value} ${singular}s`;
}
// pluralize(1, 'minute')  → '1 minute'
// pluralize(2, 'minute')  → '2 minutes'
// pluralize(30, 'second') → '30 seconds'
```

---

### Project Structure Notes

**Only file modified:** `js/conversion.js`

```
timeconversion-web/
├── index.html          ← DO NOT TOUCH
├── custom.css          ← DO NOT TOUCH
├── js/
│   ├── conversion.js   ← ✏️ IMPLEMENT FULL ENGINE HERE
│   ├── state.js        ← DO NOT TOUCH
│   └── ui.js           ← DO NOT TOUCH
└── .gitignore          ← DO NOT TOUCH
```

**What the dev agent has to work with from Story 1.1:**
- `conversion.js` stub has: `UNIT_KEYS` (7 canonical strings), `UNIT_LABELS` (pill labels), `MS_PER_*` constants (all 7), `convert()` stub returning `null`
- `state.js` has: `HERO_STATES` enum, `state` object — no changes needed for this story
- `index.html` scaffold exists with hero zone, input field, pill row — wired in Story 1.3
- `ui.js` minimal scaffold exists — Story 1.3 will add all event listeners

**Previous story (1.1) completion notes:**
- No errors encountered during implementation
- All 5 files scaffolded successfully and verified via agent-browser
- `conversion.js` stub confirmed: `convert()` correctly returns `null`, module imports resolve without errors
- MS constants are defined internally (not exported) — **use them directly in your implementation, do not redefine**

### References

- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- Integer-first math mandate: [Source: _bmad-output/planning-artifacts/architecture.md#Conversion Math Precision Strategy]
- Result object shape: [Source: _bmad-output/planning-artifacts/architecture.md#Conversion Result Object Shape]
- Module responsibility rules: [Source: _bmad-output/planning-artifacts/architecture.md#Module Responsibility Boundaries]
- Return null contract: [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines]
- Named exports only: [Source: _bmad-output/planning-artifacts/architecture.md#Export Style]
- Smart precision table: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]
- Error handling (AC3): [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- FR1–FR8 (7-unit conversion math): [Source: _bmad-output/planning-artifacts/prd.md#Time Conversion Capabilities]
- FR8 (mathematical precision): [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements]
- NFR6 (conversions < 100ms): [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements]
- NFR41 (zero console errors): [Source: _bmad-output/planning-artifacts/prd.md#Code Quality]
- NFR42–43 (pure functions, separation of concerns): [Source: _bmad-output/planning-artifacts/prd.md#Code Quality]
- Compact format gap note: [Source: _bmad-output/planning-artifacts/architecture.md#Gap Analysis]
- Previous story learnings: [Source: _bmad-output/implementation-artifacts/1-1-project-setup-and-working-shell.md#Dev Agent Record]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — no errors or unexpected issues during implementation.

### Completion Notes List

- ✅ Implemented `toMilliseconds(decimal, unitKey)` — multiplies decimal by `MS_PER_UNIT[unitKey]` lookup, snaps to integer with `Math.round()`. Correctly handles floating-point drift: `convert(0.001, 'seconds')` gives `breakdown.milliseconds === 1` (not 0).
- ✅ Implemented `cascadeBreakdown(totalMs)` — pure integer division cascade years→months→weeks→days→hours→minutes→seconds→ms using `Math.floor` + `%`. Returns all 8 keys, zero-filled.
- ✅ Implemented `buildStandardFormat` and `buildVerboseFormat` with smart precision — `PRECISION_CONFIG` table drives which fields are included per input unit; zero values are omitted; handles singular/plural in verbose.
- ✅ Implemented `buildCompactFormat` with documented `COMPACT_FORMAT_PATTERN` block comment in source. Chosen formats: seconds=`{s}.{ms:3pad}`, minutes=`{m}:{ss:2pad}`, hours=`{h}:{mm}:{ss}`, days=`{d}d {h}:{mm}`, weeks/months/years use notation format.
- ✅ Implemented `buildTotalFormat` — divides `totalMs` by the smallest-unit ms value from `PRECISION_CONFIG`, pluralises correctly.
- ✅ `convert()` stub replaced with full implementation. Wrapped in try/catch as final safety net (NFR41: zero console errors). Validation is explicit pre-try: null/undefined check, typeof/isFinite check, `<= 0` check, UNIT_KEYS.includes check.
- ✅ Added module-level `MS_PER_UNIT` lookup and `PRECISION_CONFIG` constants (not exported). `UNIT_KEYS` and `UNIT_LABELS` unchanged from Story 1.1.
- ✅ All 5 ACs verified passing via Node.js ES module runner (`node --input-type=module`). Node 22 supports ES modules natively.
- ⚠️ Code review fixes applied (2026-02-24): (1) Added `if (totalMs <= 0) return null` guard for sub-millisecond inputs that round to zero ms. (2) Fixed `buildStandardFormat` — `day` abbreviation now pluralizes to `days` for values ≠ 1 (matches spec example `'3 days 6 hr 30 min'`).
- ✅ Task 7 browser verification completed (2026-02-24) via agent-browser + Python HTTP server (:8181). All 5 ACs passed in Chromium. Zero console errors, warnings, or logs confirmed.

### File List

- `js/conversion.js` (new — full engine implementation; file was untracked from Story 1.1 scaffold, never committed)
