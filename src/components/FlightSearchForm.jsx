import React, { useState, useEffect } from 'react';
import { Plane, Calendar, Users, Shield, ArrowRightLeft, Sparkles, Activity, Search, History, Clock, ArrowRight, Tag, Globe } from 'lucide-react';
import { POPULAR_AIRPORTS } from '../data/destinations';
import { calculateSavings, formatCurrency } from '../utils/pnrGenerator';

export default function FlightSearchForm({ onSearchFlights, loading, currency = 'USD', onCurrencyChange }) {
  const [tripType, setTripType] = useState('round');
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LHR');
  const [departDate, setDepartDate] = useState('2026-08-15');
  const [returnDate, setReturnDate] = useState('2026-08-29');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Business');
  const [reserveBeforePayment, setReserveBeforePayment] = useState(true);

  // Recent Searches state (last 3 queries persisted in localStorage)
  const [recentSearches, setRecentSearches] = useState([]);

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

  const saveRecentSearch = (searchItem) => {
    try {
      const updated = [
        searchItem,
        ...recentSearches.filter(s => !(s.origin === searchItem.origin && s.destination === searchItem.destination && s.cabinClass === searchItem.cabinClass))
      ].slice(0, 3);
      setRecentSearches(updated);
      localStorage.setItem('royabridge_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist recent search:', err);
    }
  };

  // Dynamic estimate calculation
  const baseEstimate = cabinClass === 'Business' ? 1450 : (cabinClass === 'First' ? 2800 : 750);
  const totalBase = baseEstimate * passengers;
  const savings = calculateSavings(totalBase, cabinClass);

  const executeSearch = (params) => {
    const originCode = params.origin || origin;
    const destCode = params.destination || destination;
    const cabin = params.cabinClass || cabinClass;
    const depDate = params.departDate || departDate;
    const retDate = params.returnDate || returnDate;
    const tType = params.tripType || tripType;
    const pax = params.passengers || passengers;

    const originObj = POPULAR_AIRPORTS.find(a => a.code === originCode) || { code: originCode, city: originCode, name: originCode };
    const destObj = POPULAR_AIRPORTS.find(a => a.code === destCode) || { code: destCode, city: destCode, name: destCode };

    const searchPayload = {
      tripType: tType,
      origin: originCode,
      destination: destCode,
      originObj,
      destObj,
      departDate: depDate,
      returnDate: tType === 'round' ? retDate : null,
      passengers: pax,
      cabinClass: cabin,
      reserveBeforePayment,
      savings
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
      passengers: pax
    });

    onSearchFlights(searchPayload);
  };

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
          padding: '36px 32px',
          background: 'linear-gradient(180deg, rgba(14, 21, 38, 0.95) 0%, rgba(7, 11, 20, 0.95) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)'
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
            <div style={{ display: 'flex', gap: '12px' }}>
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
            {/* Main Flight Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}>
              
              {/* Origin */}
              <div>
                <label style={labelStyle}>From (Origin)</label>
                <div style={inputContainerStyle}>
                  <Plane size={18} color="var(--color-gold)" style={{ transform: 'rotate(-45deg)' }} />
                  <select 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)}
                    style={selectStyle}
                  >
                    {POPULAR_AIRPORTS.map(ap => (
                      <option key={ap.code} value={ap.code} style={{ background: '#0F172A', color: '#FFF' }}>
                        {ap.city} ({ap.code}) - {ap.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
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
                <label style={labelStyle}>To (Destination)</label>
                <div style={inputContainerStyle}>
                  <Plane size={18} color="var(--color-gold)" style={{ transform: 'rotate(45deg)' }} />
                  <select 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    style={selectStyle}
                  >
                    {POPULAR_AIRPORTS.map(ap => (
                      <option key={ap.code} value={ap.code} style={{ background: '#0F172A', color: '#FFF' }}>
                        {ap.city} ({ap.code}) - {ap.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <label style={labelStyle}>Departure Date</label>
                <div style={inputContainerStyle}>
                  <Calendar size={18} color="var(--color-gold)" />
                  <input 
                    type="date" 
                    value={departDate} 
                    onChange={(e) => setDepartDate(e.target.value)}
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
                      value={returnDate} 
                      onChange={(e) => setReturnDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Passengers & Cabin */}
              <div>
                <label style={labelStyle}>Passengers & Cabin</label>
                <div style={inputContainerStyle}>
                  <Users size={18} color="var(--color-gold)" />
                  <select 
                    value={passengers} 
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    style={{ ...selectStyle, width: '45%' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <option key={n} value={n} style={{ background: '#0F172A' }}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                  <select 
                    value={cabinClass} 
                    onChange={(e) => setCabinClass(e.target.value)}
                    style={{ ...selectStyle, width: '55%' }}
                  >
                    <option value="Economy" style={{ background: '#0F172A' }}>Economy</option>
                    <option value="Premium Economy" style={{ background: '#0F172A' }}>Premium Eco</option>
                    <option value="Business" style={{ background: '#0F172A' }}>Business Class</option>
                    <option value="First" style={{ background: '#0F172A' }}>First Class</option>
                  </select>
                </div>
              </div>

            </div>

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

            {/* Bottom Bar: High-Visibility Price Comparison + Action Button */}
            <div style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(229, 193, 88, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              {/* High Impact Public Fare vs RoyaBridge Concierge Fare Comparison Box */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(7, 11, 20, 0.95) 0%, rgba(14, 21, 38, 0.95) 100%)',
                border: '1.5px solid #10B981',
                borderRadius: 'var(--radius-md)',
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>
                    PUBLIC AIRFARE (STANDARD)
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EF4444', textDecoration: 'line-through' }}>
                    {formatCurrency(savings.originalPrice, currency)}
                  </span>
                </div>

                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.15)' }} />

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, display: 'block' }}>
                    ROYABRIDGE CONCIERGE FARE
                  </span>
                  <span style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '-0.02em' }}>
                    {formatCurrency(savings.finalPrice, currency)}
                  </span>
                </div>

                <span style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFF',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  whiteSpace: 'nowrap'
                }}>
                  YOU SAVE {formatCurrency(savings.discountAmount, currency)} ({savings.savingsPercentage}% OFF)
                </span>
              </div>

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
