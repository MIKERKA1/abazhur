// Booking maths, kept pure so tests/unit/pricing.test.ts can check it without a browser.
import { DAY_HOURS, NIGHT, packages, seats, zoneById, type ZoneId } from '../data/club.ts';
import { normalizePhone } from './phone.ts';

/** Duration as offered in the form: whole hours or the night package. */
export type Duration = 1 | 2 | 3 | 4 | 5 | 'night';

export const durations: { value: Duration; label: string }[] = [
  { value: 1, label: '1 час' },
  { value: 2, label: '2 часа' },
  { value: 3, label: '3 часа' },
  { value: 4, label: '4 часа' },
  { value: 5, label: '5 часов' },
  { value: 'night', label: NIGHT.label },
];

export const hoursOf = (d: Duration): number => (d === 'night' ? NIGHT.hours : d);

/** Weekday daytime is cheaper; evenings, nights and weekends cost the same. */
export function isDayRate(at: Date): boolean {
  const wd = at.getDay();
  const h = at.getHours();
  return wd >= 1 && wd <= 5 && h >= DAY_HOURS.from && h < DAY_HOURS.to;
}

export interface Quote {
  /** Per seat (or per room) before multiplying by the number of seats. */
  hourly: number;
  unit: number;
  total: number;
  /** Set when a package beat the hourly sum. */
  package: string | null;
  saving: number;
}

const packageName = (d: Duration): string => (d === 'night' ? 'ночной пакет' : d === 5 ? 'пакет «5 часов»' : `пакет «${d} часа»`);

/** Price of a booking. Each hour is charged at the rate of the hour it falls in; a package wins when cheaper. */
export function quote(zone: ZoneId, start: Date, duration: Duration, count: number): Quote | null {
  const z = zoneById(zone);
  if (!z || count < 1) return null;
  let hourly = 0;
  for (let i = 0; i < hoursOf(duration); i++) {
    const at = new Date(start);
    at.setHours(start.getHours() + i);
    hourly += isDayRate(at) ? z.day : z.evening;
  }
  const pk: Partial<Record<Duration, number>> = packages[zone];
  const fixed = pk[duration];
  const usePackage = fixed !== undefined && fixed < hourly;
  const unit = usePackage ? fixed : hourly;
  return {
    hourly,
    unit,
    total: unit * count,
    package: usePackage ? packageName(duration) : null,
    saving: usePackage ? (hourly - fixed) * count : 0,
  };
}

/** Night packages exist only where `packages` lists one; the PS5 rooms close at 04:00. */
export const nightAllowed = (zone: ZoneId): boolean => 'night' in packages[zone];

/**
 * Example occupancy so the plan looks like a real evening. Deterministic per date and hour,
 * so the same slot always shows the same seats taken; the page labels it as an example.
 */
export function takenSeats(date: string, hour: number): Set<string> {
  const all = [...seats.hall, ...seats.camp, ...seats.room];
  const busy = isDayRate(new Date(`${date}T${String(hour).padStart(2, '0')}:00`)) ? 0.2 : 0.4;
  let h = 2166136261;
  for (const c of `${date}|${hour}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return new Set(
    all.filter((s) => {
      for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
      return ((h >>> 0) % 1000) / 1000 < busy;
    }),
  );
}

export const BOOK_AHEAD_DAYS = 14;

export const isoDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function dateRange(today: Date): { min: string; max: string } {
  const max = new Date(today);
  max.setDate(max.getDate() + BOOK_AHEAD_DAYS);
  return { min: isoDay(today), max: isoDay(max) };
}

export interface BookingInput {
  seats: string[];
  date: string;
  hour: string;
  duration: string;
  name: string;
  phone: string;
  consent: boolean;
}

export type BookingErrors = Partial<Record<'seats' | 'date' | 'hour' | 'name' | 'phone' | 'consent', string>>;

/** Error messages say what to do, not only what is wrong. */
export function validate(input: BookingInput, now: Date): BookingErrors {
  const errors: BookingErrors = {};
  if (!input.seats.length) errors.seats = 'Выберите место на плане: нажмите на свободную лампу.';
  const { min, max } = dateRange(now);
  if (!input.date) errors.date = 'Выберите день.';
  else if (input.date < min) errors.date = 'Этот день уже прошёл. Выберите сегодня или позже.';
  else if (input.date > max) errors.date = `Бронь открыта на ${BOOK_AHEAD_DAYS} дней вперёд. Выберите день пораньше.`;
  if (input.hour === '') errors.hour = 'Выберите, во сколько придёте.';
  else if (input.date === min && Number(input.hour) <= now.getHours())
    errors.hour = 'Это время уже наступило. Выберите час позже или приходите без брони.';
  if (input.name.trim().length < 2) errors.name = 'Напишите имя: по нему вас встретят у стойки.';
  if (!input.phone.trim()) errors.phone = 'Нужен телефон, чтобы предупредить, если что-то изменится.';
  else if (!normalizePhone(input.phone)) errors.phone = 'Проверьте номер: нужно 10 цифр после +7.';
  if (!input.consent) errors.consent = 'Без согласия мы не можем принять бронь.';
  return errors;
}
