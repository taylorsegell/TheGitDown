import React from 'react';
import ReactDOM from 'react-dom/client';
import { installSavePortHost } from '../../lib/installSavePortHost';
import App from './App.tsx';
import '../../lib/fonts.css';
import './style.css';
import './brand.css';

installSavePortHost();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
