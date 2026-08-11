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
  debounceMs = 450,
  enabled = true
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastGroundedAt, setLastGroundedAt] = useState(null);
  const [groundedDateRange, setGroundedDateRange] = useState('');
  
  const prevParamsRef = useRef({
    departDate: null,
    returnDate: null,
    origin: null,
    destination: null,
    tripType: null,
    cabinClass: null,
    passengers: null
  });
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip firing on initial render unless params differ
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevParamsRef.current = { departDate, returnDate, origin, destination, tripType, cabinClass, passengers };
      setGroundedDateRange(returnDate ? `${departDate} ➔ ${returnDate}` : departDate);
      return;
    }

    if (!enabled || !departDate) return;

    const prev = prevParamsRef.current;

    // Detect explicit change in ANY search parameter
    const departChanged = prev.departDate !== null && prev.departDate !== departDate;
    const returnChanged = prev.returnDate !== null && prev.returnDate !== returnDate;
    const originChanged = prev.origin !== null && prev.origin !== origin;
    const destChanged = prev.destination !== null && prev.destination !== destination;
    const classChanged = prev.cabinClass !== null && prev.cabinClass !== cabinClass;
    const paxChanged = prev.passengers !== null && prev.passengers !== passengers;
    const typeChanged = prev.tripType !== null && prev.tripType !== tripType;

    const paramChanged = departChanged || returnChanged || originChanged || destChanged || classChanged || paxChanged || typeChanged;

    if (paramChanged) {
      prevParamsRef.current = { departDate, returnDate, origin, destination, tripType, cabinClass, passengers };
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
            triggerReason: 'parameter_update'
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
