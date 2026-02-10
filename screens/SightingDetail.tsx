
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LostItem } from '../types';
import { useRef, useEffect } from 'react';

// Helper to parse location string "Name (lat, lng)"
const parseCoords = (loc: string): [number, number] | null => {
  const match = loc.match(/\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[3])];
  }
  return null;
};

const SightingMap: React.FC<{ locationName: string }> = ({ locationName }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let center: [number, number] = [22.2855, 114.1577]; // Default
    const coords = parseCoords(locationName);
    if (coords) center = coords;

    mapRef.current = L.map(mapContainerRef.current, {
      center: center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Tile Layer - Consistent with other screens
    const isDark = document.documentElement.classList.contains('dark');
    const tileLayer = isDark
      ? 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.t%3Ageometry%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.stroke%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.fill%7Cp.c%3A%23746855'
      : 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    L.tileLayer(tileLayer).addTo(mapRef.current);

    // Add Marker
    if (coords) {
      const blueIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 1.5rem; height: 1.5rem; border-radius: 9999px; border: 3px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(coords, { icon: blueIcon }).addTo(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locationName]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/20 z-[400]">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">near_me</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{locationName.split('(')[0]}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">精確定位</p>
        </div>
      </div>
    </div>
  );
};

interface SightingDetailProps {
  items: LostItem[];
}

const SightingDetail: React.FC<SightingDetailProps> = ({ items }) => {
  const { itemId, sightingId } = useParams();
  const navigate = useNavigate();

  const item = items.find(i => i.id === itemId);
  const sighting = item?.sightings.find(s => s.id === sightingId);

  if (!item || !sighting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
        <h2 className="text-xl font-bold">找不到該目擊線索</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">返回上一頁</button>
      </div>
    );
  }

  const handleOpenInGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(sighting.locationName);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(googleMapsUrl, '_blank');
  };

  const mapUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDlpYWbimPcKXNOWRz7d1rXmaDWzV8WlyhVejIqPSZshZpmXLJKQi5IQoMcRPb3woNL4WVyLLrKINzxZVW1BmkIJubfv9nkenubeUtIKjzYTtjYEyF5OOgaq168SfhZ2yfmTzKc3lX3ctTU_djn2jEZsiyVJ0XePsEBbjjCd0GWYI9loXzL9wmq54DcFSeUvnFWDcJpslA7vahcUISXX4a1yXK5QvQpNUn0kAY2HJ6Q8vo7IL9GSTIwiich1U3C0RftAvJqgVT751gu";

  return (
    <div className="flex-1 pb-32 bg-background-light dark:bg-background-dark">
      {/* Header Overlay */}
      <div className="fixed top-0 z-50 w-full max-w-md p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="size-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="px-4 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
          <p className="text-white text-xs font-black uppercase tracking-widest">目擊詳情</p>
        </div>
        <button className="size-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center">
          <span className="material-symbols-outlined">share</span>
        </button>
      </div>

      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] bg-slate-200 dark:bg-slate-800">
        <img
          src={sighting.imageUrl || item.mainImageUrl}
          className="w-full h-full object-cover"
          alt="Sighting Photo"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="px-5 -mt-6 relative z-10">
        {/* Reporter Header */}
        <div className="bg-white dark:bg-white/5 rounded-3xl p-5 shadow-xl border border-slate-100 dark:border-white/5 mb-6 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <img src={sighting.reporterAvatar} className="size-14 rounded-2xl object-cover border-2 border-primary/20" alt={sighting.reporterName} />
            <div className="absolute -bottom-1 -right-1 bg-green-500 size-5 rounded-full border-2 border-white dark:border-background-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-white font-bold">verified</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-primary uppercase tracking-wider mb-0.5">回報者 (Reporter)</p>
            <h2 className="text-lg font-black">{sighting.reporterName}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{sighting.timestamp}</p>
            <div className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${sighting.reliability === 'High' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              可靠度 {sighting.reliability === 'High' ? '高' : '中'}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="mb-8 px-1">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">text_snippet</span>
            回報描述
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base font-medium">
            {sighting.description}
          </p>
        </section>

        {/* Location Section */}
        <section className="mb-8">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-xl font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              目擊地點
            </h3>
            <button
              onClick={handleOpenInGoogleMaps}
              className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              在 Google Maps 開啟
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>

          <div className="group relative w-full h-64 rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg">
            <SightingMap locationName={sighting.locationName} />
          </div>
        </section>

        {/* Context Item Card */}
        <section className="mb-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">關於此遺失啟事</h3>
          <div
            onClick={() => navigate(`/item/${item.id}`)}
            className="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 cursor-pointer active:scale-95 transition-all"
          >
            <img src={item.mainImageUrl} className="size-16 rounded-xl object-cover" alt={item.title} />
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-base truncate">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">失主：{item.ownerName}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">arrow_forward_ios</span>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 w-full max-w-md p-4 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pb-10 flex gap-3 z-[60]">
        <button
          onClick={() => navigate(`/chat/${item.id}`)}
          className="flex-1 h-16 bg-primary text-background-dark font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined font-black">chat</span>
          聯絡目擊者
        </button>
      </div>
    </div>
  );
};

export default SightingDetail;
