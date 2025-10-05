import React from 'react';
// FIX: Changed to namespace import to handle potential module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';

const nasaLogoUrl = "https://static.vecteezy.com/system/resources/previews/022/227/222/original/nasa-logo-white-transparent-free-png.png";
const climaCastLogoUrl = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cdefs%3e%3clinearGradient id='logo-border-gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' stop-color='%233B4D66'/%3e%3cstop offset='100%25' stop-color='%23111827'/%3e%3c/linearGradient%3e%3c/defs%3e%3crect x='5' y='5' width='90' height='90' rx='20' ry='20' fill='white' /%3e%3crect x='5' y='5' width='90' height='90' rx='20' ry='20' fill='transparent' stroke='url(%23logo-border-gradient)' stroke-width='8'/%3e%3cpath d='M25 68 L45 48 L60 58 L75 43' stroke='%233B4D66' stroke-width='10' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e";

const WelcomeScreen: React.FC = () => {
    // This style applies your custom background image.
    // Make sure your image is in the /public folder and named 'background.jpg'
    const backgroundStyle: React.CSSProperties = {
        backgroundImage: `url('/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a2332', // This is a fallback color
    };

    return (
        <div style={backgroundStyle} className="min-h-screen font-sans text-gray-200">
            {/* This overlay ensures text is readable over any background image */}
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-8 mb-8">
                    <img src={nasaLogoUrl} alt="NASA Logo" className="h-20 w-24 object-contain" />
                    <img src={climaCastLogoUrl} alt="ClimaCast Logo" className="h-20 w-auto" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Will it rain on my parade?
                </h1>

                <p className="text-sm text-gray-400 mb-8 italic">
                    * team Quasars
                </p>

                <p className="max-w-3xl text-lg text-gray-300 leading-relaxed mb-10">
                    We have developed ClimaCast, a climatology based weather prediction app. While traditional softwares have at most a week in advance predictive ability, ClimaCast uses historical data analysis to observe trends and make far into the future predictions. Wanna organize an event 6 months from now? No issues, ClimaCast has got you covered, just look up the location and time window, and a dashboard with all useful climate parameters ranging from temperature to comfort index and more appears. Analyse advanced climate stats, and plan out your activity using suggestions by AI activity planner. Have trouble reading graphs and stats? Our AI chatbot is here to assist.
                </p>
                
                <ReactRouterDOM.Link
                    to="/app"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                    Get Started
                </ReactRouterDOM.Link>
            </div>
        </div>
    );
};

export default WelcomeScreen;