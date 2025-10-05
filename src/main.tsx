import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed to namespace import to handle potential module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import Router from './Router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ReactRouterDOM.BrowserRouter>
      <Router />
    </ReactRouterDOM.BrowserRouter>
  </React.StrictMode>
);