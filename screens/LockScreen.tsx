
import React, { useState, useEffect } from 'react';

interface LockScreenProps {
  onUnlock: (targetPath?: string) => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-black select-none">
      <div className="relative h-full w-full max-w-[390px] overflow-hidden bg-background-dark">
        {/* Wallpaper Background */}
        <div className="absolute inset-0 wallpaper-gradient"></div>
        
        {/* System Top Bar */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-4 text-white pointer-events-none">
          <span className="text-sm font-semibold">{timeString}</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">signal_cellular_4_bar</span>
            <span className="material-symbols-outlined text-[18px]">wifi</span>
            <span className="material-symbols-outlined text-[20px]">battery_full</span>
          </div>
        </div>

        {/* Lock Screen Clock & Date */}
        <div className="relative z-10 flex flex-col items-center pt-12 text-white pointer-events-none">
          <p className="text-lg font-medium opacity-90">{dateString}</p>
          <h1 className="mt-2 text-[80px] font-bold leading-none tracking-tight">{timeString}</h1>
        </div>

        {/* Notifications Area */}
        <div className="relative z-20 mt-16 px-4 flex flex-col gap-3">
          {/* Main Notification - Removed Bounce */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onUnlock('/item/1');
            }}
            className="w-full text-left ios-blur flex flex-col rounded-[1.5rem] p-5 shadow-2xl ring-1 ring-white/10 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-background-dark">
                  <span className="material-symbols-outlined text-[16px] font-black">pet_supplies</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">附近走失提醒 • 現在</span>
              </div>
              <span className="material-symbols-outlined text-white/30 text-sm">more_horiz</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <h3 className="text-base font-black text-white leading-tight">波比 (Bobby) 在附近走失</h3>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/70">
                  黃金獵犬在您附近 <span className="font-black text-primary">200 米</span> 內出現，請點擊協助留意。
                </p>
              </div>
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/40 shadow-lg">
                <img 
                  alt="Golden Retriever" 
                  className="h-full w-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6CLXqVi3wb6iPFKfWPZjycHD36J02LkSZc5MGLcUzxwSG-cdXNJO1ZVhtTe-lFIqSHnocIM6s8fClUU3mEeZEPqmqm70Ssht0F3wek5k5XYdKz98gSAhAEdJlp7gpdCCeP3UFAtbyQN2QU5tuBbFd0h-_YtBbO51o7eUtXugVV5Gi7SKVe98GkV5bw-HTx7owyFhGYpSRKdlyoKWg7g_ti7tHz9ZbDj7IGuu3XmtdJnqE4IiEH1xwmNj-NmtlUxI9GulZK9yqubmo" 
                />
              </div>
            </div>
          </button>
          
          {/* Secondary Action Link */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onUnlock('/item/1');
            }}
            className="w-full ios-blur flex items-center justify-between rounded-2xl p-4 shadow-lg ring-1 ring-white/10 active:bg-white/5 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[20px] font-bold">location_on</span>
              </div>
              <span className="text-sm font-bold text-white">立即查看詳細地點</span>
            </div>
            <span className="material-symbols-outlined text-white/30 text-xl">chevron_right</span>
          </button>
        </div>

        {/* Bottom Lock Screen Controls */}
        <div className="absolute bottom-12 left-0 right-0 z-30 flex items-center justify-between px-12 pointer-events-none">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-xl border border-white/5 pointer-events-auto active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-2xl">flashlight_on</span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-xl border border-white/5 pointer-events-auto active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
          </div>
        </div>

        {/* Home Indicator - Tap or Swipe to Unlock */}
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pt-10 flex flex-col items-center">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4 animate-pulse">點擊解鎖</p>
          <button 
            onClick={() => onUnlock()} 
            className="h-1.5 w-36 rounded-full bg-white/40 active:bg-white transition-colors cursor-pointer"
            aria-label="解鎖"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
