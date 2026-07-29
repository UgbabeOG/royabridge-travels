import React, { useState } from 'react';
import { Search, ShieldCheck, X, Clock, Plane, Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/pnrGenerator';

export default function BookingTracker({ isOpen, onClose, onOpenChat }) {
  const [tab, setTab] = useState('pnr'); // 'pnr' | 'flight'
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState(null);
  const [flightStatus, setFlightStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePnrSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter a PNR code or email.');
      return;
    }
    setError('');
    
    setResult({
      pnr: searchInput.toUpperCase(),
      passenger: 'Alex Morgan',
      route: 'JFK (New York) → LHR (London Heathrow)',
      status: 'CONFIRMED_HOLD',
      holdExpires: '23 Hours Remaining',
      totalFare: 805,
      savedAmount: 345,
      cabin: 'Business Class'
    });
  };

  const handleFlightStatusSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter a flight number (e.g. BA178, EK202, DL3).');
      return;
    }
    setError('');
    setLoading(true);
    setFlightStatus(null);

    try {
      const res = await fetch('/api/flights/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightNumber: searchInput })
      });
      const data = await res.json();
      if (data.success && data.status) {
        setFlightStatus(data.status);
      } else {
        setError(data.error || 'Flight status not found.');
      }
    } catch (err) {
      setError('Failed to reach real-time flight status API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '560px',
        width: '100%',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="var(--color-gold)" />
            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.4rem' }}>
              Flight Lookup & Tracking
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: 'rgba(7, 11, 20, 0.6)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('pnr'); setError(''); setResult(null); setFlightStatus(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'pnr' ? 'var(--color-gold)' : 'transparent',
              color: tab === 'pnr' ? '#070B14' : '#CBD5E1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Track PNR Hold
          </button>
          <button
            type="button"
            onClick={() => { setTab('flight'); setError(''); setResult(null); setFlightStatus(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'flight' ? 'var(--color-gold)' : 'transparent',
              color: tab === 'flight' ? '#070B14' : '#CBD5E1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Check Live Flight Status
          </button>
        </div>

        {/* PNR Tab */}
        {tab === 'pnr' && (
          <div>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '16px' }}>
              Enter your 6-character PNR reference code to inspect your locked itinerary status and hold countdown.
            </p>

            <form onSubmit={handlePnrSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="e.g. RB7X9Y or email@domain.com"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(7, 11, 20, 0.8)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '12px 20px' }}>
                <Search size={18} />
                Search
              </button>
            </form>

            {result && (
              <div style={{
                background: 'rgba(7, 11, 20, 0.8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>PNR Reference Code</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-gold-bright)' }}>{result.pnr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Passenger</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{result.passenger}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Route</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{result.route}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Hold Expiry</span>
                  <span style={{ color: '#6EE7B7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {result.holdExpires}
                  </span>
                </div>
                <button onClick={onOpenChat} className="btn-gold" style={{ width: '100%', padding: '10px' }}>
                  Chat With Flight Concierge Agent
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Flight Status Tab */}
        {tab === 'flight' && (
          <div>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '16px' }}>
              Check real-time flight status, departure terminal, gate, and schedule by flight number.
            </p>

            <form onSubmit={handleFlightStatusSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="e.g. BA178, EK202, DL3"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(7, 11, 20, 0.8)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '12px 20px' }} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Querying...' : 'Check Status'}
              </button>
            </form>

            {flightStatus && (
              <div style={{
                background: 'rgba(7, 11, 20, 0.8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-gold)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-bright)', fontWeight: 700 }}>LIVE FLIGHT DETAILS</span>
                    <h3 style={{ fontSize: '1.3rem', color: '#FFF', fontWeight: 800 }}>{flightStatus.flightNumber} ({flightStatus.airline})</h3>
                  </div>
                  <span style={{
                    background: flightStatus.status === 'On Time' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                    color: flightStatus.status === 'On Time' ? '#10B981' : '#F59E0B',
                    border: `1px solid ${flightStatus.status === 'On Time' ? '#10B981' : '#F59E0B'}`,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    {flightStatus.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem', color: '#CBD5E1' }}>
                  <div><strong>Route:</strong> {flightStatus.origin} → {flightStatus.destination}</div>
                  <div><strong>Aircraft:</strong> {flightStatus.aircraft}</div>
                  <div><strong>Terminal:</strong> {flightStatus.departureTerminal}</div>
                  <div><strong>Gate:</strong> {flightStatus.departureGate}</div>
                  <div><strong>Scheduled Dep:</strong> {flightStatus.scheduledDeparture}</div>
                  <div><strong>Est. Arrival:</strong> {flightStatus.estimatedArrival}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '16px' }}>{error}</p>
        )}

      </div>
    </div>
  );
}

