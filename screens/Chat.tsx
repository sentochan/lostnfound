
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LostItem, Conversation, User } from '../types';

interface ChatProps {
  items: LostItem[];
  conversations: Conversation[];
  onSendMessage: (itemId: string, text: string) => void;
  user: User | null;
}

const Chat: React.FC<ChatProps> = ({ items, conversations, onSendMessage, user }) => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const item = items.find(i => i.id === itemId) || items[0];
  const conversation = conversations.find(c => c.itemId === itemId);
  const messages = conversation?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(item.id, inputText);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-2xl border-b border-slate-300 dark:border-white/10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 transition-all text-slate-900 dark:text-white border border-slate-300 dark:border-transparent active:scale-90">
          <span className="material-symbols-outlined font-black">arrow_back_ios_new</span>
        </button>
        <div className="size-11 rounded-2xl overflow-hidden bg-slate-300 border-2 border-primary/20 shadow-sm">
          <img src={conversation?.ownerAvatar || item.ownerAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR3NxjLsiI4kSq820pD3mlps-jzJM4bVn29ZuEqkIPFrQrR1ks0Njhxh-GOy55JsIKPxInVFYkpdqZPoqsGMN1O6jEtE00ZJlDqZHi5c38vIQujWyks-58pTar1bUnHrGRfD0C_FKflC1RbyxQxlnLIm80sXfHDSoHjFhMSupLzbDENfYCvVmk-G9cpbMizSINiq27ykXTla9L7JaEaAQBdKUGqebomX2a7IL7SIciheLZOTo_8kLLSov10sVTmT2syjAWN1CVWINx'} className="size-full object-cover" alt="Avatar" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black text-slate-900 dark:text-white truncate leading-tight">{conversation?.ownerName || item.ownerName}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">線上服務中</span>
          </div>
        </div>
        <button className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-transparent transition-all active:scale-90">
          <span className="material-symbols-outlined font-black">call</span>
        </button>
      </header>

      {/* Item Context Snippet */}
      <div
        onClick={() => navigate(`/item/${item.id}`)}
        className="mx-4 mt-4 p-4 bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-slate-200 dark:border-white/10 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-md group"
      >
        <img src={item.mainImageUrl} className="size-14 rounded-xl object-cover border border-slate-200 dark:border-transparent" alt="Item" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">關於該委託內容</p>
          <h3 className="text-base font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{item.title}</h3>
        </div>
        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform font-black">chevron_right</span>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-8 flex flex-col gap-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10 animate-in fade-in duration-1000">
            <div className="size-20 rounded-[2rem] bg-slate-200 dark:bg-white/5 border-2 border-slate-300 dark:border-transparent flex items-center justify-center mb-6 text-slate-400 dark:text-slate-700">
              <span className="material-symbols-outlined text-5xl">chat_bubble</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">安全警示</h3>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
              開始與對方溝通，請保持禮貌並描述您掌握的線索。<br />切勿隨意透露個人隱私或轉帳。
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = user ? m.senderId === user.id : false;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-base font-bold shadow-sm ${isMe
                    ? 'bg-primary text-slate-900 rounded-tr-none shadow-primary/20'
                    : 'bg-white dark:bg-white/10 text-slate-900 dark:text-white rounded-tl-none border-2 border-slate-100 dark:border-transparent'
                    }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 mt-2 px-1 uppercase tracking-tighter">{m.timestamp}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white/95 dark:bg-background-dark/95 backdrop-blur-2xl border-t border-slate-300 dark:border-white/10 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button type="button" className="size-12 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-primary border border-slate-300 dark:border-transparent transition-all active:scale-90 flex items-center justify-center">
            <span className="material-symbols-outlined font-black text-2xl">add_circle</span>
          </button>
          <div className="flex-1 relative">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="輸入訊息或回報線索..."
              className="w-full bg-slate-200 dark:bg-white/5 border-2 border-transparent focus:border-primary/40 rounded-[1.5rem] py-4 px-6 text-base font-bold text-slate-900 dark:text-white focus:ring-0 transition-all placeholder:text-slate-600 dark:placeholder:text-slate-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`size-14 rounded-2xl flex items-center justify-center transition-all ${inputText.trim()
              ? 'bg-primary text-slate-900 shadow-xl shadow-primary/40 scale-100 active:scale-90'
              : 'bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-slate-600 scale-95 opacity-50'
              }`}
          >
            <span className="material-symbols-outlined font-black text-2xl">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
