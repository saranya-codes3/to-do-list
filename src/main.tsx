import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

// Sync initial theme class before first paint
try {
  if (localStorage.getItem('little_day_theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch {
  // Ignore storage access errors
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
