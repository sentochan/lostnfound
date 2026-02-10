import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabaseClient';
import { Gender } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Account Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Profile Info
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Secret');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // Base64 string for initial avatar

  const [step, setStep] = useState<1 | 2>(1);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // Limit to 500KB for base64
        setError("圖片過大，請選擇小於 500KB 的圖片");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    setError(null);

    // Final Validation
    if (!isTermsAccepted) {
      setError("請同意服務條款與隱私權政策");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          gender, // Pass gender to metadata
          location, // Pass location to metadata
          avatar_url: avatarUrl // Pass avatar to metadata
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      // Successful registration
      if (data.session) {
        navigate('/');
      } else {
        setError("註冊成功！請檢查您的 Email 信箱以驗證帳號。");
        setIsLoading(false);
      }
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (!email.trim() || !password || password.length < 6) {
      setError("請輸入有效的 Email 和至少 6 位數密碼");
      return;
    }
    setStep(2);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-500">
      <div className="flex items-center p-4 pb-2 justify-between">
        <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="text-primary flex size-12 shrink-0 items-center justify-start focus:outline-none">
          <span className="material-symbols-outlined text-[28px]">arrow_back_ios</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center pr-12">註冊 ({step}/2)</h2>
      </div>

      <div className="px-6 pt-4 pb-4">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">{step === 1 ? 'person_add' : 'badge'}</span>
          </div>
        </div>
        <h1 className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold leading-tight text-center">
          {step === 1 ? '建立您的帳號' : '完善個人資料'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal pt-2 text-center">
          {step === 1 ? '加入我們，幫失物與毛孩找回溫暖的家。' : '讓大家更認識您，建立互信社區。'}
        </p>
      </div>

      <div className="flex flex-col gap-5 px-6 py-2 flex-1">
        {error && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${error.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <span className="material-symbols-outlined">{error.includes('成功') ? 'check_circle' : 'error'}</span>
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-8 duration-300">
            <label className="flex flex-col gap-2">
              <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold ml-1">電子郵件</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-14 pl-12 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                  placeholder="name@example.com"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold ml-1">設定密碼</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-14 pl-12 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                  placeholder="至少 6 個字元"
                />
              </div>
            </label>

            <button
              onClick={handleNextStep}
              className="mt-4 w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              下一步 <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-right-8 duration-300">

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div onClick={handleAvatarClick} className="relative group cursor-pointer">
                <div className={`size-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden ${avatarUrl ? 'bg-cover bg-center' : 'bg-slate-100 flex items-center justify-center'}`} style={avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : {}}>
                  {!avatarUrl && <span className="material-symbols-outlined text-4xl text-slate-300">account_circle</span>}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
                <div className="absolute -bottom-1 -right-1 size-8 bg-primary text-slate-900 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                  <span className="material-symbols-outlined text-sm font-black">edit</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <label className="flex flex-col gap-2">
              <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold ml-1">您的暱稱</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 placeholder:text-slate-400 focus:border-primary outline-none transition-all"
                placeholder="想大家怎麼稱呼您？"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold ml-1">性別</p>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-12 px-3 text-slate-900 dark:text-white outline-none focus:border-primary"
                >
                  <option value="Male">男性</option>
                  <option value="Female">女性</option>
                  <option value="Secret">不公開</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold ml-1">居住地區</p>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 placeholder:text-slate-400 focus:border-primary outline-none transition-all"
                  placeholder="例如：台北市"
                />
              </label>
            </div>


            <div className="flex items-start gap-3 mt-2 px-1">
              <button
                onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isTermsAccepted ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}
              >
                {isTermsAccepted && <span className="material-symbols-outlined text-sm font-bold text-white">check</span>}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                我同意 <span className="text-primary font-bold">服務條款</span> 與 <span className="text-primary font-bold">隱私權政策</span>，並同意 Lost&Found 處理我的個人資料。
              </p>
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={`mt-2 w-full h-14 bg-primary text-slate-900 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                  註冊中...
                </>
              ) : (
                '完成註冊'
              )}
            </button>
          </div>
        )}

        <div className="mt-auto pt-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            已有帳號？
            <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline ml-1">立即登入</button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
