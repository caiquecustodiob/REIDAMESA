
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registro padrão de Service Worker para PWAs com caminho absoluto
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('REI DA MESA: PWA Ativo com sucesso!', reg.scope);
      })
      .catch(err => {
        console.warn('PWA: Falha ao registrar Service Worker:', err);
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
