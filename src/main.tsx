import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global safety net to prevent unhandled rejection crashes
window.addEventListener('error', (event) => {
  if (event.message?.includes('QuotaExceeded') || event.message?.includes('Storage')) {
    event.preventDefault();
  }
  console.warn('[Global Error Guard]', event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Global Promise Guard]', event.reason);
});

// Auto-recover localStorage if corrupted or over quota from previous sessions
try {
  const marketKey = 'apex_fut_market_listings_v2';
  const rawMarket = localStorage.getItem(marketKey);
  // If market listings payload is bloated (>40KB), prune it so clean re-seeding occurs
  if (rawMarket && rawMarket.length > 40000) {
    localStorage.removeItem(marketKey);
    localStorage.removeItem('apex_fut_market_listings_v1');
  }
} catch (_) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
