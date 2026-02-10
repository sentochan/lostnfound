
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '../types';
import BottomNav from '../components/BottomNav';

interface MessagesProps {
  conversations: Conversation[];
}

const Messages: React.FC<MessagesProps> = ({ conversations }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-5 py-5 border-b border-slate-300 dark:border-white/10">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">我的訊息</h1>
      </header>

      <main className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center animate-in fade-in duration-700">
            <div className="size-24 rounded-[2.5rem] bg-slate-200 dark:bg-white/5 border-2 border-slate-300 dark:border-transparent flex items-center justify-center mb-6 shadow-inner text-slate-400 dark:text-slate-700">
              <span className="material-symbols-outlined text-5xl">inbox</span>
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">暫無對話紀錄</h3>
            <p className="text-base text-slate-700 dark:text-slate-400 font-medium leading-relaxed">
              您尚未開始任何對話。在失物詳情頁面點擊「聯絡失主」即可發送訊息。
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {conversations.map((c) => {
              const lastMsg = c.messages[c.messages.length - 1];
              return (
                <div 
                  key={c.itemId} 
                  onClick={() => navigate(`/chat/${c.itemId}`)}
                  className="p-5 flex gap-5 hover:bg-slate-100 dark:hover:bg-white/5 active:bg-slate-200 dark:active:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <div className="size-16 rounded-2xl overflow-hidden bg-slate-300 dark:bg-slate-800 border-2 border-primary/30 shadow-md">
                      <img src={c.ownerAvatar} className="size-full object-cover" alt="Avatar" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-8 rounded-xl overflow-hidden border-2 border-white dark:border-background-dark shadow-lg">
                      <img src={c.itemImage} className="size-full object-cover" alt="Item" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="text-base font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{c.ownerName}</h3>
                      <span className="text-[10px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-tighter bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-md">{c.lastUpdate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-700 dark:text-slate-400 truncate max-w-[200px] font-bold">
                        {lastMsg ? lastMsg.text : '點擊開始對話...'}
                      </p>
                      {/* Unread indicator */}
                      <div className="size-3 rounded-full bg-primary border-2 border-white dark:border-background-dark shadow-lg shadow-primary/40 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Messages;
