
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async (platform: string) => {
    if (platform === 'google') {
      setIsLoading('google');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
        setIsLoading(null);
      }
    } else {
      setError("此登入方式尚未啟用");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(null);
    } else {
      // onLogin and navigate will be handled by App.tsx onAuthStateChange, 
      // but strictly we can call onLogin() to update local state immediately if needed,
      // or just wait for the auth listener.
      // App.tsx handleLogin sets isAuthenticated(true) and navigates.
      onLogin();
      // navigate is called in onLogin (in App.tsx) -> handleLogin -> navigate('/')
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#1a160d] transition-colors duration-500">
      {/* Top Nav */}
      <div className="flex items-center bg-transparent p-4 justify-between absolute top-0 w-full z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-md active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[#181511] dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-[#181511] dark:text-white text-lg font-bold">登入帳號</h2>
        <div className="w-10"></div>
      </div>

      {/* Hero Section */}
      <div className="w-full pt-4 px-4">
        <div
          className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-[2rem] min-h-[280px] shadow-2xl relative group"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBJ6rksQ37SwXg-ekdHfZubu8pi31MYxdovfVLDsE1zwtK9xTdzqafNkQrrpAByyq5hsCxN55rqC-SCEjJAM7dEJ4QJL0vobIsPfPN6XwkeySbV7bQ6nZb8w7kKcjTLilrfXNSXYrLnRuiM60bjTmDlQ4_lddCRzVsEHCDgovCp6aEi3dKOxnBvUuRLZIh5sT-d1Fvd7UP95ntN_OJAhYhThRi9sseQUOwiXPfJjlYiq7KA6nQKRL-vV3nhx1OGTI8R1XY8CE5sK4y9")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="relative p-8 animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-white tracking-tight text-4xl font-black leading-tight">尋回所愛</h2>
            <p className="text-white/80 text-base font-medium mt-1">我們幫助您與失散的夥伴團聚</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="flex flex-col px-6 pt-10 gap-5">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[#181511] dark:text-white/70 text-xs font-black uppercase tracking-widest px-1">電子郵件</label>
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined absolute left-4 text-[#897b61] group-focus-within:text-primary transition-colors">email</span>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#e6e2db] dark:border-[#3d3526] bg-slate-50 dark:bg-[#2c2417] py-4 pl-12 pr-4 text-[#181511] dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-[#897b61]/40"
              placeholder="請輸入 Email"
              type="email"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#181511] dark:text-white/70 text-xs font-black uppercase tracking-widest px-1">密碼</label>
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined absolute left-4 text-[#897b61] group-focus-within:text-primary transition-colors">lock</span>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#e6e2db] dark:border-[#3d3526] bg-slate-50 dark:bg-[#2c2417] py-4 pl-12 pr-12 text-[#181511] dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-[#897b61]/40"
              placeholder="請輸入密碼"
              type="password"
            />
            <button type="button" className="absolute right-4 flex items-center justify-center text-[#897b61] hover:text-primary transition-colors">
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
          <div className="flex justify-end px-1">
            <button type="button" className="text-primary text-xs font-black uppercase tracking-wider hover:underline underline-offset-4">忘記密碼？</button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!!isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all transform active:scale-[0.98] mt-4 text-lg flex items-center justify-center gap-2"
        >
          {isLoading === 'email' ? <div className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div> : '立即登入'}
        </button>
      </form>

      {/* Social Login Area */}
      <div className="mt-auto px-6 pb-12">
        <div className="flex items-center gap-4 my-10">
          <div className="h-[1px] flex-1 bg-[#e6e2db] dark:bg-[#3d3526]"></div>
          <span className="text-[#897b61] text-[10px] font-black uppercase tracking-[0.2em]">快速登入方式</span>
          <div className="h-[1px] flex-1 bg-[#e6e2db] dark:bg-[#3d3526]"></div>
        </div>

        <div className="flex justify-center gap-8">
          {/* Google Login */}
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={!!isLoading}
            className="group flex flex-col items-center gap-2 outline-none"
          >
            <div className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-[#e6e2db] dark:border-[#3d3526] bg-white dark:bg-[#2c2417] transition-all hover:border-primary hover:scale-110 active:scale-90 shadow-sm ${isLoading === 'google' ? 'animate-pulse' : ''}`}>
              <img alt="Google" className="w-8 h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5cSaKSGXmBW3slrcUGFv7cuXIYWDWln3qudMV8MD-7bHSohXJ1FrhxkDy-x91_HDBWANwiqifVsojVLy0gvxzCnu2NeDWIFKkCERVCcoiWNiLRTnDoNsdLJiZrL-w8C7mYUlqdsqOlVy5-UWGNiD9ce6-p-CM0j-GFZoTRmjc2VITKeUCji0QmpHHXIkP6ov_FERxNgJ--Lvqd8S0iK4Bb57ivUU4ribVluxUBwLEG_foTUPbHbIqJ3knP5zf7qyUl3W-rKj8a88Q" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary">Google</span>
          </button>

          {/* Apple ID Login */}
          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={!!isLoading}
            className="group flex flex-col items-center gap-2 outline-none"
          >
            <div className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-[#e6e2db] dark:border-[#3d3526] bg-white dark:bg-[#2c2417] transition-all hover:border-primary hover:scale-110 active:scale-90 shadow-sm ${isLoading === 'apple' ? 'animate-pulse' : ''}`}>
              <span className="material-symbols-outlined text-3xl text-slate-900 dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>apple</span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary">Apple ID</span>
          </button>

          {/* WeChat Login */}
          <button
            onClick={() => handleSocialLogin('wechat')}
            disabled={!!isLoading}
            className="group flex flex-col items-center gap-2 outline-none"
          >
            <div className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-[#e6e2db] dark:border-[#3d3526] bg-white dark:bg-[#2c2417] transition-all hover:border-[#07C160] hover:scale-110 active:scale-90 shadow-sm ${isLoading === 'wechat' ? 'animate-pulse' : ''}`}>
              <span className="material-symbols-outlined text-3xl text-[#07C160]">chat</span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#07C160]">微信</span>
          </button>
        </div>

        <div className="mt-12 text-center animate-in fade-in duration-1000">
          <p className="text-[#897b61] text-sm font-medium">
            還沒有帳號嗎？
            <button onClick={() => navigate('/register')} className="text-primary font-black ml-1.5 hover:underline underline-offset-4">立即註冊</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
