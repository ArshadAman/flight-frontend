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
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}
