
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSettings, Language, Theme } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onLogout }) => {
  const navigate = useNavigate();

  const handleLanguageChange = (lang: Language) => {
    onUpdateSettings({ ...settings, language: lang });
  };

  const handleThemeChange = (theme: Theme) => {
    onUpdateSettings({ ...settings, theme: theme });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, notificationDistance: parseInt(e.target.value) });
  };

  const toggleSound = () => {
    onUpdateSettings({ ...settings, pushSound: !settings.pushSound });
  };

  const toggleVibration = () => {
    onUpdateSettings({ ...settings, pushVibration: !settings.pushVibration });
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-slate-300 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 transition-colors text-slate-900 dark:text-white border border-slate-300 dark:border-transparent">
          <span className="material-symbols-outlined font-black">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-black pr-10 text-slate-900 dark:text-white tracking-tight">App 設定</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-10 pb-20">
        {/* Theme Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="material-symbols-outlined text-primary font-black">palette</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">顯示模式</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-200 dark:bg-white/5 rounded-[1.5rem] border border-slate-300 dark:border-transparent shadow-inner">
            {(['light', 'dark'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 transition-all ${settings.theme === t
                    ? 'bg-white dark:bg-primary text-slate-900 shadow-xl scale-[1.02]'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <span className={`material-symbols-outlined text-xl ${settings.theme === t ? 'text-primary dark:text-slate-900' : ''}`}>
                  {t === 'light' ? 'light_mode' : 'dark_mode'}
                </span>
                {t === 'light' ? '淺色模式' : '深色模式'}
              </button>
            ))}
          </div>
        </section>

        {/* Language Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="material-symbols-outlined text-primary font-black">language</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">語言設定</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-200 dark:bg-white/5 rounded-[1.5rem] border border-slate-300 dark:border-transparent shadow-inner">
            {(['zh-TW', 'zh-CN', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`py-3 rounded-2xl text-[11px] font-black transition-all ${settings.language === lang
                    ? 'bg-white dark:bg-primary text-slate-900 shadow-xl scale-[1.02]'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {lang === 'zh-TW' ? '繁體中文' : lang === 'zh-CN' ? '简体中文' : 'English'}
              </button>
            ))}
          </div>
        </section>

        {/* Distance Range Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-black">distance</span>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">距離通知範圍</h2>
            </div>
            <span className="text-primary font-black text-sm px-3 py-1 bg-primary/10 rounded-lg">
              {settings.notificationDistance === 2000 ? '2.0 km' : `${settings.notificationDistance} m`}
            </span>
          </div>
          <div className="px-6 py-8 bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-200 dark:border-white/5 shadow-md">
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={settings.notificationDistance}
              onChange={handleDistanceChange}
              className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-5 text-[11px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-tighter px-1">
              <span>0m</span>
              <span className="opacity-50">1km</span>
              <span>2km</span>
            </div>
          </div>
        </section>

        {/* Push Notification Toggles */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="material-symbols-outlined text-primary font-black">notifications_active</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">推送通知</h2>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-200 dark:border-white/5 shadow-md overflow-hidden divide-y divide-slate-200 dark:divide-white/5">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-2xl">volume_up</span>
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900 dark:text-white">通知聲音</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 font-bold tracking-wide">接收新消息時播放聲音</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 border-2 ${settings.pushSound ? 'bg-primary border-primary' : 'bg-slate-300 dark:bg-white/10 border-slate-400 dark:border-transparent'
                  }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.pushSound ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-2xl">vibration</span>
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900 dark:text-white">震動提醒</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 font-bold tracking-wide">接收新消息時觸覺回饋</p>
                </div>
              </div>
              <button
                onClick={toggleVibration}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 border-2 ${settings.pushVibration ? 'bg-primary border-primary' : 'bg-slate-300 dark:bg-white/10 border-slate-400 dark:border-transparent'
                  }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.pushVibration ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          </div>
        </section>

        {/* Platform Policy Disclaimer Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="material-symbols-outlined text-primary font-black">gpp_maybe</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">法律聲明與政策</h2>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-200 dark:border-white/5 shadow-md p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 shrink-0">
                <span className="material-symbols-outlined text-2xl font-black">policy</span>
              </div>
              <div className="flex-1">
                <p className="font-black text-sm text-slate-900 dark:text-white mb-2">關於酬勞與糾紛免責聲明</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  本平台僅提供資訊交流服務。我們聲明：<br />
                  1. <span className="text-slate-900 dark:text-slate-200">報酬是用家之間的事情</span>，本平台絕不以任何方式向用家抽取報酬費用。<br />
                  2. 如報失者與拾獲者在過程中產生任何糾紛，<span className="text-red-500 font-black tracking-wider underline decoration-2">本平台一概不負責</span>。
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold leading-tight italic">
                * 提醒您在聯繫與面交時務必保持警覺，選擇公共場所見面。
              </p>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="material-symbols-outlined text-primary font-black">support_agent</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">支持與回饋</h2>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-200 dark:border-white/5 shadow-md overflow-hidden">
            <button
              onClick={() => navigate('/feedback')}
              className="w-full flex items-center justify-between p-6 active:bg-slate-100 dark:active:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined text-2xl">feedback</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm text-slate-900 dark:text-white">意見回饋 / 錯誤回報</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 font-bold tracking-wide">幫助我們改進產品體驗</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_forward_ios</span>
            </button>
          </div>
        </section>

        {/* Logout */}
        <section className="pt-6 px-1">
          <button
            onClick={onLogout}
            className="w-full p-5 bg-red-500 text-white dark:bg-red-500/10 dark:text-red-500 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-red-500/20 dark:shadow-none"
          >
            <span className="material-symbols-outlined font-black">logout</span>
            登出帳號
          </button>
          <p className="mt-10 text-center text-[10px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-[0.4em]">
            Lost n Found v0.0.1<br />
            <span className="text-[8px] tracking-normal opacity-70 normal-case">
              By Sento Chan<br />All Rights Reserved
            </span>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Settings;
