
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../types';

interface NotificationsProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead }) => {
  const navigate = useNavigate();

  const handleNotificationClick = (n: AppNotification) => {
    onMarkAsRead(n.id);
    if (n.relatedItemId) {
      navigate(`/item/${n.relatedItemId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Sighting': return 'visibility';
      case 'Nearby': return 'radar';
      case 'Message': return 'chat';
      case 'System': return 'settings_suggest';
      default: return 'notifications';
    }
  };

  const getIconStyles = (type: string) => {
    switch (type) {
      case 'Sighting': return 'bg-green-600 text-white';
      case 'Nearby': return 'bg-primary text-slate-900';
      case 'Message': return 'bg-blue-600 text-white';
      case 'System': return 'bg-slate-700 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-slate-300 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 transition-colors text-slate-900 dark:text-white border border-slate-300 dark:border-transparent">
          <span className="material-symbols-outlined font-black">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-black pr-10 text-slate-900 dark:text-white">通知中心</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-4">
          <h2 className="text-3xl font-black mb-1.5 text-slate-900 dark:text-white">近期活動</h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm font-bold">追蹤與您相關的失物動態與目擊情報</p>
        </div>

        {notifications.length > 0 ? (
          <div className="mt-4 border-t border-slate-200 dark:border-white/5 divide-y divide-slate-200 dark:divide-white/5">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full flex items-start gap-4 p-6 text-left transition-all active:bg-slate-100 dark:active:bg-white/5 ${!n.isRead ? 'bg-primary/10 dark:bg-primary/5' : 'bg-transparent'}`}
              >
                <div className={`size-14 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg ${getIconStyles(n.type)}`}>
                  <span className="material-symbols-outlined text-3xl font-black">{getIcon(n.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className={`text-base font-black leading-tight ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-slate-600 dark:text-slate-500 font-black whitespace-nowrap ml-3 uppercase tracking-tighter bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-300 dark:border-transparent">{n.timestamp}</span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-4 ${!n.isRead ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-600 dark:text-slate-500 font-medium'}`}>
                    {n.body}
                  </p>
                  
                  {n.imageUrl && (
                    <div className="relative w-full h-40 rounded-[1.5rem] overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-md">
                      <img src={n.imageUrl} className="w-full h-full object-cover" alt="Notification preview" />
                      <div className="absolute inset-0 bg-black/5 dark:bg-transparent"></div>
                    </div>
                  )}
                </div>
                {!n.isRead && (
                  <div className="size-3 bg-red-600 rounded-full shrink-0 mt-3 shadow-sm border-2 border-white dark:border-background-dark"></div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 px-10 text-center animate-in fade-in duration-700">
            <div className="size-24 rounded-[2rem] bg-slate-200 dark:bg-white/5 border-2 border-slate-300 dark:border-transparent flex items-center justify-center mb-8 shadow-inner">
              <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-700">notifications_off</span>
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">目前沒有任何通知</h3>
            <p className="text-slate-700 dark:text-slate-500 font-medium">當有新的目擊回報或系統更新時，我們會在這裡通知您。</p>
          </div>
        )}
      </main>
      
      <div className="p-8 text-center bg-slate-100 dark:bg-transparent">
        <p className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.3em]">系統會自動保留近 30 天的通知紀錄</p>
      </div>
    </div>
  );
};

export default Notifications;
