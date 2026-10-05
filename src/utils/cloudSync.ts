import { SoccerCard, StoredRewardPack, CardStats } from '../types/card';
import { db, doc, getDoc, setDoc } from './firebase';
import { safeGetItem, safeSetItem } from './safeStorage';

export interface CloudGamePayload {
  coins: number;
  clubCards: SoccerCard[];
  formationId: string;
  activeSquadSlots: Record<string, string | undefined>;
  unopenedPacks: StoredRewardPack[];
  sakaStageIndex: number;
  sakaStats: CardStats;
  cursedBoardPos: number;
  lastSyncedAt?: number;
}

export interface CloudAccountSession {
  email: string;
  docId: string;
  displayName: string;
  photoURL?: string;
  signedInAt: number;
}

// Storage keys
const SESSION_STORAGE_KEY = 'apex_fut_cloud_session';
const LOCAL_CACHE_PREFIX = 'apex_fut_cloud_profile_';

// Debounce timer for background syncing
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPayload: CloudGamePayload | null = null;
let activeDocId: string | null = null;

// Listeners for sync status changes
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
type SyncListener = (status: SyncStatus, lastSynced?: number) => void;
const syncListeners: Set<SyncListener> = new Set();

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

function notifySyncStatus(status: SyncStatus, lastSynced?: number) {
  syncListeners.forEach((fn) => {
    try {
      fn(status, lastSynced);
    } catch (e) {
      console.error('Error in sync listener:', e);
    }
  });
}

// Session state listener
type SessionListener = (session: CloudAccountSession | null) => void;
const sessionListeners: Set<SessionListener> = new Set();

export function subscribeToSession(listener: SessionListener): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

function notifySession(session: CloudAccountSession | null) {
  sessionListeners.forEach((fn) => {
    try {
      fn(session);
    } catch (e) {
      console.error('Error in session listener:', e);
    }
  });
}

/**
 * Reads stored session from safeStorage
 */
export function getStoredSession(): CloudAccountSession | null {
  try {
    const raw = safeGetItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as CloudAccountSession;
    activeDocId = session.docId;
    return session;
  } catch {
    return null;
  }
}

/**
 * Saves or clears active session
 */
export function setStoredSession(session: CloudAccountSession | null): void {
  if (session) {
    activeDocId = session.docId;
    safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    activeDocId = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  notifySession(session);
}

/**
 * Normalizes email address to a safe Firestore document ID
 */
export function emailToDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Hash password securely in the browser using Web Crypto API SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Intelligent auto-merger: Combines local and remote game progress so no
 * progress is lost when signing in from a new laptop or browser.
 */
export function mergeGameProgress(
  local: CloudGamePayload,
  remote: CloudGamePayload
): CloudGamePayload {
  // Merge cards (union by ID so neither device loses unlocked cards)
  const cardMap = new Map<string, SoccerCard>();
  (remote.clubCards || []).forEach((c) => {
    if (c && c.id) cardMap.set(c.id, c);
  });
  (local.clubCards || []).forEach((c) => {
    if (c && c.id && !cardMap.has(c.id)) {
      cardMap.set(c.id, c);
    }
  });
  const mergedCards = Array.from(cardMap.values());

  // Merge unopened packs (union by instanceId)
  const packMap = new Map<string, StoredRewardPack>();
  (remote.unopenedPacks || []).forEach((p) => {
    if (p && p.instanceId) packMap.set(p.instanceId, p);
  });
  (local.unopenedPacks || []).forEach((p) => {
    if (p && p.instanceId && !packMap.has(p.instanceId)) {
      packMap.set(p.instanceId, p);
    }
  });
  const mergedPacks = Array.from(packMap.values());

  // Merge coins: Take maximum so users never go backwards
  const mergedCoins = Math.max(remote.coins || 0, local.coins || 0);

  // Merge Cursed Board position: Take highest tile achieved
  const mergedBoardPos = Math.max(remote.cursedBoardPos || 1, local.cursedBoardPos || 1);

  // Merge Evolution Saka progress: Take highest stage
  const remoteStage = remote.sakaStageIndex || 0;
  const localStage = local.sakaStageIndex || 0;
  const mergedSakaStage = Math.max(remoteStage, localStage);
  const mergedSakaStats = remoteStage >= localStage ? remote.sakaStats : local.sakaStats;

  // Active squad: Prefer remote if it has cards assigned, else local
  const hasRemoteSquad = remote.activeSquadSlots && Object.values(remote.activeSquadSlots).some(Boolean);
  const mergedFormation = hasRemoteSquad ? remote.formationId : local.formationId;
  const mergedSquadSlots = hasRemoteSquad ? remote.activeSquadSlots : local.activeSquadSlots;

  return {
    coins: mergedCoins,
    clubCards: mergedCards,
    formationId: mergedFormation,
    activeSquadSlots: mergedSquadSlots,
    unopenedPacks: mergedPacks,
    sakaStageIndex: mergedSakaStage,
    sakaStats: mergedSakaStats,
    cursedBoardPos: mergedBoardPos,
    lastSyncedAt: Date.now(),
  };
}

/**
 * Universal Direct Authentication & Cloud Sync
 * Automatically logs in existing accounts OR registers new accounts in Cloud Firestore!
 */
export async function signInOrCreateCloudAccount(
  email: string,
  rawPass: string,
  currentLocal: CloudGamePayload
): Promise<{ session: CloudAccountSession; mergedPayload: CloudGamePayload }> {
  const cleanEmail = email.trim().toLowerCase();
  const docId = emailToDocId(cleanEmail);
  const pHash = await hashPassword(rawPass);

  notifySyncStatus('syncing');

  const docRef = doc(db, 'club_profiles', docId);
  const docSnap = await getDoc(docRef);

  let finalPayload: CloudGamePayload;

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Verify password if one was set
    if (data.passcodeHash && data.passcodeHash !== pHash) {
      notifySyncStatus('error');
      throw new Error('Incorrect password for this account. Please try again.');
    }

    // Remote profile loaded
    const remotePayload: CloudGamePayload = {
      coins: Number(data.coins) || 0,
      clubCards: data.clubCardsJson ? JSON.parse(data.clubCardsJson) : [],
      formationId: data.formationId || '4-3-3',
      activeSquadSlots: data.activeSquadSlotsJson ? JSON.parse(data.activeSquadSlotsJson) : {},
      unopenedPacks: data.unopenedPacksJson ? JSON.parse(data.unopenedPacksJson) : [],
      sakaStageIndex: Number(data.sakaStageIndex) || 0,
      sakaStats: data.sakaStatsJson ? JSON.parse(data.sakaStatsJson) : currentLocal.sakaStats,
      cursedBoardPos: Number(data.cursedBoardPos) || 1,
      lastSyncedAt: Number(data.lastSyncedAt) || Date.now(),
    };

    // Auto-merge with current device progress
    finalPayload = mergeGameProgress(currentLocal, remotePayload);

    // Save merged state back to cloud
    await saveCloudGameProgressImmediate(docId, finalPayload);
  } else {
    // Brand new account: upload current laptop's progress
    finalPayload = {
      ...currentLocal,
      lastSyncedAt: Date.now(),
    };

    const newProfile = {
      email: cleanEmail,
      passcodeHash: pHash,
      displayName: cleanEmail.split('@')[0],
      coins: finalPayload.coins,
      clubCardsJson: JSON.stringify(finalPayload.clubCards || []),
      formationId: finalPayload.formationId,
      activeSquadSlotsJson: JSON.stringify(finalPayload.activeSquadSlots || {}),
      unopenedPacksJson: JSON.stringify(finalPayload.unopenedPacks || []),
      sakaStageIndex: finalPayload.sakaStageIndex,
      sakaStatsJson: JSON.stringify(finalPayload.sakaStats),
      cursedBoardPos: finalPayload.cursedBoardPos,
      lastSyncedAt: Date.now(),
    };

    await setDoc(docRef, newProfile, { merge: true });
  }

  const session: CloudAccountSession = {
    email: cleanEmail,
    docId,
    displayName: cleanEmail.split('@')[0],
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
    signedInAt: Date.now(),
  };

  setStoredSession(session);
  safeSetItem(`${LOCAL_CACHE_PREFIX}${docId}`, JSON.stringify(finalPayload));
  notifySyncStatus('synced', finalPayload.lastSyncedAt);

  return { session, mergedPayload: finalPayload };
}

/**
 * Loads cloud progress for an active session
 */
export async function loadCloudGameProgressForAccount(
  docId: string,
  currentLocal: CloudGamePayload
): Promise<CloudGamePayload> {
  notifySyncStatus('syncing');
  try {
    const docRef = doc(db, 'club_profiles', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const remotePayload: CloudGamePayload = {
        coins: Number(data.coins) || 0,
        clubCards: data.clubCardsJson ? JSON.parse(data.clubCardsJson) : [],
        formationId: data.formationId || '4-3-3',
        activeSquadSlots: data.activeSquadSlotsJson ? JSON.parse(data.activeSquadSlotsJson) : {},
        unopenedPacks: data.unopenedPacksJson ? JSON.parse(data.unopenedPacksJson) : [],
        sakaStageIndex: Number(data.sakaStageIndex) || 0,
        sakaStats: data.sakaStatsJson ? JSON.parse(data.sakaStatsJson) : currentLocal.sakaStats,
        cursedBoardPos: Number(data.cursedBoardPos) || 1,
        lastSyncedAt: Number(data.lastSyncedAt) || Date.now(),
      };

      const merged = mergeGameProgress(currentLocal, remotePayload);
      await saveCloudGameProgressImmediate(docId, merged);
      safeSetItem(`${LOCAL_CACHE_PREFIX}${docId}`, JSON.stringify(merged));
      notifySyncStatus('synced', merged.lastSyncedAt);
      return merged;
    } else {
      return currentLocal;
    }
  } catch (err) {
    console.error('Error fetching cloud profile:', err);
    notifySyncStatus('error');
    return currentLocal;
  }
}

/**
 * Writes club progress to Firestore immediately
 */
export async function saveCloudGameProgressImmediate(
  docId: string,
  payload: CloudGamePayload
): Promise<void> {
  try {
    const docRef = doc(db, 'club_profiles', docId);
    const firestoreData = {
      coins: payload.coins,
      clubCardsJson: JSON.stringify(payload.clubCards || []),
      formationId: payload.formationId,
      activeSquadSlotsJson: JSON.stringify(payload.activeSquadSlots || {}),
      unopenedPacksJson: JSON.stringify(payload.unopenedPacks || []),
      sakaStageIndex: payload.sakaStageIndex,
      sakaStatsJson: JSON.stringify(payload.sakaStats),
      cursedBoardPos: payload.cursedBoardPos,
      lastSyncedAt: Date.now(),
    };

    await setDoc(docRef, firestoreData, { merge: true });
  } catch (error) {
    console.error('Failed to write club profile to Firestore:', error);
    throw error;
  }
}

/**
 * Debounced auto-sync to Cloud Firestore
 */
export function scheduleCloudSync(docId: string | null, payload: CloudGamePayload): void {
  const targetId = docId || activeDocId;
  if (!targetId) return;

  pendingPayload = payload;
  notifySyncStatus('syncing');

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    if (!pendingPayload || !targetId) return;
    try {
      await saveCloudGameProgressImmediate(targetId, pendingPayload);
      notifySyncStatus('synced', Date.now());
    } catch (err) {
      console.warn('Background sync encountered an issue:', err);
      notifySyncStatus('error');
    }
  }, 1000);
}
