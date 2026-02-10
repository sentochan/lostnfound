
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LostItem } from '../types';

interface ManagePostProps {
  items: LostItem[];
  onUpdateStatus: (id: string, status: 'Lost' | 'Found' | 'Recovered' | 'Closed') => void;
  onUpdateReward?: (id: string, amount: number) => void;
  onUpdateLocation?: (id: string, location: string) => void;
}

const ManagePost: React.FC<ManagePostProps> = ({ items, onUpdateStatus, onUpdateReward, onUpdateLocation }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id) || items[0];
  const [newReward, setNewReward] = useState<string>(item.reward.toString());
  const [newLocation, setNewLocation] = useState<string>(item.lastSeenLocation);

  const statuses: { value: 'Lost' | 'Recovered' | 'Closed', label: string, icon: string }[] = [
    { value: 'Lost', label: '遺失中', icon: 'search' },
    { value: 'Recovered', label: '已尋回', icon: 'celebration' },
    { value: 'Closed', label: '委託結束', icon: 'task_alt' }
  ];

  const isActive = item.status === 'Lost' || item.status === 'Found';

  const handleRewardUpdate = () => {
    const amount = parseInt(newReward);
    if (!isNaN(amount) && onUpdateReward) {
      onUpdateReward(item.id, amount);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center bg-white dark:bg-[#1a160b] p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-[#1c180d] dark:text-white flex size-10 items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[#1c180d] dark:text-white text-lg font-bold flex-1 text-center">管理我的發佈</h2>
        <div className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">more_horiz</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-48">
        {/* Item Info Card */}
        <div className="m-4 p-4 rounded-3xl bg-white dark:bg-[#2d281a] shadow-sm flex items-center gap-4 border border-gray-100 dark:border-gray-700">
          <img src={item.mainImageUrl} className="size-20 rounded-2xl object-cover shadow-inner" alt={item.title} />
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter ${item.status === 'Recovered' ? 'bg-green-500 text-white' :
                item.status === 'Closed' ? 'bg-gray-500 text-white' : 'bg-primary text-slate-900'
                }`}>
                {item.status === 'Lost' ? '遺失中' : item.status === 'Recovered' ? '已尋回' : item.status === 'Closed' ? '已完結' : '拾獲'}
              </span>
            </div>
            <h4 className="font-black text-lg truncate text-slate-900 dark:text-white">{item.title}</h4>
            <p className="text-xs text-slate-500 dark:text-[#9e8747] mt-1 font-bold truncate">地點：{item.lastSeenLocation}</p>
          </div>
        </div>

        {/* Location Management Section */}
        {isActive && onUpdateLocation && (
          <div className="mx-4 mb-6 p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">edit_location</span>
              <p className="text-sm font-black text-slate-700 dark:text-white">修改遺失地點</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full h-12 pl-10 pr-24 rounded-xl bg-slate-100 dark:bg-black/20 border-2 border-transparent focus:border-primary outline-none font-bold text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                  placeholder="搜尋地點 (例如: 台北車站)..."
                />
                <button
                  onClick={async () => {
                    if (!newLocation.trim()) return;
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newLocation)}`);
                      const data = await res.json();
                      if (data && data.length > 0) {
                        const first = data[0];
                        const formatted = `${first.display_name.split(',')[0]} (${first.lat}, ${first.lon})`;
                        setNewLocation(formatted);
                        alert(`已找到地點: ${first.display_name.split(',')[0]}\n座標: ${first.lat}, ${first.lon}`);
                      } else {
                        alert('找不到此地點，請嘗試更具體的名稱');
                      }
                    } catch (e) {
                      alert('搜尋失敗，請檢查網路連線');
                    }
                  }}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-white dark:bg-white/10 rounded-lg text-xs font-black text-slate-700 dark:text-white shadow-sm hover:bg-slate-50 transition-colors"
                >
                  搜尋定位
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                  <p className="text-[10px] text-yellow-700 dark:text-yellow-500 flex items-start gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    請點擊「搜尋定位」以確保地圖能正確顯示位置。格式應為：地點名稱 (緯度, 經度)
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (newLocation.trim() && newLocation !== item.lastSeenLocation) {
                    onUpdateLocation(item.id, newLocation);
                  }
                }}
                disabled={!newLocation.trim() || newLocation === item.lastSeenLocation}
                className={`w-full h-12 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 ${!newLocation.trim() || newLocation === item.lastSeenLocation ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary text-slate-900 shadow-primary/20 hover:brightness-110'}`}
              >
                確認更新地點
              </button>
            </div>
          </div>
        )}

        {/* Status Quick Actions */}
        <div className="mx-4 mb-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">委託進度管理</label>
            {item.status !== 'Lost' && (
              <button
                onClick={() => onUpdateStatus(item.id, 'Lost')}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                重啟委託
              </button>
            )}
          </div>

          {isActive ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateStatus(item.id, 'Recovered')}
                className="flex flex-col items-center justify-center p-5 bg-primary text-slate-900 rounded-[2rem] shadow-xl shadow-primary/20 active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined text-4xl mb-2 group-hover:animate-bounce">celebration</span>
                <span className="text-sm font-black">已尋回！</span>
              </button>
              <button
                onClick={() => onUpdateStatus(item.id, 'Closed')}
                className="flex flex-col items-center justify-center p-5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-[2rem] border-2 border-slate-300 dark:border-white/5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-4xl mb-2">task_alt</span>
                <span className="text-sm font-black">結束委託</span>
              </button>
            </div>
          ) : (
            <div className="p-6 bg-green-5 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800/30 rounded-[2.5rem] text-center animate-in zoom-in-95 duration-500">
              <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="material-symbols-outlined text-3xl font-black">done_all</span>
              </div>
              <h3 className="text-green-800 dark:text-green-400 font-black text-lg">此委託已圓滿結束</h3>
              <p className="text-green-700/60 dark:text-green-500/60 text-xs font-bold mt-1">感謝您對社區的貢獻！此啟事已不再對外顯示。</p>
            </div>
          )}
        </div>

        {/* Reward Management Section */}
        {item.category === 'Pet' && item.status === 'Lost' && (
          <div className="mx-4 mb-10 p-6 bg-white dark:bg-white/5 rounded-[2.5rem] border-2 border-slate-200 dark:border-white/10 shadow-md">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">monetization_on</span>
              調整尋獲報酬
            </h3>

            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">$</span>
                <input
                  type="number"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  className="w-full h-14 pl-10 pr-4 rounded-2xl bg-slate-100 dark:bg-black/20 border-2 border-transparent focus:border-primary outline-none font-black text-lg"
                  placeholder="輸入新金額"
                />
              </div>
              <button
                onClick={handleRewardUpdate}
                disabled={parseInt(newReward) === item.reward}
                className={`px-6 h-14 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${parseInt(newReward) === item.reward
                  ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-primary text-slate-900 shadow-primary/20'
                  }`}
              >
                更新金額
              </button>
            </div>

            {/* Reward History in Manage screen */}
            {item.rewardHistory.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">修改歷史記錄</p>
                <div className="space-y-3">
                  {[...item.rewardHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">history</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white">${h.amount.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-500">{h.timestamp}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border-2 border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary text-slate-900 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm font-black">check</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary">${item.reward.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-primary opacity-70">當前金額</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 pt-6">
          <h3 className="text-[#1c180d] dark:text-white text-lg font-black">收到的通報線索 ({item.sightings.length})</h3>
        </div>

        {item.sightings.length > 0 ? (
          item.sightings.map(s => (
            <div key={s.id} className="p-4">
              <div className="flex flex-col rounded-[2.5rem] shadow-sm bg-white dark:bg-[#2d281a] overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-5 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <img src={s.reporterAvatar} className="size-11 rounded-2xl object-cover border-2 border-primary/20 shadow-sm" alt={s.reporterName} />
                    <div>
                      <p className="text-[#1c180d] dark:text-white text-base font-black">{s.reporterName}</p>
                      <p className="text-slate-500 dark:text-[#9e8747] text-[10px] font-bold uppercase tracking-widest">{s.timestamp} • 附近目擊</p>
                    </div>
                  </div>
                  <div className="bg-primary/20 text-primary-dark font-black text-[10px] px-3 py-1 rounded-lg uppercase tracking-tighter">New</div>
                </div>

                <img src={s.imageUrl} className="w-full aspect-[4/3] object-cover" alt="Sighting" />

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">chat_bubble</span>
                    <p className="text-slate-800 dark:text-slate-300 text-sm font-bold leading-relaxed">{s.description}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#1a160b] p-4 rounded-2xl border border-slate-200 dark:border-gray-700 cursor-pointer active:bg-slate-100 transition-colors">
                    <div className="size-11 rounded-xl bg-primary text-slate-900 flex items-center justify-center shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-2xl font-black">location_on</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white text-xs font-black truncate">查看具體標記地點</p>
                      <p className="text-slate-500 dark:text-[#9e8747] text-[10px] font-bold truncate">{s.locationName}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </div>

                  <button className="w-full bg-primary text-[#1c180d] text-base font-black rounded-2xl h-14 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-2xl font-black">forum</span>
                    與目擊者對話
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 px-10 text-center">
            <span className="material-symbols-outlined text-7xl mb-4">notifications_off</span>
            <p className="font-black text-sm uppercase tracking-widest">目前尚無人回報目擊線索</p>
            <p className="text-xs mt-1 font-bold">當有人回報時，我們會第一時間通知您</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light/95 dark:from-background-dark dark:via-background-dark/95 to-transparent pb-10 max-w-md mx-auto">
        <button className="w-full flex items-center justify-center rounded-[1.5rem] h-16 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 text-lg font-black shadow-2xl active:scale-95 transition-transform">
          <span className="material-symbols-outlined mr-3 font-black">campaign</span>
          推送全體進度更新
        </button>
        <p className="text-center text-slate-500 dark:text-[#9e8747] text-[10px] font-black uppercase tracking-widest mt-4">同步通知所有關注此啟事的人</p>
      </div>
    </div>
  );
};

export default ManagePost;
