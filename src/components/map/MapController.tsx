import React, { useEffect, useRef } from 'react';
import type { Location } from '../../types';

declare global {
    interface Window {
        L: any;
    }
}

interface MapControllerProps {
    location: Location;
    setLocation: React.Dispatch<React.SetStateAction<Location>>;
    libsLoaded: boolean;
}

const MapController: React.FC<MapControllerProps> = ({ location, setLocation, libsLoaded }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null); // Ref for the map div

    // Effect for map initialization (runs only once)
    useEffect(() => {
        if (libsLoaded && mapContainerRef.current && !mapRef.current) {
            const map = window.L.map(mapContainerRef.current, { // Use the ref's DOM node
                zoomControl: false,
            }).setView([location.lat, location.lon], 10);
            
            window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors, © CARTO',
                maxZoom: 19
            }).addTo(map);

            const customIcon = window.L.icon({
                iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="%233b82f6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')}`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
            });

            markerRef.current = window.L.marker([location.lat, location.lon], { 
                draggable: true,
                icon: customIcon
             }).addTo(map)
                .on('dragend', (e: any) => {
                    const { lat, lng } = e.target.getLatLng();
                    setLocation({ lat, lon: lng, name: 'Custom Location' });
                });

            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                setLocation({ lat, lon: lng, name: 'Pinned Location' });
            });

            mapRef.current = map;
        }
    }, [libsLoaded, location.lat, location.lon, setLocation]);

    // Effect for updating map view when location prop changes
    useEffect(() => {
        if (mapRef.current && markerRef.current) {
             mapRef.current.setView([location.lat, location.lon], mapRef.current.getZoom());
             markerRef.current.setLatLng([location.lat, location.lon]);
        }
    }, [location]);

    return (
        <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
            <div ref={mapContainerRef} className="h-[400px] w-full rounded-md z-0 cursor-crosshair">
                {!libsLoaded && <div className="flex items-center justify-center h-full bg-gray-700 text-gray-400">Loading Map...</div>}
            </div>
            <p className="text-sm text-center py-2 text-gray-400 font-mono">
                {location.name} (Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)})
            </p>
        </div>
    );
};

export default MapController;
