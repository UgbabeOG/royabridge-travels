import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Printer, MessageCircle, Clock, CheckCircle2, Copy, Plane, Activity, AlertCircle } from 'lucide-react';
import { generatePNR, formatCurrency } from '../utils/pnrGenerator';
import { saveBookingToDatabase } from '../lib/bookingsService';
import { validateEmail, validatePhone, validateName } from '../utils/validation';

export default function ReserveModal({ data, onClose, onOpenChat, showToast }) {
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '' });
  const [validationError, setValidationError] = useState('');
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pnr] = useState(() => generatePNR());
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 3600); // 24 hours countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const copyPNR = () => {
    navigator.clipboard.writeText(pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    // Perform thorough input validation
    const nameVal = validateName(passengerName);
    const emailVal = validateEmail(passengerEmail);
    const phoneVal = validatePhone(passengerPhone);

    const errors = {
      name: nameVal.error || '',
      email: emailVal.error || '',
      phone: phoneVal.error || ''
    };

    setFieldErrors(errors);

    if (!nameVal.isValid || !emailVal.isValid || !phoneVal.isValid) {
      const firstErr = nameVal.error || emailVal.error || phoneVal.error;
      setValidationError(firstErr);
      return;
    }

    setValidationError('');
    setSaving(true);

    try {
      await saveBookingToDatabase({
        pnr: pnr,
        passengerName: passengerName.trim(),
        passengerEmail: passengerEmail.trim(),
        passengerPhone: passengerPhone.trim(),
        flightNumber: data.flightNumber || 'BA178',
        airline: data.airline || 'British Airways',
        origin: data.origin?.code || data.origin || 'JFK',
        originCity: data.origin?.city || data.origin?.name || 'New York',
        destination: data.destination?.code || data.destination || 'LHR',
        destinationCity: data.destination?.city || data.destination?.name || 'London',
        departDate: data.departDate || '2026-08-20',
        returnDate: data.returnDate,
        tripType: data.tripType || 'round',
        cabinClass: data.cabinClass || 'Business Class',
        passengersCount: data.passengers || 1,
        retailPrice: data.savings?.originalPrice || 1200,
        royaPrice: data.savings?.finalPrice || 840,
        savings: data.savings?.discountAmount || 360,
        aircraft: data.aircraft || 'Boeing 787 Dreamliner'
      });

      setConfirmedSuccess(true);
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Flight Reservation Hold Confirmed!',
          message: `Itinerary hold locked for ${passengerName.trim()}. 24h PNR record stored in database.`,
          pnr: pnr
        });
      }
      if (onOpenChat) onOpenChat();
    } catch (err) {
      console.error('Error saving booking:', err);
      setValidationError('Failed to store reservation hold in database. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const nameVal = validateName(passengerName);
    const emailVal = validateEmail(passengerEmail);

    if (!nameVal.isValid || !emailVal.isValid) {
      setValidationError('Please enter a valid full legal name and email address before printing your itinerary ticket.');
      return;
    }
    setValidationError('');
    window.print();
  };

  if (!data) return null;

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
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="glass-card" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px'
      }}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <span className="gold-badge" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>
              <ShieldCheck size={14} color="var(--color-gold)" />
              Reserve Before Payment Confirmed
            </span>
            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.6rem', marginTop: '4px' }}>
              Official Flight Reservation Hold
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 24-Hour Hold Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-bright)', fontWeight: 600, display: 'block' }}>
              PNR BOOKING REFERENCE CODE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em', color: '#FFF' }}>
                {pnr}
              </span>
              <button 
                onClick={copyPNR}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-gold)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem'
                }}
              >
                {copied ? <CheckCircle2 size={16} color="#10B981" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--color-gold)" />
              Price Lock Guarantee Timer
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6EE7B7' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Flight Itinerary Details */}
        <div style={{
          background: 'rgba(7, 11, 20, 0.6)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-gold-bright)', marginBottom: '14px' }}>
            Itinerary Summary
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Origin</span>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#FFF' }}>
                {data.origin.city} ({data.origin.code})
              </strong>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', background: 'rgba(229,193,88,0.1)', padding: '2px 10px', borderRadius: '10px' }}>
                {data.cabinClass} • {data.tripType === 'round' ? 'Round Trip' : 'One Way'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <div style={{ width: '40px', height: '1px', background: 'var(--color-gold)' }} />
                <Plane size={16} color="var(--color-gold)" />
                <div style={{ width: '40px', height: '1px', background: 'var(--color-gold)' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Direct / 1-Stop</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Destination</span>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#FFF' }}>
                {data.destination.city} ({data.destination.code})
              </strong>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            fontSize: '0.88rem',
            color: '#CBD5E1'
          }}>
            <div><strong>Depart Date:</strong> {data.departDate}</div>
            {data.returnDate && <div><strong>Return Date:</strong> {data.returnDate}</div>}
            <div><strong>Passengers:</strong> {data.passengers} Adult(s)</div>
            <div><strong>Luggage:</strong> 2x 23kg Included</div>
          </div>
        </div>

        {/* Passenger Input Form */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-gold-bright)', margin: 0 }}>
              Lead Passenger Contact Details
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>* Required for PNR E-Ticket</span>
          </div>

          {validationError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              marginBottom: '14px',
              fontWeight: 600
            }}>
              ⚠️ {validationError}
            </div>
          )}

          {confirmedSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: '#6EE7B7',
              fontSize: '0.88rem',
              marginBottom: '14px',
              fontWeight: 700
            }}>
              ✓ Flight Hold Confirmed for {passengerName}! Your PNR ({pnr}) details have been sent to {passengerEmail}.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Full Legal Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter full name (as on Passport)"
                value={passengerName} 
                onChange={(e) => { 
                  setPassengerName(e.target.value); 
                  setValidationError(''); 
                  setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                style={{
                  ...modalInputStyle,
                  borderColor: fieldErrors.name ? '#EF4444' : 'var(--border-gold)'
                }}
              />
              {fieldErrors.name && (
                <span style={{ fontSize: '0.73rem', color: '#FCA5A5', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input 
                type="email" 
                placeholder="e.g. alex.morgan@example.com"
                value={passengerEmail} 
                onChange={(e) => { 
                  setPassengerEmail(e.target.value); 
                  setValidationError(''); 
                  setFieldErrors(prev => ({ ...prev, email: '' }));
                }}
                style={{
                  ...modalInputStyle,
                  borderColor: fieldErrors.email ? '#EF4444' : 'var(--border-gold)'
                }}
              />
              {fieldErrors.email && (
                <span style={{ fontSize: '0.73rem', color: '#FCA5A5', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Phone / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input 
                type="tel" 
                placeholder="e.g. +1 555-234-5678"
                value={passengerPhone} 
                onChange={(e) => { 
                  setPassengerPhone(e.target.value); 
                  setValidationError(''); 
                  setFieldErrors(prev => ({ ...prev, phone: '' }));
                }}
                style={{
                  ...modalInputStyle,
                  borderColor: fieldErrors.phone ? '#EF4444' : 'var(--border-gold)'
                }}
              />
              {fieldErrors.phone && (
                <span style={{ fontSize: '0.73rem', color: '#FCA5A5', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Total Reserved Fare</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-gold-bright)' }}>
                {formatCurrency(data.savings.finalPrice)}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                {formatCurrency(data.savings.originalPrice)}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              background: '#10B981',
              color: '#070B14',
              fontWeight: 800,
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '10px'
            }}>
              $0.00 PAID TODAY
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handlePrint}
            className="btn-outline-gold"
            style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
          >
            <Printer size={16} />
            Print / Save Itinerary PDF
          </button>

          <button 
            onClick={handleConfirm}
            className="btn-gold"
            disabled={saving}
            style={{ flex: 1.2, padding: '12px', fontSize: '0.9rem' }}
          >
            {saving ? <Activity className="animate-spin" size={16} /> : <MessageCircle size={16} />}
            {saving ? 'Saving Hold to DB...' : 'Confirm Booking & Save Hold ($0 Now)'}
          </button>
        </div>

      </div>
    </div>
  );
}

const modalInputStyle = {
  background: 'rgba(7, 11, 20, 0.8)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 12px',
  color: '#FFF',
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none'
};
