import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  RefreshCw, 
  Mail, 
  Plane, 
  MapPin, 
  Tag, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  KeyRound,
  FileSpreadsheet,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { 
  PRIMARY_ADMIN_EMAIL,
  MASTER_ADMIN_PASSCODE,
  getSavedAdminSession, 
  saveAdminSession, 
  clearAdminSession, 
  loginAdminWithGoogle, 
  loginAdminWithPasscode,
  fetchAllBookingsAdmin, 
  createBookingAdmin, 
  updateBookingAdmin, 
  deleteBookingAdmin, 
  resendBookingConfirmationAdmin,
  fetchAllDestinationsAdmin,
  saveDestinationAdmin,
  deleteDestinationAdmin,
  fetchAllFlightStatusesAdmin,
  saveFlightStatusAdmin,
  deleteFlightStatusAdmin,
  fetchAllPromosAdmin,
  savePromoAdmin,
  deletePromoAdmin,
  fetchAllInquiriesAdmin,
  updateInquiryStatusAdmin,
  deleteInquiryAdmin
} from '../lib/adminService';
import { formatCurrency } from '../utils/pnrGenerator';

export default function AdminPortalModal({ isOpen, onClose, currency = 'USD' }) {
  // Session state
  const [adminSession, setAdminSession] = useState(getSavedAdminSession());
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'destinations' | 'flights' | 'promos' | 'inquiries' | 'analytics'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState(PRIMARY_ADMIN_EMAIL);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Data states
  const [bookings, setBookings] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [flightStatuses, setFlightStatuses] = useState([]);
  const [promos, setPromos] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [notification, setNotification] = useState(null);

  // Search & Filter states
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');

  // Modals for editing / creating
  const [editBookingModal, setEditBookingModal] = useState(null);
  const [createBookingModal, setCreateBookingModal] = useState(false);
  const [editDestModal, setEditDestModal] = useState(null);
  const [createDestModal, setCreateDestModal] = useState(false);
  const [editFlightModal, setEditFlightModal] = useState(null);
  const [createFlightModal, setCreateFlightModal] = useState(false);
  const [editPromoModal, setEditPromoModal] = useState(null);
  const [createPromoModal, setCreatePromoModal] = useState(false);
  const [resendingPnr, setResendingPnr] = useState(null);

  // Check existing session
  useEffect(() => {
    const session = getSavedAdminSession();
    setAdminSession(session);
  }, [isOpen]);

  // Load Admin Data when authenticated and open
  useEffect(() => {
    if (isOpen && adminSession) {
      loadAllAdminData();
    }
  }, [isOpen, adminSession]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [bList, dList, fList, pList, iList] = await Promise.all([
        fetchAllBookingsAdmin(),
        fetchAllDestinationsAdmin(),
        fetchAllFlightStatusesAdmin(),
        fetchAllPromosAdmin(),
        fetchAllInquiriesAdmin()
      ]);
      setBookings(bList);
      setDestinations(dList);
      setFlightStatuses(fList);
      setPromos(pList);
      setInquiries(iList);
    } catch (err) {
      console.error('Error loading admin records:', err);
      showNotification('Failed to load some admin records from database.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  // Login Handlers
  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const session = await loginAdminWithGoogle();
      setAdminSession(session);
      showNotification(`Welcome back, ${session.displayName}!`);
    } catch (err) {
      setLoginError(err.message || 'Google sign-in authorization failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasscodeLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const session = await loginAdminWithPasscode(loginEmail, loginPasscode);
      setAdminSession(session);
      showNotification(`Welcome, ${session.displayName}!`);
    } catch (err) {
      setLoginError(err.message || 'Invalid passcode or email.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
    showNotification('Logged out of Admin Portal.', 'info');
  };

  // Booking CRUD Handlers
  const handleSaveBooking = async (formData) => {
    try {
      if (editBookingModal) {
        await updateBookingAdmin(editBookingModal.pnr, formData);
        showNotification(`Booking PNR ${editBookingModal.pnr} updated successfully.`);
      } else {
        const newBooking = await createBookingAdmin(formData);
        showNotification(`New Booking created with PNR: ${newBooking.pnr}`);
      }
      setEditBookingModal(null);
      setCreateBookingModal(false);
      loadAllAdminData();
    } catch (err) {
      showNotification(err.message || 'Failed to save booking.', 'error');
    }
  };

  const handleDeleteBooking = async (pnr) => {
    if (!window.confirm(`Are you sure you want to delete and cancel booking PNR: ${pnr}? This cannot be undone.`)) return;
    try {
      await deleteBookingAdmin(pnr);
      showNotification(`Booking PNR ${pnr} deleted.`);
      loadAllAdminData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete booking.', 'error');
    }
  };

  const handleResendEmail = async (booking) => {
    setResendingPnr(booking.pnr);
    try {
      await resendBookingConfirmationAdmin(booking);
      showNotification(`Confirmation email resent to ${booking.passengerEmail}`);
    } catch (err) {
      showNotification(err.message || 'Failed to resend confirmation email.', 'error');
    } finally {
      setResendingPnr(null);
    }
  };

  const handleExportBookingsCSV = () => {
    if (bookings.length === 0) {
      showNotification('No bookings to export', 'error');
      return;
    }
    const headers = ['PNR', 'Passenger Name', 'Email', 'Phone', 'Flight', 'Airline', 'Origin', 'Destination', 'Depart Date', 'Return Date', 'Cabin', 'Status', 'Roya Price USD', 'Created At'];
    const rows = bookings.map(b => [
      b.pnr,
      `"${(b.passengerName || '').replace(/"/g, '""')}"`,
      b.passengerEmail || '',
      b.passengerPhone || '',
      b.flightNumber || '',
      `"${(b.airline || '').replace(/"/g, '""')}"`,
      b.origin || '',
      b.destination || '',
      b.departDate || '',
      b.returnDate || '',
      b.cabinClass || '',
      b.status || '',
      b.royaPrice || 0,
      b.createdAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RoyaBridge_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Bookings exported to CSV file.');
  };

  // Destination CRUD Handlers
  const handleSaveDestination = async (formData) => {
    try {
      await saveDestinationAdmin(formData);
      showNotification(`Destination "${formData.name}" saved.`);
      setEditDestModal(null);
      setCreateDestModal(false);
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to save destination.', 'error');
    }
  };

  const handleDeleteDestination = async (destId) => {
    if (!window.confirm('Delete this destination package?')) return;
    try {
      await deleteDestinationAdmin(destId);
      showNotification('Destination removed.');
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to delete destination.', 'error');
    }
  };

  // Flight Status CRUD
  const handleSaveFlightStatus = async (formData) => {
    try {
      await saveFlightStatusAdmin(formData);
      showNotification(`Flight status ${formData.flightNumber} saved.`);
      setEditFlightModal(null);
      setCreateFlightModal(false);
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to save flight status.', 'error');
    }
  };

  const handleDeleteFlightStatus = async (flightNumber) => {
    if (!window.confirm(`Delete flight status for ${flightNumber}?`)) return;
    try {
      await deleteFlightStatusAdmin(flightNumber);
      showNotification(`Flight status ${flightNumber} deleted.`);
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to delete flight status.', 'error');
    }
  };

  // Promo CRUD
  const handleSavePromo = async (formData) => {
    try {
      await savePromoAdmin(formData);
      showNotification(`Promo code ${formData.code} saved.`);
      setEditPromoModal(null);
      setCreatePromoModal(false);
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to save promo.', 'error');
    }
  };

  const handleDeletePromo = async (code) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return;
    try {
      await deletePromoAdmin(code);
      showNotification(`Promo code ${code} deleted.`);
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to delete promo.', 'error');
    }
  };

  // Inquiry Status Handler
  const handleUpdateInquiry = async (id, status) => {
    try {
      await updateInquiryStatusAdmin(id, { status });
      showNotification(`Inquiry updated to ${status}.`);
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to update inquiry.', 'error');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this customer inquiry?')) return;
    try {
      await deleteInquiryAdmin(id);
      showNotification('Inquiry removed.');
      loadAllAdminData();
    } catch (err) {
      showNotification('Failed to delete inquiry.', 'error');
    }
  };

  if (!isOpen) return null;

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const q = bookingSearch.toLowerCase().trim();
    const matchQuery = !q || 
      (b.pnr && b.pnr.toLowerCase().includes(q)) ||
      (b.passengerName && b.passengerName.toLowerCase().includes(q)) ||
      (b.passengerEmail && b.passengerEmail.toLowerCase().includes(q)) ||
      (b.flightNumber && b.flightNumber.toLowerCase().includes(q)) ||
      (b.airline && b.airline.toLowerCase().includes(q)) ||
      (b.origin && b.origin.toLowerCase().includes(q)) ||
      (b.destination && b.destination.toLowerCase().includes(q));

    if (bookingFilterStatus === 'ALL') return matchQuery;
    if (bookingFilterStatus === 'HOLDS') return matchQuery && (b.status === 'CONFIRMED_HOLD' || !b.status);
    if (bookingFilterStatus === 'PAID') return matchQuery && (b.status === 'PAID_TICKET_ISSUED' || b.isPaid);
    if (bookingFilterStatus === 'CANCELLED') return matchQuery && b.status === 'CANCELLED';
    if (bookingFilterStatus === 'EXPIRED') return matchQuery && b.status === 'EXPIRED';
    return matchQuery;
  });

  // Calculate Metrics
  const totalRevenueUSD = bookings
    .filter(b => b.status === 'PAID_TICKET_ISSUED' || b.isPaid)
    .reduce((sum, b) => sum + (Number(b.royaPrice) || 0), 0);
  
  const activeHoldsCount = bookings.filter(b => b.status === 'CONFIRMED_HOLD' || (!b.status && !b.isPaid)).length;
  const ticketedCount = bookings.filter(b => b.status === 'PAID_TICKET_ISSUED' || b.isPaid).length;

  return (
    <div className="admin-portal-overlay">
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 100000,
          background: notification.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="admin-portal-container">

        {/* -------------------------------------------------------------
            PORTAL HEADER
           ------------------------------------------------------------- */}
        <div className="admin-portal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #E5C158 0%, #997B28 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 900,
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  RoyaBridge Executive Portal
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'rgba(229,193,88,0.15)',
                  color: 'var(--color-gold-bright)',
                  border: '1px solid var(--border-gold)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}>
                  Live DB
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                Global Flight Reservation & Content Management System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {adminSession && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(229,193,88,0.2)',
                maxWidth: '220px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                  flexShrink: 0
                }} />
                <span style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminSession.email}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginLeft: '4px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                  title="Sign out of admin"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              title="Close Admin Portal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            PORTAL BODY: LOGIN GUARD OR AUTHENTICATED DASHBOARD
           ------------------------------------------------------------- */}
        {!adminSession ? (
          /* =========================================================
             ADMIN LOGIN SCREEN (RESPONSIVE)
             ========================================================= */
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 12px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, #070D1E 100%)'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '480px',
              background: '#0F172A',
              border: '1px solid var(--border-gold)',
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 32px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 25px rgba(229,193,88,0.1)',
              margin: 'auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(229, 193, 88, 0.15)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--color-gold-bright)'
                }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
                  Admin Authorization
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                  Authorized access for RoyaBridge Flight Operations & Support
                </p>
              </div>

              {loginError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  color: '#FCA5A5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Authorized Staff Login Account Selector */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(229,193,88,0.2)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={13} />
                  <span>PRE-AUTHORIZED CREDENTIALS</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('support@royabridge.com');
                      setLoginPasscode('RoyaAdmin2026!');
                    }}
                    style={{
                      background: loginEmail === 'support@royabridge.com' ? 'rgba(229,193,88,0.2)' : 'rgba(15,23,42,0.8)',
                      border: loginEmail === 'support@royabridge.com' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      color: loginEmail === 'support@royabridge.com' ? '#FFF' : '#94A3B8',
                      fontSize: '0.74rem',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>support@royabridge.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('ugbabechoco@gmail.com');
                      setLoginPasscode('RoyaAdmin2026!');
                    }}
                    style={{
                      background: loginEmail === 'ugbabechoco@gmail.com' ? 'rgba(229,193,88,0.2)' : 'rgba(15,23,42,0.8)',
                      border: loginEmail === 'ugbabechoco@gmail.com' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      color: loginEmail === 'ugbabechoco@gmail.com' ? '#FFF' : '#94A3B8',
                      fontSize: '0.74rem',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>ugbabechoco@gmail.com</span>
                  </button>
                </div>
              </div>

              {/* 1. Google Sign-In with popup */}
              <button
                onClick={handleGoogleLogin}
                disabled={loginLoading}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  background: '#FFF',
                  color: '#1E293B',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  marginBottom: '16px',
                  transition: 'transform 0.15s'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{loginLoading ? 'Authenticating...' : 'Sign in with Google Admin'}</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '14px 0',
                color: '#64748B',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <div style={{ flex: 1, height: '1px', background: '#334155' }} />
                <span>OR ADMIN CREDENTIALS</span>
                <div style={{ flex: 1, height: '1px', background: '#334155' }} />
              </div>

              {/* 2. Admin Passkey Form */}
              <form onSubmit={handlePasscodeLogin}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px', fontWeight: 600 }}>
                    Username / Admin Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="support@royabridge.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px', fontWeight: 600 }}>
                    Password / Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasscode ? "text" : "password"}
                      value={loginPasscode}
                      onChange={(e) => setLoginPasscode(e.target.value)}
                      placeholder="Enter admin passcode"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 38px 10px 12px',
                        background: '#1E293B',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px'
                      }}
                      title={showPasscode ? "Hide password" : "Show password"}
                    >
                      {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: 'linear-gradient(135deg, #E5C158 0%, #B89736 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: loginLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(229,193,88,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <KeyRound size={17} />
                  <span>{loginLoading ? 'Verifying...' : 'Unlock Admin Operations'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* =========================================================
             AUTHENTICATED ADMIN WORKSPACE
             ========================================================= */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Top Navigation Tabs & Quick Metrics */}
            <div style={{
              background: '#0E1726',
              borderBottom: '1px solid rgba(229,193,88,0.15)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              flexShrink: 0
            }}>
              {/* Tabs with smooth horizontal touch scroll */}
              <div className="admin-tabs-scroll" style={{ flex: '1 1 auto', minWidth: '240px' }}>
                <button
                  onClick={() => setActiveTab('bookings')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'bookings' ? 'var(--color-gold)' : 'transparent',
                    color: activeTab === 'bookings' ? '#000' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Plane size={15} />
                  <span>Bookings & PNRs ({bookings.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('destinations')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'destinations' ? 'var(--color-gold)' : 'transparent',
                    color: activeTab === 'destinations' ? '#000' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={15} />
                  <span>Destinations ({destinations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('flights')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'flights' ? 'var(--color-gold)' : 'transparent',
                    color: activeTab === 'flights' ? '#000' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Clock size={15} />
                  <span>Flight Schedules ({flightStatuses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('promos')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'promos' ? 'var(--color-gold)' : 'transparent',
                    color: activeTab === 'promos' ? '#000' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Tag size={15} />
                  <span>Promos ({promos.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'inquiries' ? 'var(--color-gold)' : 'transparent',
                    color: activeTab === 'inquiries' ? '#000' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <MessageSquare size={15} />
                  <span>Inquiries ({inquiries.length})</span>
                </button>
              </div>

              {/* Quick Actions / Refresh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                <button
                  onClick={loadAllAdminData}
                  disabled={loadingData}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#E2E8F0',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                  title="Sync with Firestore Database"
                >
                  <RefreshCw size={13} className={loadingData ? 'animate-spin' : ''} />
                  <span>Sync DB</span>
                </button>

                {activeTab === 'bookings' && (
                  <>
                    <button
                      onClick={handleExportBookingsCSV}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10B981',
                        borderRadius: '8px',
                        color: '#34D399',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Download size={13} />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={() => setCreateBookingModal(true)}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #E5C158 0%, #B89736 100%)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Plus size={15} />
                      <span>New Booking</span>
                    </button>
                  </>
                )}

                {activeTab === 'destinations' && (
                  <button
                    onClick={() => setCreateDestModal(true)}
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #E5C158 0%, #B89736 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Destination</span>
                  </button>
                )}

                {activeTab === 'flights' && (
                  <button
                    onClick={() => setCreateFlightModal(true)}
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #E5C158 0%, #B89736 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Schedule</span>
                  </button>
                )}

                {activeTab === 'promos' && (
                  <button
                    onClick={() => setCreatePromoModal(true)}
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #E5C158 0%, #B89736 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Promo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Overview Ribbon */}
            <div className="admin-metrics-grid">
              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '10px',
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ color: 'var(--color-gold-bright)', flexShrink: 0 }}><TrendingUp size={20} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Revenue</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatCurrency(totalRevenueUSD, currency)}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '10px',
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ color: '#38BDF8', flexShrink: 0 }}><Clock size={20} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Active 24h Holds</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
                    {activeHoldsCount}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '10px',
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ color: '#10B981', flexShrink: 0 }}><CheckCircle2 size={20} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ticketed / Issued</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
                    {ticketedCount}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '10px',
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ color: '#F43F5E', flexShrink: 0 }}><MessageSquare size={20} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Inquiries</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
                    {inquiries.filter(i => i.status !== 'RESOLVED').length} Pending
                  </div>
                </div>
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 20px' }}>
              
              {/* =======================================================
                  TAB 1: BOOKINGS & PNR CRUD
                  ======================================================= */}
              {activeTab === 'bookings' && (
                <div>
                  {/* Search & Filter bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      minWidth: '280px',
                      flex: '1 1 300px'
                    }}>
                      <Search size={16} color="#94A3B8" />
                      <input
                        type="text"
                        placeholder="Search by PNR, passenger, email, airline..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#FFF',
                          fontSize: '0.85rem',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {['ALL', 'HOLDS', 'PAID', 'CANCELLED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setBookingFilterStatus(st)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: bookingFilterStatus === st ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
                            background: bookingFilterStatus === st ? 'rgba(229,193,88,0.15)' : 'transparent',
                            color: bookingFilterStatus === st ? 'var(--color-gold-bright)' : '#94A3B8',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div style={{
                    background: '#0F172A',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflowX: 'auto'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#1E293B', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '12px 16px' }}>PNR CODE</th>
                          <th style={{ padding: '12px 16px' }}>PASSENGER</th>
                          <th style={{ padding: '12px 16px' }}>ROUTE & FLIGHT</th>
                          <th style={{ padding: '12px 16px' }}>DATES & CABIN</th>
                          <th style={{ padding: '12px 16px' }}>FARE</th>
                          <th style={{ padding: '12px 16px' }}>STATUS</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                              No bookings found matching your search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => {
                            const isPaid = b.status === 'PAID_TICKET_ISSUED' || b.isPaid;
                            const isHold = b.status === 'CONFIRMED_HOLD' || !b.status;
                            const isCancelled = b.status === 'CANCELLED';

                            return (
                              <tr 
                                key={b.pnr}
                                style={{ 
                                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                                  transition: 'background 0.15s'
                                }}
                              >
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    color: 'var(--color-gold-bright)',
                                    background: 'rgba(229,193,88,0.1)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(229,193,88,0.25)'
                                  }}>
                                    {b.pnr}
                                  </span>
                                </td>

                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ fontWeight: 700, color: '#FFF' }}>{b.passengerName || 'Valued Passenger'}</div>
                                  <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{b.passengerEmail || 'No email provided'}</div>
                                  {b.passengerPhone && <div style={{ color: '#64748B', fontSize: '0.72rem' }}>{b.passengerPhone}</div>}
                                </td>

                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ fontWeight: 700, color: '#E2E8F0' }}>
                                    {b.origin} → {b.destination}
                                  </div>
                                  <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                                    {b.airline} ({b.flightNumber || 'FL101'})
                                  </div>
                                </td>

                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ color: '#E2E8F0' }}>{b.departDate || 'N/A'}</div>
                                  <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem' }}>{b.cabinClass || 'Business'}</div>
                                </td>

                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ fontWeight: 800, color: '#FFF' }}>
                                    {formatCurrency(b.royaPrice || 0, currency)}
                                  </div>
                                  <div style={{ color: '#10B981', fontSize: '0.72rem' }}>
                                    Saved {formatCurrency(b.savings || 0, currency)}
                                  </div>
                                </td>

                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: isPaid ? 'rgba(16,185,129,0.15)' : isCancelled ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.15)',
                                    color: isPaid ? '#34D399' : isCancelled ? '#F87171' : '#38BDF8',
                                    border: `1px solid ${isPaid ? '#10B981' : isCancelled ? '#EF4444' : '#38BDF8'}`
                                  }}>
                                    {b.status || 'CONFIRMED_HOLD'}
                                  </span>
                                </td>

                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                    <button
                                      onClick={() => handleResendEmail(b)}
                                      disabled={resendingPnr === b.pnr}
                                      style={{
                                        padding: '5px 8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '6px',
                                        color: '#E2E8F0',
                                        cursor: 'pointer'
                                      }}
                                      title="Resend Confirmation Email"
                                    >
                                      <Mail size={14} className={resendingPnr === b.pnr ? 'animate-spin' : ''} />
                                    </button>

                                    <button
                                      onClick={() => setEditBookingModal(b)}
                                      style={{
                                        padding: '5px 8px',
                                        background: 'rgba(229,193,88,0.15)',
                                        border: '1px solid var(--border-gold)',
                                        borderRadius: '6px',
                                        color: 'var(--color-gold-bright)',
                                        cursor: 'pointer'
                                      }}
                                      title="Edit Booking"
                                    >
                                      <Edit3 size={14} />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteBooking(b.pnr)}
                                      style={{
                                        padding: '5px 8px',
                                        background: 'rgba(239,68,68,0.15)',
                                        border: '1px solid #EF4444',
                                        borderRadius: '6px',
                                        color: '#EF4444',
                                        cursor: 'pointer'
                                      }}
                                      title="Delete Booking"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* =======================================================
                  TAB 2: DESTINATIONS & PACKAGES CRUD
                  ======================================================= */}
              {activeTab === 'destinations' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {destinations.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          background: '#0F172A',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                          <img 
                            src={d.image} 
                            alt={d.name} 
                            referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.7)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: 'var(--color-gold-bright)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {d.discount || '30% OFF'}
                          </div>
                        </div>

                        <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF', margin: '0 0 4px' }}>
                            {d.name}
                          </h4>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '8px' }}>
                            Airports: <span style={{ color: '#FFF', fontWeight: 600 }}>{d.airport}</span> ({d.region})
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: '0 0 12px', flex: 1 }}>
                            {d.tagline}
                          </p>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            paddingTop: '10px',
                            marginTop: 'auto'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Concierge Fare:</div>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                                {formatCurrency(d.royaPrice || 0, currency)}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => setEditDestModal(d)}
                                style={{
                                  padding: '5px 8px',
                                  background: 'rgba(229,193,88,0.15)',
                                  border: '1px solid var(--border-gold)',
                                  borderRadius: '6px',
                                  color: 'var(--color-gold-bright)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDestination(d.id)}
                                style={{
                                  padding: '5px 8px',
                                  background: 'rgba(239,68,68,0.15)',
                                  border: '1px solid #EF4444',
                                  borderRadius: '6px',
                                  color: '#EF4444',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =======================================================
                  TAB 3: FLIGHT STATUS SCHEDULES CRUD
                  ======================================================= */}
              {activeTab === 'flights' && (
                <div>
                  <div style={{
                    background: '#0F172A',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflowX: 'auto'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#1E293B', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '12px 16px' }}>FLIGHT NUMBER</th>
                          <th style={{ padding: '12px 16px' }}>AIRLINE</th>
                          <th style={{ padding: '12px 16px' }}>ROUTE</th>
                          <th style={{ padding: '12px 16px' }}>TIMES</th>
                          <th style={{ padding: '12px 16px' }}>GATE & TERMINAL</th>
                          <th style={{ padding: '12px 16px' }}>STATUS</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flightStatuses.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                              No flight tracking records configured. Click "Add Flight Schedule" to add live entries.
                            </td>
                          </tr>
                        ) : (
                          flightStatuses.map((f) => (
                            <tr key={f.flightNumber} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                                {f.flightNumber}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#FFF' }}>
                                {f.airline}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#E2E8F0' }}>
                                {f.origin} ({f.originCity || ''}) → {f.destination} ({f.destinationCity || ''})
                              </td>
                              <td style={{ padding: '12px 16px', color: '#CBD5E1' }}>
                                Dep: {f.scheduledDeparture || '08:30 AM'}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#94A3B8' }}>
                                {f.departureTerminal || 'T1'} / {f.departureGate || 'G12'}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  color: '#38BDF8',
                                  border: '1px solid #38BDF8'
                                }}>
                                  {f.status || 'On Time'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button
                                    onClick={() => setEditFlightModal(f)}
                                    style={{
                                      padding: '5px 8px',
                                      background: 'rgba(229,193,88,0.15)',
                                      border: '1px solid var(--border-gold)',
                                      borderRadius: '6px',
                                      color: 'var(--color-gold-bright)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFlightStatus(f.flightNumber)}
                                    style={{
                                      padding: '5px 8px',
                                      background: 'rgba(239,68,68,0.15)',
                                      border: '1px solid #EF4444',
                                      borderRadius: '6px',
                                      color: '#EF4444',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* =======================================================
                  TAB 4: PROMO CODES CRUD
                  ======================================================= */}
              {activeTab === 'promos' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {promos.map((p) => (
                      <div
                        key={p.code}
                        style={{
                          background: '#0F172A',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              color: 'var(--color-gold-bright)',
                              background: 'rgba(229,193,88,0.1)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px dashed var(--border-gold)'
                            }}>
                              {p.code}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: p.active !== false ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: p.active !== false ? '#34D399' : '#F87171'
                            }}>
                              {p.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', margin: '8px 0' }}>
                            {p.discountPercent}% DISCOUNT
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 12px' }}>
                            {p.description || 'Special promo discount code'}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid rgba(255,255,255,0.08)',
                          paddingTop: '10px',
                          marginTop: '8px'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Applied: {p.usageCount || 0} times
                          </span>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setEditPromoModal(p)}
                              style={{
                                padding: '5px 8px',
                                background: 'rgba(229,193,88,0.15)',
                                border: '1px solid var(--border-gold)',
                                borderRadius: '6px',
                                color: 'var(--color-gold-bright)',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletePromo(p.code)}
                              style={{
                                padding: '5px 8px',
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid #EF4444',
                                borderRadius: '6px',
                                color: '#EF4444',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =======================================================
                  TAB 5: CUSTOMER INQUIRIES
                  ======================================================= */}
              {activeTab === 'inquiries' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {inquiries.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                        No customer inquiries received yet.
                      </div>
                    ) : (
                      inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          style={{
                            background: '#0F172A',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{inq.name}</span>
                              <span style={{ color: '#94A3B8', fontSize: '0.8rem', marginLeft: '8px' }}>&lt;{inq.email}&gt;</span>
                              {inq.phone && <span style={{ color: '#64748B', fontSize: '0.78rem', marginLeft: '8px' }}>📞 {inq.phone}</span>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <select
                                value={inq.status || 'NEW'}
                                onChange={(e) => handleUpdateInquiry(inq.id, e.target.value)}
                                style={{
                                  background: '#1E293B',
                                  color: inq.status === 'RESOLVED' ? '#10B981' : 'var(--color-gold-bright)',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  outline: 'none'
                                }}
                              >
                                <option value="NEW">Status: NEW</option>
                                <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                                <option value="RESOLVED">Status: RESOLVED</option>
                              </select>

                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: 'rgba(239,68,68,0.15)',
                                  border: '1px solid #EF4444',
                                  borderRadius: '6px',
                                  color: '#EF4444',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#E2E8F0', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                            {inq.message}
                          </div>

                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            Submitted: {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          SUB-MODAL: CREATE / EDIT BOOKING FORM
         ------------------------------------------------------------- */}
      {(createBookingModal || editBookingModal) && (
        <BookingFormModal
          booking={editBookingModal}
          onClose={() => { setEditBookingModal(null); setCreateBookingModal(false); }}
          onSave={handleSaveBooking}
        />
      )}

      {/* -------------------------------------------------------------
          SUB-MODAL: CREATE / EDIT DESTINATION FORM
         ------------------------------------------------------------- */}
      {(createDestModal || editDestModal) && (
        <DestinationFormModal
          destination={editDestModal}
          onClose={() => { setEditDestModal(null); setCreateDestModal(false); }}
          onSave={handleSaveDestination}
        />
      )}

      {/* -------------------------------------------------------------
          SUB-MODAL: CREATE / EDIT FLIGHT SCHEDULE
         ------------------------------------------------------------- */}
      {(createFlightModal || editFlightModal) && (
        <FlightScheduleFormModal
          flight={editFlightModal}
          onClose={() => { setEditFlightModal(null); setCreateFlightModal(false); }}
          onSave={handleSaveFlightStatus}
        />
      )}

      {/* -------------------------------------------------------------
          SUB-MODAL: CREATE / EDIT PROMO
         ------------------------------------------------------------- */}
      {(createPromoModal || editPromoModal) && (
        <PromoFormModal
          promo={editPromoModal}
          onClose={() => { setEditPromoModal(null); setCreatePromoModal(false); }}
          onSave={handleSavePromo}
        />
      )}

    </div>
  );
}

/* ==========================================================================
   SUB-MODALS FOR FORMS
   ========================================================================== */

function BookingFormModal({ booking, onClose, onSave }) {
  const [formData, setFormData] = useState({
    pnr: booking?.pnr || '',
    passengerName: booking?.passengerName || '',
    passengerEmail: booking?.passengerEmail || '',
    passengerPhone: booking?.passengerPhone || '',
    flightNumber: booking?.flightNumber || 'BA178',
    airline: booking?.airline || 'British Airways',
    origin: booking?.origin || 'JFK',
    destination: booking?.destination || 'LHR',
    departDate: booking?.departDate || new Date().toISOString().split('T')[0],
    returnDate: booking?.returnDate || '',
    cabinClass: booking?.cabinClass || 'Business Class',
    retailPrice: booking?.retailPrice || 1200,
    royaPrice: booking?.royaPrice || 840,
    savings: booking?.savings || 360,
    status: booking?.status || 'CONFIRMED_HOLD',
    sendConfirmationEmail: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100001,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        background: '#0F172A',
        border: '1px solid var(--border-gold)',
        borderRadius: '14px',
        padding: '20px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', margin: 0 }}>
            {booking ? `Edit Booking: ${booking.pnr}` : 'Create New Booking & PNR'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>PNR Code (Auto-generated if empty)</label>
              <input
                type="text"
                value={formData.pnr}
                onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                placeholder="e.g. RB8X92"
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              >
                <option value="CONFIRMED_HOLD">CONFIRMED_HOLD (24h Hold)</option>
                <option value="PAID_TICKET_ISSUED">PAID_TICKET_ISSUED (Ticket Issued)</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Passenger Full Legal Name *</label>
            <input
              type="text"
              required
              value={formData.passengerName}
              onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
            />
          </div>

          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Email Address *</label>
              <input
                type="email"
                required
                value={formData.passengerEmail}
                onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Contact Phone</label>
              <input
                type="text"
                value={formData.passengerPhone}
                onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="admin-form-grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Origin (IATA)</label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Destination (IATA)</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Flight Number</label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Airline</label>
              <input
                type="text"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Cabin Class</label>
              <select
                value={formData.cabinClass}
                onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              >
                <option value="Economy Class">Economy Class</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business Class">Business Class</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
          </div>

          <div className="admin-form-grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Retail USD</label>
              <input
                type="number"
                value={formData.retailPrice}
                onChange={(e) => {
                  const ret = Number(e.target.value) || 0;
                  setFormData({ ...formData, retailPrice: ret, savings: ret - (formData.royaPrice || 0) });
                }}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Roya Fare USD</label>
              <input
                type="number"
                value={formData.royaPrice}
                onChange={(e) => {
                  const roy = Number(e.target.value) || 0;
                  setFormData({ ...formData, royaPrice: roy, savings: (formData.retailPrice || 0) - roy });
                }}
                style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Savings USD</label>
              <input
                type="number"
                value={formData.savings}
                readOnly
                style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Save Booking</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DestinationFormModal({ destination, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: destination?.id || '',
    name: destination?.name || '',
    airport: destination?.airport || '',
    region: destination?.region || 'Europe',
    image: destination?.image || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
    retailPrice: destination?.retailPrice || 1000,
    royaPrice: destination?.royaPrice || 700,
    discount: destination?.discount || '30%',
    tagline: destination?.tagline || ''
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', background: '#0F172A', border: '1px solid var(--border-gold)', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginBottom: '16px' }}>
          {destination ? 'Edit Destination' : 'Add Destination Package'}
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Destination Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
          </div>
          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Airport Code(s)</label>
              <input required type="text" value={formData.airport} onChange={e => setFormData({ ...formData, airport: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Region</label>
              <input required type="text" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Image URL</label>
            <input required type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
          </div>
          <div className="admin-form-grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Retail USD</label>
              <input type="number" value={formData.retailPrice} onChange={e => setFormData({ ...formData, retailPrice: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Roya USD</label>
              <input type="number" value={formData.royaPrice} onChange={e => setFormData({ ...formData, royaPrice: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Discount</label>
              <input type="text" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Marketing Tagline</label>
            <input type="text" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', borderRadius: '8px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800 }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FlightScheduleFormModal({ flight, onClose, onSave }) {
  const [formData, setFormData] = useState({
    flightNumber: flight?.flightNumber || '',
    airline: flight?.airline || 'British Airways',
    origin: flight?.origin || 'JFK',
    destination: flight?.destination || 'LHR',
    status: flight?.status || 'On Time',
    scheduledDeparture: flight?.scheduledDeparture || '08:30 AM',
    estimatedArrival: flight?.estimatedArrival || '08:45 PM',
    departureTerminal: flight?.departureTerminal || 'Terminal 4',
    departureGate: flight?.departureGate || 'Gate B22',
    aircraft: flight?.aircraft || 'Boeing 787 Dreamliner'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', background: '#0F172A', border: '1px solid var(--border-gold)', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginBottom: '16px' }}>
          {flight ? `Edit Flight: ${flight.flightNumber}` : 'Add Flight Schedule Entry'}
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Flight Number *</label>
              <input required type="text" value={formData.flightNumber} onChange={e => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Airline</label>
              <input required type="text" value={formData.airline} onChange={e => setFormData({ ...formData, airline: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
          </div>
          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Origin (IATA)</label>
              <input required type="text" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Destination (IATA)</label>
              <input required type="text" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
          </div>
          <div className="admin-form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }}>
                <option value="On Time">On Time</option>
                <option value="Boarding">Boarding</option>
                <option value="En Route">En Route</option>
                <option value="Delayed">Delayed</option>
                <option value="Landed">Landed</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Aircraft</label>
              <input type="text" value={formData.aircraft} onChange={e => setFormData({ ...formData, aircraft: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
          </div>
          <div className="admin-form-grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Terminal</label>
              <input type="text" value={formData.departureTerminal} onChange={e => setFormData({ ...formData, departureTerminal: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Gate</label>
              <input type="text" value={formData.departureGate} onChange={e => setFormData({ ...formData, departureGate: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', borderRadius: '8px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800 }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PromoFormModal({ promo, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: promo?.code || '',
    discountPercent: promo?.discountPercent || 25,
    description: promo?.description || 'Special Promo Code',
    active: promo?.active !== false
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', background: '#0F172A', border: '1px solid var(--border-gold)', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginBottom: '16px' }}>
          {promo ? `Edit Promo: ${promo.code}` : 'Create Promo Code'}
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Promo Code *</label>
            <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER30" style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Discount Percentage (%) *</label>
            <input required type="number" min="1" max="90" value={formData.discountPercent} onChange={e => setFormData({ ...formData, discountPercent: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>Description</label>
            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '8px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#FFF' }} />
          </div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="promo-active-chk" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
            <label htmlFor="promo-active-chk" style={{ fontSize: '0.85rem', color: '#FFF', cursor: 'pointer' }}>Active Promo Code</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', borderRadius: '8px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800 }}>Save Promo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
