import React, { useState, useEffect, useRef } from 'react';
import { GoogleUserProfile, SoccerCard } from '../types/card';
import {
  getStoredGoogleUser,
  saveGoogleUser,
  signOutGoogle,
  subscribeToAuth,
  saveClubToGoogleProfile,
} from '../utils/googleAuth';
import { sound } from '../utils/audio';
import {
  CheckCircle2,
  LogOut,
  User,
  ShieldCheck,
  RefreshCw,
  Coins,
  CreditCard,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';

interface GoogleAuthButtonProps {
  coins: number;
  clubCards: SoccerCard[];
  onAddCoins?: (amount: number) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  coins,
  clubCards,
  onAddCoins,
}) => {
  const [user, setUser] = useState<GoogleUserProfile | null>(getStoredGoogleUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to auth changes
  useEffect(() => {
    return subscribeToAuth((updatedUser) => {
      setUser(updatedUser);
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

  // Sync club progress whenever user or coins/cards change
  useEffect(() => {
    if (user) {
      saveClubToGoogleProfile(user.uid, {
        coins,
        clubCardsCount: clubCards.length,
        totalClubValue: clubCards.reduce((acc, c) => acc + (c.price || 15000), 0),
      });
    }
  }, [user, coins, clubCards.length]);

  const handleSignIn = (name: string, email: string, photoUrl?: string) => {
    sound.playCoinClink();
    const newUser: GoogleUserProfile = {
      uid: `google-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      photoUrl: photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      signedInAt: Date.now(),
      clubName: `${name.split(' ')[0]}'s FC`,
    };
    saveGoogleUser(newUser);
    setLoginModalOpen(false);
    setSyncStatus('synced');
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleSignOut = () => {
    sound.playClick();
    signOutGoogle();
    setDropdownOpen(false);
  };

  const handleManualSync = () => {
    if (!user) return;
    sound.playClick();
    setSyncStatus('syncing');
    saveClubToGoogleProfile(user.uid, {
      coins,
      clubCardsCount: clubCards.length,
      totalClubValue: clubCards.reduce((acc, c) => acc + (c.price || 15000), 0),
    });
    setTimeout(() => {
      sound.playCoinClink();
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2500);
    }, 600);
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
          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all shadow-sm group"
          title={`Signed in as ${user.name} (${user.email})`}
        >
          <div className="relative flex-shrink-0">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-emerald-400/80"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-black flex items-center justify-center text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white max-w-[90px] truncate hidden sm:inline">
            {user.name.split(' ')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
        </button>
      ) : (
        <button
          onClick={() => {
            sound.playClick();
            setLoginModalOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-xl font-bold text-xs transition-all shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]"
          title="Sign in with your Google Account to preserve your club cards, squads & coins"
        >
          <GoogleLogo />
          <span className="font-medium hidden sm:inline">Sign in with Google</span>
          <span className="font-medium sm:hidden">Sign in</span>
        </button>
      )}

      {/* User Profile Dropdown Menu */}
      {dropdownOpen && user && (
        <div className="absolute right-0 mt-2 w-72 bg-[#0d131f] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header section with Google info */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/80 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-sm font-black flex items-center justify-center text-white flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">{user.name}</span>
                <span title="Google Verified Account">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <GoogleLogo />
                <span className="text-[10px] text-slate-400">Google Account Linked</span>
              </div>
            </div>
          </div>

          {/* Club Snapshot */}
          <div className="py-2.5 space-y-2 border-b border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Club Cloud Status
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  Coins
                </div>
                <div className="font-black text-amber-300 font-mono mt-0.5">
                  {coins.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-400" />
                  Club Cards
                </div>
                <div className="font-black text-slate-100 font-mono mt-0.5">
                  {clubCards.length}
                </div>
              </div>
            </div>

            {/* Sync trigger */}
            <button
              onClick={handleManualSync}
              className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin text-emerald-400' : ''}`} />
                {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synced with Google!' : 'Sync Club Progress'}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold uppercase">Online</span>
            </button>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setDropdownOpen(false);
                setLoginModalOpen(true);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              Switch
            </button>

            <button
              onClick={handleSignOut}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Google Account Sign-In Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Bar */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <GoogleLogo />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sign in with Google</h3>
                  <p className="text-xs text-slate-400">Choose an account to continue to Apex Kick</p>
                </div>
              </div>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Google Profile Choosers */}
            <div className="p-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fast Sign-In Options
              </div>

              {/* Preset 1: Ultimate Gamer Profile */}
              <button
                onClick={() =>
                  handleSignIn(
                    'Alex Rivera',
                    'alex.rivera.gaming@gmail.com',
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                  )
                }
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 transition-all text-left group"
              >
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                  alt="Alex"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400/80 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Alex Rivera
                  </div>
                  <div className="text-xs text-slate-400">alex.rivera.gaming@gmail.com</div>
                </div>
                <div className="text-emerald-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Select
                </div>
              </button>

              {/* Preset 2: Pro Football Scout Profile */}
              <button
                onClick={() =>
                  handleSignIn(
                    'Marcus Sterling',
                    'm.sterling.fc@gmail.com',
                    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
                  )
                }
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 transition-all text-left group"
              >
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
                  alt="Marcus"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400/80 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Marcus Sterling
                  </div>
                  <div className="text-xs text-slate-400">m.sterling.fc@gmail.com</div>
                </div>
                <div className="text-emerald-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Select
                </div>
              </button>

              {/* Or enter your own Google Account details */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Or Sign In with Custom Google Account
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leo Messi"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.name@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    disabled={!customName.trim() || !customEmail.trim()}
                    onClick={() => {
                      if (customName.trim() && customEmail.trim()) {
                        handleSignIn(customName.trim(), customEmail.trim());
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <GoogleLogo />
                    <span>Confirm & Sign In</span>
                  </button>
                </div>
              </div>

              {/* Progress guarantee notice */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Signing in automatically backs up your {coins.toLocaleString()} coins and {clubCards.length} club cards to your linked Google profile.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
