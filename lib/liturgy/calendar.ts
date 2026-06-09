import { LiturgicalSeason, LiturgicalYear } from "@/types/models";

import { GeneralRoman_En } from "@romcal/calendar.general-roman";
import { Romcal } from "romcal";

/**
 * Liturgical calendar of the Roman Rite, backed by romcal's General Roman
 * Calendar. Computed in-process (no network) so the assistant can ground its
 * title/theme/song suggestions in the actual proper of the day — its proper
 * name, rank (solemnity/feast/memorial), season, Sunday cycle, and any
 * coinciding celebrations.
 *
 * Scope: the universal (General Roman) calendar. Nigeria's proper celebrations
 * and conference date-transfers are not yet layered on — that's a planned
 * follow-up overlay.
 */

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** romcal's season identifiers → our LiturgicalSeason enum. */
const SEASON_MAP: Record<string, LiturgicalSeason> = {
  ADVENT: LiturgicalSeason.ADVENT,
  CHRISTMAS_TIME: LiturgicalSeason.CHRISTMAS,
  ORDINARY_TIME: LiturgicalSeason.ORDINARY_TIME,
  LENT: LiturgicalSeason.LENT,
  PASCHAL_TRIDUUM: LiturgicalSeason.TRIDUUM,
  EASTER_TIME: LiturgicalSeason.EASTER,
};

const CYCLE_MAP: Record<string, LiturgicalYear> = {
  YEAR_A: LiturgicalYear.A,
  YEAR_B: LiturgicalYear.B,
  YEAR_C: LiturgicalYear.C,
};

export type LiturgicalDay = {
  date: string; // ISO YYYY-MM-DD
  weekday: string;
  isSunday: boolean;
  /** The proper of the day, e.g. "Third Sunday in Ordinary Time". */
  name: string;
  /** Rank of the celebration, e.g. "Solemnity", "Feast", "Memorial", "Sunday". */
  rank: string;
  season: LiturgicalSeason;
  seasonLabel: string;
  year: LiturgicalYear; // Sunday cycle A/B/C
  /** Liturgical color for the day, e.g. "green", "white", "violet". */
  color: string;
  /** A holy day of obligation (attend Mass), beyond ordinary Sundays. */
  isHolyDayOfObligation: boolean;
  /** Other celebrations on the same day (e.g. optional memorials) the user may choose instead. */
  otherCelebrations: string[];
  summary: string;
};

// romcal builds a whole civil year at once; cache the promise per year since a
// liturgical calendar for a given year never changes.
const romcal = new Romcal({ localizedCalendar: GeneralRoman_En });
type RomcalCalendar = Awaited<ReturnType<Romcal["generateCalendar"]>>;
const yearCache = new Map<number, Promise<RomcalCalendar>>();

function calendarForYear(year: number): Promise<RomcalCalendar> {
  let cal = yearCache.get(year);
  if (!cal) {
    cal = romcal.generateCalendar(year);
    yearCache.set(year, cal);
  }
  return cal;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function getLiturgicalDay(input: Date): Promise<LiturgicalDay> {
  const iso = new Date(
    Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
  const civilYear = Number(iso.slice(0, 4));
  const weekdayIndex = new Date(`${iso}T00:00:00Z`).getUTCDay();
  const weekday = WEEKDAYS[weekdayIndex];
  const isSunday = weekdayIndex === 0;

  const calendar = await calendarForYear(civilYear);
  const entries = calendar[iso] ?? [];
  const day = entries[0];

  // Defensive fallback — romcal covers 1583+, so this should not happen.
  if (!day) {
    return {
      date: iso,
      weekday,
      isSunday,
      name: weekday,
      rank: isSunday ? "Sunday" : "Weekday",
      season: LiturgicalSeason.ORDINARY_TIME,
      seasonLabel: "Ordinary Time",
      year: LiturgicalYear.A,
      color: "green",
      isHolyDayOfObligation: isSunday,
      otherCelebrations: [],
      summary: `${weekday} in Ordinary Time`,
    };
  }

  // Easter Sunday carries both PASCHAL_TRIDUUM and EASTER_TIME — take the last
  // so it resolves to Easter, while Good Friday/Holy Saturday stay Triduum.
  const romcalSeason = day.seasons[day.seasons.length - 1];
  const isPentecost = /pentecost/i.test(day.name);
  const season = isPentecost
    ? LiturgicalSeason.PENTECOST
    : (SEASON_MAP[romcalSeason] ?? LiturgicalSeason.ORDINARY_TIME);
  const seasonLabel = day.seasonNames[day.seasonNames.length - 1] ?? "";
  const year = CYCLE_MAP[day.cycles.sundayCycle] ?? LiturgicalYear.A;
  const rank = titleCase(day.rankName);
  const color = day.colorNames[0] ?? "";
  const otherCelebrations = entries.slice(1).map((e) => e.name);

  const obligation =
    day.isHolyDayOfObligation && !isSunday ? ", a holy day of obligation" : "";
  const summary = `${day.name} — ${rank}, liturgical Year ${year} (${seasonLabel}, ${color})${obligation}.`;

  return {
    date: iso,
    weekday,
    isSunday,
    name: day.name,
    rank,
    season,
    seasonLabel,
    year,
    color,
    isHolyDayOfObligation: day.isHolyDayOfObligation,
    otherCelebrations,
    summary,
  };
}
