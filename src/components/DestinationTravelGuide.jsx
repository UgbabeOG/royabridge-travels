import React, { useState } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { Calendar, Compass, Globe, FileCheck, Coins, Clock, MapPin, Sparkles, Search, ChevronRight, CheckCircle2 } from 'lucide-react';


export default function DestinationTravelGuide({ onSelectDestination }) {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuideId, setActiveGuideId] = useState('london');

  const filteredGuides = DESTINATIONS.filter(dest => {
    const matchesRegion = selectedRegion === 'All' || dest.region === selectedRegion;
    const matchesQuery = !searchQuery || 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dest.tagline && dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesQuery;
  });

  const activeDest = DESTINATIONS.find(d => d.id === activeGuideId) || DESTINATIONS[0];

  return (
    <section id="travel-guide" style={{ padding: '80px 0', background: 'linear-gradient(180deg, rgba(7, 11, 20, 0.9) 0%, rgba(14, 21, 38, 0.9) 100%)', position: 'relative' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="gold-badge">
            <Compass size={14} color="var(--color-gold)" />
            Concierge Destination Guides
          </span>
          <h2>Destination Travel Guide & Insights</h2>
          <p>
            Quick essential insights for top global destinations — best time to visit, visa requirements, local currency, and top highlights before you book.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '36px'
        }}>
          {/* Region Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Europe', 'Middle East', 'Asia', 'Americas', 'Africa'].map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedRegion === region ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedRegion === region ? 'rgba(229, 193, 88, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                  color: selectedRegion === region ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1.5px solid var(--border-gold)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 18px',
            minWidth: '260px'
          }}>
            <Search size={16} color="var(--color-gold)" />
            <input
              type="text"
              placeholder="Search guide by destination or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontSize: '0.88rem',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Guide Layout: Highlight Featured Guide + Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {filteredGuides.slice(0, 8).map(dest => (
            <div
              key={dest.id}
              className="glass-card"
              style={{
                padding: '24px',
                background: activeGuideId === dest.id 
                  ? 'linear-gradient(180deg, rgba(229, 193, 88, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)' 
                  : 'rgba(15, 23, 42, 0.7)',
                border: activeGuideId === dest.id 
                  ? '1.5px solid var(--color-gold-bright)' 
                  : '1px solid rgba(229, 193, 88, 0.2)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease'
              }}
              onClick={() => setActiveGuideId(dest.id)}
            >
              <div>
                {/* Header Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    background: 'rgba(229, 193, 88, 0.15)',
                    color: 'var(--color-gold-bright)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {dest.region} • {dest.airport}
                  </span>

                  <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 600 }}>
                    Concierge Verified
                  </span>
                </div>

                <h3 style={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>
                  {dest.name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  {dest.tagline}
                </p>

                {/* Core Insights Grid (3 Pillars Requested: Best Time, Visa, Currency) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'rgba(7, 11, 20, 0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '20px'
                }}>
                  
                  {/* Best Time to Visit */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Calendar size={16} color="var(--color-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Best Time to Visit
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#FFF', fontWeight: 600 }}>
                        {dest.bestTimeToVisit || 'October – April'}
                      </span>
                    </div>
                  </div>

                  {/* Visa Requirements */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <FileCheck size={16} color="#6EE7B7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Visa Requirements
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#FFF', fontWeight: 600 }}>
                        {dest.visaRequirement || 'Visa on Arrival / eVisa'}
                      </span>
                    </div>
                  </div>


                  {/* Local Currency */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Coins size={16} color="var(--color-gold-bright)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Local Currency
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#FFF', fontWeight: 600 }}>
                        {dest.currency || 'USD / Local Currency'}
                      </span>
                    </div>
                  </div>

                  {/* Language & Flight Duration */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Clock size={16} color="#93C5FD" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Flight Duration / Language
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#CBD5E1', fontWeight: 500 }}>
                        {dest.averageFlightDuration || '6-12 Hours'} • {dest.language || 'English'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Key Highlights Tags */}
                {dest.highlights && dest.highlights.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-bright)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Top Highlights:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {dest.highlights.map((hl, i) => (
                        <span key={i} style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#E2E8F0',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="btn-gold"
                onClick={() => onSelectDestination && onSelectDestination(dest)}
                style={{ width: '100%', padding: '10px', fontSize: '0.88rem', marginTop: '8px' }}
              >
                Search Flights to {dest.name.split(',')[0]}
                <ChevronRight size={16} />
              </button>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
