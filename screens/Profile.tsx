
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LostItem, User, Gender } from '../types';
import BottomNav from '../components/BottomNav';

interface ProfileProps {
  items: LostItem[];
  user: User | null;
  unreadNotifications: number;
  onUpdateStatus: (id: string, status: 'Lost' | 'Found' | 'Recovered' | 'Closed') => void;
}

const Profile: React.FC<ProfileProps> = ({ items, user, unreadNotifications, onUpdateStatus }) => {
  if (!user) return <div className="flex items-center justify-center h-screen text-slate-500">Loading user profile...</div>;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Active' | 'Closed'>('Active');

  const getGenderIcon = (gender: Gender) => {
    switch (gender) {
      case 'Male': return 'male';
      case 'Female': return 'female';
      default: return 'visibility_off';
    }
  };

  const getGenderColor = (gender: Gender) => {
    switch (gender) {
      case 'Male': return 'text-blue-500';
      case 'Female': return 'text-pink-500';
      default: return 'text-slate-400';
    }
  };

  const userItems = items.filter(i => i.ownerId === user.id);
  const activeItems = userItems.filter(i => i.status === 'Lost' || i.status === 'Found');
  const closedItems = userItems.filter(i => i.status === 'Recovered' || i.status === 'Closed');

  const displayItems = activeTab === 'Active' ? activeItems : closedItems;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Recovered': return { text: '已尋回', style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200' };
      case 'Closed': return { text: '已完結', style: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border-slate-200' };
      default: return { text: '尋找中', style: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200' };
    }
  };

  return (
    <div className="flex-1 pb-32">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-300 dark:border-gray-800 transition-colors">
        <button onClick={() => navigate('/settings')} className="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">個人中心</h1>
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-background-dark animate-pulse"></span>
          )}
        </button>
      </header>

      <main className="px-4">
        <section className="flex flex-col items-center pt-8 pb-6">
          <div className="relative">
            <div
              className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
            <div className="absolute bottom-0 right-0 bg-primary text-slate-900 p-1.5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-xs font-black">check</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
              <span className={`material-symbols-outlined ${getGenderColor(user.gender)} font-black`}>
                {getGenderIcon(user.gender)}
              </span>
              <span className="px-2 py-0.5 bg-primary/20 text-orange-800 dark:text-primary text-[10px] font-black rounded-full uppercase tracking-wider border border-primary/30">已認證</span>
            </div>
            <p className="text-slate-700 dark:text-slate-400 text-sm mt-1 font-bold">{user.location}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              註冊日期：{user.joinDate}
            </div>
          </div>
        </section>

        <section className="py-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: items.length, label: '全部發佈', color: 'text-slate-900 dark:text-white' },
              { val: items.filter(i => i.status === 'Recovered').length, label: '已尋回', color: 'text-green-500' },
              { val: user.stats.clues, label: '目擊線索', color: 'text-slate-900 dark:text-white' }
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl text-center border-2 border-slate-200 dark:border-gray-800 shadow-sm">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-black uppercase tracking-tighter">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <div className="flex border-b border-slate-300 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('Active')}
              className={`flex-1 py-4 text-sm font-black border-b-4 transition-all ${activeTab === 'Active' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500'}`}
            >
              進行中 ({activeItems.length})
            </button>
            <button
              onClick={() => setActiveTab('Closed')}
              className={`flex-1 py-4 text-sm font-black border-b-4 transition-all ${activeTab === 'Closed' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500'}`}
            >
              已結案 ({closedItems.length})
            </button>
          </div>

          <div className="py-4 space-y-4">
            {displayItems.length > 0 ? (
              displayItems.map(item => {
                const status = getStatusDisplay(item.status);
                return (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-gray-700 shadow-md transition-all animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 flex gap-4 cursor-pointer" onClick={() => navigate(`/manage/${item.id}`)}>
                      <img src={item.mainImageUrl} className="w-24 h-24 rounded-2xl object-cover bg-slate-100 shadow-inner" alt={item.title} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-lg truncate text-slate-900 dark:text-white">{item.title}</h3>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg whitespace-nowrap uppercase tracking-tighter border ${status.style}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                          <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                          {item.lastSeenLocation}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1.5 flex items-center gap-1.5 font-black uppercase tracking-tight">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          發佈日期：2023-10-25
                        </p>
                      </div>
                    </div>

                    {activeTab === 'Active' && (
                      <div className="px-4 pb-4 flex gap-2 border-t border-slate-100 dark:border-white/5 pt-4">
                        <button
                          onClick={() => onUpdateStatus(item.id, 'Recovered')}
                          className="flex-1 py-3 bg-primary text-slate-900 text-xs font-black rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                          標記為已尋回
                        </button>
                        <button
                          onClick={() => onUpdateStatus(item.id, 'Closed')}
                          className="px-4 py-3 bg-slate-200 dark:bg-gray-700 rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-transparent active:bg-slate-300 flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span className="text-xs font-black">完結委託</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
                <p className="font-black text-sm uppercase tracking-widest">目前暫無資料</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
