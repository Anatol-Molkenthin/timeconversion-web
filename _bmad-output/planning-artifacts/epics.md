---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-02-24'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# timeconversion-web - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for timeconversion-web, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can convert decimal seconds to readable seconds/milliseconds format
FR2: Users can convert decimal minutes to readable minutes:seconds format
FR3: Users can convert decimal hours to readable hours:minutes:seconds format
FR4: Users can convert decimal days to readable days, hours, minutes format
FR5: Users can convert decimal weeks to readable weeks, days, hours format
FR6: Users can convert decimal months to readable months, weeks, days format
FR7: Users can convert decimal years to readable years, months, days format
FR8: System calculates conversions with mathematical precision (no rounding errors)
FR9: Users can enter decimal values via text input field
FR10: Users can specify time units by typing unit abbreviations (e.g., "2.5 min")
FR11: Users can select time units via clickable unit selector buttons (pills)
FR12: System parses natural language input with multiple unit variations (min, mins, minute, minutes)
FR13: System validates input and prevents invalid characters
FR14: Users can trigger conversion by pressing Enter key
FR15: Pill click acts as both unit selector and conversion trigger (no separate Calculate button)
FR16: System accepts both period (.) and comma (,) as decimal separators
FR17: System displays conversion results in standard format (e.g., "2 min 30 sec")
FR18: System displays conversion results in compact format (e.g., "2:30")
FR19: System displays conversion results in verbose format (e.g., "2 minutes, 30 seconds")
FR20: System displays total value in smallest meaningful unit (e.g., "150 seconds")
FR21: Users can copy conversion results to clipboard
FR22: System shows example placeholder before user input (e.g., "2.5 min")
FR23: System displays appropriate precision based on time unit scale (milliseconds for seconds, days for years)
FR24: System displays friendly error messages for invalid input
FR25: System provides suggestions when users make typos in unit names
FR26: System handles edge cases gracefully (very large numbers, very small decimals, empty input)
FR27: System prevents JavaScript errors from reaching the console
FR28: Users can navigate entire interface using only keyboard (no mouse required)
FR29: Users can tab through interactive elements in logical order
FR30: Users can see visible focus indicators on all interactive elements
FR31: System remembers last selected time unit for repeat conversions (V1.0)
FR32: Users can clear input and start new conversion
FR33: Interface adapts layout for mobile, tablet, and desktop screen sizes
FR34: Users can interact with touch-friendly button targets on mobile devices
FR35: Screen reader users can hear descriptive labels for all form controls
FR36: Screen reader users can hear conversion results announced via ARIA live regions
FR37: Users can navigate unit selector with arrow keys
FR38: System maintains WCAG 2.1 Level AA contrast ratios for all text
FR39: Users can resize text up to 200% without breaking layout
FR40: Users with motor impairments can interact with adequately-sized touch targets (44x44px minimum)
FR41: Users can toggle between light and dark mode (V1.0)
FR42: System detects and respects user's system color scheme preference (V1.0)
FR43: Users can switch between output formats after conversion without re-typing input (V1.0)
FR44: System provides unique, descriptive meta tags for each time unit conversion (V2.0+)
FR45: System supports shareable URLs with conversion parameters (V2.0+)
FR46: System presents semantic HTML structure for search engine indexing (V2.0+)
FR47: Users can select interface language from available translations (V2.0+)
FR48: System auto-detects user's language/country and suggests appropriate language (V2.0+)
FR49: System accepts locale-specific decimal formats (V2.0+)
FR50: Users can perform reverse conversion (readable format → decimal) (V2.0+)
FR51: Users can convert multiple values in batch mode (V2.0+)
FR52: Users can view conversion history from current session (V2.0+)

### NonFunctional Requirements

NFR1: Initial page load < 1 second on 3G connection
NFR2: First Contentful Paint (FCP) < 1 second
NFR3: Largest Contentful Paint (LCP) < 1.5 seconds
NFR4: Time to Interactive (TTI) < 2 seconds
NFR5: Total page size < 200KB (HTML + CSS + JS)
NFR6: Conversion calculations complete in < 100ms
NFR7: UI updates after conversion complete in < 50ms (60fps)
NFR8: Dark mode toggle transition < 100ms (V1.0)
NFR9: 60fps maintained during all interactions
NFR10: Functions correctly in Chrome/Chromium 120+
NFR11: Functions correctly in Firefox 121+
NFR12: Functions correctly in Safari 17+
NFR13: Functions correctly in Edge (Chromium) 120+
NFR14: Functions correctly in iOS Safari 17+
NFR15: Functions correctly in Android Chrome 120+
NFR16: Functions correctly in Firefox Mobile 121+
NFR17: Renders correctly at 320px to 2560px+ viewport widths
NFR18: Touch interactions respond within 100ms
NFR19: No horizontal scrolling on any supported device
NFR20: Text contrast ratio minimum 4.5:1 (3:1 for large text)
NFR21: Touch targets minimum 44x44 pixels
NFR22: Visible focus indicators with 2px outline minimum
NFR23: Text readable when resized to 200%
NFR24: Layout intact when text resized to 200%
NFR25: All functionality operable via keyboard only
NFR26: Tab order follows logical visual flow
NFR27: No focus traps in any interaction
NFR28: Keyboard shortcuts don't conflict with screen reader/browser shortcuts
NFR29: All form controls have descriptive ARIA labels
NFR30: Dynamic updates announced via ARIA live regions
NFR31: Navigable with NVDA, VoiceOver, and TalkBack
NFR32: Screen reader users can complete all journeys independently
NFR33: No information conveyed by color alone
NFR34: Usable in Windows High Contrast Mode
NFR35: Dark mode maintains all contrast requirements (V1.0)
NFR36: Error messages provide correction guidance
NFR37: No timing-dependent interactions
NFR38: Consistent patterns and terminology throughout
NFR39: HTML validates against W3C HTML5 standards
NFR40: CSS validates against W3C CSS3 standards
NFR41: JavaScript executes without console errors or warnings
NFR42: Code follows separation of concerns (conversion.js / ui.js / state.js)
NFR43: Functions are pure and testable where possible (especially conversion.js)
NFR44: Code is readable and understandable for future AI modification

### Additional Requirements

**From Architecture:**
- No starter template CLI — project initialized by creating 5 files manually in dependency order: `js/conversion.js` → `js/state.js` → `index.html` → `custom.css` → `js/ui.js`
- ES6 modules via `<script type="module" src="js/ui.js">` — no bundler required
- Pico.css loaded via CDN link in `<head>`; Google Fonts Inter loaded via CDN
- Module boundaries strictly enforced: `conversion.js` (pure math only), `state.js` (state object + HERO_STATES enum), `ui.js` (DOM + events only)
- Integer-first arithmetic: all conversions go through total milliseconds before cascading breakdown
- Named exports only — no default exports anywhere
- `data-*` attributes for all JS DOM targeting; CSS classes for styling only
- All CSS custom properties prefixed `--tc-` to avoid Pico conflicts
- State object shape: `{ currentValue, selectedUnit, lastConversion, heroState }`
- HERO_STATES enum: `{ EMPTY, DEMO, RESULT, ERROR }`
- Conversion result object shape fully specified (breakdown + 4 format strings)
- `convert()` returns `null` on invalid input — never throws
- Local development via Zed Live Server extension

**From UX Design:**
- Hero zone with 4 states (empty/demo/result/error) — single zone, multiple content states, no layout shift
- Unit pill row uses ARIA `role="radiogroup"` / `role="radio"` pattern; pill click = select unit + trigger conversion
- `aria-live="polite"` on hero zone fires on every result or error update
- `prefers-reduced-motion`: all CSS transitions → 0ms; animated demo sequence skipped entirely
- Mobile-first CSS, breakpoints at 480px, 768px, 1024px (base = 320px)
- Input auto-focused on page load; input font minimum 16px (prevents iOS auto-zoom)
- `:hover` styles only inside `@media (hover: hover)` — no touch-device hover artifacts
- Color system: `#0D9488` teal primary (light) / `#2DD4BF` teal primary (dark); neutral-900/50 backgrounds
- Typography: Inter 400/500/700 (UI); system monospace (result numbers only)
- Copy button: "Copy" → "Copied!" for 1.5s then reverts; independent per-format button
- Error state: hero zone shifts from teal to neutral background (200ms ease); input refocuses after 100ms
- Animated demo sequence on first visit (V1.0): types "2.5" → activates Min pill → shows result → "Try it yourself!" → clears input
- Arrow keys navigate pills without triggering conversion; Space/Enter on focused pill triggers conversion

### FR Coverage Map

| FR | Epic | Topic |
|---|---|---|
| FR1–FR8 | Epic 1 | 7-unit conversion math |
| FR9–FR16 | Epic 1 | Hybrid input handling |
| FR17–FR23 | Epic 1 | 4 output formats + clipboard |
| FR24, FR26–FR27 | Epic 1 | Error handling + edge cases |
| FR32 | Epic 1 | Clear input |
| FR28–FR30 | Epic 2 | Keyboard nav + focus indicators |
| FR33–FR34 | Epic 2 | Responsive layout + touch targets |
| FR35–FR40 | Epic 2 | Screen reader + WCAG 2.1 AA |
| FR25 | Epic 3 | Fuzzy unit matching (V1.0) |
| FR31 | Epic 3 | Unit persistence via LocalStorage (V1.0) |
| FR41–FR43 | Epic 3 | Dark mode + instant re-convert (V1.0) |
| FR44–FR46 | Epic 4 | SEO + URL params + deployment (V2.0+) |
| FR47–FR52 | Epic 5 | i18n + advanced features (V2.0+) |

## Epic List

### Epic 1: Core Conversion Tool
Users can type a decimal time value, select a time unit, and instantly see an accurate human-readable breakdown in 4 formats — with working copy-to-clipboard and clear error messages.
**FRs covered:** FR1–FR24, FR26–FR27, FR32
**Phase:** MVP

### Epic 2: Accessible & Responsive Experience
Users can complete all 3 user journeys (first-time visitor, power user, accessibility user) using only a keyboard or screen reader, on any device from 320px to 2560px.
**FRs covered:** FR28–FR30, FR33–FR40
**Phase:** MVP

### Epic 3: Power User & Visual Polish
Users return with their last unit pre-selected, benefit from dark mode, instantly re-convert by switching units, and experience a guided onboarding demo on first visit.
**FRs covered:** FR25, FR31, FR41–FR43
**Phase:** V1.0

### Epic 4: Discoverability & Public Deployment
Users can find the tool on Google for all 7 time unit queries and share conversions via URL.
**FRs covered:** FR44–FR46
**Phase:** V2.0+

### Epic 5: Global & Advanced Features
Users can use the tool in their own language, batch-convert multiple values, view session history, and reverse-convert readable time to decimal.
**FRs covered:** FR47–FR52
**Phase:** V2.0+

---

## Epic 1: Core Conversion Tool

Users can type a decimal time value, select a time unit, and instantly see an accurate human-readable breakdown in 4 formats — with working copy-to-clipboard and clear error messages.
**FRs covered:** FR1–FR24, FR26–FR27, FR32
**Phase:** MVP

### Story 1.1: Project Setup & Working Shell

As a developer,
I want the 5 project files created with correct scaffolding and CDN dependencies loading,
So that the tech stack is verified and subsequent stories have a working foundation to build on.

**Acceptance Criteria:**

**Given** the project directory exists
**When** the developer opens `index.html` via Zed Live Server
**Then** the page loads without any console errors
**And** Pico.css styles are visible (Inter font, clean typography, neutral background)
**And** a teal hero zone section is visible at the top
**And** an input field is visible below the hero zone
**And** 7 unit pill buttons (Sec, Min, Hr, Day, Wk, Mo, Yr) are visible in a row
**And** `<script type="module" src="js/ui.js">` is the only script tag in the HTML

**Given** the page has loaded
**When** the developer opens the browser console
**Then** `import { convert, UNIT_KEYS } from './js/conversion.js'` resolves without error
**And** `import { state, HERO_STATES } from './js/state.js'` resolves without error
**And** `UNIT_KEYS` returns `['seconds','minutes','hours','days','weeks','months','years']`
**And** `state.selectedUnit` returns `'minutes'`
**And** `state.heroState` returns `'empty'`

---

### Story 1.2: Conversion Engine

As a user,
I want the system to accurately convert any decimal time value into a human-readable breakdown for all 7 time units,
So that I can trust the results are mathematically correct.

**Acceptance Criteria:**

**Given** `convert(2.5, 'minutes')` is called
**When** the function executes
**Then** it returns an object with `breakdown.minutes === 2` and `breakdown.seconds === 30`
**And** `formats.standard === '2 min 30 sec'`
**And** `formats.compact === '2:30'`
**And** `formats.verbose === '2 minutes, 30 seconds'`
**And** `formats.total === '150 seconds'`

**Given** `convert(1.5, 'hours')` is called
**When** the function executes
**Then** `breakdown.hours === 1`, `breakdown.minutes === 30`, `breakdown.seconds === 0`

**Given** `convert(0.0, 'minutes')` or `convert(null, 'minutes')` or `convert(2.5, 'invalid')` is called
**When** the function executes
**Then** it returns `null` (never throws an error)

**Given** `convert(0.001, 'seconds')` is called (tiny decimal)
**When** the function executes
**Then** it returns a correct breakdown without floating-point drift

**Given** `convert(1000000, 'seconds')` is called (very large number)
**When** the function executes
**Then** it returns a correct result without console errors

---

### Story 1.3: Input, Unit Selection & Results Display

As a first-time visitor,
I want to type a decimal value, click a unit pill, and immediately see a complete human-readable breakdown,
So that I can convert time in under 5 seconds without reading any instructions.

**Acceptance Criteria:**

**Given** the page has loaded
**When** the page finishes loading
**Then** the input field is auto-focused (cursor ready to type)
**And** the input field shows placeholder text "e.g. 2.5"
**And** the "Min" pill is visually marked as active (teal fill)

**Given** the user has typed `2.5` in the input field
**When** the user clicks the "Min" pill
**Then** the hero zone displays `2 min 30 sec` as the primary result (large, prominent)
**And** `2:30` is shown as the compact format
**And** `2 minutes, 30 seconds` is shown as the verbose format
**And** `150 seconds` is shown as the total
**And** each format has a "Copy" button beside it
**And** `state.heroState` is `'result'`

**Given** the user has typed `2.5` and "Min" is already the selected unit
**When** the user presses the Enter key
**Then** the conversion triggers and the result displays identically to clicking the pill

**Given** the user has typed `2.5 min` in the input field (natural language)
**When** the user clicks any pill
**Then** the value `2.5` and unit `'minutes'` are parsed correctly from the text
**And** the "Min" pill switches to active to reflect the parsed unit

**Given** the user has typed `2,5` (comma as decimal separator)
**When** the user clicks the "Min" pill
**Then** it is treated as `2.5` and converts correctly

**Given** `convert(0.5, 'seconds')` result is displayed
**When** the hero zone renders
**Then** the breakdown shows both seconds AND milliseconds (e.g. `0 sec 500 ms`)
**And** milliseconds are included because the input unit is seconds (FR23 — smart precision)

**Given** `convert(1.5, 'years')` result is displayed
**When** the hero zone renders
**Then** the breakdown shows years, months, and days only (no hours/minutes/seconds)
**And** sub-day components are omitted for large units (FR23 — smart precision)

**Given** a result is displayed and the user clicks the "Copy" button next to standard format
**When** the copy action fires
**Then** the button text changes to "Copied!" for 1.5 seconds then reverts to "Copy"
**And** the clipboard contains `2 min 30 sec`
**And** other format copy buttons are unaffected

---

### Story 1.4: Error Handling & Edge Cases

As a user,
I want to receive a clear, helpful message when I enter invalid input,
So that I know exactly what to fix and am never left confused or stuck.

**Acceptance Criteria:**

**Given** the input field is empty
**When** the user clicks any pill or presses Enter
**Then** the hero zone background shifts from teal to neutral (200ms transition)
**And** the hero zone displays: `"Try entering a number first — like 2.5"`
**And** `state.heroState` is `'error'`
**And** the input field regains focus within 100ms

**Given** the input contains only letters (e.g. "abc")
**When** the user triggers conversion
**Then** a friendly error message appears: `"That doesn't look like a number. Try something like 2.5 or 0.75"`

**Given** the input contains a negative number (e.g. "-2.5")
**When** the user triggers conversion
**Then** a friendly error message appears: `"Time values must be positive. Try a number greater than 0"`

**Given** an error state is showing
**When** the user types a valid value and clicks a pill
**Then** the hero zone transitions back to the result state with the correct conversion
**And** the teal background is restored

**Given** any interaction or conversion
**When** checking the browser console
**Then** zero errors or warnings are present

**Given** the user manually clears the input field
**When** the field becomes empty and focus leaves it
**Then** the hero zone returns to the `'empty'` state

---

## Epic 2: Accessible & Responsive Experience

Users can complete all 3 user journeys using only a keyboard or screen reader, on any device from 320px to 2560px.
**FRs covered:** FR28–FR30, FR33–FR40
**Phase:** MVP

### Story 2.1: Mobile-Responsive Layout

As a mobile user,
I want the interface to adapt cleanly to my screen size with large enough touch targets,
So that I can use the tool comfortably on any phone, tablet, or desktop.

**Acceptance Criteria:**

**Given** the page is viewed at 320px viewport width
**When** the page renders
**Then** the hero zone and input zone are single-column, full-width
**And** the pill row wraps across 2 rows (approximately 4 pills per row) without overflow
**And** there is no horizontal scrollbar
**And** all 7 pills and all copy buttons are at least 44×44px clickable area

**Given** the page is viewed at 768px (tablet)
**When** the page renders
**Then** all 7 pills fit in a single row
**And** the content is centered with comfortable margins

**Given** the page is viewed at 1024px+ (desktop)
**When** the page renders
**Then** the content is centered with max-width 640px
**And** the teal hero zone gradient extends full-width behind the centered content

**Given** the input field is focused on an iOS device
**When** the virtual keyboard appears
**Then** the page does not zoom in (input font is ≥16px)

**Given** the user is on a touch device
**When** hovering over pills
**Then** no hover styles are applied (`:hover` rules are inside `@media (hover: hover)` only)

**Given** the page is viewed at any supported width (320px–2560px)
**When** the browser is resized
**Then** no content is clipped, no horizontal scroll appears, and layout remains usable

---

### Story 2.2: Full Keyboard Navigation

As a keyboard-only user,
I want to navigate and convert using only Tab, Arrow keys, Space, and Enter,
So that I can complete every conversion without touching a mouse.

**Acceptance Criteria:**

**Given** the page has loaded
**When** the user presses Tab repeatedly
**Then** focus moves in order: input field → pill row (enters as a group) → copy buttons (when visible)
**And** each focused element has a visible 2px teal focus outline with 2px offset
**And** focus never becomes trapped in any element

**Given** focus is inside the pill row
**When** the user presses Arrow Right
**Then** focus moves to the next pill without triggering a conversion

**Given** focus is inside the pill row
**When** the user presses Arrow Left
**Then** focus moves to the previous pill without triggering a conversion

**Given** focus is on a pill (e.g. "Hr")
**When** the user presses Space or Enter
**Then** that unit is selected and conversion is triggered (same as clicking the pill)

**Given** focus is on the last pill
**When** the user presses Tab
**Then** focus exits the pill row and moves to the copy buttons (or next focusable element)

**Given** the user is navigating with keyboard only
**When** they complete a full conversion cycle (type value → Tab to pill → arrow to unit → Space)
**Then** the result appears in the hero zone exactly as it would with mouse use

---

### Story 2.3: Screen Reader & ARIA Accessibility

As a screen reader user,
I want all interface states announced and all controls labelled,
So that I can complete every user journey independently without any visual context.

**Acceptance Criteria:**

**Given** a screen reader user lands on the page
**When** they navigate to the input field
**Then** the screen reader announces: `"Enter decimal time value"`

**Given** a screen reader user navigates to the pill row
**When** they enter the group
**Then** the screen reader announces: `"Select time unit, group"` (radiogroup label)
**And** each pill announces as: `"Minutes, selected, radio button 2 of 7"` (or whichever is active)

**Given** a screen reader user presses Space on the "Hr" pill with "3.45" typed
**When** the conversion fires
**Then** the ARIA live region (`aria-live="polite"`) announces the result
**And** the announcement includes the primary format, compact format, and total (e.g. `"3 hours 27 minutes. Compact: 3:27. 12,420 seconds total."`)

**Given** a screen reader user triggers a conversion with empty input
**When** the error state activates
**Then** the same ARIA live region announces the error message: `"Try entering a number first — like 2.5"`
**And** focus returns to the input field

**Given** `prefers-reduced-motion: reduce` is set in the OS
**When** the page loads or any interaction occurs
**Then** all CSS transitions are 0ms (no animation)
**And** the animated demo sequence (V1.0) is never triggered

**Given** a screen reader user navigates to a copy button
**When** they reach it
**Then** the screen reader announces: `"Copy standard format, button"`
**And** after pressing it: `"Copied to clipboard"` is announced

---

### Story 2.4: Visual Accessibility & WCAG Compliance

As a user with visual impairments,
I want the interface to meet WCAG 2.1 AA standards,
So that I can read results clearly regardless of my visual needs or display settings.

**Acceptance Criteria:**

**Given** the light mode color scheme
**When** the page is evaluated for contrast
**Then** teal-600 (`#0D9488`) on white passes 4.5:1 minimum (actual: 4.7:1)
**And** white text on teal-600 hero zone passes 4.5:1 minimum
**And** all body text on neutral backgrounds passes 4.5:1 minimum

**Given** any error or state change
**When** information is conveyed
**Then** it is never communicated by color alone — text and/or icon always accompanies color changes

**Given** the user sets browser text zoom to 200%
**When** the page renders
**Then** all text remains readable with no clipping
**And** the layout reflows to accommodate larger text without horizontal scroll
**And** no fixed-height containers clip content

**Given** Windows High Contrast Mode is enabled
**When** the page renders
**Then** the tool remains fully usable
**And** focus indicators, button borders, and text remain visible

**Given** the page is evaluated with an automated accessibility tool (e.g. Lighthouse or axe)
**When** the audit runs
**Then** no WCAG 2.1 AA violations are reported

---

## Epic 3: Power User & Visual Polish

Users return with their last unit pre-selected, benefit from dark mode, instantly re-convert by switching units, and experience a guided onboarding demo on first visit.
**FRs covered:** FR25, FR31, FR41–FR43
**Phase:** V1.0

### Story 3.1: Unit Persistence & Instant Re-convert

As a returning power user,
I want my last-used unit remembered and unit switching to instantly re-convert,
So that I can chain multiple conversions without repetitive setup.

**Acceptance Criteria:**

**Given** the user selects "Hr" and completes a conversion
**When** the user closes the tab and reopens the tool
**Then** "Hr" is pre-selected (teal active state) on load
**And** the input field is empty and auto-focused (ready for the next value)
**And** `state.selectedUnit` equals `'hours'` on load

**Given** no LocalStorage entry exists (first-ever visit)
**When** the page loads
**Then** "Min" is the default selected unit (unchanged from MVP behavior)

**Given** a conversion result is showing ("2 min 30 sec" for `2.5 min`)
**When** the user clicks the "Hr" pill without changing the input
**Then** the result immediately updates to the hours equivalent (e.g. `0 hr 2 min 30 sec`)
**And** no re-typing or additional button press is needed

**Given** `state.js` is updated
**When** reviewing the code
**Then** `loadFromStorage()` reads `selectedUnit` from LocalStorage on init
**And** `saveToStorage()` writes `selectedUnit` to LocalStorage on every pill click
**And** neither function accesses the DOM

---

### Story 3.2: Dark Mode — Auto Detection & Manual Toggle

As a user who prefers dark interfaces,
I want the tool to respect my system preference and let me override it manually,
So that I can use the tool comfortably in any lighting condition.

**Acceptance Criteria:**

**Given** the user's OS is set to dark mode (`prefers-color-scheme: dark`)
**When** the page loads for the first time
**Then** the tool automatically renders in dark mode
**And** the hero zone uses `#2DD4BF` (teal-400) as the primary color
**And** backgrounds use neutral-800/900 tones
**And** all text meets WCAG 2.1 AA contrast in dark mode

**Given** the page is in dark mode
**When** the user clicks the dark mode toggle button
**Then** the page switches to light mode
**And** the toggle preference is saved to LocalStorage
**And** the switch transition completes in under 100ms

**Given** the user has manually set light mode via the toggle
**When** they return to the tool later
**Then** light mode is shown regardless of their OS preference (manual override persists)

**Given** dark mode is active
**When** the user converts a value
**Then** the result is fully legible and all contrast ratios remain ≥4.5:1

---

### Story 3.3: Fuzzy Unit Matching

As a user typing natural language input,
I want the tool to recognise common unit abbreviations and tolerate minor typos,
So that I never get an error because I typed "housr" instead of "hours".

**Acceptance Criteria:**

**Given** the user types `2.5 hr` in the input field
**When** they trigger conversion
**Then** `'hr'` is recognised as `'hours'` and converts correctly

**Given** the user types `2.5 housr` (typo)
**When** they trigger conversion
**Then** the system matches it to `'hours'` and converts correctly (fuzzy match)
**And** no error is shown for close-enough unit names

**Given** the user types `2.5 sec`, `2.5 secs`, `2.5 second`, `2.5 seconds`
**When** they trigger conversion
**Then** all variations resolve to `'seconds'`

**Given** the unit alias table in `ui.js`
**When** reviewing the code
**Then** it covers all 7 units with at minimum: full singular, full plural, common abbreviation(s) for each

**Given** the user types a string with no recognisable unit (e.g. `2.5 xyz`)
**When** they trigger conversion
**Then** the system falls back to the currently selected pill unit (silent fallback, no error)

---

### Story 3.4: First-Visit Animated Demo

As a first-time visitor,
I want to see a brief demo that shows exactly how to use the tool,
So that I understand what it does without reading a single word of instruction.

**Acceptance Criteria:**

**Given** a user visits the tool for the first time (no LocalStorage unit)
**When** the page finishes loading
**Then** an animated demo sequence begins automatically in the hero zone
**And** the characters "2", ".", "5" are typed into the input field one by one (80–100ms per character)
**And** the "Min" pill activates (teal fill)
**And** the hero zone shows `2 min 30 sec` as if a real conversion occurred
**And** after 1.5 seconds the hero zone displays `"Try it yourself!"`
**And** the input field is cleared and re-focused, ready for the user

**Given** `prefers-reduced-motion: reduce` is set
**When** the page loads
**Then** the animated demo sequence is skipped entirely
**And** the page loads directly to the empty state with input focused

**Given** a returning user (LocalStorage unit exists)
**When** the page loads
**Then** the animated demo is skipped entirely
**And** the page loads directly to the empty state with their last unit pre-selected

**Given** the user starts typing during the demo
**When** a keypress is detected in the input field
**Then** the demo stops immediately and yields control to the user

---

## Epic 4: Discoverability & Public Deployment

Users can find the tool on Google for all 7 time unit queries and share specific conversions via URL.
**FRs covered:** FR44–FR46
**Phase:** V2.0+

### Story 4.1: SEO Foundation — Meta Tags & Structured Data

As a user searching on Google,
I want to find this tool at the top of results for time unit conversion queries,
So that I can get to the answer in one click.

**Acceptance Criteria:**

**Given** `index.html` is updated
**When** a search engine or social media platform reads the page
**Then** `<title>` is set to `"Decimal Time Converter — Convert 2.5 minutes to 2 min 30 sec"`
**And** `<meta name="description">` clearly describes the tool and all 7 supported units
**And** Open Graph tags (`og:title`, `og:description`, `og:type`) are present
**And** Twitter Card meta tags are present

**Given** the page source
**When** reviewed for structured data
**Then** a Schema.org `WebApplication` JSON-LD block is present
**And** `robots.txt` exists at the root allowing all crawlers
**And** `sitemap.xml` exists listing all pages

**Given** the HTML structure
**When** evaluated for semantic markup
**Then** a single `<h1>` describing the tool is present
**And** `<main>`, and `<output>` elements are used correctly
**And** W3C HTML validation reports zero errors

---

### Story 4.2: Shareable URL Parameters

As a user who wants to share a specific conversion,
I want to paste a URL that pre-fills the tool with my values,
So that a colleague opens it and sees the same result immediately.

**Acceptance Criteria:**

**Given** a user opens `index.html?value=2.5&unit=minutes`
**When** the page loads
**Then** the input field is pre-filled with `2.5`
**And** the "Min" pill is pre-selected
**And** the conversion is triggered automatically, showing the result in the hero zone
**And** no user interaction is required

**Given** a user opens a URL with an invalid unit (`?value=2.5&unit=blah`)
**When** the page loads
**Then** the invalid unit is ignored and the default "Min" is used
**And** no console error is thrown

**Given** a URL with a valid value and unit loads successfully
**When** the user changes the input or unit
**Then** the URL parameters do not interfere with subsequent conversions

---

### Story 4.3: Per-Unit Pages & Netlify Deployment

As a user searching for a specific unit (e.g. "decimal hours to hours minutes"),
I want to land on a page optimised exactly for that query,
So that I get the most relevant result and trust the tool immediately.

**Acceptance Criteria:**

**Given** per-unit HTML files are created (`minutes.html`, `hours.html`, etc.)
**When** each file is opened
**Then** its `<title>` and `<meta description>` are specific to that unit (e.g. "Decimal Hours Converter")
**And** the tool functions identically to `index.html` with that unit pre-selected
**And** `sitemap.xml` lists all 8 pages (index + 7 unit pages)

**Given** a `netlify.toml` file is created at the project root
**When** the project folder is deployed to Netlify
**Then** the site is live and accessible via a public URL
**And** all pages load without errors
**And** no build command is required (static deploy)

**Given** the deployed site
**When** tested on Chrome, Firefox, and Safari
**Then** all functionality from Epics 1–3 works identically to local development

---

## Epic 5: Global & Advanced Features

Users can use the tool in their own language, batch-convert multiple values, view session history, and reverse-convert readable time to decimal.
**FRs covered:** FR47–FR52
**Phase:** V2.0+

### Story 5.1: Internationalisation (i18n)

As a non-English speaker,
I want to use the tool in my own language with my local decimal format,
So that I don't have to mentally translate the interface or worry about decimal separators.

**Acceptance Criteria:**

**Given** a new `js/i18n.js` module exists
**When** reviewed
**Then** it exports a string table covering all UI labels, unit names, error messages, and output format strings
**And** it exports a `detectLocale()` function that reads `navigator.language`

**Given** a user's browser language is set to French (`fr-FR`)
**When** the page loads
**Then** unit labels, result format labels, and error messages are displayed in French
**And** the user is shown a language selector showing their auto-detected language

**Given** a user manually selects a different language from the language selector
**When** they choose Spanish
**Then** the interface switches to Spanish immediately without a page reload
**And** their language preference is saved to LocalStorage

**Given** a user's locale uses comma as decimal separator (e.g. `de-DE`)
**When** the page loads
**Then** the input field accepts `2,5` as a valid decimal by default
**And** the placeholder shows a locale-appropriate example

---

### Story 5.2: Reverse Conversion

As a user who has a readable time value,
I want to convert it back to a decimal,
So that I can use it in a formula or API that requires a decimal input.

**Acceptance Criteria:**

**Given** a reverse conversion mode toggle is available
**When** the user activates it
**Then** the input field accepts values like `"2 min 30 sec"` or `"2:30"`
**And** a unit pill is still required to specify the output decimal unit

**Given** the user enters `"2 min 30 sec"` with "Min" selected
**When** they trigger conversion
**Then** the result shows `2.5` (decimal minutes)
**And** the standard format result confirms: `"2.5 minutes = 2 min 30 sec"`

**Given** an unrecognisable reverse input format
**When** the user triggers conversion
**Then** a friendly error message explains the expected format with examples

---

### Story 5.3: Batch Conversion

As a power user,
I want to convert multiple decimal values at once,
So that I can process a list of API response times in a single session.

**Acceptance Criteria:**

**Given** a batch mode toggle is available
**When** the user activates it
**Then** a multi-line input area replaces the single input field
**And** the user can enter one value per line (e.g. `1.83`, `0.67`, `2.37`)

**Given** the user has entered 3 values and selects "Min"
**When** they trigger batch conversion
**Then** results are shown in a scrollable list, one row per input value
**And** each row shows the standard format result and a copy button

**Given** a batch result list is showing
**When** the user clicks "Copy All"
**Then** all results are copied as newline-separated text, ready to paste into a spreadsheet

---

### Story 5.4: Session Conversion History

As a power user doing multiple conversions,
I want to see my recent conversions in the current session,
So that I can reference a previous result without re-entering it.

**Acceptance Criteria:**

**Given** the user has completed at least one conversion
**When** a history panel is visible
**Then** the most recent conversion appears at the top
**And** each entry shows: input value, unit, and standard format result

**Given** the user has completed 10+ conversions
**When** viewing the history
**Then** a maximum of 10 most recent entries are shown
**And** older entries are automatically removed

**Given** the user clicks a history entry
**When** the click registers
**Then** the input field is populated with that entry's value and unit
**And** the conversion is re-triggered immediately

**Given** history entries exist and the page is refreshed
**When** the page reloads
**Then** the history is cleared (session-only, not persisted to LocalStorage)
