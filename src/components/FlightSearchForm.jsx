import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Calendar, Users, Shield, ArrowRightLeft, Sparkles, Activity, Search, History, Clock, ArrowRight, Tag, Globe, Plus, Trash2, MapPin } from 'lucide-react';
import { POPULAR_AIRPORTS, INTERCITY_ROUTES } from '../data/destinations';
import { calculateSavings, formatCurrency } from '../utils/pnrGenerator';
import SearchableAirportSelect from './SearchableAirportSelect';

export default function FlightSearchForm({ onSearchFlights, loading, currency = 'USD', onCurrencyChange }) {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayStr();

  const [tripType, setTripType] = useState('round'); // 'round' | 'oneWay' | 'multiCity'
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LHR');
  const [departDate, setDepartDate] = useState(() => {
    const defaultDate = '2026-08-15';
    return defaultDate < todayStr ? todayStr : defaultDate;
  });
  const [returnDate, setReturnDate] = useState(() => {
    const defaultReturn = '2026-08-29';
    const minDep = '2026-08-15' < todayStr ? todayStr : '2026-08-15';
    return defaultReturn < minDep ? minDep : defaultReturn;
  });
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showPaxPopover, setShowPaxPopover] = useState(false);
  const [shakePaxPopover, setShakePaxPopover] = useState(false);

  const triggerShakePax = () => {
    setShakePaxPopover(true);
    setTimeout(() => setShakePaxPopover(false), 500);
  };

  const passengers = adults + childrenCount + infants;
  const [cabinClass, setCabinClass] = useState('Business');
  const [reserveBeforePayment, setReserveBeforePayment] = useState(true);

  // Multi-city legs state
  const [multiCityLegs, setMultiCityLegs] = useState([
    { id: 1, origin: 'JFK', destination: 'LHR', date: '2026-08-15' < todayStr ? todayStr : '2026-08-15' },
    { id: 2, origin: 'LHR', destination: 'DXB', date: '2026-08-22' < todayStr ? todayStr : '2026-08-22' }
  ]);

  const handleDepartDateChange = (val) => {
    if (!val) return;
    const chosen = val < todayStr ? todayStr : val;
    setDepartDate(chosen);
    if (returnDate < chosen) {
      setReturnDate(chosen);
    }
  };

  const handleReturnDateChange = (val) => {
    if (!val) return;
    const minRet = departDate || todayStr;
    const chosen = val < minRet ? minRet : val;
    setReturnDate(chosen);
  };

  // Recent Searches state (last 3 queries persisted in localStorage)
  const [recentSearches, setRecentSearches] = useState([]);
  const [airports, setAirports] = useState(POPULAR_AIRPORTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('royabridge_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 3));
        }
      }
    } catch (err) {
      console.warn('Failed to load recent searches:', err);
    }
  }, []);

  useEffect(() => {
    async function loadAirports() {
      try {
        const res = await fetch('/api/airports');
        const data = await res.json();
        if (data.success && Array.isArray(data.airports)) {
          setAirports(data.airports);
        }
      } catch (err) {
        console.warn('Failed to load dynamic airports database, falling back to static roster:', err);
      }
    }
    loadAirports();
  }, []);

  const saveRecentSearch = useCallback((searchItem) => {
    try {
      setRecentSearches(prev => {
        const updated = [
          searchItem,
          ...prev.filter(s => !(s.origin === searchItem.origin && s.destination === searchItem.destination && s.cabinClass === searchItem.cabinClass))
        ].slice(0, 3);
        localStorage.setItem('royabridge_recent_searches', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.warn('Failed to persist recent search:', err);
    }
  }, []);

  // Dynamic estimate calculation
  const legMultiplier = tripType === 'multiCity' ? multiCityLegs.length : (tripType === 'round' ? 2 : 1);
  const baseEstimate = cabinClass === 'Business' ? 1450 : (cabinClass === 'First' ? 2800 : 750);
  const totalBase = baseEstimate * passengers * (legMultiplier / (tripType === 'round' ? 2 : 1));
  const savings = calculateSavings(totalBase, cabinClass);

  const handleAddLeg = () => {
    if (multiCityLegs.length >= 5) return;
    const lastLeg = multiCityLegs[multiCityLegs.length - 1];
    const newOrigin = lastLeg ? lastLeg.destination : 'LHR';
    const nextDate = lastLeg ? new Date(new Date(lastLeg.date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '2026-08-29';
    
    setMultiCityLegs([
      ...multiCityLegs,
      { id: Date.now(), origin: newOrigin, destination: 'HND', date: nextDate }
    ]);
  };

  const handleRemoveLeg = (id) => {
    if (multiCityLegs.length <= 2) return;
    setMultiCityLegs(multiCityLegs.filter(leg => leg.id !== id));
  };

  const handleUpdateLeg = (id, field, value) => {
    setMultiCityLegs(multiCityLegs.map(leg => {
      if (leg.id === id) {
        return { ...leg, [field]: value };
      }
      return leg;
    }));
  };

  const executeSearch = useCallback((params = {}) => {
    const tType = params.tripType || tripType;
    const cabin = params.cabinClass || cabinClass;
    const pax = params.passengers || passengers;

    let originCode = params.origin || origin;
    let destCode = params.destination || destination;
    let depDate = params.departDate || departDate;
    let retDate = params.returnDate || returnDate;
    let legsPayload = null;

    if (tType === 'multiCity') {
      legsPayload = multiCityLegs.map(leg => {
        const oObj = airports.find(a => a.code === leg.origin) || { code: leg.origin, city: leg.origin };
        const dObj = airports.find(a => a.code === leg.destination) || { code: leg.destination, city: leg.destination };
        return {
          ...leg,
          originObj: oObj,
          destObj: dObj
        };
      });
      originCode = legsPayload[0].origin;
      destCode = legsPayload[legsPayload.length - 1].destination;
      depDate = legsPayload[0].date;
    }

    const originObj = airports.find(a => a.code === originCode) || { code: originCode, city: originCode, name: originCode };
    const destObj = airports.find(a => a.code === destCode) || { code: destCode, city: destCode, name: destCode };

    const paxBreakdown = params.passengerBreakdown || { adults, children: childrenCount, infants };

    const searchPayload = {
      tripType: tType,
      origin: originCode,
      destination: destCode,
      originObj,
      destObj,
      departDate: depDate,
      returnDate: tType === 'round' ? retDate : null,
      passengers: pax,
      passengerBreakdown: paxBreakdown,
      cabinClass: cabin,
      reserveBeforePayment,
      savings,
      legs: legsPayload,
      forceFresh: params.forceFresh !== undefined ? params.forceFresh : true,
      triggerReason: params.triggerReason || 'manual_submit'
    };

    // Persist to recent searches
    saveRecentSearch({
      id: Date.now(),
      origin: originCode,
      destination: destCode,
      originCity: originObj.city || originCode,
      destCity: destObj.city || destCode,
      departDate: depDate,
      returnDate: tType === 'round' ? retDate : null,
      cabinClass: cabin,
      tripType: tType,
      passengers: pax,
      passengerBreakdown: paxBreakdown,
      legsCount: legsPayload ? legsPayload.length : null
    });

    onSearchFlights(searchPayload);
  }, [tripType, cabinClass, passengers, adults, childrenCount, infants, origin, destination, departDate, returnDate, multiCityLegs, airports, reserveBeforePayment, savings, onSearchFlights, saveRecentSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch({ origin, destination, departDate, returnDate, tripType, passengers, cabinClass });
  };

  const handleSelectRecent = (recent) => {
    setOrigin(recent.origin);
    setDestination(recent.destination);
    setDepartDate(recent.departDate || '2026-08-15');
    if (recent.returnDate) setReturnDate(recent.returnDate);
    setCabinClass(recent.cabinClass || 'Business');
    if (recent.tripType) setTripType(recent.tripType);
    if (recent.passengers) setPassengers(recent.passengers);

    executeSearch(recent);
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <section id="reserve" style={{ padding: '60px 0', position: 'relative' }}>
      <div className="container">
        
        <div className="glass-card" style={{
          padding: '32px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(229, 193, 88, 0.2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
          overflow: 'visible'
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
            borderBottom: '1px solid rgba(229, 193, 88, 0.15)',
            paddingBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTripType('round')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: tripType === 'round' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: tripType === 'round' ? 'rgba(229, 193, 88, 0.2)' : 'transparent',
                  color: tripType === 'round' ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => setTripType('oneWay')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: tripType === 'oneWay' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: tripType === 'oneWay' ? 'rgba(229, 193, 88, 0.2)' : 'transparent',
                  color: tripType === 'oneWay' ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('multiCity')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: tripType === 'multiCity' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: tripType === 'multiCity' ? 'rgba(229, 193, 88, 0.2)' : 'transparent',
                  color: tripType === 'multiCity' ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Multi-City
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Currency Selector Dropdown */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid var(--border-gold)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                <Globe size={15} color="var(--color-gold)" />
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Currency:</span>
                <select 
                  value={currency} 
                  onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
                  style={{
                    background: 'transparent',
                    color: 'var(--color-gold-bright)',
                    border: 'none',
                    outline: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    paddingRight: '2px'
                  }}
                  id="currency-selector"
                  aria-label="Select Currency"
                >
                  <option value="USD" style={{ background: '#0F172A', color: '#FFF' }}>USD ($)</option>
                  <option value="EUR" style={{ background: '#0F172A', color: '#FFF' }}>EUR (€)</option>
                  <option value="GBP" style={{ background: '#0F172A', color: '#FFF' }}>GBP (£)</option>
                </select>
              </div>

              <span className="gold-badge" style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
                <Shield size={14} color="var(--color-gold)" />
                Reserve Before Payment Enabled
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Popular Inter-City Quick Route Selector Bar */}
            <div style={{
              marginBottom: '18px',
              padding: '12px 16px',
              background: 'rgba(7, 11, 20, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(229, 193, 88, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--color-gold-bright)',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                <MapPin size={14} color="var(--color-gold)" />
                Inter-City Quick Routes:
              </div>

              <div className="no-scrollbar" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                width: '100%',
                flex: 1,
                paddingBottom: '2px'
              }}>
                {INTERCITY_ROUTES.map(route => {
                  const isSelected = origin === route.origin && destination === route.destination;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => {
                        setOrigin(route.origin);
                        setDestination(route.destination);
                      }}
                      style={{
                        background: isSelected ? 'rgba(229, 193, 88, 0.25)' : 'rgba(15, 23, 42, 0.9)',
                        border: isSelected ? '1px solid var(--color-gold-bright)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? 'var(--color-gold-bright)' : '#E2E8F0',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0
                      }}
                    >
                      <Plane size={12} color={isSelected ? 'var(--color-gold-bright)' : '#94A3B8'} />
                      <span>{route.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Standard Single/Round Form Fields */}
            {tripType !== 'multiCity' ? (
              <div className="search-form-grid">
                
                {/* Origin */}
                <div>
                  <SearchableAirportSelect
                    label="From (Origin)"
                    value={origin}
                    onChange={(val) => setOrigin(val)}
                    airports={airports}
                    placeholder="Search origin city, airport or code..."
                    icon={(props) => <Plane {...props} style={{ transform: 'rotate(-45deg)' }} />}
                  />
                </div>

                {/* Swap Button */}
                <div className="swap-btn-col">
                  <button
                    type="button"
                    onClick={swapLocations}
                    title="Swap Origin & Destination"
                    style={{
                      background: 'rgba(229, 193, 88, 0.15)',
                      border: '1px solid var(--border-gold)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gold-bright)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </div>

                {/* Destination */}
                <div>
                  <SearchableAirportSelect
                    label="To (Destination)"
                    value={destination}
                    onChange={(val) => setDestination(val)}
                    airports={airports}
                    placeholder="Search destination city, airport or code..."
                    icon={(props) => <Plane {...props} style={{ transform: 'rotate(45deg)' }} />}
                  />
                </div>

                {/* Departure Date */}
                <div>
                  <label style={labelStyle}>Departure Date</label>
                  <div style={inputContainerStyle}>
                    <Calendar size={18} color="var(--color-gold)" />
                    <input 
                      type="date" 
                      min={todayStr}
                      value={departDate} 
                      onChange={(e) => handleDepartDateChange(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Return Date */}
                {tripType === 'round' && (
                  <div>
                    <label style={labelStyle}>Return Date</label>
                    <div style={inputContainerStyle}>
                      <Calendar size={18} color="var(--color-gold)" />
                      <input 
                        type="date" 
                        min={departDate || todayStr}
                        value={returnDate} 
                        onChange={(e) => handleReturnDateChange(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Passengers & Cabin */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Passengers & Cabin</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Passengers Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setShowPaxPopover(!showPaxPopover)}
                      style={{
                        ...inputContainerStyle,
                        width: '55%',
                        cursor: 'pointer',
                        justifyContent: 'space-between',
                        padding: '0 12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <Users size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', color: '#FFF', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {passengers} Pax ({adults}A{childrenCount > 0 ? `, ${childrenCount}C` : ''}{infants > 0 ? `, ${infants}I` : ''})
                        </span>
                      </div>
                    </button>

                    {/* Cabin Class Selector */}
                    <div style={{ ...inputContainerStyle, width: '45%' }}>
                      <select 
                        value={cabinClass} 
                        onChange={(e) => setCabinClass(e.target.value)}
                        style={{ ...selectStyle, width: '100%' }}
                      >
                        <option value="Economy" style={{ background: '#0F172A' }}>Economy</option>
                        <option value="Premium Economy" style={{ background: '#0F172A' }}>Premium Eco</option>
                        <option value="Business" style={{ background: '#0F172A' }}>Business Class</option>
                        <option value="First" style={{ background: '#0F172A' }}>First Class</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-Passenger Selection Popover */}
                  {showPaxPopover && (
                    <div 
                      className={shakePaxPopover ? 'shake-error-container' : ''}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: '320px',
                        maxWidth: 'calc(100vw - 32px)',
                        zIndex: 300,
                        background: '#0B1120',
                        border: shakePaxPopover ? '1.5px solid #EF4444' : '1.5px solid var(--border-gold)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        boxShadow: shakePaxPopover ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 16px 40px rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-gold-bright)', fontWeight: 700, borderBottom: '1px solid rgba(229,193,88,0.2)', paddingBottom: '8px' }}>
                        Select Passengers
                      </div>

                      {/* Adults Counter */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}>Adults</div>
                          <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Age 12+ years (Lead must be 18+)</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() => {
                              const newAdults = Math.max(1, adults - 1);
                              setAdults(newAdults);
                              if (infants > newAdults) setInfants(newAdults);
                            }}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-gold)',
                              background: adults <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(229,193,88,0.15)',
                              color: adults <= 1 ? '#475569' : '#FFF',
                              cursor: adults <= 1 ? 'not-allowed' : 'pointer',
                              fontWeight: 800
                            }}
                          >-</button>
                          <span style={{ color: '#FFF', fontWeight: 800, width: '18px', textAlign: 'center', fontSize: '0.88rem' }}>{adults}</span>
                          <button
                            type="button"
                            disabled={passengers >= 9}
                            onClick={() => setAdults(prev => prev + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-gold)',
                              background: passengers >= 9 ? 'rgba(255,255,255,0.05)' : 'rgba(229,193,88,0.15)',
                              color: passengers >= 9 ? '#475569' : '#FFF',
                              cursor: passengers >= 9 ? 'not-allowed' : 'pointer',
                              fontWeight: 800
                            }}
                          >+</button>
                        </div>
                      </div>

                      {/* Children Counter */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}>Children</div>
                          <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Age 2–11 years</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            disabled={childrenCount <= 0}
                            onClick={() => setChildrenCount(prev => Math.max(0, prev - 1))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-gold)',
                              background: childrenCount <= 0 ? 'rgba(255,255,255,0.05)' : 'rgba(229,193,88,0.15)',
                              color: childrenCount <= 0 ? '#475569' : '#FFF',
                              cursor: childrenCount <= 0 ? 'not-allowed' : 'pointer',
                              fontWeight: 800
                            }}
                          >-</button>
                          <span style={{ color: '#FFF', fontWeight: 800, width: '18px', textAlign: 'center', fontSize: '0.88rem' }}>{childrenCount}</span>
                          <button
                            type="button"
                            disabled={passengers >= 9}
                            onClick={() => setChildrenCount(prev => prev + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-gold)',
                              background: passengers >= 9 ? 'rgba(255,255,255,0.05)' : 'rgba(229,193,88,0.15)',
                              color: passengers >= 9 ? '#475569' : '#FFF',
                              cursor: passengers >= 9 ? 'not-allowed' : 'pointer',
                              fontWeight: 800
                            }}
                          >+</button>
                        </div>
                      </div>

                      {/* Infants Counter */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}>Infants</div>
                          <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Under 2 years (In lap/seat)</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            disabled={infants <= 0}
                            onClick={() => setInfants(prev => Math.max(0, prev - 1))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-gold)',
                              background: infants <= 0 ? 'rgba(255,255,255,0.05)' : 'rgba(229,193,88,0.15)',
                              color: infants <= 0 ? '#475569' : '#FFF',
                              cursor: infants <= 0 ? 'not-allowed' : 'pointer',
                              fontWeight: 800
                            }}
                          >-</button>
                          <span style={{ color: '#FFF', fontWeight: 800, width: '18px', textAlign: 'center', fontSize: '0.88rem' }}>{infants}</span>
                          <button
                            type="button"
                            disabled={infants >= adults || passengers >= 9}
                            onClick={() => setInfants(prev => Math.min(adults, prev + 1))}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-gold)',
                              background: (infants >= adults || passengers >= 9) ? 'rgba(255,255,255,0.05)' : 'rgba(229,193,88,0.15)',
                              color: (infants >= adults || passengers >= 9) ? '#475569' : '#FFF',
                              cursor: (infants >= adults || passengers >= 9) ? 'not-allowed' : 'pointer',
                              fontWeight: 800
                            }}
                          >+</button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPaxPopover(false)}
                        style={{
                          background: 'linear-gradient(135deg, #E5C158 0%, #B8902A 100%)',
                          color: '#070B14',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                      >
                        Apply Passenger Selection
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* Multi-City Form Builder */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-gold-bright)', fontWeight: 700 }}>
                    Configure Multi-City Flight Legs
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="var(--color-gold)" />
                      <select 
                        value={passengers} 
                        onChange={(e) => setPassengers(Number(e.target.value))}
                        style={{ ...selectStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                          <option key={n} value={n} style={{ background: '#0F172A' }}>{n} Pax</option>
                        ))}
                      </select>
                      <select 
                        value={cabinClass} 
                        onChange={(e) => setCabinClass(e.target.value)}
                        style={{ ...selectStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        <option value="Economy" style={{ background: '#0F172A' }}>Economy</option>
                        <option value="Premium Economy" style={{ background: '#0F172A' }}>Premium Eco</option>
                        <option value="Business" style={{ background: '#0F172A' }}>Business</option>
                        <option value="First" style={{ background: '#0F172A' }}>First</option>
                      </select>
                    </div>
                  </div>
                </div>

                {multiCityLegs.map((leg, index) => (
                  <div 
                    key={leg.id}
                    className="multicity-leg-grid"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--color-gold)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      Flight {index + 1}
                    </span>

                    {/* From */}
                    <div>
                      <SearchableAirportSelect
                        label="From"
                        value={leg.origin}
                        onChange={(val) => handleUpdateLeg(leg.id, 'origin', val)}
                        airports={airports}
                        placeholder="Search origin..."
                        icon={(props) => <Plane {...props} size={15} style={{ transform: 'rotate(-45deg)' }} />}
                      />
                    </div>

                    {/* To */}
                    <div>
                      <SearchableAirportSelect
                        label="To"
                        value={leg.destination}
                        onChange={(val) => handleUpdateLeg(leg.id, 'destination', val)}
                        airports={airports}
                        placeholder="Search destination..."
                        icon={(props) => <Plane {...props} size={15} style={{ transform: 'rotate(45deg)' }} />}
                      />
                    </div>

                    {/* Flight Date */}
                    <div>
                      <label style={labelStyle}>Date</label>
                      <div style={inputContainerStyle}>
                        <Calendar size={15} color="var(--color-gold)" />
                        <input
                          type="date"
                          min={index === 0 ? todayStr : (multiCityLegs[index - 1]?.date || todayStr)}
                          value={leg.date}
                          onChange={(e) => {
                            const minLeg = index === 0 ? todayStr : (multiCityLegs[index - 1]?.date || todayStr);
                            const val = e.target.value < minLeg ? minLeg : e.target.value;
                            handleUpdateLeg(leg.id, 'date', val);
                          }}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Remove Leg Button */}
                    <div style={{ marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveLeg(leg.id)}
                        disabled={multiCityLegs.length <= 2}
                        style={{
                          background: multiCityLegs.length <= 2 ? 'transparent' : 'rgba(239, 68, 68, 0.15)',
                          border: multiCityLegs.length <= 2 ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(239, 68, 68, 0.3)',
                          color: multiCityLegs.length <= 2 ? '#475569' : '#FCA5A5',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px',
                          cursor: multiCityLegs.length <= 2 ? 'not-allowed' : 'pointer'
                        }}
                        title="Remove flight leg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Leg Button */}
                {multiCityLegs.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddLeg}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(229, 193, 88, 0.1)',
                      border: '1px border-dashed var(--border-gold)',
                      color: 'var(--color-gold-bright)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    <Plus size={16} /> Add Flight Leg
                  </button>
                )}
              </div>
            )}

            {/* Recent Searches Bar (horizontal scrollable, max 3 queries) */}
            {recentSearches && recentSearches.length > 0 && (
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px dashed rgba(229, 193, 88, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--color-gold-bright)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}>
                  <History size={14} color="var(--color-gold)" />
                  Recent Searches:
                </div>

                <div 
                  className="no-scrollbar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '2px',
                    width: '100%'
                  }}
                >
                  {recentSearches.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleSelectRecent(item)}
                      style={{
                        background: 'rgba(7, 11, 20, 0.85)',
                        border: '1px solid rgba(229, 193, 88, 0.35)',
                        borderRadius: 'var(--radius-full)',
                        padding: '6px 14px',
                        color: '#FFF',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold-bright)';
                        e.currentTarget.style.background = 'rgba(229, 193, 88, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.35)';
                        e.currentTarget.style.background = 'rgba(7, 11, 20, 0.85)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Clock size={12} color="var(--color-gold)" />
                      <span>{item.origin} → {item.destination}</span>
                      <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>• {item.cabinClass}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Bar: Action Button */}
            <div style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(229, 193, 88, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              {/* Submit CTA */}
              <button 
                type="submit"
                className="btn-gold"
                style={{ padding: '16px 40px', fontSize: '1.05rem', minWidth: '280px' }}
                disabled={loading}
              >
                {loading ? <Activity className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Searching Live Inventory...' : 'Search Real-Time Flights & Prices'}
              </button>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: '600',
  color: 'var(--color-gold-bright)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px'
};

const inputContainerStyle = {
  background: 'rgba(7, 11, 20, 0.8)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const selectStyle = {
  background: 'transparent',
  border: 'none',
  color: '#F8FAFC',
  fontSize: '0.95rem',
  fontWeight: '500',
  outline: 'none',
  width: '100%',
  cursor: 'pointer'
};

const inputStyle = {
  background: 'transparent',
  border: 'none',
  color: '#F8FAFC',
  fontSize: '0.95rem',
  fontWeight: '500',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark'
};
