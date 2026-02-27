// ui.js — DOM wiring: events, render functions, input parsing
// No math here. No direct state mutations beyond intended patterns.
// No exports — this is the entry point; nothing imports from ui.js.

import { convert, UNIT_KEYS, UNIT_LABELS } from './conversion.js';
import { state, HERO_STATES } from './state.js';

// ── Error messages ───────────────────────────────────────────────────────────
// Verbatim strings from the acceptance criteria — do NOT edit without updating ACs.
const ERROR_MESSAGES = {
  empty:    "Try entering a number first \u2014 like 2.5",
  invalid:  "That doesn't look like a number. Try something like 2.5 or 0.75",
  negative: "Time values must be positive. Try a number greater than 0"
};

// ── validateInput ────────────────────────────────────────────────────────────
// Returns { valid: true } or { valid: false, message: string }.
// Must be called BEFORE convert() — do not rely on convert() to distinguish errors.
function validateInput(parsedValue, rawInput) {
  const trimmed = rawInput ? rawInput.trim() : '';
  if (trimmed === '') return { valid: false, message: ERROR_MESSAGES.empty };
  if (parsedValue === null) return { valid: false, message: ERROR_MESSAGES.invalid };
  if (parsedValue <= 0) return { valid: false, message: ERROR_MESSAGES.negative };
  return { valid: true };
}

// ── Unit alias table ────────────────────────────────────────────────────────
// Maps natural-language suffixes to canonical unit keys.
// 'm' is intentionally omitted — ambiguous (minutes vs months).
const UNIT_ALIASES = {
  // seconds
  s: 'seconds', sec: 'seconds', secs: 'seconds', second: 'seconds', seconds: 'seconds',
  // minutes
  min: 'minutes', mins: 'minutes', minute: 'minutes', minutes: 'minutes',
  // hours
  h: 'hours', hr: 'hours', hrs: 'hours', hour: 'hours', hours: 'hours',
  // days
  d: 'days', day: 'days', days: 'days',
  // weeks
  w: 'weeks', wk: 'weeks', wks: 'weeks', week: 'weeks', weeks: 'weeks',
  // months
  mo: 'months', mos: 'months', month: 'months', months: 'months',
  // years
  y: 'years', yr: 'years', yrs: 'years', year: 'years', years: 'years'
};

// ── parseNaturalLanguage ─────────────────────────────────────────────────────
// Parses raw input string into { value, unit } where either may be null.
// Handles:
//   - Comma decimal separator ("2,5" → 2.5)
//   - Numeric-only input ("2.5" → { value: 2.5, unit: null })
//   - Natural language suffix ("2.5 min" → { value: 2.5, unit: 'minutes' })
function parseNaturalLanguage(inputStr) {
  if (!inputStr || !inputStr.trim()) return { value: null, unit: null };
  const normalised = inputStr.trim().replace(',', '.');
  const match = normalised.match(/^([+-]?\d+\.?\d*)\s*([a-zA-Z]*)$/);
  if (!match) return { value: null, unit: null };
  const value = parseFloat(match[1]);
  const suffix = match[2].toLowerCase().trim();
  const unit = suffix ? (UNIT_ALIASES[suffix] ?? null) : null;
  return { value: isNaN(value) ? null : value, unit };
}

// ── renderPills ──────────────────────────────────────────────────────────────
// Sets aria-checked on each pill to reflect the active unit.
// CSS already handles the teal active style via .pill[aria-checked="true"].
function renderPills(selectedUnit) {
  document.querySelectorAll('[data-unit]').forEach(pill => {
    pill.setAttribute('aria-checked', pill.dataset.unit === selectedUnit ? 'true' : 'false');
  });
}

// ── renderHeroZone ───────────────────────────────────────────────────────────
// Renders hero zone content based on state.heroState.
function renderHeroZone() {
  const zone = document.getElementById('hero-zone');
  if (!zone) return;
  zone.setAttribute('data-state', state.heroState);

  if (state.heroState === HERO_STATES.RESULT && state.lastConversion) {
    const { formats } = state.lastConversion;
    zone.innerHTML = `
      <div id="hero-result">
        <div class="result-primary">
          <span class="result-value">${escHtml(formats.standard)}</span>
          <button class="copy-btn" data-copy-text="${escAttr(formats.standard)}" aria-label="Copy standard format">Copy</button>
        </div>
        <div class="result-secondaries">
          <div class="result-row">
            <span class="result-label">Compact</span>
            <span class="result-value-sm">${escHtml(formats.compact)}</span>
            <button class="copy-btn" data-copy-text="${escAttr(formats.compact)}" aria-label="Copy compact format">Copy</button>
          </div>
          <div class="result-row">
            <span class="result-label">Verbose</span>
            <span class="result-value-sm">${escHtml(formats.verbose)}</span>
            <button class="copy-btn" data-copy-text="${escAttr(formats.verbose)}" aria-label="Copy verbose format">Copy</button>
          </div>
          <div class="result-row">
            <span class="result-label">Total</span>
            <span class="result-value-sm">${escHtml(formats.total)}</span>
            <button class="copy-btn" data-copy-text="${escAttr(formats.total)}" aria-label="Copy total format">Copy</button>
          </div>
        </div>
      </div>`;
  } else if (state.heroState === HERO_STATES.ERROR) {
    zone.innerHTML = `<p id="hero-content">${escHtml(state.errorMessage || 'Invalid input')}</p>`;
  } else {
    // EMPTY (or DEMO — demo is V1.0)
    zone.innerHTML = `<p id="hero-content">Enter a decimal time value above</p>`;
  }
}

// ── handleCopy ───────────────────────────────────────────────────────────────
// Copies text to clipboard; shows "Copied!" on the button for 1.5s.
// Operates independently per button — no global state.
function handleCopy(text, buttonEl) {
  navigator.clipboard.writeText(text).then(() => {
    buttonEl.textContent = 'Copied!';
    setTimeout(() => { buttonEl.textContent = 'Copy'; }, 1500);
  }).catch(() => {
    // Clipboard API unavailable — fail silently, no console error
  });
}

// ── handlePillClick ──────────────────────────────────────────────────────────
// Processes a pill click: validate → parse input → resolve unit → convert → render.
function handlePillClick(pillEl) {
  const rawInput = document.getElementById('value-input').value;
  const clickedUnit = pillEl.dataset.unit;
  const { value, unit: parsedUnit } = parseNaturalLanguage(rawInput);

  const validation = validateInput(value, rawInput);
  if (!validation.valid) {
    state.heroState = HERO_STATES.ERROR;
    state.errorMessage = validation.message;
    renderPills(state.selectedUnit);
    renderHeroZone();
    setTimeout(() => document.getElementById('value-input').focus(), 100);
    return;
  }

  // Natural language unit wins over clicked pill; fall back to clicked pill
  const resolvedUnit = parsedUnit ?? clickedUnit;

  const result = convert(value, resolvedUnit);
  if (result !== null) {
    // Commit state only after confirmed successful conversion
    state.selectedUnit = resolvedUnit;
    state.currentValue = value;
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

// ── handleEnterKey ───────────────────────────────────────────────────────────
// Enter key on the input: validate → convert → render.
function handleEnterKey(event) {
  if (event.key !== 'Enter') return;
  const rawInput = document.getElementById('value-input').value;
  const { value, unit: parsedUnit } = parseNaturalLanguage(rawInput);

  const validation = validateInput(value, rawInput);
  if (!validation.valid) {
    state.heroState = HERO_STATES.ERROR;
    state.errorMessage = validation.message;
    renderPills(state.selectedUnit);
    renderHeroZone();
    setTimeout(() => document.getElementById('value-input').focus(), 100);
    return;
  }

  const resolvedUnit = parsedUnit ?? state.selectedUnit;

  const result = convert(value, resolvedUnit);
  if (result !== null) {
    // Commit state only after confirmed successful conversion
    state.selectedUnit = resolvedUnit;
    state.currentValue = value;
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

// ── handleInputBlur ──────────────────────────────────────────────────────────
// When the input loses focus while empty, return hero zone to empty state (AC6).
function handleInputBlur() {
  const input = document.getElementById('value-input');
  if (input && input.value.trim() === '') {
    state.heroState = HERO_STATES.EMPTY;
    renderHeroZone();
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
// Escape user-generated text before inserting into HTML content or attributes.
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

// ── init ─────────────────────────────────────────────────────────────────────
function init() {
  // Auto-focus input so the user can type immediately
  const input = document.getElementById('value-input');
  if (input) {
    input.focus();
    input.addEventListener('blur', handleInputBlur);
    input.addEventListener('keydown', handleEnterKey);
  }

  // Render pills to visually activate the default unit (Min)
  renderPills(state.selectedUnit);

  // Pill click — event delegation on #pill-row
  document.getElementById('pill-row').addEventListener('click', (e) => {
    const pill = e.target.closest('[data-unit]');
    if (pill) handlePillClick(pill);
  });

  // Copy button clicks — event delegation on #hero-zone (handles dynamically rendered buttons)
  document.getElementById('hero-zone').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy-text]');
    if (btn) handleCopy(btn.dataset.copyText, btn);
  });
}

document.addEventListener('DOMContentLoaded', init);
