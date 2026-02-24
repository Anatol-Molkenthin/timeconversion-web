// ui.js — DOM wiring: events, render functions, input parsing
// No math here. No direct state mutations beyond intended patterns.
// No exports — this is the entry point; nothing imports from ui.js.

import { convert, UNIT_KEYS, UNIT_LABELS } from './conversion.js';
import { state, HERO_STATES } from './state.js';

function init() {
  // Auto-focus input on page load so the user can type immediately
  const input = document.getElementById('value-input');
  if (input) {
    input.focus();
  }

  // Story 1.3 will wire up event listeners for pill clicks and Enter key,
  // renderHeroZone(), renderPills(), handlePillClick(), handleEnterKey(),
  // handleCopy(), parseNaturalLanguage(), and validateInput().
}

document.addEventListener('DOMContentLoaded', init);
