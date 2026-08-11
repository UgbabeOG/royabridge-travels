export function normalizeFlightPrice(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value === 'string') {
    const cleaned = value.trim().replace(/[^0-9.\-]/g, '');
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
  }

  return null;
}

export function getPricedSerpApiFlights(rawFlights: Array<Record<string, any>> = []): Array<{ flight: Record<string, any>; price: number }> {
  return rawFlights.reduce<Array<{ flight: Record<string, any>; price: number }>>((acc, flight) => {
    const price = normalizeFlightPrice(flight?.price);
    if (price !== null) {
      acc.push({ flight, price });
    }
    return acc;
  }, []);
}
