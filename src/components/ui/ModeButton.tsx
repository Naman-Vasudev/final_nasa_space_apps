import React from 'react';

type Mode = 'search' | 'pin' | 'draw';

interface ModeButtonProps {
    value: Mode;
    currentMode: Mode;
    setMode: (mode: Mode) => void;
    label: string;
    icon: string;
}

const ModeButton: React.FC<ModeButtonProps> = ({ value, currentMode, setMode, label, icon }) => (
    <button onClick={() => setMode(value)} className={`flex-1 min-w-[120px] p-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${currentMode === value ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
        {icon} {label}
    </button>
);

export default ModeButton;
