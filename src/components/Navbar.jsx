import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquare, PhoneCall, Menu, X, Phone, Mail } from 'lucide-react';

export default function Navbar({ onOpenSearch, onOpenChat, onOpenTracker, onOpenContact }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileNavClick = (href) => {
    setMobileMenuOpen(false);
    if (href) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled || mobileMenuOpen ? 'rgba(7, 11, 20, 0.95)' : 'rgba(7, 11, 20, 0.4)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled || mobileMenuOpen ? '1px solid rgba(229, 193, 88, 0.25)' : '1px solid transparent',
      padding: scrolled ? '12px 0' : '18px 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 193, 88, 0.3) 0%, rgba(11, 16, 29, 0.9) 100%)',
            border: '1.5px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(229, 193, 88, 0.3)',
            flexShrink: 0
          }}>
            <svg width="26" height="26" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-gold)" strokeWidth="4" />
              <ellipse cx="50" cy="50" rx="44" ry="18" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
              <ellipse cx="50" cy="50" rx="18" ry="44" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
              <rect x="58" y="52" width="24" height="28" rx="4" fill="var(--color-gold)" stroke="#070B14" strokeWidth="2" />
              <path d="M 65 52 V 46 Q 65 43 70 43 Q 75 43 75 46 V 52" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
            </svg>
          </div>
          <div>
            <span className="font-royal" style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.45rem)',
              fontWeight: 800,
              color: 'var(--color-gold-bright)',
              letterSpacing: '0.03em',
              display: 'block',
              lineHeight: 1.1
            }}>
              ROYABRIDGE TRAVELS
            </span>
            <span style={{
              fontSize: '0.68rem',
              color: '#CBD5E1',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500
            }}>
              Flight Concierge & Booking
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', lg: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-links">
          <a href="#about" style={navLinkStyle}>About Us</a>
          <a href="#destinations" style={navLinkStyle}>Destinations</a>
          <a href="#reserve" style={navLinkStyle}>Reserve Before Payment</a>
          <a href="#reviews" style={navLinkStyle}>User Reviews</a>
          <a href="#faq" style={navLinkStyle}>FAQ</a>
        </div>

        {/* Action Buttons & Hamburger Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Contact Us Button */}
          <button 
            onClick={onOpenContact}
            className="btn-outline-gold"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <PhoneCall size={15} />
            Contact Us
          </button>

          {/* Track Reservation Button */}
          <button 
            onClick={onOpenTracker}
            className="btn-outline-gold desktop-only"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={15} />
            Track
          </button>

          {/* Send Us A Message Button */}
          <button 
            onClick={onOpenChat}
            className="btn-gold desktop-only"
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
          >
            <MessageSquare size={15} />
            Message
          </button>

          {/* Hamburger Menu Toggle Button for Mobile/Tablet */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'rgba(229, 193, 88, 0.15)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-sm)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold-bright)',
              cursor: 'pointer'
            }}
            className="hamburger-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(7, 11, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1.5px solid var(--border-gold-glow)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          <a href="#about" onClick={() => handleMobileNavClick('#about')} style={mobileNavLinkStyle}>About Us</a>
          <a href="#destinations" onClick={() => handleMobileNavClick('#destinations')} style={mobileNavLinkStyle}>Worldwide Destinations</a>
          <a href="#reserve" onClick={() => handleMobileNavClick('#reserve')} style={mobileNavLinkStyle}>Reserve Before Payment</a>
          <a href="#reviews" onClick={() => handleMobileNavClick('#reviews')} style={mobileNavLinkStyle}>User Reviews</a>
          <a href="#faq" onClick={() => handleMobileNavClick('#faq')} style={mobileNavLinkStyle}>FAQ</a>

          <div style={{ height: '1px', background: 'rgba(229,193,88,0.15)', margin: '8px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="btn-gold"
              style={{ width: '100%', padding: '12px' }}
            >
              <PhoneCall size={16} />
              Contact Us (Email / Phone)
            </button>

            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenTracker(); }}
              className="btn-outline-gold"
              style={{ width: '100%', padding: '12px' }}
            >
              <ShieldCheck size={16} />
              Track Reservation
            </button>

            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
              className="btn-gold"
              style={{ width: '100%', padding: '12px' }}
            >
              <MessageSquare size={16} />
              Send Us A Message
            </button>
          </div>

        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-links {
            display: flex !important;
          }
          .hamburger-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}

const navLinkStyle = {
  color: 'var(--color-text-main)',
  textDecoration: 'none',
  fontSize: '0.92rem',
  fontWeight: '500',
  transition: 'color 0.2s ease'
};

const mobileNavLinkStyle = {
  color: '#F8FAFC',
  textDecoration: 'none',
  fontSize: '1.05rem',
  fontWeight: '600',
  padding: '6px 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)'
};
