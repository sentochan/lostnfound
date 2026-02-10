
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface FeedbackProps {
  onComplete: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<'Suggestion' | 'Bug' | 'Other'>('Suggestion');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 3) {
      alert('最多只能上傳 3 張圖片');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    // 模擬向後台發送數據
    setTimeout(() => {
      setIsSending(false);
      onComplete();
      navigate('/settings');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-slate-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-8">意見回饋</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* Type Selection */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 px-1">回饋類型</h2>
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
            {(['Suggestion', 'Bug', 'Other'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  type === t
                    ? 'bg-primary text-background-dark shadow-md'
                    : 'text-slate-500'
                }`}
              >
                {t === 'Suggestion' ? '功能建議' : t === 'Bug' ? '錯誤回報' : '其他'}
              </button>
            ))}
          </div>
        </section>

        {/* Content Area */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 px-1">您的意見</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-white/5 border-none focus:ring-2 focus:ring-primary h-48 text-sm resize-none placeholder:text-slate-400"
            placeholder={type === 'Bug' ? "請描述錯誤發生的步驟..." : "告訴我們您的想法..."}
          ></textarea>
        </section>

        {/* Screenshots */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 px-1">上傳截圖 (選填)</h2>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm group">
                <img src={img} className="w-full h-full object-cover" alt="Upload preview" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 size-6 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            ))}
            
            {images.length < 3 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary hover:border-primary/40"
              >
                <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                <span className="text-[10px] font-bold">{images.length}/3</span>
              </button>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>
        </section>

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic text-center">
            感謝您的反饋，我們的工作人員將在收到訊息後進行評估與改進。
          </p>
        </div>
      </main>

      <div className="p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pb-10">
        <button 
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className={`w-full h-16 rounded-full font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isSending || !message.trim() 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-primary text-background-dark shadow-primary/30'
          }`}
        >
          {isSending ? (
            <div className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined font-black">send</span>
              發送意見回饋
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Feedback;
