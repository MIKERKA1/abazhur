import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nightAllowed, quote, takenSeats, validate } from '../../src/lib/pricing.ts';

// 2026-10-26 is a Monday, 2026-10-31 a Saturday.
const at = (iso: string) => new Date(iso);

test('weekday daytime and evening hours are charged at their own rate', () => {
  assert.equal(quote('hall', at('2026-10-26T10:00'), 2, 1)?.total, 380);
  assert.equal(quote('hall', at('2026-10-26T16:00'), 2, 1)?.total, 190 + 250);
  assert.equal(quote('hall', at('2026-10-31T12:00'), 1, 1)?.total, 250);
});

test('a package applies only when it is cheaper than the hours', () => {
  const evening = quote('hall', at('2026-10-26T18:00'), 3, 1)!;
  assert.equal(evening.total, 650);
  assert.equal(evening.saving, 100);
  assert.equal(evening.package, 'пакет «3 часа»');
  const day = quote('hall', at('2026-10-26T10:00'), 3, 1)!;
  assert.equal(day.total, 570);
  assert.equal(day.package, null);
  assert.equal(quote('hall', at('2026-10-31T12:00'), 5, 1)?.package, 'пакет «5 часов»');
});

test('night package and group bookings', () => {
  const night = quote('hall', at('2026-10-30T23:00'), 'night', 2)!;
  assert.equal(night.unit, 900);
  assert.equal(night.total, 1800);
  assert.equal(night.saving, (9 * 250 - 900) * 2);
  assert.equal(quote('camp', at('2026-10-31T15:00'), 2, 5)?.total, 3500);
  assert.equal(nightAllowed('room'), false);
  assert.equal(quote('hall', at('2026-10-26T10:00'), 1, 0), null);
});

test('example occupancy is stable for the same slot and leaves free seats', () => {
  const a = takenSeats('2026-10-31', 20);
  assert.deepEqual([...a], [...takenSeats('2026-10-31', 20)]);
  assert.ok(a.size > 0 && a.size < 27);
});

test('validation explains every missing field and rejects past hours', () => {
  const now = at('2026-10-26T15:30');
  const empty = validate({ seats: [], date: '', hour: '', duration: '2', name: '', phone: '', consent: false }, now);
  assert.deepEqual(Object.keys(empty).sort(), ['consent', 'date', 'hour', 'name', 'phone', 'seats']);
  const past = validate({ seats: ['1'], date: '2026-10-26', hour: '15', duration: '2', name: 'Аня', phone: '89123456789', consent: true }, now);
  assert.deepEqual(Object.keys(past), ['hour']);
  const ok = validate({ seats: ['1'], date: '2026-10-26', hour: '18', duration: '2', name: 'Аня', phone: '+7 912 345-67-89', consent: true }, now);
  assert.deepEqual(ok, {});
});
