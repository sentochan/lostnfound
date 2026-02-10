
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabaseClient';

interface PricingTier {
    price: number;
    durationHours: number;
    label: string;
    popular?: boolean;
}

const tiers: PricingTier[] = [
    { price: 0.99, durationHours: 2, label: '緊急置頂 (2小時)' },
    { price: 1.99, durationHours: 5, label: '標準置頂 (5小時)', popular: true },
    { price: 2.99, durationHours: 8, label: '長效置頂 (8小時)' },
    { price: 9.99, durationHours: 24, label: '全日置頂 (24小時)' },
];

const BoostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

    const handlePurchase = async () => {
        if (!selectedTier || !id) return;
        setLoading(true);

        // Mock Payment Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Calculate Expiry
        const now = new Date();
        now.setHours(now.getHours() + selectedTier.durationHours);
        const expiry = now.toISOString();

        // Update Supabase
        const { error } = await supabase
            .from('items')
            .update({ is_boosted: true, boost_expiry: expiry })
            .eq('id', id);

        setLoading(false);

        if (error) {
            alert('購買失敗: ' + error.message);
        } else {
            alert(`成功獲得 ${selectedTier.label}！`);
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex flex-col items-center">
            <header className="w-full flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">提升曝光率</h1>
                <div className="w-10"></div>
            </header>

            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                    <span className="material-symbols-outlined text-4xl text-primary animate-bounce">rocket_launch</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">讓更多人看到您的委託</h2>
                <p className="text-slate-500 text-sm px-8">
                    置頂功能可讓您的失物顯示在首頁最上方，並優先推送給附近 3km 的用戶。
                </p>
            </div>

            <div className="w-full max-w-md space-y-4 mb-8">
                {tiers.map((tier, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedTier(tier)}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedTier === tier
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/50'
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">
                                Most Popular
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg">{tier.label}</h3>
                                <p className="text-slate-500 text-xs font-bold mt-1">優先顯示 • 地圖置頂</p>
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                US${tier.price}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto w-full max-w-md">
                <button
                    onClick={handlePurchase}
                    disabled={!selectedTier || loading}
                    className={`w-full h-16 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${!selectedTier || loading
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-primary text-slate-900 shadow-primary/30'
                        }`}
                >
                    {loading ? (
                        <div className="size-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            確認購買
                            {selectedTier && <span>• US${selectedTier.price}</span>}
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 font-bold">
                    點擊購買即代表您同意服務條款。此為測試版本，不會實際扣款。
                </p>
            </div>
        </div>
    );
};

export default BoostPage;
