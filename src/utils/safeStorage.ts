/**
 * Safe LocalStorage Utility with automatic quota management,
 * error boundary protection, and card payload sanitization.
 */

import { SoccerCard, TransferListing } from '../types/card';

/**
 * Strips heavy data URLs and transient SVG images from cards before storing in localStorage.
 * CardItem dynamically re-generates SVG graphics on demand if fullCardImage is absent.
 */
export function sanitizeCardForStorage(card: SoccerCard): SoccerCard {
  const sanitized = { ...card };
  // If fullCardImage is large or a data URI, strip it to prevent storage exhaustion
  if (sanitized.fullCardImage && sanitized.fullCardImage.length > 300) {
    delete sanitized.fullCardImage;
  }
  // If photoUrl is an embedded base64 image over 2KB, omit from serialized market cache
  if (sanitized.photoUrl && sanitized.photoUrl.startsWith('data:') && sanitized.photoUrl.length > 2000) {
    delete sanitized.photoUrl;
  }
  return sanitized;
}

export function sanitizeCardsListForStorage(cards: SoccerCard[]): SoccerCard[] {
  return cards.map(sanitizeCardForStorage);
}

export function sanitizeListingsForStorage(listings: TransferListing[]): TransferListing[] {
  // Keep only the most recent 20 listings to prevent unbounded growth
  const boundedListings = listings.slice(0, 20);
  return boundedListings.map((item) => ({
    ...item,
    card: sanitizeCardForStorage(item.card),
  }));
}

/**
 * Safely sets an item in localStorage with quota exceeded fallback handling.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    const isQuotaError =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014;

    if (isQuotaError) {
      console.warn(`[SafeStorage] Quota exceeded on key "${key}". Running cleanup...`);
      try {
        // Clear obsolete or non-critical cache keys to free up space
        const obsoleteKeys = [
          'apex_fut_market_listings_v1',
          'apex_fut_hl_history',
        ];
        obsoleteKeys.forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch (_) {}
        });

        let payloadToSave = value;
        // If market listings key itself is causing the quota error, truncate to 8 listings
        if (key.includes('market_listings')) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              payloadToSave = JSON.stringify(parsed.slice(0, 8));
            }
          } catch (_) {}
        }

        // Retry saving once after clearing
        localStorage.setItem(key, payloadToSave);
        return true;
      } catch (retryError) {
        console.warn(`[SafeStorage] Failed to save key "${key}" even after cleanup. Silently skipping.`, retryError);
        return false;
      }
    } else {
      console.warn(`[SafeStorage] Non-critical error writing to localStorage for key "${key}":`, error);
      return false;
    }
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`[SafeStorage] Error reading localStorage key "${key}":`, error);
    return null;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[SafeStorage] Error removing localStorage key "${key}":`, error);
  }
}
