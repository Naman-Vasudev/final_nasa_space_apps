import React from 'react';

const ChartTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-md font-semibold text-gray-200 text-center mb-2">{children}</h4>
);

export default ChartTitle;
