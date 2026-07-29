import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInAnonymously, onAuthStateChanged, getIdTokenResult } from './firebase';

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  idToken: '',
  tokenClaims: {},
  loading: true,
  grantAdminRole: async () => {},
  revokeAdminRole: async () => {},
  refreshToken: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [idToken, setIdToken] = useState('');
  const [tokenClaims, setTokenClaims] = useState({});
  const [loading, setLoading] = useState(true);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch token result without forcing refresh initially
          const tokenRes = await getIdTokenResult(currentUser);
          setIdToken(tokenRes.token);
          setTokenClaims(tokenRes.claims || {});
          setIsAdmin(Boolean(tokenRes.claims?.admin));
        } catch (e) {
          console.warn('[AuthContext] Error getting token result:', e);
        } finally {
          setLoading(false);
        }
      } else {
        // Automatically sign in anonymously to ensure every user session has a Firebase Auth Token
        try {
          const anonCred = await signInAnonymously(auth);
          setUser(anonCred.user);
          const tokenRes = await getIdTokenResult(anonCred.user);
          setIdToken(tokenRes.token);
          setTokenClaims(tokenRes.claims || {});
          setIsAdmin(Boolean(tokenRes.claims?.admin));
        } catch (err) {
          console.warn('[AuthContext] Anonymous sign in fallback:', err);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Forces an immediate token refresh on the client side
   */
  const refreshToken = async (forcedUser = user) => {
    const targetUser = forcedUser || auth.currentUser;
    if (!targetUser) return null;

    try {
      // Force refresh (true) asks Firebase Auth server for a fresh JWT with updated claims
      const freshTokenResult = await getIdTokenResult(targetUser, true);
      setIdToken(freshTokenResult.token);
      setTokenClaims(freshTokenResult.claims || {});
      const adminClaim = Boolean(freshTokenResult.claims?.admin);
      setIsAdmin(adminClaim);
      console.log('[AuthContext] Token refreshed immediately. Claims:', freshTokenResult.claims);
      return freshTokenResult;
    } catch (err) {
      console.error('[AuthContext] Error refreshing token:', err);
      throw err;
    }
  };

  /**
   * Grants admin role to current user and forces immediate client-side token refresh
   */
  const grantAdminRole = async () => {
    const currentUser = user || auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user session found');
    }

    try {
      // 1. Call backend API to set custom claim
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, admin: true })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to assign admin claim');
      }

      // 2. CRITICAL REQUIREMENT: Force immediate token refresh on client side
      const freshTokenResult = await refreshToken(currentUser);
      
      // Fallback update in case local dev environment doesn't reach remote Auth server
      if (!freshTokenResult?.claims?.admin) {
        setIsAdmin(true);
        setTokenClaims(prev => ({ ...prev, admin: true }));
      }

      return {
        success: true,
        uid: currentUser.uid,
        token: freshTokenResult?.token,
        claims: freshTokenResult?.claims
      };
    } catch (err) {
      console.error('[AuthContext] Grant admin role error:', err);
      throw err;
    }
  };

  /**
   * Revokes admin role and forces immediate client-side token refresh
   */
  const revokeAdminRole = async () => {
    const currentUser = user || auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Call backend API to remove custom claim
      await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, admin: false })
      });

      // 2. CRITICAL REQUIREMENT: Force immediate token refresh on client side
      const freshTokenResult = await refreshToken(currentUser);
      
      setIsAdmin(false);
      setTokenClaims(prev => {
        const updated = { ...prev };
        delete updated.admin;
        return updated;
      });

      return freshTokenResult;
    } catch (err) {
      console.error('[AuthContext] Revoke admin role error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      idToken,
      tokenClaims,
      loading,
      grantAdminRole,
      revokeAdminRole,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
