import React, { useState, useEffect, useRef } from 'react';
import { SoccerCard, StoredRewardPack, CardStats } from '../types/card';
import {
  CloudAccountSession,
  CloudGamePayload,
  getStoredSession,
  setStoredSession,
  subscribeToSession,
  subscribeToSyncStatus,
  signInOrCreateCloudAccount,
  saveCloudGameProgressImmediate,
  loadCloudGameProgressForAccount,
  SyncStatus,
} from '../utils/cloudSync';
import { sound } from '../utils/audio';
import {
  CheckCircle2,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Coins,
  CreditCard,
  ChevronDown,
  X,
  Mail,
  Lock,
  Layers,
  AlertCircle,
  Cloud,
  Check,
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
  const [session, setSession] = useState<CloudAccountSession | null>(getStoredSession);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state tracking
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to session changes
  useEffect(() => {
    return subscribeToSession((s) => {
      setSession(s);
    });
  }, []);

  // Subscribe to Cloud Sync status
  useEffect(() => {
    return subscribeToSyncStatus((status, lastSynced) => {
      setSyncStatus(status);
      if (lastSynced) setLastSyncedTime(lastSynced);
    });
  }, []);

  // Hydrate from cloud on initial boot if user already had an active session
  useEffect(() => {
    const currentSession = getStoredSession();
    if (currentSession) {
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

      loadCloudGameProgressForAccount(currentSession.docId, currentLocalPayload)
        .then((merged) => {
          onCloudLoaded(merged);
        })
        .catch((err) => {
          console.warn('Initial session hydration warning:', err);
        });
    }
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

  // Handle Universal Cloud Sign-In & Registration
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    if (password.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

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
      sound.playClick();
      const { session: newSession, mergedPayload } = await signInOrCreateCloudAccount(
        email.trim(),
        password,
        currentLocalPayload
      );

      sound.playCoinClink();
      onCloudLoaded(mergedPayload);
      setSession(newSession);
      setLoginModalOpen(false);
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please verify your details.';
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    sound.playClick();
    setStoredSession(null);
    setDropdownOpen(false);
  };

  // Manual Force Sync
  const handleManualSync = async () => {
    if (!session) return;
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
      await saveCloudGameProgressImmediate(session.docId, payload);
      sound.playCoinClink();
      setSyncStatus('synced');
      setLastSyncedTime(Date.now());
      setTimeout(() => setSyncStatus('idle'), 2500);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncStatus('error');
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Top Header Button */}
      {session ? (
        <button
          onClick={() => {
            sound.playClick();
            setDropdownOpen(!dropdownOpen);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/60 rounded-xl transition-all shadow-sm group select-none"
          title={`Signed in as ${session.email} (Cloud Synced)`}
        >
          <div className="relative flex-shrink-0">
            {session.photoURL ? (
              <img
                src={session.photoURL}
                alt={session.displayName}
                className="w-5 h-5 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-black flex items-center justify-center text-white">
                {session.displayName.charAt(0).toUpperCase()}
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
            {session.displayName}
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
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 rounded-xl font-black text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-[0.98]"
          title="Sign in with your Email & Password to save progress permanently across all laptops"
        >
          <Cloud className="w-4 h-4 fill-slate-950" />
          <span className="hidden sm:inline">Sign in to Cloud</span>
          <span className="sm:hidden">Sign in</span>
        </button>
      )}

      {/* User Profile Dropdown Menu */}
      {dropdownOpen && session && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0d131f] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header section with User Info */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
            {session.photoURL ? (
              <img
                src={session.photoURL}
                alt={session.displayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-sm font-black flex items-center justify-center text-white flex-shrink-0">
                {session.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">
                  {session.displayName}
                </span>
                <span title="Verified Cloud Profile">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{session.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-300 font-semibold">
                  {syncStatus === 'syncing'
                    ? 'Syncing changes...'
                    : syncStatus === 'error'
                    ? 'Sync offline'
                    : 'Cloud Synced Across All Laptops'}
                </span>
              </div>
            </div>
          </div>

          {/* Club Snapshot */}
          <div className="py-3 space-y-2.5 border-b border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Cloud Protected Inventory</span>
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
                ? `Saved ${new Date(lastSyncedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Protected by Cloud'}
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
                <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-xl shadow-md text-slate-950">
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

              {/* Email & Password Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. juraijsaeed@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Password or PIN
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="Choose or enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    First time? Enter any password you like to create your cloud account!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim() || !password.trim()}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Connecting &amp; Syncing Club...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Sign In &amp; Sync Progress</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Progress Protection Guarantee */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Loss Auto-Merge:</strong> Signing in immediately downloads your cloud club, and merges any progress made on this laptop so nothing is reset.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
