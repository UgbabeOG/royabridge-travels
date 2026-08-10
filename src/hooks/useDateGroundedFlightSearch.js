import { useEffect, useRef, useState } from 'react';

/**
 * Custom React hook that monitors departure and return date field updates in flight search parameters.
 * Automatically triggers a fresh Google Search grounded flight search whenever the user updates
 * the departure or return date fields, ensuring search results and pricing data are dynamically
 * refreshed and accurate for the specific dates selected.
 */
export function useDateGroundedFlightSearch({
  departDate,
  returnDate,
  origin,
  destination,
  tripType = 'round',
  cabinClass = 'Business',
  passengers = 1,
  multiCityLegs = [],
  onSearchFlights,
  debounceMs = 350,
  enabled = true
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastGroundedAt, setLastGroundedAt] = useState(null);
  const [groundedDateRange, setGroundedDateRange] = useState('');
  
  const prevDatesRef = useRef({ departDate: null, returnDate: null });
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip firing on initial render unless dates differ from initialized defaults
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDatesRef.current = { departDate, returnDate };
      setGroundedDateRange(returnDate ? `${departDate} ➔ ${returnDate}` : departDate);
      return;
    }

    if (!enabled || !departDate) return;

    const prevDepart = prevDatesRef.current.departDate;
    const prevReturn = prevDatesRef.current.returnDate;

    // Detect explicit change in departDate or returnDate
    const departChanged = prevDepart !== null && prevDepart !== departDate;
    const returnChanged = prevReturn !== null && prevReturn !== returnDate;
    const dateChanged = departChanged || returnChanged;

    if (dateChanged) {
      prevDatesRef.current = { departDate, returnDate };
      setIsRefreshing(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const dateLabel = returnDate ? `${departDate} ➔ ${returnDate}` : departDate;
        setGroundedDateRange(dateLabel);

        if (typeof onSearchFlights === 'function') {
          onSearchFlights({
            tripType,
            origin,
            destination,
            departDate,
            returnDate: tripType === 'round' ? returnDate : null,
            passengers,
            cabinClass,
            multiCityLegs,
            forceFresh: true,
            triggerReason: 'date_update',
            updatedField: departChanged ? 'departDate' : 'returnDate'
          });
        }

        setLastGroundedAt(new Date().toLocaleTimeString());
        setIsRefreshing(false);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [departDate, returnDate, origin, destination, tripType, cabinClass, passengers, multiCityLegs, onSearchFlights, debounceMs, enabled]);

  return {
    isRefreshing,
    lastGroundedAt,
    groundedDateRange
  };
}

export default useDateGroundedFlightSearch;
