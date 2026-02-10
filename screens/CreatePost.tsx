
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as L from 'leaflet';
import { Category, Gender } from '../types';
import { supabase } from '../src/lib/supabaseClient';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState<'Lost' | 'Found'>('Lost');
  const [category, setCategory] = useState<string>('寵物');
  const [subCategory, setSubCategory] = useState<string>('');
  const [breed, setBreed] = useState<string>('');
  const [title, setTitle] = useState('');

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const [storageLocation, setStorageLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [reward, setReward] = useState<string>('0');
  const [description, setDescription] = useState('');

  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // Location State (香港中環)
  const [selectedLocation, setSelectedLocation] = useState('中環 IFC 商場 附近');
  const [coords, setCoords] = useState<[number, number]>([22.2855, 114.1577]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const categories = [
    { name: '寵物', icon: 'pets' },
    { name: '人', icon: 'person' },
    { name: '電子產品', icon: 'devices' },
    { name: '銀包', icon: 'account_balance_wallet' },
    { name: '文件', icon: 'description' },
    { name: '其他', icon: 'more_horiz' }
  ];

  const subCategoryMap: Record<string, string[]> = {
    '寵物': ['狗', '貓', '鳥', '倉鼠', '兔', '其他'],
    '人': ['兒童 (18歲以下)', '長者 (失智症)', '其他'],
    '電子產品': ['手機', '電腦/平板', '耳機', '相機', '手錶', '其他'],
    '銀包': ['長夾/短夾', '卡片夾', '鑰匙包', '零錢包'],
    '文件': ['身份證', '護照', '駕照', '學生證', '工作證', '其他'],
  };

  useEffect(() => {
    if (step === 2 && mapContainerRef.current && !mapRef.current) {
      setTimeout(() => {
        if (!mapContainerRef.current) return;
        mapRef.current = L.map(mapContainerRef.current, {
          center: coords,
          zoom: 16,
          zoomControl: false,
          attributionControl: false
        });
        const isDark = document.documentElement.classList.contains('dark');
        const tileLayer = isDark
          ? 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.t%3Ageometry%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.stroke%7Cp.c%3A%23242f3e%7Cs.t%3Alabels.text.fill%7Cp.c%3A%23746855' // Dark flavored Google Map (Unofficial style)
          : 'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Standard Google Map
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
                // Simplified display name logic
                let name = data.display_name.split(',')[0];
                if (data.address) {
                  // Try to construct a better short name if available
                  name = data.address.building || data.address.amenity || data.address.road || name;
                }
                setSelectedLocation(`${name} (${center.lat.toFixed(6)}, ${center.lng.toFixed(6)})`);
              } else {
                setSelectedLocation(`座標: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
              }
            } catch (error) {
              console.error("Reverse geocoding error", error);
              setSelectedLocation(`座標: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
            } finally {
              setIsSearching(false);
            }
          }
        });
      }, 100);
    }
    return () => {
      if (step !== 2 && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [step]);

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 5) {
            stopRecording();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('無法開啟麥克風，請檢查權限設定。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Format: "Name (lat, lng)" to match ItemDetail expectations
        setSelectedLocation(`${display_name.split(',')[0]} (${lat}, ${lon})`);
      } else {
        alert('找不到該地點，請嘗試更具體的描述。');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current?.flyTo([latitude, longitude], 17);
      });
    }
  };

  useEffect(() => {
    setSubCategory('');
    setName('');
    setAge('');
    setHeight('');
    setWeight('');
    setGender(null);
    setAudioUrl(null);
    setDescription('');
    setBreed('');
    setTitle('');
  }, [category]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 3) { alert('最多只能上傳 3 張圖片'); return; }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => { if (event.target?.result) setImages(prev => [...prev, event.target?.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    // Collect data
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      alert("請先登入！");
      navigate('/login');
      return;
    }

    const newItem = {
      owner_id: user.data.user.id,
      title: title, // User input as Main Title
      category: (() => {
        const map: Record<string, string> = { '寵物': 'Pet', '人': 'People', '電子產品': 'Electronics', '銀包': 'Wallet', '文件': 'Documents', '其他': 'Other' };
        return map[category] || 'Other';
      })(),
      pet_type: (() => {
        if (category !== '寵物') return null;
        const map: Record<string, string> = { '狗': 'Dog', '貓': 'Cat', '鳥': 'Bird' };
        return map[subCategory] || 'Other';
      })(),
      // Subtitle Format in Description: 【尋找[類別]】在[地點]遺失的[品種]
      description: (() => {
        const loc = selectedLocation.split('(')[0].trim();
        const target = breed || subCategory || name || '物品';
        const subtitle = `【尋找${category}】在${loc}${postType === 'Lost' ? '遺失' : '拾獲'}的${target}`;
        return `${subtitle}\n\n${description}`;
      })(),
      reward: parseInt(reward) || 0,
      last_seen_location: selectedLocation,
      last_seen_timestamp: new Date().toISOString(),
      main_image_url: images.length > 0 ? images[0] : null, // Note: This stores Base64 if not uploaded to storage. Might be too large for some DB configs, but Supabase TEXT supports it. Ideally upload to Storage.
      secondary_image_urls: images.slice(1),
      status: postType,
      owner_name: user.data.user.user_metadata.name || 'Anonymous',
      distance: '0 km', // Calculated by backend or geofunction
      fake_reports: 0
    };

    const { error } = await supabase.from('items').insert(newItem);

    if (error) {
      console.error("Error creating post:", error);
      alert(`發佈失敗: ${error.message}`);
    } else {
      alert("發佈成功！");
      window.location.href = '/'; // Force reload to fetch new data immediately
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
        <button type="button" onClick={() => step === 1 ? navigate('/') : setStep(1)} className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent transition-all active:scale-90">
          <span className="material-symbols-outlined font-black text-slate-900 dark:text-white">{step === 1 ? 'close' : 'arrow_back_ios_new'}</span>
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">發佈{postType === 'Lost' ? '尋物' : '拾獲'}啟事</h1>
        <div className="flex size-11 items-center justify-end">
          {step === 1 && <button type="button" onClick={() => images.length > 0 && setStep(2)} className={`${images.length > 0 ? 'text-primary' : 'text-slate-400'} font-black text-sm px-2`}>下一步</button>}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 bg-white dark:bg-transparent">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{step === 1 ? '填寫基本資訊' : '標記精確地點'}</p>
          <p className="text-xs font-black text-primary">{step} / 2</p>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-primary transition-all duration-500 ease-out ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-48">
        {step === 1 ? (
          <div className="px-5 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">上傳照片 (最多 3 張)</label>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-lg">
                    <img src={img} className="w-full h-full object-cover" alt="Upload preview" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1.5 right-1.5 size-7 bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm font-black">close</span>
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl font-black">add_a_photo</span>
                    <span className="text-[11px] font-black">{images.length}/3</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">啟事類型</label>
              <div className="flex p-1.5 bg-slate-200 dark:bg-white/5 rounded-[1.5rem] border border-slate-300 dark:border-transparent shadow-inner">
                <button type="button" onClick={() => setPostType('Lost')} className={`flex-1 py-3.5 rounded-2xl text-sm font-black transition-all ${postType === 'Lost' ? 'bg-red-500 text-white shadow-xl' : 'text-slate-500'}`}>遺失了</button>
                <button type="button" onClick={() => setPostType('Found')} className={`flex-1 py-3.5 rounded-2xl text-sm font-black transition-all ${postType === 'Found' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>拾獲了</button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">物品種類</label>
                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar py-1">
                  {categories.map((cat) => (
                    <button key={cat.name} type="button" onClick={() => setCategory(cat.name)} className={`px-5 py-3 rounded-2xl flex items-center gap-2 whitespace-nowrap border-2 transition-all ${category === cat.name ? 'bg-primary border-primary text-slate-900 shadow-lg font-black' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 font-bold'}`}>
                      <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                      <span className="text-xs uppercase tracking-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Input */}
              {postType === 'Lost' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">懸賞金額 (選填)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-500">$</span>
                    <input
                      type="number"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-3.5 pl-10 pr-5 text-slate-900 dark:text-white font-black text-sm outline-none shadow-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}


              {category === '寵物' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-primary uppercase tracking-widest px-1">寵物類型</label>
                    <div className="flex gap-2.5 overflow-x-auto hide-scrollbar py-1">
                      {subCategoryMap['寵物'].map((sub) => (
                        <button key={sub} type="button" onClick={() => setSubCategory(sub)} className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${subCategory === sub ? 'bg-primary border-primary text-slate-900 shadow-md' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500'}`}>
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">品種 (選填)</label>
                    <input
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold text-sm outline-none shadow-sm"
                      placeholder="例如：柴犬、摺耳貓"
                    />
                  </div>
                </div>
              )}
            </div>

            {(category === '寵物' || category === '人') && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="h-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">{category === '寵物' ? '寵物名字' : '真實姓名'}</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-black text-sm outline-none shadow-sm" placeholder={category === '寵物' ? "例如：Bobby" : "請輸入姓名"} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">性別</label>
                    <div className="flex p-1 bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
                      <button type="button" onClick={() => setGender('Male')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${gender === 'Male' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500'}`}>{category === '寵物' ? '公' : '男'}</button>
                      <button type="button" onClick={() => setGender('Female')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${gender === 'Female' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-500'}`}>{category === '寵物' ? '母' : '女'}</button>
                    </div>
                  </div>
                </div>

                {category === '人' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">年齡</label>
                      <div className="relative">
                        <input value={age} onChange={(e) => setAge(e.target.value)} type="number" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-4 pl-4 pr-10 text-slate-900 dark:text-white font-black text-sm outline-none shadow-sm" placeholder="選填" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">歲</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">身高</label>
                      <div className="relative">
                        <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-4 pl-4 pr-10 text-slate-900 dark:text-white font-black text-sm outline-none shadow-sm" placeholder="選填" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">cm</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">體重</label>
                      <div className="relative">
                        <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-4 pl-4 pr-10 text-slate-900 dark:text-white font-black text-sm outline-none shadow-sm" placeholder="選填" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">kg</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Voice Recording Section for Pets */}
            {category === '寵物' && postType === 'Lost' && (
              <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">mic</span>
                      錄製飼主呼喚聲 (5秒)
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">播放給目擊現場的寵物聽，增加尋回率</p>
                  </div>
                  {audioUrl && (
                    <button type="button" onClick={() => setAudioUrl(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">刪除重錄</button>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  {audioUrl ? (
                    <div className="w-full px-4">
                      <audio controls src={audioUrl} className="w-full h-10"></audio>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`size-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isRecording ? 'bg-red-500 scale-110 shadow-red-500/30' : 'bg-primary text-slate-900 shadow-primary/20 hover:scale-105 active:scale-95'}`}
                      >
                        <span className="material-symbols-outlined text-4xl font-black">
                          {isRecording ? 'stop' : 'mic'}
                        </span>

                        {isRecording && (
                          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
                        )}
                      </button>

                      <div className="flex flex-col items-center">
                        <p className={`text-sm font-black ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                          {isRecording ? `錄製中 ${recordingTime}s / 5s` : '按住按鈕開始錄製'}
                        </p>
                        {isRecording && (
                          <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className={`w-1 bg-red-500 rounded-full animate-bounce`} style={{ height: `${Math.random() * 16 + 8}px`, animationDelay: `${i * 100}ms` }}></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {postType === 'Found' && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest px-1">物品存放下落</label>
                  <input value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} className="w-full h-14 px-5 rounded-[1.5rem] border-2 border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 focus:border-blue-500 outline-none text-sm font-black text-slate-900 dark:text-white placeholder:text-blue-400/60 shadow-sm" placeholder="例如：已交到中環警署報案大廳..." />
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">啟事標題</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-14 px-5 rounded-[1.5rem] border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 focus:border-primary outline-none text-sm font-black text-slate-900 dark:text-white shadow-sm"
                  placeholder={category === '人' ? "請輸入簡短標題，如：尋找在中環走失的家人" : `請輸入標題，如：在旺角走失的${subCategory || category}`}
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">詳細描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-5 rounded-[2rem] border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 focus:border-primary outline-none text-sm font-black text-slate-900 dark:text-white h-32 resize-none shadow-sm"
                  placeholder="請詳細描述特徵、穿著或相關背景資訊..."
                ></textarea>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex-1 relative min-h-[500px]">
              <div ref={mapContainerRef} className="w-full h-full z-0"></div>

              <div className="absolute top-4 left-4 right-4 z-20">
                <form onSubmit={handleLocationSearch} className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {isSearching ? (
                      <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">search</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋香港地點 (如: 旺角站)"
                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-slate-500">close</span>
                    </button>
                  )}
                </form>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 -mt-10">
                <div className="relative">
                  <div className="absolute -inset-8 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="relative size-14 bg-primary rounded-full border-4 border-white dark:border-background-dark shadow-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-background-dark text-3xl font-black">{postType === 'Lost' ? 'person_search' : (category === '寵物' ? 'pets' : 'location_on')}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-20 right-4 z-20">
                <button type="button" onClick={handleGetCurrentLocation} className="size-12 rounded-2xl bg-white/95 dark:bg-background-dark/95 backdrop-blur-md shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center active:scale-90 transition-all"><span className="material-symbols-outlined font-black text-slate-900 dark:text-white">my_location</span></button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-background-dark/85 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-background-dark font-black text-2xl">near_me</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">標記{postType === 'Lost' ? '最後見到' : '拾獲'}的地點</p>
                      <p className="text-sm font-black text-white truncate">{selectedLocation}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-white/5 rounded-2xl border border-white/5">
                      <input type="checkbox" checked={privacyAgreed} onChange={() => setPrivacyAgreed(!privacyAgreed)} className="appearance-none size-6 border-2 border-primary/40 rounded-lg checked:bg-primary transition-all cursor-pointer" />
                      <span className="text-[11px] font-bold text-slate-300 leading-tight">我承諾提供真實地點資訊，並遵守香港隱私權政策</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        }
      </main >

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white dark:from-background-dark dark:via-background-dark pt-12 z-[60]">
        <button
          disabled={images.length === 0 || (step === 2 && !privacyAgreed)}
          onClick={() => {
            if (step === 1) {
              setStep(2);
            } else {
              handleSubmit();
            }
          }}
          className={`w-full h-16 font-black text-lg rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.98] ${(images.length > 0 && (step === 1 || privacyAgreed)) ? 'bg-primary text-slate-900 shadow-primary/30' : 'bg-slate-200 text-slate-400 opacity-60'}`}
        >
          {step === 1 ? '確認資訊並下一步' : '確認發佈此啟事'}
          <span className="material-symbols-outlined font-black">{step === 1 ? 'arrow_forward' : 'send'}</span>
        </button>
      </div>
    </div >
  );
};

export default CreatePost;
