import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { UserProfile } from '../types/index.ts';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role?: 'customer' | 'admin') => void;
  logout: () => Promise<void>;
  getAuthHeader: () => Promise<Record<string, string>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  loginAsDemoUser: () => {},
  logout: async () => {},
  getAuthHeader: async () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('smartcart_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to demo customer for immediate out-of-the-box delight
    return {
      uid: 'demo-user-123',
      email: 'shopper@smartcart.in',
      displayName: 'Aditi Sharma',
      role: 'customer',
      phone: '+91 98765 43210',
      token: 'demo-token-:demo-user-123:shopper@smartcart.in',
    };
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || 'customer@smartcart.in',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            role: fbUser.email?.includes('admin') ? 'admin' : 'customer',
            phone: fbUser.phoneNumber || '+91 98765 43210',
            token: idToken,
          };
          setUser(profile);
          localStorage.setItem('smartcart_user', JSON.stringify(profile));

          // Sync with database
          fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              uid: profile.uid,
              email: profile.email,
              displayName: profile.displayName,
              role: profile.role,
            }),
          }).catch((err) => console.error('Failed to sync user to database:', err));
        } catch (error) {
          console.error('Error fetching Firebase ID token:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await res.user.getIdToken();
      const profile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || 'customer@smartcart.in',
        displayName: res.user.displayName || 'SmartCart Shopper',
        role: res.user.email?.includes('admin') ? 'admin' : 'customer',
        phone: res.user.phoneNumber || '+91 98765 43210',
        token: idToken,
      };
      setUser(profile);
      localStorage.setItem('smartcart_user', JSON.stringify(profile));
    } catch (error) {
      console.error('Google Sign-In failed or popup closed:', error);
      // Fallback seamlessly to demo user if popup is blocked
      loginAsDemoUser('customer');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = (role: 'customer' | 'admin' = 'customer') => {
    const isAd = role === 'admin';
    const profile: UserProfile = {
      uid: isAd ? 'demo-admin-999' : 'demo-user-123',
      email: isAd ? 'admin@smartcart.in' : 'shopper@smartcart.in',
      displayName: isAd ? 'Platform Admin (Ramesh)' : 'Aditi Sharma',
      role,
      phone: '+91 98765 43210',
      token: `demo-token-:${isAd ? 'demo-admin-999' : 'demo-user-123'}:${isAd ? 'admin@smartcart.in' : 'shopper@smartcart.in'}`,
    };
    setUser(profile);
    localStorage.setItem('smartcart_user', JSON.stringify(profile));
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('smartcart_user');
  };

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    if (!user) return {};
    if (user.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return { Authorization: `Bearer demo-token-:${user.uid}:${user.email}` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        loginAsDemoUser,
        logout,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
