import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, ShieldAlert, Key, RefreshCw, UserCheck, UserX, 
  Search, Filter, CheckCircle2, Clock, Plane, FileText, AlertCircle, 
  Lock, Copy, ExternalLink, ArrowRight, DollarSign, Database
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { fetchAllBookingsForAdmin, updateBookingStatusInDatabase } from '../lib/bookingsService';

export default function AdminPortal({ isOpen, onClose, showToast, currency = 'USD' }) {
  const { user, isAdmin, idToken, tokenClaims, grantAdminRole, revokeAdminRole, refreshToken } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [securityTestResult, setSecurityTestResult] = useState(null);
  const [testingAccess, setTestingAccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'CONFIRMED_HOLD' | 'TICKETED'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState('');

  // Auto load bookings when modal opens or admin status changes
  useEffect(() => {
    if (isOpen) {
      loadAdminBookings();
    }
  }, [isOpen, isAdmin, idToken]);

  const loadAdminBookings = async () => {
    setLoading(true);
    setSecurityTestResult(null);
    try {
      const res = await fetchAllBookingsForAdmin(idToken, isAdmin);
      setBookings(res.bookings || []);
      setSecurityTestResult({
        success: true,
        firestoreSuccess: res.firestoreSuccess,
        apiSuccess: res.apiSuccess,
        message: 'Database read verified successfully with token.admin === true'
      });
    } catch (err) {
      console.warn('[Admin Portal] Database access restricted:', err);
      setBookings([]);
      setSecurityTestResult({
        success: false,
        error: err.message || 'Database Access Denied: Token does not contain admin === true',
        firestoreError: err.firestoreError,
        apiError: err.apiError
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async () => {
    setActionLoading(true);
    try {
      const res = await grantAdminRole();
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Admin Role Granted!',
          message: 'Client ID Token refreshed immediately. token.admin === true claim acquired.'
        });
      }
      await loadAdminBookings();
    } catch (err) {
      if (showToast) {
        showToast({
          type: 'error',
          title: 'Role Grant Failed',
          message: err.message
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeRole = async () => {
    setActionLoading(true);
    try {
      await revokeAdminRole();
      if (showToast) {
        showToast({
          type: 'info',
          title: 'Admin Role Revoked',
          message: 'Client ID Token refreshed immediately. Database read access restricted.'
        });
      }
      await loadAdminBookings();
    } catch (err) {
      if (showToast) {
        showToast({
          type: 'error',
          title: 'Role Revoke Failed',
          message: err.message
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualTokenRefresh = async () => {
    setActionLoading(true);
    try {
      const freshRes = await refreshToken();
      if (showToast) {
        showToast({
          type: 'success',
          title: 'ID Token Refreshed',
          message: `Fresh JWT fetched. Admin claim = ${Boolean(freshRes?.claims?.admin)}`
        });
      }
      await loadAdminBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestDatabaseAccess = async () => {
    setTestingAccess(true);
    await loadAdminBookings();
    setTestingAccess(false);
  };

  const handleToggleBookingStatus = async (pnr, currentStatus) => {
    const nextStatus = currentStatus === 'CONFIRMED_HOLD' ? 'TICKETED' : 'CONFIRMED_HOLD';
    await updateBookingStatusInDatabase(pnr, nextStatus);
    setBookings(prev => prev.map(b => b.pnr === pnr ? { ...b, status: nextStatus } : b));
    if (showToast) {
      showToast({
        type: 'success',
        title: `PNR ${pnr} Updated`,
        message: `Booking status changed to ${nextStatus}`
      });
    }
  };

  const copyPnrToClipboard = (pnr) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(''), 2000);
  };

  if (!isOpen) return null;

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'CONFIRMED_HOLD' && b.status === 'CONFIRMED_HOLD') ||
      (filterStatus === 'TICKETED' && b.status === 'TICKETED');

    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !cleanQuery || 
      b.pnr?.toLowerCase().includes(cleanQuery) ||
      b.passengerName?.toLowerCase().includes(cleanQuery) ||
      b.passengerEmail?.toLowerCase().includes(cleanQuery) ||
      b.flightNumber?.toLowerCase().includes(cleanQuery) ||
      b.airline?.toLowerCase().includes(cleanQuery);

    return matchesStatus && matchesSearch;
  });

  const totalReserved = bookings.filter(b => b.status === 'CONFIRMED_HOLD').length;
  const totalBooked = bookings.filter(b => b.status === 'TICKETED').length;
  const totalVolume = bookings.reduce((sum, b) => sum + (Number(b.royaPrice || b.totalFare) || 0), 0);

  return (
    <div className="admin-portal-backdrop" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 220,
      background: 'rgba(5, 8, 16, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div className="glass-card admin-portal-modal" style={{
        maxWidth: '1240px',
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
        background: '#090F1E',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
      }}>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="gold-badge" style={{ fontSize: '0.78rem' }}>
                <ShieldCheck size={14} color="var(--color-gold)" />
                Executive Concierge & Reservation Admin
              </span>

              {/* Security Admin Role Indicator Badge */}
              {isAdmin ? (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#6EE7B7',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <CheckCircle2 size={13} />
                  ADMIN TOKEN VERIFIED (admin === true)
                </span>
              ) : (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#FCA5A5',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <ShieldAlert size={13} />
                  REGULAR USER (DB READS RESTRICTED)
                </span>
              )}
            </div>

            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.75rem', margin: 0 }}>
              User Flight Bookings & Holds Management
            </h2>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
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

        {/* ADMIN ROLE CONTROLLER & IMMEDIATE TOKEN REFRESH BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 29, 0.9) 100%)',
          border: '1.5px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-gold-bright)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} />
                Admin Role Claim & Token Refresh Controller
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                Granting the admin role calls the server claim API and <strong style={{ color: '#FFF' }}>forces an immediate client-side token refresh</strong> (`getIdTokenResult(true)`).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!isAdmin ? (
                <button
                  type="button"
                  onClick={handleGrantRole}
                  disabled={actionLoading}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <UserCheck size={16} />
                  {actionLoading ? 'Granting Role...' : 'Grant Admin Role (admin === true)'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRevokeRole}
                  disabled={actionLoading}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #EF4444',
                    color: '#FCA5A5',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UserX size={16} />
                  {actionLoading ? 'Revoking Role...' : 'Revoke Admin Role'}
                </button>
              )}

              <button
                type="button"
                onClick={handleManualTokenRefresh}
                disabled={actionLoading}
                className="btn-outline-gold"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={15} className={actionLoading ? 'animate-spin' : ''} />
                Force Token Refresh
              </button>
            </div>
          </div>

          {/* Session Token Info Box */}
          <div style={{
            background: 'rgba(7, 11, 20, 0.7)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            fontSize: '0.78rem'
          }}>
            <div>
              <span style={{ color: '#94A3B8' }}>Firebase User UID:</span>
              <div style={{ color: '#FFF', fontFamily: 'monospace', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.uid || 'anonymous-session'}
              </div>
            </div>

            <div>
              <span style={{ color: '#94A3B8' }}>Token Claims Status:</span>
              <div style={{ color: isAdmin ? '#6EE7B7' : '#FCA5A5', fontWeight: 800 }}>
                {isAdmin ? 'admin === true (Verified in Token)' : 'admin === false or undefined'}
              </div>
            </div>

            <div>
              <span style={{ color: '#94A3B8' }}>Client Rule Check Policy:</span>
              <div style={{ color: 'var(--color-gold-bright)', fontWeight: 600 }}>
                UI Visibility Only (Security enforced by DB)
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY & DATABASE ACCESS ENFORCEMENT CARD */}
        <div style={{
          background: securityTestResult?.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: securityTestResult?.success ? '1.5px solid #10B981' : '1.5px solid #EF4444',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: '280px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: securityTestResult?.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {securityTestResult?.success ? <Database size={22} color="#10B981" /> : <Lock size={22} color="#EF4444" />}
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#FFF', fontWeight: 800, margin: 0 }}>
                Database Read Security Status: {securityTestResult?.success ? 'ALLOWED (Admin Verified)' : 'RESTRICTED / ACCESS DENIED'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: securityTestResult?.success ? '#6EE7B7' : '#FCA5A5', margin: '3px 0 0 0' }}>
                {securityTestResult?.success 
                  ? 'Firestore rule `request.auth.token.admin == true` passed! Reserved and booked flights readable from database.' 
                  : (securityTestResult?.error || 'Database reads restricted: requesting token does not contain admin === true.')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestDatabaseAccess}
            disabled={testingAccess}
            className="btn-outline-gold"
            style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={14} className={testingAccess ? 'animate-spin' : ''} />
            Test Database Read Access
          </button>
        </div>

        {/* METRICS DASHBOARD CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={metricCardStyle}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Total User Bookings</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>
              {bookings.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-bright)' }}>User records in bookings collection</span>
          </div>

          <div style={metricCardStyle}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Reserved Flights (Holds)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-gold-bright)', marginTop: '4px' }}>
              {totalReserved}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>Status: CONFIRMED_HOLD</span>
          </div>

          <div style={metricCardStyle}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Booked & Ticketed Flights</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6EE7B7', marginTop: '4px' }}>
              {totalBooked}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#38BDF8' }}>Status: TICKETED</span>
          </div>

          <div style={metricCardStyle}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Total Concierge Volume</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>
              ${totalVolume.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}>Total gross fare value</span>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(7,11,20,0.6)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'ALL', label: `All Bookings (${bookings.length})` },
              { id: 'CONFIRMED_HOLD', label: `Reserved Holds (${totalReserved})` },
              { id: 'TICKETED', label: `Booked Flights (${totalBooked})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: filterStatus === tab.id ? 800 : 600,
                  color: filterStatus === tab.id ? 'var(--color-gold-bright)' : '#94A3B8',
                  background: filterStatus === tab.id ? 'rgba(229, 193, 88, 0.18)' : 'transparent',
                  border: filterStatus === tab.id ? '1px solid var(--color-gold)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search PNR, Passenger, Email, Flight..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(7,11,20,0.8)',
                border: '1px solid var(--border-gold)',
                color: '#FFF',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* USER RESERVED & BOOKED FLIGHTS TABLE */}
        <div style={{
          background: 'rgba(7, 11, 20, 0.6)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflowX: 'auto'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <RefreshCw size={24} className="animate-spin" color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
              <div>Fetching user reserved & booked flights from database...</div>
            </div>
          ) : !isAdmin ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <ShieldAlert size={36} color="#EF4444" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#FFF', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Database Access Denied</h4>
              <p style={{ color: '#FCA5A5', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 16px' }}>
                You are currently viewing in Regular User Mode. Database reads for the bookings collection are restricted until your token contains <strong style={{ color: '#FFF' }}>admin === true</strong>.
              </p>
              <button 
                type="button" 
                onClick={handleGrantRole}
                className="btn-gold"
                style={{ padding: '10px 20px', fontSize: '0.88rem', margin: '0 auto' }}
              >
                Grant Admin Role & Refresh Token Now
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <FileText size={32} color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
              <div>No booking records match your current filter or search criteria.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid rgba(229,193,88,0.2)', background: 'rgba(15, 23, 42, 0.9)', color: 'var(--color-gold-bright)' }}>
                  <th style={thStyle}>PNR REF</th>
                  <th style={thStyle}>PASSENGER DETAILS</th>
                  <th style={thStyle}>FLIGHT & ROUTE</th>
                  <th style={thStyle}>CABIN & PAX</th>
                  <th style={thStyle}>DEPARTURE</th>
                  <th style={thStyle}>STATUS & HOLD</th>
                  <th style={thStyle}>CONCIERGE FARE</th>
                  <th style={thStyle}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, idx) => {
                  const isHold = booking.status === 'CONFIRMED_HOLD';
                  return (
                    <tr 
                      key={booking.pnr || idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {/* PNR Code */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#FFF', letterSpacing: '0.08em', fontSize: '0.9rem' }}>
                            {booking.pnr}
                          </strong>
                          <button
                            type="button"
                            onClick={() => copyPnrToClipboard(booking.pnr)}
                            title="Copy PNR Reference"
                            style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', padding: '2px' }}
                          >
                            {copiedPnr === booking.pnr ? <CheckCircle2 size={13} color="#10B981" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>

                      {/* Passenger Details */}
                      <td style={tdStyle}>
                        <strong style={{ color: '#FFF', display: 'block' }}>{booking.passenger || booking.passengerName}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>{booking.email || booking.passengerEmail}</span>
                        {booking.phone && <span style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>{booking.phone}</span>}
                      </td>

                      {/* Flight & Route */}
                      <td style={tdStyle}>
                        <div style={{ color: '#FFF', fontWeight: 700 }}>
                          {booking.airline} • {booking.flightNumber}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-gold-bright)', marginTop: '2px' }}>
                          {booking.route || `${booking.origin} → ${booking.destination}`}
                        </div>
                      </td>

                      {/* Cabin & Pax */}
                      <td style={tdStyle}>
                        <span style={{ color: '#CBD5E1', display: 'block' }}>{booking.cabin || booking.cabinClass}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{booking.passengers || booking.passengersCount} Pax</span>
                      </td>

                      {/* Departure */}
                      <td style={tdStyle}>
                        <span style={{ color: '#FFF' }}>{booking.departDate}</span>
                        {booking.returnDate && <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Ret: {booking.returnDate}</span>}
                      </td>

                      {/* Status & Hold */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {isHold ? (
                            <span style={{
                              background: 'rgba(229, 193, 88, 0.15)',
                              border: '1px solid var(--color-gold)',
                              color: 'var(--color-gold-bright)',
                              padding: '3px 8px',
                              borderRadius: '10px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              width: 'fit-content'
                            }}>
                              <Clock size={11} />
                              RESERVED HOLD
                            </span>
                          ) : (
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid #10B981',
                              color: '#6EE7B7',
                              padding: '3px 8px',
                              borderRadius: '10px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              width: 'fit-content'
                            }}>
                              <CheckCircle2 size={11} />
                              BOOKED & TICKETED
                            </span>
                          )}
                          {isHold && (
                            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                              {booking.holdExpires || '24h Hold'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={tdStyle}>
                        <strong style={{ color: '#6EE7B7', fontSize: '0.92rem' }}>
                          ${(booking.totalFare || booking.royaPrice || 840).toLocaleString()}
                        </strong>
                        {booking.savedAmount > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', display: 'block' }}>
                            Saved ${(booking.savedAmount).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => handleToggleBookingStatus(booking.pnr, booking.status)}
                          style={{
                            background: isHold ? 'rgba(16, 185, 129, 0.15)' : 'rgba(229, 193, 88, 0.15)',
                            border: isHold ? '1px solid #10B981' : '1px solid var(--color-gold)',
                            color: isHold ? '#6EE7B7' : 'var(--color-gold-bright)',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isHold ? 'Mark Ticketed' : 'Mark Hold'}
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

const metricCardStyle = {
  background: 'rgba(13, 20, 36, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const thStyle = {
  padding: '12px 14px',
  fontSize: '0.74rem',
  fontWeight: 800,
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '12px 14px',
  verticalAlign: 'middle'
};
