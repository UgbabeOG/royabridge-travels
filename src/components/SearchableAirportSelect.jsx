import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Check, ChevronDown, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchableAirportSelect({
  value,
  onChange,
  airports = [],
  label,
  placeholder = "Search city, country or airport code (e.g., LHR, New York)...",
  icon: IconComponent
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Find currently selected airport object
  const selectedAirport = airports.find(a => a.code?.toUpperCase() === value?.toUpperCase());

  // Sync initial input value display text
  useEffect(() => {
    if (selectedAirport) {
      setSearchTerm(`${selectedAirport.city} (${selectedAirport.code}) - ${selectedAirport.country}`);
    } else if (value) {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value, selectedAirport]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search term back to selected airport display text on close
        if (selectedAirport) {
          setSearchTerm(`${selectedAirport.city} (${selectedAirport.code}) - ${selectedAirport.country}`);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedAirport]);

  // Filter airports based on debounced search query while typing
  const query = (debouncedSearchTerm || '').trim().toLowerCase();
  
  // Strip out display suffix if user is typing a new query
  const rawInputQuery = (isOpen && selectedAirport && searchTerm.includes(`(${selectedAirport.code})`))
    ? '' 
    : query;

  const filteredAirports = airports.filter(ap => {
    if (!rawInputQuery) return true;
    const matchCode = ap.code?.toLowerCase().includes(rawInputQuery);
    const matchCity = ap.city?.toLowerCase().includes(rawInputQuery);
    const matchCountry = ap.country?.toLowerCase().includes(rawInputQuery);
    const matchName = ap.name?.toLowerCase().includes(rawInputQuery);
    return matchCode || matchCity || matchCountry || matchName;
  });

  const handleSelect = (apCode) => {
    onChange(apCode);
    const chosen = airports.find(a => a.code === apCode);
    if (chosen) {
      setSearchTerm(`${chosen.city} (${chosen.code}) - ${chosen.country}`);
    }
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Highlight input for easy typing over current selection
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--color-gold-bright)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </label>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.85)',
        border: isOpen ? '1px solid var(--color-gold-bright)' : '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        gap: '10px',
        boxShadow: isOpen ? '0 0 12px rgba(229, 193, 88, 0.25)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'text'
      }} onClick={() => inputRef.current && inputRef.current.focus()}>
        
        {IconComponent && <IconComponent size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />}

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '0.88rem',
            fontWeight: 600,
            width: '100%',
            fontFamily: 'inherit'
          }}
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%'
            }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}

        <ChevronDown 
          size={16} 
          color={isOpen ? 'var(--color-gold-bright)' : '#94A3B8'} 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }} 
        />
      </div>

      {/* Floating Dropdown Autocomplete Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          maxHeight: '280px',
          overflowY: 'auto',
          background: '#0B1120',
          border: '1px solid rgba(229, 193, 88, 0.35)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.65)',
          zIndex: 9999,
          padding: '6px'
        }}>
          {filteredAirports.length === 0 ? (
            <div style={{
              padding: '16px 12px',
              textAlign: 'center',
              color: '#94A3B8',
              fontSize: '0.82rem'
            }}>
              No matching airports found for "{searchTerm}".
            </div>
          ) : (
            filteredAirports.map((ap) => {
              const isSelected = ap.code === value;
              return (
                <div
                  key={ap.code}
                  onClick={() => handleSelect(ap.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(229, 193, 88, 0.18)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <span style={{
                      background: isSelected ? 'var(--color-gold-bright)' : 'rgba(229, 193, 88, 0.15)',
                      color: isSelected ? '#000' : 'var(--color-gold-bright)',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px',
                      flexShrink: 0
                    }}>
                      {ap.code}
                    </span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{
                        color: isSelected ? '#FFF' : '#E2E8F0',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {ap.city}, {ap.country}
                      </span>
                      <span style={{
                        color: '#94A3B8',
                        fontSize: '0.74rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {ap.name || `${ap.city} International Airport`}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check size={16} color="var(--color-gold-bright)" style={{ flexShrink: 0 }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
