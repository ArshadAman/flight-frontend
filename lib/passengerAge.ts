/** Airline-style age bands at travel date (common India domestic/intl rules). */
export type PaxAgeBand = "adult" | "child" | "infant";

export function ageInYearsOnDate(dobIso: string, travelIso: string): number | null {
  const dob = parseYmd(dobIso);
  const travel = parseYmd(travelIso);
  if (!dob || !travel) return null;
  if (dob > travel) return null;

  let years = travel.getFullYear() - dob.getFullYear();
  const m = travel.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && travel.getDate() < dob.getDate())) {
    years -= 1;
  }
  return years;
}

export function expectedBandForPaxType(paxType: number): PaxAgeBand {
  if (paxType === 1) return "child";
  if (paxType === 2) return "infant";
  return "adult";
}

export function bandForAge(ageYears: number): PaxAgeBand {
  if (ageYears < 2) return "infant";
  if (ageYears < 12) return "child";
  return "adult";
}

export function paxTypeLabel(paxType: number): string {
  if (paxType === 1) return "Child";
  if (paxType === 2) return "Infant";
  return "Adult";
}

export function bandLabel(band: PaxAgeBand): string {
  if (band === "child") return "Child (2–11 years)";
  if (band === "infant") return "Infant (under 2 years)";
  return "Adult (12+ years)";
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addYearsClamped(d: Date, years: number): Date {
  const out = new Date(d.getFullYear() + years, d.getMonth(), d.getDate());
  // Feb 29 → last day of Feb when target year isn't a leap year
  if (out.getMonth() !== d.getMonth()) {
    out.setDate(0);
  }
  return startOfLocalDay(out);
}

function addDaysClamped(d: Date, days: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  return startOfLocalDay(out);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Allowed DOB calendar range so age on travel date matches the pax type.
 * Adult: 12+ → DOB on/before travel−12y (cannot pick the travel day / 2026 as DOB).
 * Child: 2–11 → after travel−12y … on/before travel−2y
 * Infant: under 2 → after travel−2y … min(today, travel)
 */
export function dobBoundsForPaxType(
  paxType: number,
  travelDateIso: string | undefined | null
): { minDate: Date; maxDate: Date; hint: string } {
  const travel = parseYmd(travelDateIso || "") || startOfLocalDay(new Date());
  const today = startOfLocalDay(new Date());
  const hardMin = new Date(1920, 0, 1);
  const notAfterToday = (d: Date) => (d > today ? today : d);

  if (paxType === 2) {
    const minDate = addDaysClamped(addYearsClamped(travel, -2), 1);
    const maxDate = notAfterToday(travel);
    return {
      minDate: minDate < hardMin ? hardMin : minDate,
      maxDate,
      hint: "Infant must be under 2 on the travel date. DOB cannot be in the future.",
    };
  }

  if (paxType === 1) {
    const minDate = addDaysClamped(addYearsClamped(travel, -12), 1);
    const maxDate = notAfterToday(addYearsClamped(travel, -2));
    return {
      minDate: minDate < hardMin ? hardMin : minDate,
      maxDate,
      hint: `Child must be 2–11 on travel. Latest allowed DOB: ${formatYmd(maxDate)}.`,
    };
  }

  // Adult 12+
  const maxDate = notAfterToday(addYearsClamped(travel, -12));
  const minDate = addYearsClamped(travel, -120);
  return {
    minDate: minDate < hardMin ? hardMin : minDate,
    maxDate,
    hint: `Adult must be 12+ on travel. DOB must be on or before ${formatYmd(maxDate)} (not the travel date).`,
  };
}

/**
 * Validates DOB against passenger type using age on the travel/departure date.
 * Returns an error message or null if valid.
 */
export function validatePassengerDob(
  dobIso: string | undefined | null,
  paxType: number,
  travelDateIso: string | undefined | null,
  passengerLabel = "Passenger"
): string | null {
  if (!dobIso?.trim()) {
    return `${passengerLabel}: Date of birth is required.`;
  }
  const travel = travelDateIso || new Date().toISOString().slice(0, 10);
  const age = ageInYearsOnDate(dobIso, travel);
  if (age === null) {
    return `${passengerLabel}: Enter a valid date of birth on or before the travel date.`;
  }
  if (age < 0 || age > 120) {
    return `${passengerLabel}: Date of birth looks invalid.`;
  }

  const expected = expectedBandForPaxType(paxType);
  const actual = bandForAge(age);
  if (actual !== expected) {
    return `${passengerLabel}: DOB age is ${age} (${bandLabel(actual)}), but this passenger is marked as ${paxTypeLabel(paxType)}. Use ${bandLabel(expected)}.`;
  }
  return null;
}

function parseYmd(value: string): Date | null {
  const raw = String(value || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : startOfLocalDay(d);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}
