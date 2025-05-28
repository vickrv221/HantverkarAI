/**
 * Huvudingångspunkt för HantverkarAI React-applikationen
 * Konfigurerar React Router och renderar applikationen
 */

import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Skapa React 18 root för optimal prestanda
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendera applikationen med BrowserRouter för routing
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);