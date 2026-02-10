
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LostItem, Sighting } from '../types';

import { supabase } from '../src/lib/supabaseClient';

// Helper to parse location string "Name (lat, lng)" or fallback
const parseCoords = (loc: string): [number, number] | null => {
  const match = loc.match(/\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[3])];
  }
  // Try to parse if it's just "lat, ln" inside or "座標: lat, lng"
  const clean = loc.replace('座標: ', '');
  const simpleMatch = clean.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (simpleMatch) {
    return [parseFloat(simpleMatch[1]), parseFloat(simpleMatch[3])];
  }
  return null;
};

const getLocationName = (location: string) => {
  return location.replace(/\s*\(-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\)$/, '');
};

const ItemMap: React.FC<{ item: LostItem }> = ({ item }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (Hong Kong) if no coords
    let initialCenter: [number, number] = [22.2855, 114.1577];
    const mainCoords = parseCoords(item.lastSeenLocation);
    if (mainCoords) initialCenter = mainCoords;

    mapRef.current = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Tile Layer
    const isDark = document.documentElement.classList.contains('dark');
    const tileLayer = isDark
      ? 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.t%3Ageometry%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.stroke%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.fill%7Cp.c%3A%23746855'
      : 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    L.tileLayer(tileLayer).addTo(mapRef.current);

    // Add Markers
    // 1. Main Lost Location (Red)
    if (mainCoords) {
      const redIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ef4444; width: 1.5rem; height: 1.5rem; border-radius: 9999px; border: 3px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(mainCoords, { icon: redIcon }).addTo(mapRef.current)
        .bindPopup(`<div style="font-weight:900; font-size: 12px;">最後遺失地點</div>`);
    }

    // 2. Sightings (Blue)
    item.sightings.forEach(sighting => {
      const sCoords = parseCoords(sighting.locationName);
      if (sCoords) {
        const blueIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #3b82f6; width: 1.2rem; height: 1.2rem; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker(sCoords, { icon: blueIcon }).addTo(mapRef.current)
          .bindPopup(`<div style="font-weight:bold; font-size: 11px;">目擊: ${sighting.locationName.split('(')[0]}</div>`);
      }
    });

    // Fit bounds if multiple points
    const points: [number, number][] = [];
    if (mainCoords) points.push(mainCoords);
    item.sightings.forEach(s => {
      const c = parseCoords(s.locationName);
      if (c) points.push(c);
    });

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [item]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

interface ItemDetailProps {
  items: LostItem[];
  onToggleFavorite: (id: string) => void;
  onReportFake: (id: string) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ items, onToggleFavorite, onReportFake }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("ItemDetail Render. ID:", id, "PropItem:", items.find(i => i.id === id));
  const [isFakeReported, setIsFakeReported] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(true);

  // Data Fetching State
  const [fetchedItem, setFetchedItem] = useState<LostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Current User State
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  // Attempt to fund item in props first
  const propItem = items.find(i => i.id === id);

  useEffect(() => {
    // If the item exists in props, we are good.
    if (propItem) {
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch it.
    if (!id) return;

    // Otherwise, fetch it.
    if (!id) return;

    const fetchItem = async () => {
      console.log("Fetching item from Supabase:", id);
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('items')
          .select(`
                    *,
                    sightings (*)
                `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const mappedItem: LostItem = {
            id: data.id,
            title: data.title || '無標題',
            category: data.category || 'Other',
            petType: data.pet_type || 'Other',
            description: data.description || '',
            reward: data.reward || 0,
            rewardHistory: Array.isArray(data.reward_history) ? data.reward_history : [],
            lastSeenLocation: data.last_seen_location || 'Unknown',
            lastSeenTimestamp: data.last_seen_timestamp ? new Date(data.last_seen_timestamp).toLocaleString() : 'Unknown',
            mainImageUrl: data.main_image_url || '',
            secondaryImageUrls: Array.isArray(data.secondary_image_urls) ? data.secondary_image_urls : [],
            status: data.status || 'Lost',
            ownerName: data.owner_name || 'Anonymous',
            ownerId: data.owner_id || '',
            distance: data.distance || 'Unknown',
            sightings: Array.isArray(data.sightings) ? data.sightings.map((s: any) => ({
              id: s.id,
              reporterName: s.reporter_name || 'Anonymous',
              reporterAvatar: s.reporter_avatar || '',
              timestamp: s.created_at ? new Date(s.created_at).toLocaleString() : '',
              locationName: s.location_name || 'Unknown',
              description: s.description || '',
              imageUrl: s.image_url,
              mapPreviewUrl: s.map_preview_url,
              reliability: s.reliability || 'Low',
              distance: s.distance || ''
            })) : [],
            isFavorite: false,
            fakeReports: data.fake_reports || 0,
            storageLocation: data.storage_location,
            ownerVoiceUrl: data.owner_voice_url
          };
          setFetchedItem(mappedItem);
          console.log("Item fetched successfully:", mappedItem);
        }
      } catch (err: any) {
        console.error("Error fetching item details:", err);
        setError(err.message || "無法載入遺失物資訊");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id, propItem]);


  const item = propItem || fetchedItem;

  // Safe default for filtering images to prevent crash if item is null during render
  const images = item ? [item.mainImageUrl, ...item.secondaryImageUrls].filter(Boolean) : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const toggleVoice = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">正在載入...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">sentiment_dissatisfied</span>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">找不到此遺失物</h2>
        <p className="text-slate-500 mb-6">{error === 'JSON object requested, multiple (or no) rows returned' ? '該頁面可能已被刪除' : (error || '請檢查連結是否正確')}</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-slate-900 font-black rounded-2xl shadow-lg active:scale-95 transition-all">
          返回首頁
        </button>
      </div>
    );
  }



  const handleShare = async () => {
    const shareData = {
      title: `尋找失物: ${item.title}`,
      text: `請幫忙尋找: ${item.title}。最後見於: ${item.lastSeenLocation}。描述: ${item.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('連結已複製到剪貼簿！');
      }
    } catch (err) {
      console.error('分享失敗:', err);
    }
  };

  const handleToggleFavorite = () => {
    if (propItem) {
      onToggleFavorite(item.id);
    } else if (fetchedItem) {
      setFetchedItem({ ...fetchedItem, isFavorite: !fetchedItem.isFavorite });
    }
  };

  const handleReportFake = () => {
    if (propItem) {
      onReportFake(item.id);
    } else if (fetchedItem) {
      setFetchedItem({ ...fetchedItem, fakeReports: fetchedItem.fakeReports + 1 });
      alert("舉報成功！我們將進行審核。");
    }
    setIsFakeReported(true);
  };

  const getMapQuery = (location: string) => {
    // 1. Check for "Name (lat, lng)" format -> Use lat,lng
    const coordsMatch = location.match(/\((-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?)\)$/);
    if (coordsMatch) {
      return coordsMatch[1];
    }

    // 2. Fallback to existing logic
    const cleanLoc = location.replace('座標: ', '');
    const isCoords = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(cleanLoc);

    if (isCoords) {
      return cleanLoc;
    }

    if (cleanLoc.includes('Hong Kong') || cleanLoc.includes('香港')) {
      return cleanLoc;
    }

    return `${cleanLoc} Hong Kong`;
  };

  const getLocationName = (location: string) => {
    // Remove the coordinates part for display: "IFC (22.2, 114.1)" -> "IFC"
    return location.replace(/\s*\(-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\)$/, '');
  };

  const mapUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDlpYWbimPcKXNOWRz7d1rXmaDWzV8WlyhVejIqPSZshZpmXLJKQi5IQoMcRPb3woNL4WVyLLrKINzxZVW1BmkIJubfv9nkenubeUtIKjzYTtjYEyF5OOgaq168SfhZ2yfmTzKc3lX3ctTU_djn2jEZSiyVJ0XePsEBbjjCd0GWYI9loXzL9wmq54DcFSeUvnFWDcJpslA7vahcUISXX4a1yXK5QvQpNUn0kAY2HJ6Q8vo7IL9GSTIwiich1U3C0RftAvJqgVT751gu";

  return (
    <div className="flex-1 pb-40">
      {/* Header Over Image */}
      <div className="fixed top-0 z-50 w-full max-w-md bg-gradient-to-b from-black/70 to-transparent px-4 py-5 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex items-center justify-center size-11 rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/40 transition-all active:scale-90 shadow-2xl"
        >
          <span className="material-symbols-outlined font-black">arrow_back_ios_new</span>
        </button>
        <div className="flex gap-2.5 pointer-events-auto">
          {currentUser && item && currentUser.id === item.ownerId && (
            <>
              <button
                onClick={() => navigate(`/boost/${item.id}`)}
                className="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg lg:shadow-orange-500/30 transition-all active:scale-90 hover:scale-105"
              >
                <span className="material-symbols-outlined font-black">rocket_launch</span>
              </button>
              <button
                onClick={() => navigate(`/manage/${item.id}`)}
                className="flex items-center justify-center size-11 rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/40 transition-all active:scale-90 shadow-2xl"
              >
                <span className="material-symbols-outlined font-black">edit</span>
              </button>
            </>
          )}
          <button
            onClick={handleReportFake}
            disabled={isFakeReported}
            className={`flex items-center justify-center size-11 rounded-2xl backdrop-blur-xl border transition-all active:scale-90 shadow-2xl ${isFakeReported ? 'bg-red-600 text-white border-red-600' : 'bg-white/20 text-white border-white/30 hover:bg-red-500/80'}`}
          >
            <span className="material-symbols-outlined font-black">report</span>
          </button>
          <button onClick={handleShare} className="flex items-center justify-center size-11 rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/40 shadow-2xl transition-all active:scale-90">
            <span className="material-symbols-outlined font-black">share</span>
          </button>
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="relative w-full aspect-[4/5] bg-slate-300 dark:bg-slate-800 overflow-hidden transition-colors">
        {images.map((img, idx) => (
          <img
            key={img}
            src={img}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            alt={`${item.title} - ${idx + 1}`}
          />
        ))}

        {images.length > 1 && (
          <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center gap-2 px-4 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 shadow-xl ${idx === currentImgIndex ? 'w-8 bg-primary' : 'w-2 bg-white/60'}`}
              ></div>
            ))}
          </div>
        )}

        <div className="absolute top-24 left-4 z-20 flex gap-2">
          <span className={`text-white text-[11px] font-black px-5 py-2 rounded-xl uppercase tracking-[0.2em] shadow-2xl ${item.status === 'Lost' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {item.status === 'Lost' ? '遺失中' : '拾獲'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-10 relative z-20 bg-background-light dark:bg-background-dark rounded-t-[3rem] pt-10 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-colors">

        {/* Reward Card */}
        {item.status === 'Lost' && item.reward > 0 && (
          <div className="flex flex-col gap-4 mb-8">
            <div className="bg-[#1a1c22] border border-white/5 rounded-[2.5rem] p-8 flex justify-between items-center animate-in zoom-in-95 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute -top-4 -right-4 size-32 bg-primary/5 rounded-full blur-3xl"></div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#9e8747] mb-2">尋獲報酬 (REWARD)</p>
                <div className="flex items-center gap-3">
                  <p className="text-5xl font-black text-primary leading-none tracking-tighter">${item.reward.toLocaleString()}</p>
                  {item.rewardHistory.length > 0 && (
                    <span className="text-[10px] font-black px-2.5 py-1 bg-green-500/90 text-white rounded-lg animate-pulse uppercase tracking-tighter">已加碼</span>
                  )}
                </div>
              </div>
              <div className="size-20 rounded-[1.8rem] bg-white text-slate-900 flex items-center justify-center shadow-2xl shadow-white/5 ring-8 ring-white/5">
                <span className="material-symbols-outlined text-4xl font-black filled-icon">monetization_on</span>
              </div>
            </div>

            {/* Reward History - Ascending Order Timeline */}
            <div className="bg-[#1a1c22] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl ring-1 ring-white/10">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 active:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">history</span>
                  查看加碼歷史 ({item.rewardHistory.length})
                </div>
                <span className={`material-symbols-outlined transition-transform duration-500 ${showHistory ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {showHistory && (
                <div className="px-8 pb-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col gap-8 pt-2 relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[7px] top-2 bottom-6 w-0.5 bg-slate-700/50"></div>

                    {/* Render History in CHRONOLOGICAL order (遞增) */}
                    {item.rewardHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between pl-8 relative group">
                        {/* Static History Dot */}
                        <div className="absolute left-[3px] top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-slate-500 border-2 border-[#1a1c22] z-10"></div>

                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-slate-200 group-hover:text-white transition-colors">${h.amount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-tight">{h.timestamp}</p>
                        </div>
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/5 text-slate-500 uppercase tracking-tighter">曾設金額</span>
                      </div>
                    ))}

                    {/* Current/Latest Node at the bottom */}
                    <div className="flex items-center justify-between pl-8 relative animate-in fade-in duration-1000">
                      {/* Active/Latest Yellow Glowing Dot */}
                      <div className="absolute left-[0px] top-1/2 -translate-y-1/2 size-4 rounded-full bg-primary border-2 border-[#1a1c22] z-10 shadow-[0_0_15px_rgba(250,198,56,0.8)]"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-black text-primary">${item.reward.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-primary/60 mt-0.5 tracking-tight">當前加碼後金額</p>
                      </div>
                      <span className="text-[9px] font-black px-3 py-1.5 rounded-lg bg-primary/10 text-primary uppercase tracking-tighter ring-1 ring-primary/20">最新</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owner's Voice Call */}
        {item.ownerVoiceUrl && (
          <div className="mb-8 p-6 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-md flex items-center gap-5 relative overflow-hidden group">
            <div
              className="absolute left-0 bottom-0 h-1 bg-primary/40 transition-all duration-100 ease-linear"
              style={{ width: `${audioProgress}%` }}
            ></div>

            <div className="relative">
              {isPlaying && (
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
              )}
              <button
                onClick={toggleVoice}
                className={`relative size-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isPlaying ? 'bg-primary text-slate-900' : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white'}`}
              >
                <span className="material-symbols-outlined text-3xl font-black">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">飼主的呼喚聲</h4>
                <span className="text-[9px] font-black px-2 py-0.5 bg-primary/20 text-primary rounded border border-primary/20">限 5 秒</span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">播放此聲音可吸引寵物注意或確認身份。</p>
            </div>

            <audio
              ref={audioRef}
              src={item.ownerVoiceUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-3xl font-black mb-5 tracking-tight leading-tight text-slate-900 dark:text-white">{item.title}</h1>
          <div className="flex flex-wrap gap-2.5">
            {['已認證身份', item.category === 'Pet' ? '具備晶片' : '外觀可辨識'].map(tag => (
              <span key={tag} className="px-5 py-2 bg-slate-200 dark:bg-white/10 rounded-2xl text-[11px] font-black text-slate-800 dark:text-slate-300 border-2 border-slate-300 dark:border-white/5 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Improved Location & Sighting Map */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-5">
            <div className={`size-14 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${item.status === 'Lost' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
              <span className="material-symbols-outlined text-3xl font-black">{item.status === 'Lost' ? 'fmd_bad' : 'location_on'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">最後遺失地點 (Last Seen)</p>
              <p className="text-lg font-black text-slate-900 dark:text-white truncate">{getLocationName(item.lastSeenLocation)}</p>
            </div>
          </div>

          <div className="group relative w-full h-80 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 shadow-lg">
            <ItemMap item={item} />
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-black mb-5 flex items-center gap-3 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary text-2xl font-black">description</span>
            詳細特徵描述
          </h3>
          <div className="p-6 bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-200 dark:border-white/5 shadow-md">
            <p className="text-slate-900 dark:text-slate-200 leading-relaxed text-base font-bold whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>

        {/* Actual Sightings List */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl font-black">visibility</span>
              目擊情報回報 ({item.sightings.length})
            </h3>
            {item.sightings.length > 0 && (
              <span className="text-[10px] font-black px-3 py-1 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">正在過濾虛假回報</span>
            )}
          </div>

          <div className="space-y-6">
            {item.sightings.length > 0 ? (
              item.sightings.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/sighting/${item.id}/${s.id}`)}
                  className="bg-white dark:bg-white/5 rounded-[2.5rem] p-5 border-2 border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={s.reporterAvatar} className="size-10 rounded-2xl object-cover border-2 border-primary/20" alt={s.reporterName} />
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{s.reporterName}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.timestamp} • {s.distance}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${s.reliability === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'}`}>
                      {s.reliability === 'High' ? '高可靠性' : '中度參考'}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {s.imageUrl && (
                      <div className="size-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 shadow-sm">
                        <img src={s.imageUrl} className="size-full object-cover" alt="Sighting photo" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 text-primary">
                        <span className="material-symbols-outlined text-sm font-black">location_on</span>
                        <p className="text-[11px] font-black truncate">{s.locationName}</p>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-400 font-bold line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-white/10">
                <span className="material-symbols-outlined text-5xl mb-3">notification_important</span>
                <p className="text-sm font-black">目前尚無目擊回報</p>
                <p className="text-xs font-bold mt-1">若您有任何線索，請點擊下方按鈕回報。</p>
              </div>
            )}

            {item.status === 'Lost' && (
              <button
                onClick={() => navigate(`/report/${item.id}`)}
                className="w-full py-8 border-4 border-dashed border-primary text-primary font-black rounded-[2.5rem] flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-all active:scale-[0.98] shadow-inner bg-primary/5 mt-4"
              >
                <span className="material-symbols-outlined text-4xl font-black">add_a_photo</span>
                <span className="text-lg">回報新的目擊位置</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Sticky Action Bar */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-2xl p-5 border-t border-slate-300 dark:border-white/10 flex gap-4 pb-12 z-[60] shadow-[0_-15px_50px_rgba(0,0,0,0.1)] transition-colors">
        <button
          onClick={handleToggleFavorite}
          className={`size-16 shrink-0 rounded-[1.5rem] border-2 flex items-center justify-center transition-all active:scale-90 shadow-lg ${item.isFavorite ? 'bg-red-500 text-white border-red-500 shadow-red-500/30' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-transparent'}`}
        >
          <span className={`material-symbols-outlined text-3xl ${item.isFavorite ? 'filled-icon' : ''}`}>favorite</span>
        </button>
        <button
          onClick={() => navigate(`/chat/${item.id}`)}
          className={`flex-1 h-16 ${item.status === 'Found' ? 'bg-blue-600' : 'bg-primary'} text-white dark:text-slate-900 font-black text-xl rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.97] transition-all ${item.status === 'Lost' ? 'shadow-primary/40' : 'shadow-blue-600/30'}`}
        >
          <span className="material-symbols-outlined font-black text-3xl">chat</span>
          {item.status === 'Found' ? '認領物品' : '聯繫委託人'}
        </button>
      </div>
    </div>
  );
};

export default ItemDetail;
