
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as L from 'leaflet';
import { LostItem, Sighting } from '../types';
import { MOCK_USER } from '../constants';
import { supabase } from '../src/lib/supabaseClient';

interface ReportSightingProps {
  items: LostItem[];
  onReport: (itemId: string, sighting: Sighting, newLocation: string) => void;
}

const ReportSighting: React.FC<ReportSightingProps> = ({ items, onReport }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const item = items.find(i => i.id === id) || items[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('中環 皇后大道中');
  const [description, setDescription] = useState('');

  // Search & Map State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [coords, setCoords] = useState<[number, number]>([22.2855, 114.1577]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Use Google Maps Tiles
    const isDark = document.documentElement.classList.contains('dark');
    const tileLayer = isDark
      ? 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.t%3Ageometry%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.stroke%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.fill%7Cp.c%3A%23746855'
      : 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    L.tileLayer(tileLayer).addTo(mapRef.current);

    mapRef.current.on('moveend', async () => {
      const center = mapRef.current?.getCenter();
      if (center) {
        setCoords([center.lat, center.lng]);
        setIsSearching(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            let name = data.display_name.split(',')[0];
            if (data.address) {
              name = data.address.building || data.address.amenity || data.address.road || name;
            }
            setLocationName(`${name} (${center.lat.toFixed(6)}, ${center.lng.toFixed(6)})`);
          } else {
            setLocationName(`座標: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
          }
        } catch (error) {
          console.error("Reverse geocoding error", error);
          setLocationName(`座標: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        } finally {
          setIsSearching(false);
        }
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const handleLocationSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Hong Kong')}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setCoords(newCoords);
        mapRef.current.flyTo(newCoords, 17, { duration: 1.5 });
        // Trigger moveend to update name
      } else {
        alert('找不到該地點');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    // Get current user
    const user = await supabase.auth.getUser();

    const newSighting = {
      item_id: id,
      reporter_id: user.data.user?.id || null, // Can be anonymous if reporting allowed (schema says set null)
      reporter_name: user.data.user?.user_metadata.name || 'Anonymous',
      reporter_avatar: user.data.user?.user_metadata.avatar_url || MOCK_USER.avatarUrl,
      description: description,
      location_name: locationName,
      image_url: selectedImage || null, // Base64 if small.
      map_preview_url: null,
      reliability: 'High',
      distance: '0 米'
    };

    // Insert into Supabase
    const { error } = await supabase.from('sightings').insert(newSighting);

    if (error) {
      console.error("Error reporting sighting:", error);
      alert(`回報失敗: ${error.message}`);
      setIsSubmitting(false);
    } else {
      // Optimistic UI update via onReport is optional if we reload or if real-time subscription handles it.
      // For now, consistent with App, we just rely on navigation or just success message.
      // App.tsx addSighting updates local state. We can still call it for immediate feedback if App state matches.
      // Update local state via App.tsx to reflect changes immediately
      onReport(item.id, newSighting as any, locationName);

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => navigate(`/item/${id}`, { replace: true }), 2000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-6">
        <div className="size-24 rounded-full bg-green-500 flex items-center justify-center mb-6 animate-bounce text-white">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h2 className="text-3xl font-black text-center mb-2">回報成功！</h2>
        <p className="text-slate-500 text-center">感謝您的幫忙，這對尋回 {item.title} 至關重要。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-lg font-bold">回報目擊線索</h1>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-32">

        <div className="relative w-full h-[50vh] bg-slate-200 overflow-hidden group">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Search Bar - Overlay */}
          <div className="absolute top-4 left-4 right-4 z-[400]">
            <div className="relative shadow-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋地點 (例如: 銅鑼灣)"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border border-white/20 text-sm font-bold shadow-lg outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleLocationSearch}
                className="absolute left-0 top-0 h-12 w-12 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400] pb-8">
            <div className="relative flex flex-col items-center">
              <div className="bg-red-600 p-3 rounded-full shadow-2xl border-4 border-white animate-bounce">
                <span className="material-symbols-outlined text-white text-3xl font-black">visibility</span>
              </div>
              <div className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-black mt-2 shadow-lg text-red-600 backdrop-blur-md">
                移動地圖以標記位置
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-[401]">
            <div className="p-4 bg-white/95 dark:bg-[#1a1c22]/95 backdrop-blur-xl rounded-[1.5rem] border border-white/20 shadow-2xl flex items-center gap-4">
              <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${isSearching ? 'bg-slate-100 text-slate-400' : 'bg-primary text-slate-900'}`}>
                {isSearching ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">near_me</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">目擊地點</p>
                <p className="text-sm font-black truncate leading-tight">{locationName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-base font-bold mb-4">上傳現場照片</h3>
            <label className="relative flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden cursor-pointer">
              {selectedImage ? (
                <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  <span className="text-sm font-medium">點擊拍攝或上傳照片</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4">詳細描述</h3>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white dark:bg-white/5 border-none focus:ring-2 focus:ring-primary h-32 text-sm placeholder:text-slate-400"
              placeholder="請具體描述：當時見到往哪個方向走，穿著什麼顏色的衣服/項圈..."
            ></textarea>
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 w-full max-w-md p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pb-10">
        <button onClick={handleSubmit} disabled={isSubmitting || !description.trim()} className={`w-full h-16 rounded-full font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${isSubmitting || !description.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary text-background-dark'}`}>
          {isSubmitting ? '發送中...' : '提交目擊線索'}
        </button>
      </div>
    </div>
  );
};

export default ReportSighting;
