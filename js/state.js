// state.js — Application state and hero zone enum
// No DOM access. No conversion math.

export const HERO_STATES = {
  EMPTY:  'empty',
  DEMO:   'demo',
  RESULT: 'result',
  ERROR:  'error'
};

export const state = {
  currentValue:   null,      // Parsed float or null
  selectedUnit:   'minutes', // Default unit — MVP default; V1.0 will persist via LocalStorage
  lastConversion: null,      // Last result from convert(), or null
  heroState:      'empty'    // Initial state — one of HERO_STATES values
};
