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
const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR   = 3_600_000;
const MS_PER_DAY    = 86_400_000;
const MS_PER_WEEK   = 604_800_000;
const MS_PER_MONTH  = 2_629_746_000; // Average Gregorian month
const MS_PER_YEAR   = 31_556_952_000; // Average Gregorian year

// Lookup table for toMilliseconds() and validation — module-level, not exported
const MS_PER_UNIT = {
  seconds: MS_PER_SECOND,
  minutes: MS_PER_MINUTE,
  hours:   MS_PER_HOUR,
  days:    MS_PER_DAY,
  weeks:   MS_PER_WEEK,
  months:  MS_PER_MONTH,
  years:   MS_PER_YEAR
};

// Smart precision config: which breakdown fields to include per input unit,
// and the smallest meaningful unit for formats.total — not exported
const PRECISION_CONFIG = {
  seconds: {
    fields: ['seconds', 'milliseconds'],
    total:  { label: 'millisecond', ms: 1 }
  },
  minutes: {
    fields: ['minutes', 'seconds'],
    total:  { label: 'second', ms: MS_PER_SECOND }
  },
  hours: {
    fields: ['hours', 'minutes', 'seconds'],
    total:  { label: 'second', ms: MS_PER_SECOND }
  },
  days: {
    fields: ['days', 'hours', 'minutes'],
    total:  { label: 'minute', ms: MS_PER_MINUTE }
  },
  weeks: {
    fields: ['weeks', 'days', 'hours'],
    total:  { label: 'hour', ms: MS_PER_HOUR }
  },
  months: {
    fields: ['months', 'weeks', 'days'],
    total:  { label: 'day', ms: MS_PER_DAY }
  },
  years: {
    fields: ['years', 'months', 'days'],
    total:  { label: 'day', ms: MS_PER_DAY }
  }
};

// Standard format abbreviation labels — not exported
const ABBR_LABELS = {
  years: 'yr', months: 'mo', weeks: 'wk', days: 'day',
  hours: 'hr', minutes: 'min', seconds: 'sec', milliseconds: 'ms'
};

// Verbose format full-word labels (singular) — not exported
const VERBOSE_LABELS = {
  years: 'year', months: 'month', weeks: 'week', days: 'day',
  hours: 'hour', minutes: 'minute', seconds: 'second', milliseconds: 'millisecond'
};

/**
 * Convert total milliseconds to a full breakdown object (all 8 unit keys).
 * Uses integer-first arithmetic — Math.floor on integers only, no float accumulation.
 * @param {number} totalMs - Integer milliseconds (must be non-negative integer)
 * @returns {{years, months, weeks, days, hours, minutes, seconds, milliseconds}}
 */
function cascadeBreakdown(totalMs) {
  let rem = totalMs;
  const years        = Math.floor(rem / MS_PER_YEAR);    rem = rem % MS_PER_YEAR;
  const months       = Math.floor(rem / MS_PER_MONTH);   rem = rem % MS_PER_MONTH;
  const weeks        = Math.floor(rem / MS_PER_WEEK);    rem = rem % MS_PER_WEEK;
  const days         = Math.floor(rem / MS_PER_DAY);     rem = rem % MS_PER_DAY;
  const hours        = Math.floor(rem / MS_PER_HOUR);    rem = rem % MS_PER_HOUR;
  const minutes      = Math.floor(rem / MS_PER_MINUTE);  rem = rem % MS_PER_MINUTE;
  const seconds      = Math.floor(rem / MS_PER_SECOND);
  const milliseconds = rem % MS_PER_SECOND;
  return { years, months, weeks, days, hours, minutes, seconds, milliseconds };
}

/**
 * Convert a decimal input and unit key to total integer milliseconds.
 * Uses Math.round() to snap floating-point drift to the nearest integer ms.
 * Example: 0.001 * 1000 may yield 0.9999... → Math.round → 1 (correct).
 * @param {number} decimal
 * @param {string} unitKey
 * @returns {number} integer milliseconds
 */
function toMilliseconds(decimal, unitKey) {
  return Math.round(decimal * MS_PER_UNIT[unitKey]);
}

/**
 * Build standard format: abbreviation labels, space-separated, non-zero applicable fields only.
 * Smart precision: only fields defined in PRECISION_CONFIG[unitKey].fields are included.
 * Examples: '2 min 30 sec', '1 hr 30 min', '500 ms', '40 sec'
 */
function buildStandardFormat(breakdown, unitKey) {
  const fields = PRECISION_CONFIG[unitKey].fields;
  const parts = fields
    .filter(f => breakdown[f] !== 0)
    .map(f => {
      const val = breakdown[f];
      // 'day' is the only full-word abbreviation that conventionally pluralizes (spec example: '3 days 6 hr 30 min')
      const label = (f === 'days' && val !== 1) ? `${ABBR_LABELS[f]}s` : ABBR_LABELS[f];
      return `${val} ${label}`;
    });
  if (parts.length === 0) {
    // All applicable fields are zero — show smallest applicable unit as 0
    const smallest = fields[fields.length - 1];
    return `0 ${ABBR_LABELS[smallest]}`;
  }
  return parts.join(' ');
}

/**
 * Build verbose format: full English words, comma-separated, non-zero applicable fields only.
 * Handles singular/plural correctly.
 * Examples: '2 minutes, 30 seconds', '1 hour, 30 minutes', '500 milliseconds'
 */
function buildVerboseFormat(breakdown, unitKey) {
  const fields = PRECISION_CONFIG[unitKey].fields;
  const parts = fields
    .filter(f => breakdown[f] !== 0)
    .map(f => {
      const val = breakdown[f];
      const word = VERBOSE_LABELS[f];
      return val === 1 ? `${val} ${word}` : `${val} ${word}s`;
    });
  if (parts.length === 0) {
    const smallest = fields[fields.length - 1];
    return `0 ${VERBOSE_LABELS[smallest]}s`;
  }
  return parts.join(', ');
}

/*
 * COMPACT_FORMAT_PATTERN — chosen format per input unit:
 *   seconds → "{s}.{ms:3pad}"           e.g. "0.500", "1.000", "40.000"
 *   minutes → "{m}:{ss:2pad}"           e.g. "2:30", "0:45", "10:05"
 *   hours   → "{h}:{mm:2pad}:{ss:2pad}" e.g. "1:30:00", "0:05:30"
 *   days    → "{d}d {h}:{mm:2pad}"      e.g. "1d 3:30", "0d 0:45"
 *   weeks   → "{w}w {d}d {h}h"          e.g. "1w 2d 6h", "0w 1d 0h"
 *   months  → "{mo}mo {w}w {d}d"        e.g. "1mo 2w 3d", "0mo 1w 0d"
 *   years   → "{y}y {mo}mo {d}d"        e.g. "1y 2mo 15d", "0y 6mo 0d"
 */

/**
 * Build compact format: concise colon/notation format per input unit.
 * All fields for the unit are always shown (including zeros), zero-padded where conventional.
 */
function buildCompactFormat(breakdown, unitKey) {
  const { years, months, weeks, days, hours, minutes, seconds, milliseconds } = breakdown;
  const pad2 = n => String(n).padStart(2, '0');
  const pad3 = n => String(n).padStart(3, '0');
  switch (unitKey) {
    case 'seconds': return `${seconds}.${pad3(milliseconds)}`;
    case 'minutes': return `${minutes}:${pad2(seconds)}`;
    case 'hours':   return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
    case 'days':    return `${days}d ${hours}:${pad2(minutes)}`;
    case 'weeks':   return `${weeks}w ${days}d ${hours}h`;
    case 'months':  return `${months}mo ${weeks}w ${days}d`;
    case 'years':   return `${years}y ${months}mo ${days}d`;
    // Unreachable: unitKey is validated before this function is called
    default:        return '';
  }
}

/**
 * Build total format: total value expressed in the smallest meaningful unit for the input unit.
 * Examples: '150 seconds' (for minutes), '500 milliseconds' (for seconds), '5400 seconds' (for hours)
 */
function buildTotalFormat(totalMs, unitKey) {
  const { label, ms } = PRECISION_CONFIG[unitKey].total;
  const total = Math.round(totalMs / ms);
  const word = total === 1 ? label : `${label}s`;
  return `${total} ${word}`;
}

/**
 * Convert a decimal time value to a human-readable breakdown.
 *
 * @param {number} decimal - Positive decimal number (must be > 0, finite, non-null)
 * @param {string} unitKey - Canonical unit key from UNIT_KEYS
 * @returns {{input: {raw, unit}, breakdown: {...}, formats: {standard, compact, verbose, total}}|null}
 *          Returns null on ANY invalid input — never throws.
 */
export function convert(decimal, unitKey) {
  try {
    // Task 1: Input validation — explicit checks, never rely on throw to signal invalid input
    if (decimal === null || decimal === undefined) return null;
    if (typeof decimal !== 'number' || !isFinite(decimal)) return null;
    if (decimal <= 0) return null;
    if (!UNIT_KEYS.includes(unitKey)) return null;

    // Task 2: Convert to total integer milliseconds (eliminates float drift)
    const totalMs = toMilliseconds(decimal, unitKey);
    // Guard: extremely small decimals (e.g. 0.0001 seconds) round to 0ms — treat as invalid
    if (totalMs <= 0) return null;

    // Task 3: Cascade integer division to get all 8 breakdown fields
    const breakdown = cascadeBreakdown(totalMs);

    // Task 4: Build all 4 format strings
    return {
      input: { raw: decimal, unit: unitKey },
      breakdown,
      formats: {
        standard: buildStandardFormat(breakdown, unitKey),
        compact:  buildCompactFormat(breakdown, unitKey),
        verbose:  buildVerboseFormat(breakdown, unitKey),
        total:    buildTotalFormat(totalMs, unitKey)
      }
    };
  } catch (err) {
    // Final safety net — unexpected errors must not propagate to the UI (NFR41: zero console errors)
    console.error('[conversion.js] Unexpected error in convert():', err);
    return null;
  }
}
