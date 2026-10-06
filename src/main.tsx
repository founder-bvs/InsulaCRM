import React from 'react';
import ReactDOM from 'react-dom/client';
import { CrmProvider } from './context/CrmContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CrmProvider>
      <AppContent />
    </CrmProvider>
  </React.StrictMode>
);
