
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { LostItem } from '../types';
import BottomNav from '../components/BottomNav';

interface MapViewProps {
  items: LostItem[];
  searchQuery: string;
}

const MapView: React.FC<MapViewProps> = ({ items, searchQuery }) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedItem, setSelectedItem] = useState<LostItem>(items[0]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Helper to parse location string
  const parseCoords = (loc: string): [number, number] | null => {
    const match = loc.match(/\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[3])];
    }
    const clean = loc.replace('座標: ', '');
    const simpleMatch = clean.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (simpleMatch) {
      return [parseFloat(simpleMatch[1]), parseFloat(simpleMatch[3])];
    }
    return null;
  };

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.lastSeenLocation.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Default to Hong Kong
      mapRef.current = L.map(mapContainerRef.current, {
        center: [22.2855, 114.1577],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Google Maps Tile Layer (matching ItemDetail.tsx)
      const isDark = document.documentElement.classList.contains('dark');
      const tileLayer = isDark
        ? 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.t%3Ageometry%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.stroke%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.fill%7Cp.c%3A%23746855'
        : 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      L.tileLayer(tileLayer).addTo(mapRef.current);

      // 用户位置
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current!);
          mapRef.current?.setView([latitude, longitude], 15);
        });
      }
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add filtered markers
    const boundsPoints: [number, number][] = [];

    filteredItems.forEach((item) => {
      const coords = parseCoords(item.lastSeenLocation);
      if (!coords) return; // Skip if no valid coords

      boundsPoints.push(coords);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="relative w-12 h-12 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
              <img src="${item.mainImageUrl}" class="w-full h-full object-cover" />
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-0.5"></div>
          </div>
        `,
        iconSize: [48, 56],
        iconAnchor: [24, 56]
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(mapRef.current!);
      marker.on('click', () => {
        setSelectedItem(item);
        setIsMinimized(false);
        mapRef.current?.flyTo(coords, 16, { animate: true, duration: 1 });
      });
      markersRef.current.push(marker);
    });

    if (boundsPoints.length > 0 && mapRef.current) {
      // Optional: auto-fit bounds on load
      // const bounds = L.latLngBounds(boundsPoints);
      // mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => { };
  }, [filteredItems]);

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 16);
      });
    }
  };

  const handleOpenInGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(selectedItem.lastSeenLocation);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-background-dark overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center p-4 pb-2 justify-between bg-gradient-to-b from-black/80 to-transparent h-[72px]">
        <button onClick={() => navigate(-1)} className="text-white flex size-12 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-bold tracking-tight">探索附近 (香港)</h2>
          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-primary/20 rounded-full border border-primary/30">
            <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest">實時地圖</p>
          </div>
        </div>
        <button className="text-white flex size-12 items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>

      <div ref={mapContainerRef} className="flex-1 z-0 h-full w-full" />

      <div className={`absolute right-4 z-30 transition-all duration-500 ${isMinimized ? 'bottom-32' : 'bottom-80'}`}>
        <button onClick={handleRecenter} className="flex size-14 items-center justify-center rounded-2xl bg-primary text-background-dark shadow-2xl active:scale-90 transition-all">
          <span className="material-symbols-outlined font-bold">my_location</span>
        </button>
      </div>

      {selectedItem && (
        <div className={`absolute bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMinimized ? 'translate-y-[calc(100%-110px)]' : 'translate-y-0'}`}>
          <div className="mx-auto w-full max-w-md bg-background-dark/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] pb-24 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
            <div onClick={() => setIsMinimized(!isMinimized)} className="flex h-12 w-full flex-col items-center justify-center cursor-pointer active:bg-white/5 rounded-t-[2.5rem]">
              <div className="h-1.5 w-14 rounded-full bg-white/20 mb-2"></div>
            </div>
            <div className="px-6 py-2 flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${selectedItem.status === 'Lost' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                      <span className={`text-[10px] font-black uppercase ${selectedItem.status === 'Lost' ? 'text-red-500' : 'text-blue-500'}`}>{selectedItem.status === 'Lost' ? '遺失' : '拾獲'}</span>
                    </div>
                    <span className="text-white/40 text-[10px] font-bold">{selectedItem.lastSeenTimestamp}</span>
                  </div>
                  <h3 className="text-white text-2xl font-black truncate leading-tight mb-1">{selectedItem.title}</h3>
                  <button onClick={handleOpenInGoogleMaps} className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors text-left">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    <p className="text-sm font-medium truncate underline underline-offset-4">{selectedItem.lastSeenLocation}</p>
                  </button>
                </div>
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl flex flex-col items-center min-w-[80px]">
                  <span className="text-primary text-[10px] font-black uppercase mb-1 opacity-70">Reward</span>
                  <span className="text-primary text-2xl font-black leading-none">${selectedItem.reward.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate(`/report/${selectedItem.id}`)} className="flex-1 h-16 bg-primary text-background-dark rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.97] transition-all">
                  <span className="material-symbols-outlined font-black">add_a_photo</span>回報線索
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default MapView;
