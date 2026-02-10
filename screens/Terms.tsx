
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-slate-300 dark:border-white/10">
                <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 transition-colors text-slate-900 dark:text-white border border-slate-300 dark:border-transparent">
                    <span className="material-symbols-outlined font-black">arrow_back_ios_new</span>
                </button>
                <h1 className="flex-1 text-center text-lg font-black pr-10 text-slate-900 dark:text-white tracking-tight">隱私權與條款</h1>
            </header>

            <main className="p-6 space-y-6 text-slate-700 dark:text-slate-300 pb-20">
                <section className="bg-white dark:bg-white/5 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">個人資料收集聲明</h2>

                    <div className="space-y-4 text-sm font-bold leading-relaxed">
                        <p>
                            感謝您使用 Lost n Found (以下簡稱「本平台」)。為了提供報失與協尋服務，我們需要收集您的特定個人資料。請詳細閱讀以下條款：
                        </p>

                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-6 mb-2">1. 收集的資料項目</h3>
                        <ul className="list-disc pl-5 space-y-1 opacity-80">
                            <li>基本資料：電子郵件地址、暱稱、頭像。</li>
                            <li>位置資訊：當您發布貼文或使用地圖功能時的地理座標。</li>
                            <li>通訊內容：您在平台內發送的訊息內容與圖片。</li>
                            <li>裝置資訊：用於推送通知的裝置識別碼。</li>
                        </ul>

                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-6 mb-2">2. 資料使用目的</h3>
                        <ul className="list-disc pl-5 space-y-1 opacity-80">
                            <li>協助用戶定位遺失物與發布協尋資訊。</li>
                            <li>媒合失主與拾獲者，並提供通訊功能。</li>
                            <li>發送附近的遺失物通知。</li>
                            <li>平台安全管理與防止詐騙行為。</li>
                        </ul>

                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-6 mb-2">3. 資料保護與分享</h3>
                        <p className="opacity-80">
                            我們致力於保護您的隱私。除法律要求或為了完成協尋服務（如向其他用戶顯示您的概略位置距離）外，我們不會將您的個人資料出售或無故透露給第三方。
                        </p>

                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-6 mb-2">4. 用戶權益</h3>
                        <p className="opacity-80">
                            您有權隨時在「設定」頁面查看、修改您的個人資料，或聯繫管理員要求刪除帳號。
                        </p>
                    </div>
                </section>

                <p className="text-center text-xs text-slate-400 font-bold mt-8">
                    最後更新日期：2026年2月11日
                </p>
            </main>
        </div>
    );
};

export default Terms;
