// --- Dynamic Icons ---

// Weathervane for Wind
export const WeathervaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L12 22M12 2L6 6M12 2L18 6M6 6L6 10L18 10L18 6M6 6L2 6L4 4M18 6L22 6L20 4" />
    </svg>
);


// Dynamic Thermometer for Temperature
export const DynamicTemperatureIcon: React.FC<{ value: number }> = ({ value }) => {
    const MIN_TEMP = -20;
    const MAX_TEMP = 45;
    const clampedValue = Math.max(MIN_TEMP, Math.min(MAX_TEMP, value));
    const percentage = (clampedValue - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
    
    // Total tube height is from y=5 to y=13.5 -> 8.5 units. Bulb starts at 13.5
    const mercuryTubeHeight = percentage * 8.5;
    const mercuryY = 13.5 - mercuryTubeHeight;
    
    const getColor = (temp: number) => {
        if (temp <= 0) return "#60a5fa"; // blue
        if (temp <= 25) return "#fb923c"; // orange
        return "#f87171"; // red
    };
    const color = getColor(value);

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            {/* Mercury Fill */}
            <path d={`M12 17.5a2.5 2.5 0 1 0 0 -5a2.5 2.5 0 0 0 0 5z`} fill={color} stroke="none" />
            <rect x="11" y={mercuryY} width="2" height={mercuryTubeHeight} fill={color} stroke="none" rx="1" />
            
            {/* Outline */}
            <path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5" />
        </svg>
    );
};


// Dynamic Rain/Snow icon for Precipitation
export const DynamicPrecipitationIcon: React.FC<{ isSnowing: boolean }> = ({ isSnowing }) => {
    if (isSnowing) {
        // Snowflake Icon
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636" />
            </svg>
        );
    }
    // Raindrop Icon
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a7 7 0 007-7c0-5.25-7-13-7-13S5 9.75 5 15a7 7 0 007 7z" />
        </svg>
    );
};


// Dynamic Sun for UV Index
export const DynamicUvIcon: React.FC<{ uvIndex: number }> = ({ uvIndex }) => {
    const getUvStyle = (uv: number) => {
        let color = '#FDD835'; // Moderate
        let glowStdDeviation = 1;
        if (uv <= 2) { color = '#4CAF50'; glowStdDeviation = 0.5; } // Low
        else if (uv > 5 && uv <= 7) { color = '#FF9800'; glowStdDeviation = 2; } // High
        else if (uv > 7 && uv <= 10) { color = '#F44336'; glowStdDeviation = 3; } // Very High
        else if (uv > 10) { color = '#9C27B0'; glowStdDeviation = 4; } // Extreme
        return { color, glowStdDeviation };
    };

    const { color, glowStdDeviation } = getUvStyle(uvIndex);

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
             <defs>
                <filter id="uv-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={glowStdDeviation} result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g stroke={color} filter="url(#uv-glow)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </g>
             <circle cx="12" cy="12" r="4" fill={color} stroke={color} strokeWidth="2" />
        </svg>
    );
};

// --- Standard Icons ---

export const HumidityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5.69l5 4.5V18a2 2 0 01-2 2H9a2 2 0 01-2-2v-7.81l5-4.5M12 5.69L12 3m0 2.69L7 10.19V18m10-7.81L12 5.69" />
    </svg>
);

export const ComfortIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

// Icons for Activity Planner
export const OutdoorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const LeisureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-2a2 2 0 114 0v2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v-2a2 2 0 114 0v2" />
    </svg>
);

export const IndoorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

// Chatbot Icon is now defined locally in Chatbot.tsx for maximum reliability.