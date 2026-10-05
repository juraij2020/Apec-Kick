import React, { useState, useEffect, useRef } from 'react';
import { SoccerCard, StoredRewardPack, CardStats } from '../types/card';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from '../utils/firebase';
import {
  CloudGamePayload,
  loadCloudGameProgress,
  saveCloudGameProgressImmediate,
  subscribeToSyncStatus,
} from '../utils/cloudSync';
import { sound } from '../utils/audio';
import {
  CheckCircle2,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  Coins,
  CreditCard,
  ChevronDown,
  X,
  Mail,
  Lock,
  Layers,
  Sparkles,
  AlertCircle,
  Cloud,
} from 'lucide-react';

interface GoogleAuthButtonProps {
  coins: number;
  clubCards: SoccerCard[];
  formationId: string;
  activeSquadSlots: Record<string, string | undefined>;
  unopenedPacks: StoredRewardPack[];
  sakaStageIndex: number;
  sakaStats: CardStats;
  cursedBoardPos: number;
  onCloudLoaded: (merged: CloudGamePayload) => void;
  onAddCoins?: (amount: number) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  coins,
  clubCards,
  formationId,
  activeSquadSlots,
  unopenedPacks,
  sakaStageIndex,
  sakaStats,
  cursedBoardPos,
  onCloudLoaded,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'login' | 'register'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state tracking
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Hydrate from Cloud Firestore
        const currentLocalPayload: CloudGamePayload = {
          coins,
          clubCards,
          formationId,
          activeSquadSlots,
          unopenedPacks,
          sakaStageIndex,
          sakaStats,
          cursedBoardPos,
        };
        try {
          const merged = await loadCloudGameProgress(currentUser, currentLocalPayload);
          onCloudLoaded(merged);
        } catch (err) {
          console.error('Error loading cloud progress:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Cloud Sync status
  useEffect(() => {
    return subscribeToSyncStatus((status, lastSynced) => {
      setSyncStatus(status);
      if (lastSynced) setLastSyncedTime(lastSynced);
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Google One-Click Sign In
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      sound.playClick();
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        sound.playCoinClink();
        setLoginModalOpen(false);
      }
    } catch (err: unknown) {
      console.warn('Google popup error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign-in failed. Please try Email login.';
      if (msg.includes('popup-blocked')) {
        setAuthError('Browser blocked popup window. Please allow popups or use Email sign-in below.');
      } else {
        setAuthError(msg.replace('Firebase: ', ''));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email / Password Login or Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (cred.user) {
          sound.playCoinClink();
          setLoginModalOpen(false);
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (cred.user) {
          sound.playCoinClink();
          setLoginModalOpen(false);
        }
      }
    } catch (err: unknown) {
      console.warn('Auth error:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setAuthError(msg.replace('Firebase: ', ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    sound.playClick();
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Manual Force Sync
  const handleManualSync = async () => {
    if (!user) return;
    sound.playClick();
    setSyncStatus('syncing');

    try {
      const payload: CloudGamePayload = {
        coins,
        clubCards,
        formationId,
        activeSquadSlots,
        unopenedPacks,
        sakaStageIndex,
        sakaStats,
        cursedBoardPos,
        lastSyncedAt: Date.now(),
      };
      await saveCloudGameProgressImmediate(user.uid, payload);
      sound.playCoinClink();
      setSyncStatus('synced');
      setLastSyncedTime(Date.now());
      setTimeout(() => setSyncStatus('idle'), 2500);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncStatus('error');
    }
  };

  // Google SVG G Logo
  const GoogleLogo = () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Top Header Button */}
      {user ? (
        <button
          onClick={() => {
            sound.playClick();
            setDropdownOpen(!dropdownOpen);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/60 rounded-xl transition-all shadow-sm group select-none"
          title={`Signed in as ${user.displayName || user.email} (Cloud Synced)`}
        >
          <div className="relative flex-shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-black flex items-center justify-center text-white">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                syncStatus === 'syncing'
                  ? 'bg-amber-400 animate-ping'
                  : syncStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-400'
              }`}
            />
          </div>

          <span className="text-xs font-semibold text-slate-200 group-hover:text-white max-w-[85px] truncate hidden sm:inline">
            {(user.displayName || user.email || 'Cloud').split(' ')[0]}
          </span>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
        </button>
      ) : (
        <button
          onClick={() => {
            sound.playClick();
            setAuthError(null);
            setLoginModalOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 rounded-xl font-black text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          title="Sign in with your Google Account or Email to save progress permanently across all laptops"
        >
          <GoogleLogo />
          <span className="hidden sm:inline">Sign in to Cloud</span>
          <span className="sm:hidden">Sign in</span>
        </button>
      )}

      {/* User Profile Dropdown Menu */}
      {dropdownOpen && user && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0d131f] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header section with User Info */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-sm font-black flex items-center justify-center text-white flex-shrink-0">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span title="Verified Cloud Profile">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-300 font-semibold">
                  {syncStatus === 'syncing'
                    ? 'Syncing changes...'
                    : syncStatus === 'error'
                    ? 'Sync issue (offline)'
                    : 'Cloud Synced Across All Devices'}
                </span>
              </div>
            </div>
          </div>

          {/* Club Snapshot */}
          <div className="py-3 space-y-2.5 border-b border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Cloud Synchronized Club</span>
              <span className="text-emerald-400 font-mono text-[9px]">ACTIVE</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 text-center">
                <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  Coins
                </div>
                <div className="font-black text-amber-300 font-mono mt-0.5 text-xs truncate">
                  {coins.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 text-center">
                <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-400" />
                  Cards
                </div>
                <div className="font-black text-slate-100 font-mono mt-0.5 text-xs">
                  {clubCards.length}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 text-center">
                <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  Packs
                </div>
                <div className="font-black text-cyan-300 font-mono mt-0.5 text-xs">
                  {unopenedPacks.length}
                </div>
              </div>
            </div>

            {/* Manual Sync Trigger */}
            <button
              onClick={handleManualSync}
              disabled={syncStatus === 'syncing'}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 hover:text-white rounded-xl transition-all border border-slate-700/60 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    syncStatus === 'syncing' ? 'animate-spin text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="font-bold">
                  {syncStatus === 'syncing' ? 'Saving to Firestore...' : 'Sync Club to Cloud Now'}
                </span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {syncStatus === 'synced' ? 'SAVED' : 'ONLINE'}
              </span>
            </button>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-mono truncate">
              {lastSyncedTime
                ? `Last saved: ${new Date(lastSyncedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Protected by Firebase'}
            </span>

            <button
              onClick={handleSignOut}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Cloud Account Sign-In / Register Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border-2 border-emerald-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.25)] animate-in zoom-in-95 duration-200">
            {/* Top Bar */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-xl shadow-md text-slate-950">
                  <Cloud className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Cross-Device Cloud Sign In</h3>
                  <p className="text-xs text-slate-400">Save progress across all laptops &amp; Vercel</p>
                </div>
              </div>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Error Banner */}
              {authError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{authError}</span>
                </div>
              )}

              {/* Primary Option: Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                <GoogleLogo />
                <span>Sign in with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-slate-500 text-xs uppercase font-bold">
                <div className="h-px bg-slate-800 flex-1" />
                <span>Or with Email &amp; Password</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    onClick={() => setAuthMode('login')}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all shadow-md"
                  >
                    {isSubmitting && authMode === 'login' ? 'Signing in...' : 'Sign In'}
                  </button>

                  <button
                    type="submit"
                    onClick={() => setAuthMode('register')}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700"
                  >
                    {isSubmitting && authMode === 'register' ? 'Registering...' : 'Create Account'}
                  </button>
                </div>
              </form>

              {/* Progress Protection Guarantee */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Loss Auto-Merge:</strong> Signing in immediately downloads your cloud club, and merges any progress you just made on this device so nothing is reset.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
