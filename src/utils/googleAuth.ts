/**
 * Google Account Authentication Client Utility
 * Integrates Google Identity Services (GIS) with local club synchronization.
 */

import { GoogleUserProfile } from '../types/card';
import { safeGetItem, safeSetItem } from './safeStorage';

const STORAGE_USER_KEY = 'apex_fut_google_user';
const STORAGE_SYNC_PREFIX = 'apex_fut_cloud_club_';

// Listeners for auth state changes
type AuthListener = (user: GoogleUserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

export function subscribeToAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: GoogleUserProfile | null) {
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

/**
 * Retrieves the currently saved Google User profile from safeStorage
 */
export function getStoredGoogleUser(): GoogleUserProfile | null {
  const data = safeGetItem(STORAGE_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as GoogleUserProfile;
  } catch {
    return null;
  }
}

/**
 * Saves or updates the Google User profile and notifies subscribers
 */
export function saveGoogleUser(user: GoogleUserProfile | null): void {
  if (user) {
    safeSetItem(STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_USER_KEY);
  }
  notifyListeners(user);
}

/**
 * Parses JWT token from Google Identity Services Credential Response
 */
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT:', e);
    return null;
  }
}

/**
 * Saves club progress snapshot tied to a specific Google account
 */
export function saveClubToGoogleProfile(
  uid: string,
  clubData: {
    coins: number;
    clubCardsCount: number;
    squadName?: string;
    totalClubValue?: number;
  }
): void {
  try {
    safeSetItem(`${STORAGE_SYNC_PREFIX}${uid}`, JSON.stringify({
      ...clubData,
      lastSyncedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to sync club data to Google profile:', e);
  }
}

/**
 * Retrieves previously saved club snapshot for a Google account
 */
export function getClubFromGoogleProfile(uid: string): any | null {
  const data = safeGetItem(`${STORAGE_SYNC_PREFIX}${uid}`);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Sign out of Google Account
 */
export function signOutGoogle(): void {
  saveGoogleUser(null);
}
