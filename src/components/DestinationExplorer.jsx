import React, { useState, useEffect } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { formatCurrency } from '../utils/pnrGenerator';
import { Plane, Tag, Sparkles, Database, ShieldCheck, RefreshCw } from 'lucide-react';

export default function DestinationExplorer({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [serverVerified, setServerVerified] = useState(false);

  useEffect(() => {
    async function fetchServerDestinations() {
      try {
        setLoading(true);
        const res = await fetch('/api/destinations');
        const data = await res.json();
        if (data.success && Array.isArray(data.destinations)) {
          setDestinations(data.destinations);
          setServerVerified(true);
        } else {
          setDestinations(DESTINATIONS);
        }
      } catch (err) {
        console.warn('Failed to fetch backend destination database, using fallback:', err);
        setDestinations(DESTINATIONS);
      } finally {
        setLoading(false);
      }
    }

    fetchServerDestinations();
  }, []);

  const handleSelectWithValidation = async (dest) => {
    try {
      // Validate prices with backend API before passing selection to parent
      const valRes = await fetch('/api/destinations/validate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: dest.id,
          passengers: 1,
          cabinClass: 'Business'
        })
      });

      const valData = await valRes.json();
      if (valData.success && valData.pricing) {
        // Use backend validated price object
        const validatedDest = {
          ...dest,
          retailPrice: valData.pricing.retailPrice,
          royaPrice: valData.pricing.royaPrice,
          serverVerified: true
        };
        onSelectDestination(validatedDest);
      } else {
        onSelectDestination(dest);
      }
    } catch (e) {
      onSelectDestination(dest);
    }
  };

  const filteredDestinations = destinations.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Popular') return item.popular;
    return item.region === filter;
  });

  return (
    <section id="destinations" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="gold-badge">Popular Worldwide Destinations</span>
          <h2>Top Global Routes with Up to 30% Savings</h2>
          <p>
            Explore our featured international and domestic flight destinations. Select any city to lock in your concierge rate.
          </p>
        </div>

        {/* Region Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {['All', 'Popular', 'Europe', 'Middle East', 'Asia', 'Americas', 'Africa'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: filter === tab ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                background: filter === tab ? 'linear-gradient(135deg, rgba(229, 193, 88, 0.25) 0%, rgba(184, 144, 37, 0.15) 100%)' : 'rgba(15, 23, 42, 0.6)',
                color: filter === tab ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: 'var(--color-gold)' }}>
            <RefreshCw className="animate-spin" size={28} style={{ marginRight: '12px' }} />
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Loading backend price database...</span>
          </div>
        ) : (
          /* Destination Cards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filteredDestinations.map(dest => (
              <div 
                key={dest.id} 
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectWithValidation(dest)}
              >
                {/* Image & Badge Header */}
                <div style={{
                  position: 'relative',
                  height: '200px',
                  backgroundImage: `url('${dest.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,11,20,0.85) 100%)'
                  }} />
                  
                  {/* Discount Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #F5D77F 0%, #E5C158 100%)',
                    color: '#070B14',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    SAVE {dest.discount}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '16px',
                    right: '16px'
                  }}>
                    <h3 style={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 700 }}>
                      {dest.name}
                    </h3>
                    <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {dest.airport} • {dest.tagline}
                    </span>
                  </div>
                </div>

                {/* Price Details Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                        Retail Fare: <strike>{formatCurrency(dest.retailPrice)}</strike>
                      </span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                        {formatCurrency(dest.royaPrice)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 600 }}>
                      Concierge Deal
                    </span>
                  </div>

                  <button 
                    className="btn-outline-gold"
                    style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                  >
                    <Plane size={15} />
                    Reserve This Route
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

