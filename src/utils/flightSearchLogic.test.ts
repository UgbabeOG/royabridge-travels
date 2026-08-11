import assert from 'node:assert/strict';
import test from 'node:test';
import { getPricedSerpApiFlights, normalizeFlightPrice } from './flightSearchLogic';

test('normalizeFlightPrice rejects non-numeric and zero values', () => {
  assert.equal(normalizeFlightPrice(''), null);
  assert.equal(normalizeFlightPrice('0'), null);
  assert.equal(normalizeFlightPrice('USD 250'), 250);
});

test('getPricedSerpApiFlights only keeps flights with numeric positive prices', () => {
  const flights = [
    { price: 320 },
    { price: 'N/A' },
    { price: 0 },
    { price: '540' }
  ];

  const priced = getPricedSerpApiFlights(flights as any);
  assert.equal(priced.length, 2);
  assert.deepEqual(priced.map(item => item.price), [320, 540]);
});
