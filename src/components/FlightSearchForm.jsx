import React, { useState } from 'react';
import { Plane, Calendar, Users, Shield, ArrowRightLeft, Sparkles, Activity, Search } from 'lucide-react';
import { POPULAR_AIRPORTS } from '../data/destinations';
import { calculateSavings, formatCurrency } from '../utils/pnrGenerator';

export default function FlightSearchForm({ onSearchFlights, loading }) {
  const [tripType, setTripType] = useState('round');
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LHR');
  const [departDate, setDepartDate] = useState('2026-08-15');
  const [returnDate, setReturnDate] = useState('2026-08-29');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Business');
  const [reserveBeforePayment, setReserveBeforePayment] = useState(true);

  // Dynamic estimate calculation
  const baseEstimate = cabinClass === 'Business' ? 1450 : (cabinClass === 'First' ? 2800 : 750);
  const totalBase = baseEstimate * passengers;
  const savings = calculateSavings(totalBase, cabinClass);

  const handleSubmit = (e) => {
    e.preventDefault();
    const originObj = POPULAR_AIRPORTS.find(a => a.code === origin) || { code: origin, city: origin, name: origin };
    const destObj = POPULAR_AIRPORTS.find(a => a.code === destination) || { code: destination, city: destination, name: destination };

    onSearchFlights({
      tripType,
      origin,
      destination,
      originObj,
      destObj,
      departDate,
      returnDate: tripType === 'round' ? returnDate : null,
      passengers,
      cabinClass,
      reserveBeforePayment,
      savings
    });
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="gold-badge" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
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

            {/* Bottom Bar: Savings Calculator + Action Button */}
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(229, 193, 88, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              {/* Dynamic Price Preview Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  padding: '12px 20px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#6EE7B7', display: 'block', fontWeight: 600 }}>
                    ESTIMATED CONCIERGE PRICE
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                      {formatCurrency(savings.finalPrice)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                      {formatCurrency(savings.originalPrice)}
                    </span>
                    <span style={{
                      fontSize: '0.78rem',
                      background: 'var(--color-gold)',
                      color: '#070B14',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 800
                    }}>
                      SAVE {savings.savingsPercentage}%
                    </span>
                  </div>
                </div>
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
