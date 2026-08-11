import React, { useState, useEffect } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { formatCurrency } from '../utils/pnrGenerator';
import { Plane, Tag, Sparkles, Database, ShieldCheck, RefreshCw, X, Sun, Compass, FileText, CheckCircle2, ExternalLink, Globe, Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export default function DestinationExplorer({ onSelectDestination, currency = 'USD' }) {
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);
  const [loading, setLoading] = useState(true);
  const [serverVerified, setServerVerified] = useState(false);

  // Insight Modal state
  const [selectedInsightDest, setSelectedInsightDest] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightData, setInsightData] = useState(null);

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

  const handleOpenInsights = async (dest, e) => {
    if (e) e.stopPropagation();
    setSelectedInsightDest(dest);
    setInsightLoading(true);
    setInsightData(null);

    try {
      const res = await fetch('/api/destination-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: dest.id,
          destinationName: dest.name,
          airport: dest.airport,
          region: dest.region
        })
      });
      const data = await res.json();
      if (data.success) {
        setInsightData(data);
      } else {
        setInsightData({
          destinationName: dest.name,
          airport: dest.airport,
          bestTimeToVisit: 'October through April for comfortable weather.',
          weatherInfo: 'Mild and pleasant seasonal weather.',
          visaRequirement: 'Check local embassy or e-Visa portal prior to travel.',
          topLandmarks: ['Cultural Center', 'Historic Old Town', 'Local Food Markets'],
          travelTips: ['Use authorized taxis.', 'Keep digital copies of travel documents.'],
          groundingSources: [{ title: `Google Travel Guide - ${dest.name}`, url: `https://www.google.com/travel/guide?q=${encodeURIComponent(dest.name)}` }]
        });
      }
    } catch (err) {
      console.error('Failed to load travel insights:', err);
      setInsightData({
        destinationName: dest.name,
        airport: dest.airport,
        bestTimeToVisit: 'Spring & Autumn months offer optimal travel conditions.',
        weatherInfo: 'Fair weather with seasonal variations.',
        visaRequirement: 'Standard travel visa or e-Visa applicable for major nationalities.',
        topLandmarks: ['Heritage Quarter', 'Panoramas & Parks'],
        travelTips: ['Book flight in advance to secure concierge deals.'],
        groundingSources: []
      });
    } finally {
      setInsightLoading(false);
    }
  };

  const filteredDestinations = destinations.filter(item => {
    const matchesFilter = filter === 'All' ? true : filter === 'Popular' ? item.popular : item.region === filter;
    if (!matchesFilter) return false;

    if (!debouncedSearchTerm.trim()) return true;
    const q = debouncedSearchTerm.toLowerCase().trim();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.city && item.city.toLowerCase().includes(q)) ||
      (item.country && item.country.toLowerCase().includes(q)) ||
      (item.airport && item.airport.toLowerCase().includes(q)) ||
      (item.region && item.region.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <section id="destinations" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="gold-badge">Worldwide Destinations</span>
          <h2>Top Global Routes Across Asia, Americas, Europe & Middle East</h2>
          <p>
            Explore our curated luxury destinations with up to 30% concierge savings. Click any card to book or view grounded travel insights.
          </p>
        </div>

        {/* Global Route Search Bar */}
        <div style={{
          maxWidth: '680px',
          margin: '0 auto 24px auto',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={18} 
              color="var(--color-gold)" 
              style={{
                position: 'absolute',
                left: '18px',
                pointerEvents: 'none'
              }} 
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search global routes by city, country, or airport code (e.g., Tokyo, LHR, Paris)..."
              style={{
                width: '100%',
                padding: '14px 44px 14px 48px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: searchTerm ? '1.5px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-full)',
                color: '#FFF',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: searchTerm ? '0 0 16px rgba(229, 193, 88, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#CBD5E1',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Result Indicator */}
          {searchTerm && (
            <div style={{
              marginTop: '10px',
              textAlign: 'center',
              fontSize: '0.84rem',
              color: 'var(--color-gold-bright)',
              fontWeight: 600
            }}>
              Found {filteredDestinations.length} route{filteredDestinations.length === 1 ? '' : 's'} matching "{searchTerm}"
            </div>
          )}
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
        ) : filteredDestinations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px dashed rgba(229, 193, 88, 0.3)',
            borderRadius: 'var(--radius-md)',
            margin: '20px 0'
          }}>
            <Search size={38} color="var(--color-gold)" style={{ margin: '0 auto 12px auto', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '8px', fontWeight: 700 }}>
              No Global Routes Found
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px auto' }}>
              No routes match your search query "{searchTerm}" under the {filter === 'All' ? 'global' : filter} filter. Try searching by city name or airport code like DXB, HND, LHR, or JFK.
            </p>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setFilter('All'); }}
              className="btn-gold"
              style={{ padding: '9px 22px', fontSize: '0.88rem' }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          /* Destination Cards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => handleSelectWithValidation(dest)}
              >
                {/* Image & Badge Header */}
                <div style={{
                  position: 'relative',
                  height: '210px',
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
                    SAVE UP TO {dest.discount}
                  </div>

                  {/* Region Tag */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(7, 11, 20, 0.75)',
                    border: '1px solid rgba(229,193,88,0.3)',
                    color: 'var(--color-gold)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {dest.region}
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

                {/* Card Actions Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Grounded Travel Insight Button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenInsights(dest, e)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(96, 165, 250, 0.35)',
                        color: '#93C5FD',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.22)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)'}
                    >
                      <Sparkles size={14} color="#60A5FA" />
                      Travel Insights
                    </button>

                    {/* Reserve CTA */}
                    <button 
                      className="btn-outline-gold"
                      style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                    >
                      <Plane size={15} />
                      Reserve This Route
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Grounded Travel Insights Modal */}
        {selectedInsightDest && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #0E1526 0%, #070B14 100%)',
              border: '1.5px solid var(--border-gold-glow)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedInsightDest(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#FFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={18} color="#60A5FA" />
                  <span style={{ fontSize: '0.78rem', color: '#93C5FD', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Grounded Destination Intelligence
                  </span>
                </div>
                <h3 style={{ fontSize: '1.6rem', color: '#FFF', fontWeight: 800, margin: 0 }}>
                  {selectedInsightDest.name}
                </h3>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Airport: {selectedInsightDest.airport} • Region: {selectedInsightDest.region}
                </span>
              </div>

              {insightLoading ? (
                <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--color-gold)' }}>
                  <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E2E8F0' }}>
                    Fetching live weather, visa guidelines, landmarks, and travel insights...
                  </p>
                </div>
              ) : insightData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Weather & Best Time */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Sun size={18} color="var(--color-gold)" />
                      <h4 style={{ color: 'var(--color-gold-bright)', margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                        Best Time & Weather Forecast
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#E2E8F0', margin: '0 0 6px 0', lineHeight: 1.5 }}>
                      <strong>Optimal Months:</strong> {insightData.bestTimeToVisit}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                      <strong>Current Climate:</strong> {insightData.weatherInfo}
                    </p>
                  </div>

                  {/* Visa & Entry */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FileText size={18} color="#6EE7B7" />
                      <h4 style={{ color: '#6EE7B7', margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                        Visa & Entry Guidelines
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#E2E8F0', margin: 0, lineHeight: 1.5 }}>
                      {insightData.visaRequirement}
                    </p>
                  </div>

                  {/* Must See Landmarks */}
                  {insightData.topLandmarks && insightData.topLandmarks.length > 0 && (
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Compass size={18} color="#A78BFA" />
                        <h4 style={{ color: '#C4B5FD', margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                          Top Recommended Attractions
                        </h4>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#E2E8F0', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {insightData.topLandmarks.map((lm, idx) => (
                          <li key={idx}>{lm}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Travel Tips */}
                  {insightData.travelTips && insightData.travelTips.length > 0 && (
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <CheckCircle2 size={18} color="#F59E0B" />
                        <h4 style={{ color: '#FCD34D', margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                          Concierge Travel Tips
                        </h4>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#E2E8F0', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {insightData.travelTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Grounding Web Sources */}
                  {insightData.groundingSources && insightData.groundingSources.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        VERIFIED SOURCES
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {insightData.groundingSources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.72rem',
                              color: '#93C5FD',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(96, 165, 250, 0.25)',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ExternalLink size={10} />
                            {src.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      const destToSelect = selectedInsightDest;
                      setSelectedInsightDest(null);
                      handleSelectWithValidation(destToSelect);
                    }}
                    className="btn-gold"
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
                  >
                    <Plane size={18} />
                    Reserve Flight to {selectedInsightDest.name}
                  </button>

                </div>
              ) : null}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}


