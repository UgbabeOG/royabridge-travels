import React, { useState } from 'react';
import { Plane, Clock, ShieldCheck, Sparkles, Luggage, AlertCircle, ArrowRight, Filter, TrendingDown, Check } from 'lucide-react';
import { formatCurrency } from '../utils/pnrGenerator';

export default function RealTimeFlightResults({ 
  flights, 
  searchQuery, 
  loading, 
  error, 
  onSelectFlight,
  priceTrend,
  onCheckStatus
}) {
  const [sortBy, setSortBy] = useState('price'); // 'price' | 'duration' | 'departure'
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  if (!searchQuery && !loading && (!flights || flights.length === 0)) {
    return null;
  }

  // Filter & sort logic
  let filtered = Array.isArray(flights) ? [...flights] : [];

  if (selectedAirline !== 'ALL') {
    filtered = filtered.filter(f => f.airline.toLowerCase().includes(selectedAirline.toLowerCase()) || f.airlineCode === selectedAirline);
  }

  if (nonStopOnly) {
    filtered = filtered.filter(f => f.stops === 0);
  }

  if (sortBy === 'price') {
    filtered.sort((a, b) => a.royaPrice - b.royaPrice);
  } else if (sortBy === 'duration') {
    filtered.sort((a, b) => (parseInt(a.duration) || 8) - (parseInt(b.duration) || 8));
  }

  const uniqueAirlines = Array.from(new Set((flights || []).map(f => f.airlineCode)));

  return (
    <section id="realtime-results" style={{ padding: '40px 0 60px', position: 'relative' }}>
      <div className="container">
        
        {/* Loading State Skeleton & Scanner Animation */}
        {loading && (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center', background: '#0E1526' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(229,193,88,0.3) 0%, rgba(16,185,129,0.2) 100%)',
              border: '2px solid var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'spin 2s linear infinite'
            }}>
              <Plane size={32} color="var(--color-gold-bright)" />
            </div>

            <h3 className="font-royal" style={{ fontSize: '1.5rem', color: '#FFF', marginBottom: '10px' }}>
              Querying Real-Time Airline Inventory...
            </h3>
            <p style={{ color: '#CBD5E1', maxWidth: '520px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
              Scanning Global Distribution Systems (GDS) for live flight schedules from <strong>{searchQuery?.origin || 'Origin'}</strong> to <strong>{searchQuery?.destination || 'Destination'}</strong>...
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span className="gold-badge" style={{ fontSize: '0.8rem' }}>
                <Sparkles size={14} /> Live Price Comparison Active
              </span>
              <span className="gold-badge" style={{ fontSize: '0.8rem' }}>
                <ShieldCheck size={14} /> Applying 30% Concierge Discount
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid #EF4444' }}>
            <AlertCircle size={36} color="#EF4444" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '8px' }}>Unable to load live flight data</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* Results View */}
        {!loading && !error && filtered && (
          <div>
            
            {/* Results Header */}
            <div className="glass-card" style={{
              padding: '24px 28px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.95) 0%, rgba(7, 11, 20, 0.98) 100%)',
              border: '1.5px solid var(--border-gold)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.05em' }}>
                      REAL-TIME FLIGHT INVENTORY FOUND ({filtered.length} OPTIONS)
                    </span>
                  </div>
                  <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.6rem' }}>
                    {searchQuery?.origin || 'Origin'} → {searchQuery?.destination || 'Destination'}
                    <span style={{ fontSize: '1rem', color: 'var(--color-gold-bright)', marginLeft: '12px', fontWeight: 400 }}>
                      • {searchQuery?.cabinClass || 'Business'} Class
                    </span>
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowTrend(!showTrend)}
                    className="btn-outline-gold"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <TrendingDown size={16} />
                    {showTrend ? 'Hide Price Trends' : 'View 7-Day Price Trends'}
                  </button>
                </div>
              </div>

              {/* Price Trend Interactive Graph */}
              {showTrend && priceTrend && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(229,193,88,0.15)',
                  background: 'rgba(7, 11, 20, 0.6)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <h4 style={{ color: 'var(--color-gold-bright)', fontSize: '0.92rem', fontWeight: 700 }}>
                      7-Day Airfare Outlook ({searchQuery?.origin} - {searchQuery?.destination})
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#6EE7B7', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                      💡 Tip: {priceTrend.priceAdvice}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '10px 0' }}>
                    {priceTrend.trend.map((t, idx) => (
                      <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-bright)', fontWeight: 700, marginBottom: '4px' }}>
                          ${t.royaPrice}
                        </div>
                        <div style={{
                          height: `${Math.max(25, (t.royaPrice / 1500) * 70)}px`,
                          background: t.isCheapest 
                            ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)' 
                            : 'linear-gradient(180deg, #E5C158 0%, #B89025 100%)',
                          borderRadius: '4px',
                          margin: '0 auto',
                          width: '28px',
                          boxShadow: t.isCheapest ? '0 0 12px rgba(16,185,129,0.5)' : 'none'
                        }} />
                        <span style={{ fontSize: '0.75rem', color: t.isCheapest ? '#6EE7B7' : '#94A3B8', display: 'block', marginTop: '6px', fontWeight: t.isCheapest ? 800 : 500 }}>
                          {t.day} {t.isCheapest ? '⭐' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sorting & Filter Controls Bar */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={14} /> Sort:
                  </span>
                  <button
                    onClick={() => setSortBy('price')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: sortBy === 'price' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      background: sortBy === 'price' ? 'rgba(229,193,88,0.2)' : 'transparent',
                      color: sortBy === 'price' ? 'var(--color-gold-bright)' : '#94A3B8',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Lowest Concierge Price
                  </button>
                  <button
                    onClick={() => setSortBy('duration')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: sortBy === 'duration' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      background: sortBy === 'duration' ? 'rgba(229,193,88,0.2)' : 'transparent',
                      color: sortBy === 'duration' ? 'var(--color-gold-bright)' : '#94A3B8',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Fastest Duration
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={nonStopOnly}
                      onChange={(e) => setNonStopOnly(e.target.checked)}
                      style={{ accentColor: 'var(--color-gold)' }}
                    />
                    Direct Flights Only
                  </label>
                </div>
              </div>

            </div>

            {/* Flight Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filtered.map((flight) => (
                <div 
                  key={flight.id || flight.flightNumber}
                  className="glass-card"
                  style={{
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.9) 0%, rgba(7, 11, 20, 0.95) 100%)',
                    border: '1px solid rgba(229, 193, 88, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    
                    {/* Airline Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.6rem' }}>{flight.logo || '✈️'}</span>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: '#FFF', display: 'block' }}>
                            {flight.airline}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', background: 'rgba(229,193,88,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {flight.flightNumber} • {flight.aircraft || 'Boeing 787'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8' }}>
                        <Luggage size={14} color="var(--color-gold)" />
                        {flight.baggageIncluded}
                      </div>
                    </div>

                    {/* Departure & Arrival Schedule */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{flight.departTime}</span>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8' }}>{flight.origin}</span>
                        </div>

                        <div style={{ flex: 1, padding: '0 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block' }}>{flight.duration}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(229,193,88,0.4)' }} />
                            <Plane size={14} color="var(--color-gold)" />
                            <div style={{ flex: 1, height: '1px', background: 'rgba(229,193,88,0.4)' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: flight.stops === 0 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                            {flight.stops === 0 ? 'Nonstop Direct' : `1 Stop (${flight.stopLocation || 'Transit'})`}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{flight.arriveTime}</span>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8' }}>{flight.destination}</span>
                        </div>
                      </div>

                      {flight.seatsRemaining && (
                        <span style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600 }}>
                          🔥 Only {flight.seatsRemaining} seats left at this price
                        </span>
                      )}
                    </div>

                    {/* Price & Concierge CTA */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      background: 'rgba(7, 11, 20, 0.6)',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(229,193,88,0.2)'
                    }}>
                      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through', display: 'block' }}>
                          Public Fare: {formatCurrency(flight.retailPrice)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-gold-bright)' }}>
                            {formatCurrency(flight.royaPrice)}
                          </span>
                          <span style={{ fontSize: '0.75rem', background: '#10B981', color: '#070B14', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            SAVE 30%
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#6EE7B7', display: 'block', marginTop: '2px' }}>
                          ✓ Free 24h PNR Hold • $0 Paid Today
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectFlight(flight)}
                        className="btn-gold"
                        style={{ width: '100%', padding: '10px 20px', fontSize: '0.9rem' }}
                      >
                        <ShieldCheck size={16} />
                        Reserve Flight Before Payment
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
