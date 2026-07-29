import React from 'react';
import { Plane, ShieldCheck, Sparkles, Clock, DollarSign, MessageCircle, ArrowRight, Star, Globe2 } from 'lucide-react';

export default function Hero({ onStartSearch, onOpenChat }) {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '130px',
      paddingBottom: '90px',
      backgroundImage: `linear-gradient(180deg, rgba(5, 8, 17, 0.72) 0%, rgba(5, 8, 17, 0.88) 60%, rgba(5, 8, 17, 1) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2200&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'fixed',
      overflow: 'hidden'
    }}>
      
      {/* Ambient Glowing Orbs */}
      <div className="glow-bg" style={{
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(229, 193, 88, 0.28) 0%, rgba(0,0,0,0) 70%)'
      }} />

      <div className="glow-bg" style={{
        top: '50%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(0,0,0,0) 70%)'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        
        {/* Floating Aircraft Graphic Asset over Beach Visual */}
        <div style={{
          marginBottom: '20px',
          display: 'inline-block',
          position: 'relative'
        }}>
          <div className="animate-plane" style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 193, 88, 0.35) 0%, rgba(10, 15, 30, 0.9) 100%)',
            border: '2px solid var(--color-gold)',
            boxShadow: '0 0 30px rgba(229, 193, 88, 0.4)'
          }}>
            <Plane size={48} color="var(--color-gold-bright)" style={{ transform: 'rotate(-25deg)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }} />
          </div>

          {/* Floating Micro Badge */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-30px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#FFF',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap'
          }}>
            ✈ LIVE FLIGHT HOLDS
          </div>
        </div>

        {/* Top Announcement Badge */}
        <div style={{ marginBottom: '20px' }}>
          <span className="gold-badge">
            <Sparkles size={15} color="var(--color-gold-bright)" />
            Worldwide Flight Concierge • Domestic & International
          </span>
        </div>

        {/* Main Title - ROYABRIDGE TRAVELS */}
        <h1 className="font-royal" style={{
          fontSize: 'clamp(3rem, 6.5vw, 5.2rem)',
          fontWeight: 900,
          letterSpacing: '0.05em',
          color: '#FFF',
          textShadow: '0 6px 35px rgba(0,0,0,0.9)',
          marginBottom: '6px',
          lineHeight: 1.1
        }}>
          <span className="gold-gradient-text">ROYABRIDGE TRAVELS</span>
        </h1>

        {/* Brand Subtitle: "Create Unforgettable Memories" */}
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(1.25rem, 2.8vw, 1.9rem)',
          fontWeight: 300,
          color: '#F8FAFC',
          marginBottom: '32px',
          letterSpacing: '0.08em',
          textShadow: '0 2px 12px rgba(0,0,0,0.7)',
          fontStyle: 'italic'
        }}>
          Create Unforgettable Memories
        </p>

        {/* Hero Offer Glass Card */}
        <div className="glass-card" style={{
          maxWidth: '880px',
          margin: '0 auto 40px',
          padding: '28px 36px',
          background: 'linear-gradient(180deg, rgba(12, 18, 34, 0.85) 0%, rgba(5, 8, 17, 0.92) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.25rem, 2.4vw, 1.85rem)',
            fontWeight: 800,
            color: 'var(--color-gold-bright)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.3
          }}>
            SAVE UP TO 30% ON BOOK FLIGHTS TO ANY DESTINATION WORLDWIDE
          </h2>
          <p style={{
            color: '#CBD5E1',
            fontSize: '1.08rem',
            marginTop: '12px',
            fontWeight: 500
          }}>
            Discover the World, Save Big and Travel Better with our Private Airfare Concierge.
          </p>

          {/* Value Feature Badges with Sophisticated Micro-Animations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px',
            marginTop: '28px'
          }}>
            <div style={badgeItemStyle}>
              <Clock size={18} color="var(--color-gold)" />
              <span>Fast Booking Assistance</span>
            </div>
            <div style={badgeItemStyle}>
              <DollarSign size={18} color="var(--color-gold)" />
              <span>Competitive Airfares</span>
            </div>
            <div style={badgeItemStyle}>
              <ShieldCheck size={18} color="var(--color-gold)" />
              <span>Reserve Before Payment</span>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={onStartSearch}
            className="btn-gold pulse-glow"
            style={{ padding: '16px 38px', fontSize: '1.08rem' }}
          >
            <Plane size={20} />
            Search & Reserve Flights
            <ArrowRight size={18} />
          </button>

          <button 
            onClick={onOpenChat}
            className="btn-outline-gold"
            style={{ padding: '15px 34px', fontSize: '1.05rem' }}
          >
            <MessageCircle size={20} />
            Send Us A Message
          </button>
        </div>

        {/* Bottom Micro Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          marginTop: '60px',
          flexWrap: 'wrap',
          color: 'var(--color-text-muted)',
          fontSize: '0.92rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span><strong>100% Valid PNR</strong> Embassy & Visa Flight Holds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={16} fill="var(--color-gold)" color="var(--color-gold)" />
            <span><strong>4.95 / 5.0 Rating</strong> Verified Traveler Feedback</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe2 size={16} color="var(--color-gold)" />
            <span><strong>Global Support</strong> 24/7 Fast Booking Assistance</span>
          </div>
        </div>

      </div>
    </section>
  );
}

const badgeItemStyle = {
  background: 'rgba(5, 8, 17, 0.65)',
  border: '1px solid rgba(229, 193, 88, 0.3)',
  padding: '12px 16px',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  color: '#E2E8F0',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all 0.3s ease'
};
