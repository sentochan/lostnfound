
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItemsLeft = [
    { label: '首頁', icon: 'home', path: '/' },
    { label: '地圖', icon: 'explore', path: '/map' },
  ];

  const navItemsRight = [
    { label: '訊息', icon: 'chat_bubble', path: '/messages' },
    { label: '我的', icon: 'person', path: '/profile' },
  ];

  const renderNavItem = (item: { label: string, icon: string, path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive ? 'text-primary scale-110' : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        <span className={`material-symbols-outlined ${isActive ? 'filled-icon' : ''}`}>
          {item.icon}
        </span>
        <span className={`text-[10px] font-black ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-300 dark:border-white/10 pb-8 pt-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors">
      <div className="flex justify-between items-center px-4 relative">
        <div className="flex flex-1 justify-around">
          {navItemsLeft.map(renderNavItem)}
        </div>

        <div className="relative -mt-12 px-2">
          <button 
            onClick={() => navigate('/create')}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-slate-900 shadow-2xl shadow-primary/50 transform active:scale-95 transition-all border-4 border-white dark:border-background-dark"
          >
            <span className="material-symbols-outlined text-4xl font-black">add</span>
          </button>
        </div>

        <div className="flex flex-1 justify-around">
          {navItemsRight.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
