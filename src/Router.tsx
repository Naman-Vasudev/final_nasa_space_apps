import React from 'react';
// FIX: Changed to namespace import to handle potential module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import App from './App';

const Router: React.FC = () => {
    return (
        <ReactRouterDOM.Routes>
            {/* The main application is now the root path, the welcome screen has been removed. */}
            <ReactRouterDOM.Route path="/" element={<App />} />
        </ReactRouterDOM.Routes>
    );
};

export default Router;