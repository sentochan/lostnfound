
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gender } from '../types';

interface EditProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    gender: user.gender,
    location: user.location,
    avatarUrl: user.avatarUrl,
    bio: "致力於幫助社區中迷路上毛孩與主人團聚。熱愛動物，在香港地區活動。"
  });

  const handleSave = () => {
    onUpdate({
      ...user,
      name: formData.name,
      gender: formData.gender,
      location: formData.location,
      avatarUrl: formData.avatarUrl
    });
    navigate('/profile');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({ ...formData, avatarUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const genderOptions: { value: Gender, label: string, icon: string }[] = [
    { value: 'Male', label: '男', icon: 'male' },
    { value: 'Female', label: '女', icon: 'female' },
    { value: 'Secret', label: '不顯示', icon: 'visibility_off' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-slate-300 dark:border-white/10 transition-colors">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-transparent active:scale-90">
          <span className="material-symbols-outlined font-black">close</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-black text-slate-900 dark:text-white tracking-tight">編輯個人資料</h1>
        <button onClick={handleSave} className="text-primary font-black text-sm px-4 py-2 hover:bg-primary/10 rounded-xl transition-colors active:scale-95">儲存</button>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-8">
        <div className="flex flex-col items-center py-6">
          <div onClick={handleAvatarClick} className="relative group cursor-pointer">
            <div className="size-32 rounded-[2.5rem] border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-slate-200 bg-cover bg-center transition-transform group-hover:scale-105 active:scale-95 duration-300" style={{ backgroundImage: `url('${formData.avatarUrl}')` }} />
            <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="material-symbols-outlined text-white text-3xl font-black">photo_camera</span>
            </div>
            <div className="absolute -bottom-2 -right-2 size-10 bg-primary text-slate-900 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 transition-all group-hover:rotate-12">
              <span className="material-symbols-outlined text-xl font-black">edit</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em]">點擊更換個人頭像</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">用戶名稱</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-slate-500">person</span>
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 outline-none transition-all shadow-sm" placeholder="請輸入您的姓名" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">性別</label>
            <div className="grid grid-cols-3 gap-3">
              {genderOptions.map((opt) => (
                <button key={opt.value} onClick={() => setFormData({...formData, gender: opt.value})} className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all active:scale-95 ${formData.gender === opt.value ? 'bg-primary border-primary text-slate-900 shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'}`}>
                  <span className="material-symbols-outlined text-2xl mb-1">{opt.icon}</span>
                  <span className="text-sm font-black">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest px-1">所在地區</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-slate-500">location_on</span>
              <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 focus:border-primary rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 outline-none transition-all shadow-sm" placeholder="例如：中環、旺角或沙田" />
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button onClick={handleSave} className="w-full py-5 bg-primary text-slate-900 font-black text-lg rounded-[1.5rem] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined font-black">save</span>儲存所有變更
          </button>
        </div>
      </main>
      
      <div className="p-8 text-center">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em] leading-loose">
          電子郵件與手機號碼已由系統加密保護
        </p>
      </div>
    </div>
  );
};

export default EditProfile;
