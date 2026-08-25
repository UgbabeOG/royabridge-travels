import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Download, Printer, MessageCircle, Clock, CheckCircle2, Copy, Plane, Activity, AlertCircle, Shield, Sparkles, Check, Luggage, PlusCircle, FileText, Lock, HeartHandshake, Search, Globe, ExternalLink, Share2, Mail, Send, CreditCard, CheckCircle } from 'lucide-react';
import { generatePNR, formatCurrency } from '../utils/pnrGenerator';
import { saveBookingToDatabase, updateBookingPaymentStatus, extractAirportCode, extractAirportCity } from '../lib/bookingsService';
import { validateEmail, validatePhone, validateName, validateDob, validatePassengerDob, validatePassport } from '../utils/validation';
import { openFlutterwavePayment } from '../utils/flutterwave';
import CheckoutProgressIndicator from './CheckoutProgressIndicator';

export default function ReserveModal({ data, onClose, onOpenChat, onOpenTerms, onOpenRefunds, showToast, currency = 'USD' }) {
  const paxContainerRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);
  const initialBreakdown = data?.passengerBreakdown || { adults: data?.passengers || 1, children: 0, infants: 0 };

  const [passengersList, setPassengersList] = useState(() => {
    const list = [];
    const totalAdults = Math.max(1, Number(initialBreakdown.adults) || 1);
    const totalChildren = Math.max(0, Number(initialBreakdown.children) || 0);
    const totalInfants = Math.max(0, Number(initialBreakdown.infants) || 0);

    for (let i = 0; i < totalAdults; i++) {
      list.push({
        id: `adult-${Date.now()}-${i}`,
        type: 'adult',
        isLead: i === 0,
        title: 'Mr',
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        passport: '',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      });
    }

    for (let i = 0; i < totalChildren; i++) {
      list.push({
        id: `child-${Date.now()}-${i}`,
        type: 'child',
        isLead: false,
        title: 'Master',
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        passport: '',
        seatPreference: 'Aisle',
        mealPreference: 'Standard'
      });
    }

    for (let i = 0; i < totalInfants; i++) {
      list.push({
        id: `infant-${Date.now()}-${i}`,
        type: 'infant',
        isLead: false,
        title: 'Master',
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        passport: '',
        seatPreference: 'Lap',
        mealPreference: 'Standard'
      });
    }

    return list;
  });

  const [paxErrors, setPaxErrors] = useState({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [checkoutMode, setCheckoutMode] = useState('flutterwave'); // 'flutterwave' | 'hold'
  const [isPaid, setIsPaid] = useState(false);
  const [flwDetails, setFlwDetails] = useState(null);

  // Interactive Cabin Selection
  const initialCabin = data?.cabinClass || 'Business';
  const [selectedCabin, setSelectedCabin] = useState(initialCabin);

  // Interactive Travel Insurance & Add-ons
  const [addOns, setAddOns] = useState({
    travelInsurance: true, // Comprehensive Medical & Delay Coverage ($49/pax)
    conciergeProtection: false, // VIP Concierge & Baggage Guarantee ($29/pax)
    flexiBooking: false, // Flexi Date Change Protection ($35/pax)
    carbonOffset: false // Eco-Travel Carbon Neutral Offset ($12/pax)
  });

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

  // Auto-stage PNR hold in database/cache on mount so copying PNR anytime returns accurate flight details
  useEffect(() => {
    const autoPersistHold = async () => {
      try {
        const originCode = extractAirportCode(data?.origin, 'JFK');
        const originCity = extractAirportCity(data?.origin, originCode);
        const destCode = extractAirportCode(data?.destination, 'LHR');
        const destCity = extractAirportCity(data?.destination, destCode);
        const leadPax = passengersList.find(p => p.isLead) || passengersList[0];

        await saveBookingToDatabase({
          pnr: pnr,
          passengerName: leadPax?.fullName || 'Valued Passenger (Hold Reserved)',
          passengerEmail: leadPax?.email || '',
          passengerPhone: leadPax?.phone || '',
          passengerDob: leadPax?.dob || '',
          passengerPassport: leadPax?.passport || '',
          passengersList: passengersList,
          adultsCount: adultsCount,
          childrenCount: childrenCount,
          infantsCount: infantsCount,
          passengersCount: passengersCount,
          flightNumber: data?.flightNumber || 'FL' + Math.floor(100 + Math.random() * 900),
          airline: data?.airline || 'Partner Airline',
          origin: originCode,
          originCity: originCity,
          destination: destCode,
          destinationCity: destCity,
          departDate: data?.departDate || new Date().toISOString().split('T')[0],
          returnDate: data?.returnDate || null,
          tripType: data?.tripType || 'round',
          cabinClass: selectedCabin,
          retailPrice: totalRetailPrice,
          royaPrice: totalFinalPrice,
          savings: totalSavings,
          aircraft: data?.aircraft || 'Boeing 787 Dreamliner',
          status: 'CONFIRMED_HOLD'
        });
      } catch (e) {
        console.warn('Auto-persist hold warning:', e);
      }
    };
    if (data && pnr) {
      autoPersistHold();
    }
  }, [pnr, data]);

  const updatePassengerField = (index, field, value) => {
    setPassengersList(prev => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };
      if (field === 'firstName' || field === 'lastName') {
        const fn = field === 'firstName' ? value : target.firstName;
        const ln = field === 'lastName' ? value : target.lastName;
        target.fullName = `${fn} ${ln}`.trim();
      }
      next[index] = target;
      return next;
    });

    if (paxErrors[index] && paxErrors[index][field]) {
      setPaxErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: '' }
      }));
    }
  };

  const addPassenger = (type) => {
    if (passengersList.length >= 9) return;
    setPassengersList(prev => [
      ...prev,
      {
        id: `${type}-${Date.now()}`,
        type: type,
        isLead: false,
        title: type === 'adult' ? 'Mr' : 'Master',
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        passport: '',
        seatPreference: type === 'infant' ? 'Lap' : 'Window',
        mealPreference: 'Standard'
      }
    ]);
  };

  const removePassenger = (index) => {
    if (passengersList[index]?.isLead) return;
    if (passengersList.length <= 1) return;
    setPassengersList(prev => prev.filter((_, i) => i !== index));
    setPaxErrors(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

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

  const [shareCopied, setShareCopied] = useState(false);

  const generateItineraryText = () => {
    const leadPax = passengersList.find(p => p.isLead) || passengersList[0] || {};
    const leadName = `${leadPax.title || ''} ${leadPax.fullName || 'Valued Passenger'}`.trim();
    const orig = data.origin?.city || data.origin?.code || data.origin || 'JFK';
    const dest = data.destination?.city || data.destination?.code || data.destination || 'LHR';
    const flightNo = data.flightNumber || 'BA178';
    const airln = data.airline || 'British Airways';
    const depDate = data.departDate || '2026-08-20';
    const retDate = data.returnDate ? ` | Return: ${data.returnDate}` : '';
    const price = formatCurrency(totalFinalPrice, currency);

    const paxListText = passengersList.map((p, idx) => 
      `   ${idx + 1}. ${p.title} ${p.fullName} (${p.type.toUpperCase()}) - DOB: ${p.dob || 'N/A'} | Passport: ${p.passport ? p.passport.toUpperCase() : 'N/A'}`
    ).join('\n');

    return `✈️ ROYA BRIDGE TRAVELS - FLIGHT ITINERARY HOLD
📌 PNR Reference: ${pnr}
👤 Lead Passenger: ${leadName} (${leadPax.email || ''} | ${leadPax.phone || ''})
👥 Total Passengers: ${passengersCount} (${adultsCount} Adult${adultsCount > 1 ? 's' : ''}, ${childrenCount} Child${childrenCount !== 1 ? 'ren' : ''}, ${infantsCount} Infant${infantsCount !== 1 ? 's' : ''})
Passenger Manifest:
${paxListText}

🛫 Flight: ${airln} (${flightNo})
📍 Route: ${orig} ➔ ${dest}
📅 Departure: ${depDate}${retDate}
💺 Cabin Class: ${selectedCabin}
💰 Locked Fare: ${price} ($0 Paid Today)
⏱️ Status: 24-Hour Price Lock Confirmed

Track or Manage Reservation:
${window.location.origin}`;
  };

  const handleShareItinerary = async () => {
    const text = generateItineraryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `RoyaBridge Flight Itinerary - PNR ${pnr}`,
          text: text,
          url: window.location.origin
        });
        if (showToast) {
          showToast({
            type: 'success',
            title: 'Itinerary Shared!',
            message: `Flight itinerary PNR ${pnr} shared successfully.`
          });
        }
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    copyItineraryToClipboard();
  };

  const copyItineraryToClipboard = () => {
    const text = generateItineraryText();
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    if (showToast) {
      showToast({
        type: 'success',
        title: 'Itinerary Copied to Clipboard!',
        message: `PNR ${pnr} details & share link copied.`
      });
    }
    setTimeout(() => setShareCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateItineraryText());
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Flight Itinerary Hold - PNR ${pnr}`);
    const body = encodeURIComponent(generateItineraryText());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const toggleAddOn = (key) => {
    setAddOns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic Multi-Passenger Pricing Calculations
  const adultsCount = passengersList.filter(p => p.type === 'adult').length;
  const childrenCount = passengersList.filter(p => p.type === 'child').length;
  const infantsCount = passengersList.filter(p => p.type === 'infant').length;
  const passengersCount = passengersList.length;

  const baseRoyaPricePerPax = data?.savings?.finalPrice || data?.royaPrice || 840;
  const baseRetailPricePerPax = data?.savings?.originalPrice || data?.retailPrice || 1200;

  const CABIN_PRICING = {
    'Economy': -320,
    'Premium Economy': -150,
    'Business': 0,
    'First': 480
  };

  const cabinDelta = CABIN_PRICING[selectedCabin] !== undefined ? CABIN_PRICING[selectedCabin] : 0;
  
  const adultFare = Math.max(200, baseRoyaPricePerPax + cabinDelta);
  const childFare = Math.round(adultFare * 0.75);
  const infantFare = Math.round(adultFare * 0.10);

  const adultRetail = Math.max(300, baseRetailPricePerPax + cabinDelta);
  const childRetail = Math.round(adultRetail * 0.75);
  const infantRetail = Math.round(adultRetail * 0.10);

  const baseFlightTotal = (adultsCount * adultFare) + (childrenCount * childFare) + (infantsCount * infantFare);
  const baseRetailTotal = (adultsCount * adultRetail) + (childrenCount * childRetail) + (infantsCount * infantRetail);

  const ADD_ON_RATES = {
    travelInsurance: 49,
    conciergeProtection: 29,
    flexiBooking: 35,
    carbonOffset: 12
  };

  let addOnsTotalPerPax = 0;
  if (addOns.travelInsurance) addOnsTotalPerPax += ADD_ON_RATES.travelInsurance;
  if (addOns.conciergeProtection) addOnsTotalPerPax += ADD_ON_RATES.conciergeProtection;
  if (addOns.flexiBooking) addOnsTotalPerPax += ADD_ON_RATES.flexiBooking;
  if (addOns.carbonOffset) addOnsTotalPerPax += ADD_ON_RATES.carbonOffset;

  const payingPaxCount = adultsCount + childrenCount;
  const totalAddOnsAmount = addOnsTotalPerPax * payingPaxCount;

  const totalFinalPrice = baseFlightTotal + totalAddOnsAmount;
  const totalRetailPrice = baseRetailTotal + totalAddOnsAmount;
  const totalSavings = totalRetailPrice - totalFinalPrice;

  const handleConfirm = async () => {
    let hasError = false;
    const newPaxErrors = {};
    let firstErrorMsg = '';

    passengersList.forEach((pax, i) => {
      const errs = {};

      const fullNameToTest = pax.fullName || `${pax.firstName} ${pax.lastName}`.trim();
      const nameVal = validateName(fullNameToTest);
      if (!pax.firstName || !pax.firstName.trim()) {
        errs.firstName = 'First name is required';
        hasError = true;
        if (!firstErrorMsg) firstErrorMsg = `Passenger ${i+1} (${pax.type.toUpperCase()}): First name is required`;
      } else if (!pax.lastName || !pax.lastName.trim()) {
        errs.lastName = 'Last name is required';
        hasError = true;
        if (!firstErrorMsg) firstErrorMsg = `Passenger ${i+1} (${pax.type.toUpperCase()}): Last name is required`;
      } else if (!nameVal.isValid) {
        errs.firstName = nameVal.error;
        hasError = true;
        if (!firstErrorMsg) firstErrorMsg = `Passenger ${i+1}: ${nameVal.error}`;
      }

      const dobVal = validatePassengerDob(pax.dob, pax.type, pax.isLead);
      if (!dobVal.isValid) {
        errs.dob = dobVal.error;
        hasError = true;
        if (!firstErrorMsg) firstErrorMsg = `Passenger ${i+1} (${pax.type.toUpperCase()}): ${dobVal.error}`;
      }

      const passportVal = validatePassport(pax.passport);
      if (!passportVal.isValid) {
        errs.passport = passportVal.error;
        hasError = true;
        if (!firstErrorMsg) firstErrorMsg = `Passenger ${i+1} (${pax.type.toUpperCase()}): ${passportVal.error}`;
      }

      if (pax.isLead) {
        const emailVal = validateEmail(pax.email);
        if (!emailVal.isValid) {
          errs.email = emailVal.error;
          hasError = true;
          if (!firstErrorMsg) firstErrorMsg = `Lead Passenger: ${emailVal.error}`;
        }

        const phoneVal = validatePhone(pax.phone);
        if (!phoneVal.isValid) {
          errs.phone = phoneVal.error;
          hasError = true;
          if (!firstErrorMsg) firstErrorMsg = `Lead Passenger: ${phoneVal.error}`;
        }
      }

      if (Object.keys(errs).length > 0) {
        newPaxErrors[i] = errs;
      }
    });

    setPaxErrors(newPaxErrors);

    if (hasError) {
      setValidationError(firstErrorMsg || 'Please complete all required passenger information correctly.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 550);
      if (paxContainerRef.current) {
        paxContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setValidationError('');
    setSaving(true);

    try {
      const addOnsList = Object.keys(addOns).filter(k => addOns[k]);
      const leadPax = passengersList.find(p => p.isLead) || passengersList[0];

      const originCode = extractAirportCode(data.origin, 'JFK');
      const originCity = extractAirportCity(data.origin, originCode);
      const destCode = extractAirportCode(data.destination, 'LHR');
      const destCity = extractAirportCity(data.destination, destCode);

      const savedRecord = await saveBookingToDatabase({
        pnr: pnr,
        passengerName: `${leadPax.title} ${leadPax.fullName}`.trim(),
        passengerEmail: leadPax.email.trim(),
        passengerPhone: leadPax.phone.trim(),
        passengerDob: leadPax.dob.trim(),
        passengerPassport: leadPax.passport.trim().toUpperCase(),
        passengersList: passengersList,
        adultsCount: adultsCount,
        childrenCount: childrenCount,
        infantsCount: infantsCount,
        passengersCount: passengersCount,
        flightNumber: data.flightNumber || 'FL' + Math.floor(100 + Math.random() * 900),
        airline: data.airline || 'Partner Airline',
        origin: originCode,
        originCity: originCity,
        destination: destCode,
        destinationCity: destCity,
        departDate: data.departDate || new Date().toISOString().split('T')[0],
        returnDate: data.returnDate,
        tripType: data.tripType || 'round',
        cabinClass: selectedCabin,
        retailPrice: totalRetailPrice,
        royaPrice: totalFinalPrice,
        savings: totalSavings,
        selectedAddOns: addOnsList,
        seatPreference: leadPax.seatPreference,
        mealPreference: leadPax.mealPreference,
        specialRequests: specialRequests,
        aircraft: data.aircraft || 'Boeing 787 Dreamliner',
        status: 'CONFIRMED_HOLD'
      });

      setConfirmedSuccess(true);

      if (checkoutMode === 'flutterwave') {
        await openFlutterwavePayment({
          pnr: pnr,
          amount: totalFinalPrice,
          currency: currency || 'USD',
          passengerEmail: leadPax.email.trim(),
          passengerName: `${leadPax.title} ${leadPax.fullName}`.trim(),
          passengerPhone: leadPax.phone.trim(),
          flightNumber: data.flightNumber || 'FL101',
          airline: data.airline || 'Partner Airline',
          route: `${originCode} → ${destCode}`,
          onSuccess: async (payRes) => {
            setIsPaid(true);
            setFlwDetails(payRes);
            await updateBookingPaymentStatus(pnr, payRes);

            if (showToast) {
              showToast({
                type: 'success',
                title: 'Payment Confirmed!',
                message: `Ticket issued & confirmed for ${leadPax.fullName.trim()}. Payment ref: ${payRes.flw_ref || payRes.tx_ref || 'OK'}.`,
                pnr: pnr
              });
            }
          },
          onCancel: () => {
            if (showToast) {
              showToast({
                type: 'info',
                title: '24-Hour Hold Active',
                message: `Your PNR hold (${pnr}) is reserved. You can pay anytime in Manage Booking.`
              });
            }
          },
          onError: (err) => {
            setValidationError(err?.message || 'Payment process was cancelled or encountered an issue. Your PNR hold remains active.');
          }
        });
      } else {
        if (showToast) {
          showToast({
            type: 'success',
            title: 'Flight Reservation & Email Confirmed!',
            message: `24-Hour itinerary hold locked for ${leadPax.fullName.trim()} (${passengersCount} passengers). Confirmation email sent to ${leadPax.email.trim()}.`,
            pnr: pnr
          });
        }
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      setValidationError('Failed to store reservation in database. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const leadPax = passengersList.find(p => p.isLead) || passengersList[0];
    const nameVal = validateName(leadPax?.fullName || '');
    const emailVal = validateEmail(leadPax?.email || '');

    if (!nameVal.isValid || !emailVal.isValid) {
      setValidationError('Please enter a valid lead passenger full name and email address before printing your itinerary ticket.');
      return;
    }
    setValidationError('');
    window.print();
  };

  const handleStepClick = (stepId) => {
    if (stepId === 1) {
      onClose();
    } else if (stepId === 2) {
      const modalCard = document.querySelector('.glass-card');
      if (modalCard) modalCard.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (stepId === 3) {
      if (paxContainerRef.current) {
        paxContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (stepId === 4) {
      const paymentEl = document.getElementById('checkout-payment-section');
      if (paymentEl) {
        paymentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (!data) return null;

  const activeStepNumber = isPaid ? 4 : confirmedSuccess ? 4 : 3;

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
        maxWidth: '1100px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(16px, 3.5vw, 28px)'
      }}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '18px',
          marginBottom: '20px'
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

        {/* Multi-Step Checkout Progress Indicator */}
        <CheckoutProgressIndicator 
          currentStep={activeStepNumber}
          isConfirmed={confirmedSuccess}
          isPaid={isPaid}
          onStepClick={handleStepClick}
        />

        {/* 2-Column Checkout Layout */}
        <div className="checkout-modal-grid">
          
          {/* LEFT COLUMN: Options, Passengers & Add-ons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Flight Itinerary Overview */}
            <div style={{
              background: 'rgba(7, 11, 20, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-gold-bright)', fontWeight: 700 }}>
                  Flight Route & Carrier
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 600 }}>
                    {data.airline || 'British Airways'} • {data.flightNumber || 'BA178'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Origin</span>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#FFF' }}>
                    {data.origin?.city || data.origin} ({data.origin?.code || data.origin})
                  </strong>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
                    <div style={{ width: '30px', height: '1px', background: 'var(--color-gold)' }} />
                    <Plane size={15} color="var(--color-gold)" />
                    <div style={{ width: '30px', height: '1px', background: 'var(--color-gold)' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {data.tripType === 'round' ? 'Round Trip' : 'One Way'}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Destination</span>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#FFF' }}>
                    {data.destination?.city || data.destination} ({data.destination?.code || data.destination})
                  </strong>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px dashed rgba(255,255,255,0.1)',
                fontSize: '0.82rem',
                color: '#CBD5E1'
              }}>
                <div><strong>Depart:</strong> {data.departDate}</div>
                {data.returnDate && <div><strong>Return:</strong> {data.returnDate}</div>}
                <div><strong>Passengers:</strong> {passengersCount} Adult(s)</div>
                <div><strong>Aircraft:</strong> {data.aircraft || 'Boeing 787'}</div>
              </div>
            </div>



            {/* Interactive Cabin Class Selector */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-gold-bright)', display: 'block', marginBottom: '8px' }}>
                Select Cabin Class Upgrade
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {[
                  { name: 'Economy', priceNote: '-$320' },
                  { name: 'Premium Economy', priceNote: '-$150' },
                  { name: 'Business', priceNote: 'Standard Rate' },
                  { name: 'First', priceNote: '+$480 Upgrade' }
                ].map(cabin => {
                  const isSelected = selectedCabin === cabin.name;
                  return (
                    <button
                      key={cabin.name}
                      type="button"
                      onClick={() => setSelectedCabin(cabin.name)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(229,193,88,0.15)' : 'rgba(7,11,20,0.6)',
                        border: isSelected ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)',
                        color: isSelected ? 'var(--color-gold-bright)' : '#CBD5E1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.88rem' }}>
                          {cabin.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isSelected ? 'var(--color-gold)' : '#94A3B8' }}>
                          {cabin.priceNote}
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="var(--color-gold)" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Travel Insurance & Add-ons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-gold-bright)', margin: 0 }}>
                  Travel Insurance & Protection Add-ons
                </label>
                <span style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>
                  <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Real-time Price Adjustment
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* Addon 1: Comprehensive Insurance */}
                <div 
                  onClick={() => toggleAddOn('travelInsurance')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.travelInsurance ? 'rgba(16, 185, 129, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.travelInsurance ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.travelInsurance} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: '#10B981' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        Comprehensive Travel & Medical Insurance
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Coverage for medical emergencies, flight delays & lost baggage up to $50,000.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6EE7B7' }}>
                      +$49
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

                {/* Addon 2: VIP Concierge Protection */}
                <div 
                  onClick={() => toggleAddOn('conciergeProtection')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.conciergeProtection ? 'rgba(229, 193, 88, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.conciergeProtection ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.conciergeProtection} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: 'var(--color-gold)' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        VIP Fast-Track & Disruption Monitoring
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        24/7 dedicated travel concierge assistant & instant re-booking on flight changes.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                      +$29
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

                {/* Addon 3: Flexi Date Guarantee */}
                <div 
                  onClick={() => toggleAddOn('flexiBooking')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.flexiBooking ? 'rgba(129, 140, 248, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.flexiBooking ? '1px solid #818CF8' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.flexiBooking} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: '#818CF8' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        Flexi-Date Change Guarantee
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Zero change fee penalty for shifting departure or return dates up to 2h prior.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#A5B4FC' }}>
                      +$35
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

                {/* Addon 4: Eco Carbon Offset */}
                <div 
                  onClick={() => toggleAddOn('carbonOffset')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.carbonOffset ? 'rgba(52, 211, 153, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.carbonOffset ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.carbonOffset} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: '#34D399' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        100% SAF Carbon Neutral Eco-Pass
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Certified Sustainable Aviation Fuel offset for your flight carbon footprint.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6EE7B7' }}>
                      +$12
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Passenger Contact Form */}
            <div ref={paxContainerRef} className={isShaking ? 'shake-error-container' : ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', color: 'var(--color-gold-bright)', margin: 0, fontWeight: 800 }}>
                    Passenger Information ({passengersCount} {passengersCount === 1 ? 'Passenger' : 'Passengers'})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {adultsCount} Adult{adultsCount > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}` : ''}{infantsCount > 0 ? `, ${infantsCount} Infant${infantsCount > 1 ? 's' : ''}` : ''}
                  </span>
                </div>

                {/* Quick Add Companion Buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => addPassenger('adult')}
                    disabled={passengersCount >= 9}
                    style={{
                      background: 'rgba(229,193,88,0.12)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--color-gold)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: passengersCount >= 9 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + Adult
                  </button>
                  <button
                    type="button"
                    onClick={() => addPassenger('child')}
                    disabled={passengersCount >= 9}
                    style={{
                      background: 'rgba(229,193,88,0.12)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--color-gold)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: passengersCount >= 9 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + Child
                  </button>
                  <button
                    type="button"
                    onClick={() => addPassenger('infant')}
                    disabled={passengersCount >= 9}
                    style={{
                      background: 'rgba(229,193,88,0.12)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--color-gold)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: passengersCount >= 9 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + Infant
                  </button>
                </div>
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
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(7, 11, 20, 0.95) 100%)',
                  border: '1.5px solid #10B981',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  marginBottom: '20px',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <CheckCircle2 size={22} color="#10B981" />
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#6EE7B7', letterSpacing: '0.02em' }}>
                          FLIGHT HOLD RESERVED
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#CBD5E1', margin: 0 }}>
                        Lead Pax: <strong style={{ color: '#FFF' }}>{passengersList[0]?.fullName}</strong> ({passengersList[0]?.email})
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>PNR REFERENCE</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--color-gold-bright)', letterSpacing: '0.08em' }}>{pnr}</strong>
                    </div>
                  </div>

                  {/* Confirmation Email Sent Callout */}
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid #3B82F6',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.82rem',
                    color: '#93C5FD'
                  }}>
                    <Mail size={18} color="#60A5FA" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#FFF' }}>Confirmation Email Sent!</strong> Complete booking manifest with PNR reference <strong style={{ color: '#E5C158' }}>{pnr}</strong> for all {passengersCount} passenger(s) sent to <strong style={{ color: '#FFF' }}>{passengersList[0]?.email}</strong>.
                    </div>
                  </div>

                  {/* Manifest Summary */}
                  <div style={{ background: 'rgba(7, 11, 20, 0.7)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-gold-bright)', marginBottom: '8px' }}>
                      Passenger Manifest ({passengersCount})
                    </div>
                    {passengersList.map((p, idx) => (
                      <div key={p.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < passengersList.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <span>
                          <strong>{p.title} {p.fullName}</strong> ({p.type.toUpperCase()})
                        </span>
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                          DOB: {p.dob || 'N/A'} | Pass: {p.passport?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Share Itinerary Action Buttons */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Share2 size={16} color="var(--color-gold)" /> Share Reserved Itinerary
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Send confirmation & PNR to travel companions
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleShareItinerary}
                        className="btn-gold"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                      >
                        <Share2 size={14} />
                        Share Itinerary
                      </button>

                      <button
                        type="button"
                        onClick={shareViaWhatsApp}
                        style={{
                          background: 'rgba(37, 211, 102, 0.15)',
                          border: '1px solid #25D366',
                          color: '#25D366',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={shareViaEmail}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid #3B82F6',
                          color: '#60A5FA',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Mail size={14} /> Email
                      </button>

                      <button
                        type="button"
                        onClick={copyItineraryToClipboard}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFF',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {shareCopied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                        {shareCopied ? 'Copied!' : 'Copy Details'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Passenger Input Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {passengersList.map((pax, index) => {
                  const errs = paxErrors[index] || {};
                  const hasCardError = Object.keys(errs).length > 0;
                  return (
                    <div 
                      key={pax.id || index}
                      className={hasCardError && isShaking ? 'shake-error-card' : ''}
                      style={{
                        background: hasCardError ? 'rgba(239, 68, 68, 0.06)' : 'rgba(7, 11, 20, 0.65)',
                        border: hasCardError 
                          ? '1.5px solid #EF4444' 
                          : pax.isLead 
                          ? '1.5px solid var(--border-gold)' 
                          : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: hasCardError ? '0 0 12px rgba(239, 68, 68, 0.25)' : 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px',
                        position: 'relative',
                        transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            background: pax.isLead ? 'var(--color-gold)' : '#334155', 
                            color: pax.isLead ? '#070B14' : '#FFF', 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            padding: '2px 6px', 
                            borderRadius: '4px' 
                          }}>
                            PAX {index + 1}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
                            {pax.isLead ? 'Lead Passenger (Primary Contact)' : pax.type === 'adult' ? 'Adult Passenger (12+ yrs)' : pax.type === 'child' ? 'Child Passenger (2–11 yrs)' : 'Infant Passenger (Under 2 yrs)'}
                          </span>
                        </div>

                        {!pax.isLead && (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>

                      <div className="passenger-form-grid">
                        {/* Title */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            Title
                          </label>
                          <select
                            value={pax.title}
                            onChange={(e) => updatePassengerField(index, 'title', e.target.value)}
                            style={modalInputStyle}
                          >
                            {pax.type === 'adult' ? (
                              <>
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                                <option value="Dr">Dr</option>
                              </>
                            ) : (
                              <>
                                <option value="Master">Master</option>
                                <option value="Miss">Miss</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* First Name */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            First Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Given name"
                            value={pax.firstName}
                            onChange={(e) => updatePassengerField(index, 'firstName', e.target.value)}
                            style={{
                              ...modalInputStyle,
                              borderColor: errs.firstName ? '#EF4444' : 'var(--border-gold)'
                            }}
                          />
                          {errs.firstName && <span style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>{errs.firstName}</span>}
                        </div>

                        {/* Last Name */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            Last Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Surname"
                            value={pax.lastName}
                            onChange={(e) => updatePassengerField(index, 'lastName', e.target.value)}
                            style={{
                              ...modalInputStyle,
                              borderColor: errs.lastName ? '#EF4444' : 'var(--border-gold)'
                            }}
                          />
                          {errs.lastName && <span style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>{errs.lastName}</span>}
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            Date of Birth <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="date"
                            value={pax.dob}
                            onChange={(e) => updatePassengerField(index, 'dob', e.target.value)}
                            style={{
                              ...modalInputStyle,
                              borderColor: errs.dob ? '#EF4444' : 'var(--border-gold)',
                              colorScheme: 'dark'
                            }}
                          />
                          {errs.dob ? (
                            <span style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>{errs.dob}</span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                              {pax.isLead ? 'Must be 18+' : pax.type === 'adult' ? '12+ yrs' : pax.type === 'child' ? 'Age 2–11 yrs' : 'Under 2 yrs'}
                            </span>
                          )}
                        </div>

                        {/* Passport Number */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            Passport Number <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Passport / ID"
                            value={pax.passport}
                            onChange={(e) => updatePassengerField(index, 'passport', e.target.value.toUpperCase())}
                            style={{
                              ...modalInputStyle,
                              borderColor: errs.passport ? '#EF4444' : 'var(--border-gold)'
                            }}
                          />
                          {errs.passport && <span style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>{errs.passport}</span>}
                        </div>

                        {/* Lead Only: Email */}
                        {pax.isLead && (
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                              Email Address <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                              type="email"
                              placeholder="alex@example.com"
                              value={pax.email}
                              onChange={(e) => updatePassengerField(index, 'email', e.target.value)}
                              style={{
                                ...modalInputStyle,
                                borderColor: errs.email ? '#EF4444' : 'var(--border-gold)'
                              }}
                            />
                            {errs.email && <span style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>{errs.email}</span>}
                          </div>
                        )}

                        {/* Lead Only: Phone */}
                        {pax.isLead && (
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                              Phone / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                              type="tel"
                              placeholder="+1 555-0192"
                              value={pax.phone}
                              onChange={(e) => updatePassengerField(index, 'phone', e.target.value)}
                              style={{
                                ...modalInputStyle,
                                borderColor: errs.phone ? '#EF4444' : 'var(--border-gold)'
                              }}
                            />
                            {errs.phone && <span style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>{errs.phone}</span>}
                          </div>
                        )}

                        {/* Seat Preference */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            Seat Preference
                          </label>
                          <select
                            value={pax.seatPreference}
                            onChange={(e) => updatePassengerField(index, 'seatPreference', e.target.value)}
                            style={modalInputStyle}
                          >
                            <option value="Window">Window</option>
                            <option value="Aisle">Aisle</option>
                            <option value="Extra Legroom">Extra Legroom</option>
                            <option value="Lap">In Lap (Infant)</option>
                          </select>
                        </div>

                        {/* Meal Request */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                            Meal Request
                          </label>
                          <select
                            value={pax.mealPreference}
                            onChange={(e) => updatePassengerField(index, 'mealPreference', e.target.value)}
                            style={modalInputStyle}
                          >
                            <option value="Standard">Standard Gourmet</option>
                            <option value="Child/Infant Meal">Child/Infant Meal</option>
                            <option value="Vegetarian">Vegetarian/Vegan</option>
                            <option value="Halal">Halal</option>
                            <option value="Kosher">Kosher</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN: STICKY REAL-TIME BOOKING SUMMARY SIDEBAR */}
          <div style={{
            position: 'sticky',
            top: '0px',
            background: 'linear-gradient(180deg, #131B2E 0%, #0A0F1D 100%)',
            border: '1.5px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
          }}>

            {/* Sidebar Title & Live Status */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(229,193,88,0.2)',
              paddingBottom: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 800, letterSpacing: '0.05em' }}>
                  REAL-TIME CHECKOUT
                </span>
                <h3 style={{ fontSize: '1.15rem', color: '#FFF', fontWeight: 800, margin: 0 }}>
                  Booking Summary
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  color: '#6EE7B7',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} className="animate-pulse" />
                  Live Updated
                </div>
              </div>
            </div>

            {/* PNR Hold Banner */}
            <div style={{
              background: 'rgba(229,193,88,0.08)',
              border: '1px dashed rgba(229,193,88,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>PNR HOLD REF</span>
                <strong style={{ fontSize: '1.05rem', color: '#FFF', letterSpacing: '0.08em' }}>{pnr}</strong>
              </div>
              <button 
                type="button" 
                onClick={copyPNR}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-gold)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <CheckCircle2 size={14} color="#10B981" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Timer Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color="var(--color-gold)" /> 24h Lock Guarantee
              </span>
              <strong style={{ color: '#6EE7B7' }}>{formatTime(timeLeft)}</strong>
            </div>

            {/* Itemized Real-Time Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span>
                  Adult Fare ({adultsCount} x {formatCurrency(adultFare, currency)})
                </span>
                <span>{formatCurrency(adultsCount * adultFare, currency)}</span>
              </div>

              {childrenCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                  <span>
                    Child Fare ({childrenCount} x {formatCurrency(childFare, currency)})
                  </span>
                  <span>{formatCurrency(childrenCount * childFare, currency)}</span>
                </div>
              )}

              {infantsCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                  <span>
                    Infant Fare ({infantsCount} x {formatCurrency(infantFare, currency)})
                  </span>
                  <span>{formatCurrency(infantsCount * infantFare, currency)}</span>
                </div>
              )}

              {addOns.travelInsurance && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6EE7B7', fontSize: '0.8rem' }}>
                  <span>+ Medical Insurance ({payingPaxCount} pax)</span>
                  <span>+{formatCurrency(ADD_ON_RATES.travelInsurance * payingPaxCount, currency)}</span>
                </div>
              )}

              {addOns.conciergeProtection && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold-bright)', fontSize: '0.8rem' }}>
                  <span>+ VIP Protection ({payingPaxCount} pax)</span>
                  <span>+{formatCurrency(ADD_ON_RATES.conciergeProtection * payingPaxCount, currency)}</span>
                </div>
              )}

              {addOns.flexiBooking && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A5B4FC', fontSize: '0.8rem' }}>
                  <span>+ Flexi-Date Guarantee ({payingPaxCount} pax)</span>
                  <span>+{formatCurrency(ADD_ON_RATES.flexiBooking * payingPaxCount, currency)}</span>
                </div>
              )}

              {addOns.carbonOffset && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399', fontSize: '0.8rem' }}>
                  <span>+ Eco Carbon Offset ({payingPaxCount} pax)</span>
                  <span>+{formatCurrency(ADD_ON_RATES.carbonOffset * payingPaxCount, currency)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.78rem' }}>
                <span>Airport Taxes & Airline Surcharges</span>
                <span style={{ color: '#6EE7B7' }}>Included ($0)</span>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

            {/* Total Price Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Total Reserved Fare</span>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                    {formatCurrency(totalRetailPrice, currency)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--color-gold-bright)', lineHeight: 1 }}>
                    {formatCurrency(totalFinalPrice, currency)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 700 }}>
                    You Save {formatCurrency(totalSavings, currency)} (30% OFF)
                  </span>
                </div>
              </div>

            </div>

            {/* Payment Verified Banner if Paid */}
            {isPaid ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)',
                border: '1.5px solid #10B981',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                textAlign: 'center',
                color: '#6EE7B7',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircle size={18} color="#10B981" /> TICKET PAID & CONFIRMED
                </div>
                <span style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 600 }}>
                  Ref: {flwDetails?.flw_ref || flwDetails?.tx_ref || 'SUCCESS'}
                </span>
              </div>
            ) : (
              /* Payment Method Option Selector */
              <div id="checkout-payment-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  CHOOSE CHECKOUT MODE
                </span>

                {/* Option 1: Instant Payment */}
                <div 
                  onClick={() => setCheckoutMode('flutterwave')}
                  style={{
                    background: checkoutMode === 'flutterwave' ? 'rgba(229,193,88,0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: checkoutMode === 'flutterwave' ? '1.5px solid var(--border-gold)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: checkoutMode === 'flutterwave' ? '5px solid var(--color-gold)' : '2px solid #64748B',
                      background: '#0F172A'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={15} color="var(--color-gold-bright)" /> Pay Now & Issue Ticket
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Cards, M-Pesa, Mobile Money, Bank Transfer, Apple Pay
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#6EE7B7', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    Instant
                  </span>
                </div>

                {/* Option 2: 24h Free Hold */}
                <div 
                  onClick={() => setCheckoutMode('hold')}
                  style={{
                    background: checkoutMode === 'hold' ? 'rgba(229,193,88,0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: checkoutMode === 'hold' ? '1.5px solid var(--border-gold)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: checkoutMode === 'hold' ? '5px solid var(--color-gold)' : '2px solid #64748B',
                      background: '#0F172A'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color="#38BDF8" /> 24-Hour Hold ($0 Today)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Lock fare price for 24 hours free. Pay later.
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    $0 Now
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!confirmedSuccess ? (
                <button 
                  type="button"
                  onClick={handleConfirm}
                  className="btn-gold"
                  disabled={saving}
                  style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 800 }}
                >
                  {saving ? <Activity className="animate-spin" size={16} /> : (checkoutMode === 'flutterwave' ? <CreditCard size={16} /> : <MessageCircle size={16} />)}
                  {saving ? 'Processing Booking...' : (checkoutMode === 'flutterwave' ? `Pay ${formatCurrency(totalFinalPrice, currency)}` : 'Confirm Flight Hold ($0 Now)')}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleShareItinerary}
                  className="btn-gold"
                  style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 800, background: '#10B981', color: '#070B14', border: 'none' }}
                >
                  <Share2 size={16} />
                  Share Confirmed Itinerary
                </button>
              )}

              <button 
                type="button"
                onClick={handlePrint}
                className="btn-outline-gold"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
              >
                <Printer size={15} />
                Print / Save Itinerary PDF
              </button>
            </div>

            {/* Guarantees & Legal Links */}
            <div style={{ 
              fontSize: '0.73rem', 
              color: '#94A3B8', 
              textAlign: 'center', 
              lineHeight: 1.5,
              background: 'rgba(7, 11, 20, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div>
                🛡️ Official PNR hold stored securely in database. Cancel anytime within 24 hours at no cost.
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '12px', 
                paddingTop: '6px', 
                borderTop: '1px solid rgba(255,255,255,0.08)' 
              }}>
                <button
                  type="button"
                  onClick={() => onOpenRefunds && onOpenRefunds()}
                  style={{ background: 'none', border: 'none', color: 'var(--color-gold-bright)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.73rem', padding: 0 }}
                >
                  Refund Policy
                </button>
                <span style={{ color: '#475569' }}>•</span>
                <button
                  type="button"
                  onClick={() => onOpenTerms && onOpenTerms()}
                  style={{ background: 'none', border: 'none', color: 'var(--color-gold-bright)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.73rem', padding: 0 }}
                >
                  Terms of Service
                </button>
              </div>
            </div>

          </div>

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
  fontSize: '0.88rem',
  width: '100%',
  outline: 'none'
};

