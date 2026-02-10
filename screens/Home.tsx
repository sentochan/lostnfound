
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LostItem, User } from '../types';
import BottomNav from '../components/BottomNav';
import { supabase } from '../src/lib/supabaseClient';

interface HomeProps {
  items: LostItem[];
  user: User | null;
  onToggleFavorite: (id: string) => void;
  unreadNotifications: number;
  searchQuery: string;
  locationPermissionDenied: boolean;
}

const Home: React.FC<HomeProps> = ({ items, user, onToggleFavorite, unreadNotifications, searchQuery, locationPermissionDenied }) => {
  if (!user) return <div className="flex items-center justify-center h-screen text-slate-500">Loading user data...</div>;

  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('寵物');
  const [activeSubFilter, setActiveSubFilter] = useState('全部');
  const [sortBy, setSortBy] = useState<'distance' | 'reward' | 'time'>('distance');

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

  const categoryMap: Record<string, string> = {
    '寵物': 'Pet',
    '人': 'People',
    '電子產品': 'Electronics',
    '銀包': 'Wallet',
    '文件': 'Documents',
    '其他': 'Other'
  };

  // Reset subfilter when main category changes
  useEffect(() => {
    setActiveSubFilter('全部');
  }, [activeCategory]);

  const handleHidePost = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (!window.confirm('確定要隱藏此貼文嗎？(僅管理員可見)')) return;

    try {
      const { error } = await supabase.from('items').update({ admin_hidden: true }).eq('id', itemId);
      if (error) throw error;
      alert('貼文已隱藏');
      // Note: Real-time update might require parent state refresh or subscription
    } catch (err) {
      alert('隱藏失敗');
    }
  };

  const parseDistance = (distStr: string): number => {
    if (!distStr || distStr === 'Unknown') return Infinity;
    try {
      if (distStr.endsWith(' m')) {
        return parseFloat(distStr) / 1000; // Convert to km
      }
      if (distStr.endsWith(' km')) {
        return parseFloat(distStr);
      }
    } catch (e) {
      return Infinity;
    }
    return Infinity;
  };

  const filteredItems = useMemo(() => {
    // 1. Filter by Main Category
    let result = items.filter(item => item.category === categoryMap[activeCategory]);

    // 2. Filter by Sub Category (if not "All")
    if (activeSubFilter !== '全部') {
      result = result.filter(item => {
        const sub = activeSubFilter.toLowerCase();
        if (activeCategory === '寵物') {
          const petTypeMapping: Record<string, string> = { '狗': 'Dog', '貓': 'Cat', '鳥': 'Bird', '其他': 'Other' };
          return item.petType === petTypeMapping[activeSubFilter];
        }
        return item.title.toLowerCase().includes(sub) || item.description.toLowerCase().includes(sub);
      });
    }

    // 3. Global Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.lastSeenLocation.toLowerCase().includes(q)
      );
    }

    // 4. Admin Hidden Filter
    if (!user.isAdmin) {
      result = result.filter(item => !item.adminHidden);
    }

    // 5. Filter Fake Reports
    result = result.filter(item => item.fakeReports < 10);

    // 6. Sorting & Boost Logic
    return [...result].sort((a, b) => {
      const now = new Date();

      const distA = parseDistance(a.distance);
      const distB = parseDistance(b.distance);

      // Boost Check
      const expiryA = a.boostExpiry ? new Date(a.boostExpiry) : null;
      const expiryB = b.boostExpiry ? new Date(b.boostExpiry) : null;

      const isBoostedA = a.isBoosted && distA <= 2 && (expiryA ? now <= expiryA : true);
      const isBoostedB = b.isBoosted && distB <= 2 && (expiryB ? now <= expiryB : true);

      if (isBoostedA && !isBoostedB) return -1;
      if (!isBoostedA && isBoostedB) return 1;

      // Standard Sorts
      if (sortBy === 'reward') return b.reward - a.reward;
      if (sortBy === 'time') return new Date(b.lastSeenTimestamp).getTime() - new Date(a.lastSeenTimestamp).getTime();
      if (sortBy === 'distance') return distA - distB;

      return 0;
    });
  }, [items, activeCategory, activeSubFilter, searchQuery, sortBy, user.isAdmin]);

  return (
    <div className="flex-1 pb-32">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-300 dark:border-white/10 transition-colors">
        <div className="flex items-center p-4 justify-between h-[72px]">
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Lost n Found</h1>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/20 transition-colors text-slate-900 dark:text-white"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-background-dark animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Main Category Tabs with Icons */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar border-b border-slate-300 dark:border-white/10 scroll-smooth pt-2">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col items-center min-w-max pb-3 transition-all relative px-2 ${activeCategory === cat.name
                ? 'text-primary'
                : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span className="material-symbols-outlined mb-1 text-2xl">{cat.icon}</span>
              <span className="text-xs font-black tracking-wide whitespace-nowrap">{cat.name}</span>
              {activeCategory === cat.name && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full animate-in fade-in duration-300"></div>
              )}
            </button>
          ))}
        </div>

        {/* Sub Filter Chips */}
        {subCategoryMap[activeCategory] && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
            <button
              onClick={() => setActiveSubFilter('全部')}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border ${activeSubFilter === '全部' ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-300'}`}
            >
              全部
            </button>
            {subCategoryMap[activeCategory].map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubFilter(sub)}
                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border ${activeSubFilter === sub ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-300'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Sorting Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
          <button onClick={() => setSortBy('distance')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${sortBy === 'distance' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400'}`}>
            距離優先
          </button>
          <button onClick={() => setSortBy('reward')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${sortBy === 'reward' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400'}`}>
            最高報酬
          </button>
          <button onClick={() => setSortBy('time')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${sortBy === 'time' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400'}`}>
            最新發佈
          </button>
        </div>


        {/* Items List */}
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const dist = parseDistance(item.distance || '');
            // Boost Logic: check radius (2km) AND expiry
            const now = new Date();
            const expiry = item.boostExpiry ? new Date(item.boostExpiry) : null;
            const isExpired = expiry ? now > expiry : false;
            const isBoosted = item.isBoosted && dist <= 2 && !isExpired;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className={`group bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer relative active:scale-[0.98] ${isBoosted ? 'col-span-2 border-2 border-primary/30 shadow-primary/10' : 'col-span-1'}`}
              >
                {/* Admin Hide Button */}
                {user.isAdmin && (
                  <button
                    onClick={(e) => handleHidePost(e, item.id)}
                    className="absolute top-2 right-2 z-20 size-8 bg-black/60 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">visibility_off</span>
                  </button>
                )}

                {/* Boost Badge with Countdown */}
                {isBoosted && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in zoom-in duration-300">
                    <span className="material-symbols-outlined text-[10px] animate-pulse">rocket_launch</span>
                    <span>
                      {(() => {
                        if (!expiry) return '置頂推廣';
                        const diffMs = expiry.getTime() - now.getTime();
                        if (diffMs <= 0) return ''; // Should not happen due to isBoosted check

                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                        if (hours > 0) return `剩餘 ${hours}小時 ${minutes}分`;
                        return `剩餘 ${minutes}分`;
                      })()}
                    </span>
                  </div>
                )}

                <div className={`relative overflow-hidden ${isBoosted ? 'aspect-[21/9]' : 'aspect-[4/5]'}`}>
                  <img src={item.mainImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={`size-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${item.isFavorite ? 'bg-red-500/90 text-white shadow-red-500/30 shadow-lg' : 'bg-black/30 text-white/70 hover:bg-black/50'}`}
                    >
                      <span className={`material-symbols-outlined text-sm ${item.isFavorite ? 'filled-icon' : ''}`}>favorite</span>
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${item.status === 'Lost' ? 'bg-red-500/80' : 'bg-blue-500/80'}`}>
                        {item.status === 'Lost' ? '遺失' : '拾獲'}
                      </span>
                      {item.reward > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-green-500/80 backdrop-blur-md text-[10px] font-black flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">monetization_on</span>
                          ${item.reward}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-black leading-tight mb-1 line-clamp-2 ${isBoosted ? 'text-2xl' : 'text-sm'}`}>{item.title}</h3>
                    <div className="flex items-center gap-1 opacity-80">
                      <span className="material-symbols-outlined text-[10px]">location_on</span>
                      <p className="text-[10px] font-bold truncate">
                        {item.lastSeenLocation.replace(/\s*\(-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\)$/, '')}
                      </p>
                      <span className="mx-1">•</span>
                      <p className="text-[10px]">{item.distance}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
            <p className="text-sm font-bold">沒有找到符合的結果</p>
            <button
              onClick={() => {
                setActiveCategory('寵物');
                setActiveSubFilter('全部');
              }}
              className="mt-4 text-primary font-black text-xs hover:underline"
            >
              清除篩選
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
