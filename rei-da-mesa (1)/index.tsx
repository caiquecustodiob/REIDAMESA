
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registro padrão de Service Worker para PWAs
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usar caminho relativo direto './sw.js' é a forma mais segura e compatível
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('REI DA MESA: PWA Ativo!', reg.scope);
      })
      .catch(err => {
        // Log silenciados em produção para não poluir o console, mas avisando o desenvolvedor
        console.warn('PWA: Falha ao registrar SW (Normal em alguns navegadores de desktop ou em modo anônimo):', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
