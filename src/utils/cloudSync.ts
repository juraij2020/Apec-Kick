import { SoccerCard, StoredRewardPack, CardStats } from '../types/card';
import { db, doc, getDoc, setDoc, User } from './firebase';
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

// Local cache keys
const LOCAL_CACHE_PREFIX = 'apex_fut_cloud_profile_';

// Debounce timer for background syncing
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPayload: CloudGamePayload | null = null;

// Listeners for sync status changes
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
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
 * Loads cloud profile from Firestore on login. If existing cloud data is found,
 * it merges it with the current laptop's local state.
 */
export async function loadCloudGameProgress(
  user: User,
  currentLocal: CloudGamePayload
): Promise<CloudGamePayload> {
  notifySyncStatus('syncing');
  try {
    const docRef = doc(db, 'users', user.uid, 'game_data', 'profile');
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

      // Intelligent auto-merge
      const merged = mergeGameProgress(currentLocal, remotePayload);

      // Save merged progress back to Firestore so both devices share the full inventory
      await saveCloudGameProgressImmediate(user.uid, merged);

      // Save to local cache
      safeSetItem(`${LOCAL_CACHE_PREFIX}${user.uid}`, JSON.stringify(merged));

      notifySyncStatus('synced', merged.lastSyncedAt);
      return merged;
    } else {
      // First time user on cloud: upload current laptop's progress
      const initialPayload: CloudGamePayload = {
        ...currentLocal,
        lastSyncedAt: Date.now(),
      };
      await saveCloudGameProgressImmediate(user.uid, initialPayload);
      safeSetItem(`${LOCAL_CACHE_PREFIX}${user.uid}`, JSON.stringify(initialPayload));
      notifySyncStatus('synced', initialPayload.lastSyncedAt);
      return initialPayload;
    }
  } catch (error) {
    console.error('Failed to load cloud progress from Firestore:', error);
    notifySyncStatus('error');
    // Fall back to local storage
    return currentLocal;
  }
}

/**
 * Immediate write of club progress to Firestore.
 */
export async function saveCloudGameProgressImmediate(
  uid: string,
  payload: CloudGamePayload
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, 'game_data', 'profile');
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

    // Also update root user document
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        uid,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to write to Firestore:', error);
    throw error;
  }
}

/**
 * Debounced background sync: Call whenever state updates (cards, coins, packs, minigames).
 * Batches calls within 1000ms so fast gameplay does not spam Firestore writes.
 */
export function scheduleCloudSync(user: User | null, payload: CloudGamePayload): void {
  if (!user) return;

  pendingPayload = payload;
  notifySyncStatus('syncing');

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    if (!pendingPayload || !user) return;
    try {
      await saveCloudGameProgressImmediate(user.uid, pendingPayload);
      notifySyncStatus('synced', Date.now());
    } catch (err) {
      console.warn('Background Firestore sync encountered an issue:', err);
      notifySyncStatus('error');
    }
  }, 1000);
}
