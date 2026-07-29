import React from 'react';
import { Phone, Mail, MessageCircle, Clock, MapPin, X, Copy, CheckCircle2 } from 'lucide-react';

export default function ContactModal({ isOpen, onClose, onOpenChat }) {
  const [copiedItem, setCopiedItem] = React.useState('');

  if (!isOpen) return null;

  const copyToClipboard = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(''), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px'
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <span className="gold-badge" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
              24/7 Concierge Support
            </span>
            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.5rem', marginTop: '4px' }}>
              Contact RoyaBridge Travels
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
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

        <p style={{ color: '#CBD5E1', fontSize: '0.92rem', marginBottom: '24px' }}>
          Connect directly with our senior flight concierge team via phone, email, or live chat for immediate assistance with bookings, itinerary holds, or custom fares.
        </p>

        {/* Contact Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          
          {/* Phone Contact */}
          <div style={{
            background: 'rgba(7, 11, 20, 0.7)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(229, 193, 88, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold-bright)'
              }}>
                <Phone size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Call Toll-Free (24/7)</span>
                <strong style={{ fontSize: '1.05rem', color: '#FFF' }}>+1 (800) 769-2274</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href="tel:+18007692274"
                className="btn-gold"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                Call Now
              </a>
              <button
                onClick={() => copyToClipboard('+18007692274', 'phone')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#CBD5E1',
                  padding: '8px',
                  cursor: 'pointer'
                }}
                title="Copy Phone Number"
              >
                {copiedItem === 'phone' ? <CheckCircle2 size={16} color="#10B981" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Email Contact */}
          <div style={{
            background: 'rgba(7, 11, 20, 0.7)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(229, 193, 88, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold-bright)'
              }}>
                <Mail size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Email Concierge</span>
                <strong style={{ fontSize: '0.98rem', color: '#FFF' }}>concierge@royabridgetravels.com</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href="mailto:concierge@royabridgetravels.com?subject=RoyaBridge%20Flight%20Concierge%20Inquiry"
                className="btn-outline-gold"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                Send Email
              </a>
              <button
                onClick={() => copyToClipboard('concierge@royabridgetravels.com', 'email')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#CBD5E1',
                  padding: '8px',
                  cursor: 'pointer'
                }}
                title="Copy Email Address"
              >
                {copiedItem === 'email' ? <CheckCircle2 size={16} color="#10B981" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

        </div>

        {/* Live Chat Button */}
        <button 
          onClick={() => {
            onClose();
            onOpenChat();
          }}
          className="btn-gold"
          style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
        >
          <MessageCircle size={18} />
          Start Live Concierge Messaging
        </button>

      </div>
    </div>
  );
}
