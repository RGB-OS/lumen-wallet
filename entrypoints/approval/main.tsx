import React from 'react';
import ReactDOM from 'react-dom/client';
import '../popup/style.css';
import Approval from './approval';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Approval />
  </React.StrictMode>,
);