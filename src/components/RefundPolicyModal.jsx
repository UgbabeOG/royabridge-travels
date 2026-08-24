import React from 'react';
import { X, ShieldCheck, Mail, Phone, RefreshCw, AlertCircle, MessageCircle } from 'lucide-react';

export default function RefundPolicyModal({ isOpen, onClose, onOpenContact, onOpenChat }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 350,
      background: 'rgba(7, 11, 20, 0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '720px',
        width: '100%',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(24px, 5vw, 36px)',
        maxHeight: '88vh',
        overflowY: 'auto',
        color: '#E2E8F0',
        lineHeight: 1.6
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '18px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="gold-badge" style={{ fontSize: '0.75rem' }}>
                <RefreshCw size={13} style={{ marginRight: '4px' }} /> Cancellation & Refunds
              </span>
            </div>
            <h1 className="font-royal" style={{ color: '#FFF', fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', margin: 0, fontWeight: 800 }}>
              Cancellation & Refund Policy
            </h1>
            <p style={{ color: 'var(--color-gold-bright)', fontSize: '0.85rem', margin: '4px 0 0 0', fontWeight: 600 }}>
              Effective Date: January 1, 2026
            </p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="legal-policy-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.92rem' }}>
          
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', margin: 0 }}>
            At <strong style={{ color: 'var(--color-gold-bright)' }}>RoyaBridge Travels</strong>, we aim to provide transparent and flexible travel concierge services. Please read our cancellation and refund guidelines carefully prior to confirming your booking.
          </p>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>1. 24-Hour Free Reservation Hold</h2>
            <p style={{ margin: 0 }}>
              Reserving a flight under our 24-hour PNR hold feature requires zero upfront payment. If you choose not to issue the ticket within the 24-hour window, the reservation will automatically expire with zero cost or penalty.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>2. Ticket Cancellations & Refunds</h2>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: '#FFF' }}>Concierge Service Fees:</strong> Once an official e-ticket or PNR is generated and issued at your request, RoyaBridge concierge service fees are non-refundable.
              </li>
              <li>
                <strong style={{ color: '#FFF' }}>Airline Ticket Rules:</strong> Issued airline tickets are governed strictly by the operating carrier’s fare rules. Non-refundable tickets cannot be refunded unless explicitly allowed by the airline.
              </li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>3. Airline Schedule Changes & Cancellations</h2>
            <p style={{ margin: 0 }}>
              In the event that an airline cancels, delays, or reschedules a flight, refunds or rebookings are handled in accordance with the airline's policy. Approved refunds will be credited back via our payment gateway (Flutterwave) within 3 to 15 business days for card payments or 24 to 48 hours for bank transfers.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>4. Visa Rejections</h2>
            <p style={{ margin: 0 }}>
              If a flight hold was generated for visa application purposes, the 24-hour reservation hold expires automatically at no charge. If a fully issued and ticketed flight is canceled due to visa denial, standard airline cancellation penalties apply.
            </p>
          </section>

          <section style={{
            ...sectionStyle,
            background: 'rgba(7, 11, 20, 0.75)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '18px'
          }}>
            <h2 style={{ ...headingStyle, color: 'var(--color-gold-bright)', marginBottom: '8px' }}>5. How to Request a Refund</h2>
            <p style={{ marginBottom: '12px', color: '#CBD5E1' }}>
              To initiate a refund or ticket cancellation request, please contact our support team in writing with your PNR Reference Code:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--color-gold)" />
                <span><strong>Email:</strong> <a href="mailto:support@royabridge.com" style={linkStyle}>support@royabridge.com</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--color-gold)" />
                <span><strong>Phone / WhatsApp:</strong> <a href="tel:+14028822524" style={linkStyle}>+1 (402) 882-2524</a></span>
              </div>
            </div>
          </section>

        </div>

        {/* Action Footer */}
        <div style={{
          marginTop: '28px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button 
            onClick={() => {
              onClose();
              if (onOpenChat) onOpenChat();
            }}
            className="btn-outline-gold"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <MessageCircle size={16} /> Contact Support
          </button>
          
          <button 
            onClick={onClose}
            className="btn-gold"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            Close Policy
          </button>
        </div>

      </div>
    </div>
  );
}

const sectionStyle = {
  background: 'rgba(15, 23, 42, 0.4)',
  padding: '14px 18px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid rgba(255, 255, 255, 0.05)'
};

const headingStyle = {
  color: '#FFF',
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: '0 0 6px 0'
};

const linkStyle = {
  color: 'var(--color-gold-bright)',
  textDecoration: 'underline'
};
