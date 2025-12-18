
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('REI DA MESA: PWA Ativo!', reg.scope);
      })
      .catch(err => {
        console.warn('PWA: Falha ao registrar:', err);
      });
  });
}

// Lógica de File Handling (Capturar arquivo aberto pelo SO)
if ('launchQueue' in window) {
  (window as any).launchQueue.setConsumer(async (launchParams: any) => {
    if (launchParams.files && launchParams.files.length > 0) {
      try {
        const fileHandle = launchParams.files[0];
        const file = await fileHandle.getFile();
        const text = await file.text();
        const state = JSON.parse(text);
        
        // Dispara evento customizado para o App.tsx capturar
        window.dispatchEvent(new CustomEvent('rei-import-state', { detail: state }));
      } catch (err) {
        console.error('Erro ao processar arquivo de lançamento:', err);
      }
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
