import React from 'react';
import { X, ShieldCheck, Mail, Phone, Globe, ExternalLink, MessageCircle } from 'lucide-react';

export default function TermsOfServiceModal({ isOpen, onClose, onOpenContact, onOpenChat }) {
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
                <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Legal Terms
              </span>
            </div>
            <h1 className="font-royal" style={{ color: '#FFF', fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', margin: 0, fontWeight: 800 }}>
              Terms of Service
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
        <div className="legal-terms-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.92rem' }}>
          
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', margin: 0 }}>
            Welcome to <strong style={{ color: 'var(--color-gold-bright)' }}>RoyaBridge Travels</strong>. By accessing our website and using our flight concierge services, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>1. Service Scope</h2>
            <p style={{ margin: 0 }}>
              RoyaBridge Travels acts as an independent flight concierge and intermediary between travelers and third-party global air carriers (accessing 400+ GDS partner airlines). We facilitate seat reservations, PNR holds, and ticket issuance on your behalf.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>2. Payments & Pricing</h2>
            <p style={{ margin: 0 }}>
              All payments are processed securely through Flutterwave. Prices quoted on our website are inclusive of applicable taxes and concierge service fees. Rates are subject to availability until ticket issuance is finalized.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>3. Passenger Information Accuracy</h2>
            <p style={{ margin: 0 }}>
              Customers are solely responsible for providing accurate passenger names matching their valid passport details exactly during checkout. RoyaBridge Travels is not liable for boarding denials, re-issuance fees, or airline penalties resulting from incorrect information supplied by the customer.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>4. Travel Documents & Visas</h2>
            <p style={{ margin: 0 }}>
              Travelers are responsible for securing all required travel documents, including valid passports, entry visas, and health clearances required by transit or destination countries.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>5. Dispute Resolution & Chargebacks</h2>
            <p style={{ margin: 0 }}>
              If you experience any issues regarding your booking or payment, you agree to contact RoyaBridge Support directly at <a href="mailto:support@royabridge.com" style={linkStyle}>support@royabridge.com</a> to resolve the matter prior to filing a dispute or chargeback with your bank or payment provider.
            </p>
          </section>

          <section style={{
            ...sectionStyle,
            background: 'rgba(7, 11, 20, 0.75)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '18px'
          }}>
            <h2 style={{ ...headingStyle, color: 'var(--color-gold-bright)', marginBottom: '10px' }}>6. Contact Us</h2>
            <p style={{ marginBottom: '12px', color: '#94A3B8' }}>For questions regarding these Terms, contact us at:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} color="var(--color-gold)" />
                <span><strong>Website:</strong> <a href="https://www.royabridge.com" target="_blank" rel="noreferrer" style={linkStyle}>RoyaBridge Travels</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--color-gold)" />
                <span><strong>Email:</strong> <a href="mailto:support@royabridge.com" style={linkStyle}>support@royabridge.com</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--color-gold)" />
                <span><strong>Phone:</strong> <a href="tel:+14028822524" style={linkStyle}>+1 (402) 882-2524</a></span>
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
            <MessageCircle size={16} /> Live Support
          </button>
          
          <button 
            onClick={onClose}
            className="btn-gold"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            I Understand & Agree
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
