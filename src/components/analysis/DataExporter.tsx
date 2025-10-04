import React, { useState } from 'react';
import type { AnalysisData, GraphDataPoint, Location } from '../../types';

interface DataExporterProps {
    analysis: AnalysisData;
    location: Location;
    date: string;
}

type ExportFormat = 'json' | 'csv';

const FormatButton: React.FC<{ value: ExportFormat, current: ExportFormat, set: (v: ExportFormat) => void, label: string }> = ({ value, current, set, label }) => (
    <button
        onClick={() => set(value)}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            current === value ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
    >
        {label}
    </button>
);

const convertToCSV = (data: GraphDataPoint[]): string => {
    if (!data || data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header as keyof GraphDataPoint]).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

const DataExporter: React.FC<DataExporterProps> = ({ analysis, location, date }) => {
    const [format, setFormat] = useState<ExportFormat>('json');

    const handleDownload = () => {
        const locationName = (location.name || 'custom_location').replace(/, /g, '_').replace(/\s/g, '_');
        const filename = `climacast_data_${locationName}_${date}.${format}`;
        
        let dataString: string;
        let mimeType: string;

        if (format === 'json') {
            dataString = JSON.stringify(analysis, null, 2);
            mimeType = 'application/json';
        } else {
            dataString = convertToCSV(analysis.graphData);
            mimeType = 'text/csv';
        }

        const blob = new Blob([dataString], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                 <h4 className="text-md font-semibold text-white">Export Analysis Data</h4>
                <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg">
                    <FormatButton value="json" current={format} set={setFormat} label="JSON" />
                    <FormatButton value="csv" current={format} set={setFormat} label="CSV" />
                </div>
            </div>
            <button
                onClick={handleDownload}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
            >
                Download .{format}
            </button>
        </div>
    );
};

export default DataExporter;