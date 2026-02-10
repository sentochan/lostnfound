
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LostItem } from '../types';
import { supabase } from '../src/lib/supabaseClient';
import BottomNav from '../components/BottomNav';

interface AdminDashboardProps {
    user: User | null;
    items: LostItem[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, items }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'Overview' | 'Users' | 'Posts'>('Overview');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Stats
    const totalPosts = items.length;
    const lostPosts = items.filter(i => i.status === 'Lost').length;
    const foundPosts = items.filter(i => i.status === 'Found').length;
    const recoveredPosts = items.filter(i => i.status === 'Recovered').length;
    const reportedPosts = items.filter(i => i.fakeReports > 0).length;

    useEffect(() => {
        if (!user?.isAdmin) {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    const handleBanUser = async (userId: string, currentStatus: boolean) => {
        const confirmMsg = currentStatus ? '解除封鎖此用戶？' : '確定要封鎖此用戶嗎？';
        if (!window.confirm(confirmMsg)) return;

        // In a real app, you'd toggle a 'banned' column in profiles
        // For now, let's assume we have an 'is_banned' column or similar logic
        // We'll verify if the column exists in Supabase first, but for UI:
        alert('此功能需要後端支援 "is_banned" 欄位');
    };

    const handleHidePost = async (itemId: string, currentHidden: boolean) => {
        const { error } = await supabase.from('items').update({ admin_hidden: !currentHidden }).eq('id', itemId);
        if (!error) {
            alert(currentHidden ? '已重新上架' : '貼文已下架');
            // Trigger a refresh or optimistic update here if needed (via props from App.tsx usually)
            window.location.reload(); // Simple reload for now
        } else {
            alert('操作失敗');
        }
    };

    const handleDeletePost = async (itemId: string) => {
        if (!window.confirm('確定要永久刪除此貼文嗎？此操作無法復原！')) return;
        const { error } = await supabase.from('items').delete().eq('id', itemId);
        if (!error) {
            alert('貼文已刪除');
            window.location.reload();
        } else {
            alert('刪除失敗');
        }
    };

    if (!user || !user.isAdmin) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 h-16 flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                    Admin Dashboard
                </h1>
                <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-500">Exit</button>
            </header>

            <div className="p-4">
                {/* Tabs */}
                <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl mb-6">
                    {(['Overview', 'Users', 'Posts'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-slate-500'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-2 gap-4">
                        <StatsCard title="總貼文" value={totalPosts} icon="post" color="bg-blue-500" />
                        <StatsCard title="總用戶" value={users.length} icon="group" color="bg-purple-500" />
                        <StatsCard title="遺失中" value={lostPosts} icon="search" color="bg-red-500" />
                        <StatsCard title="已尋獲" value={foundPosts} icon="check_circle" color="bg-green-500" />
                        <StatsCard title="被舉報" value={reportedPosts} icon="report" color="bg-orange-500" />
                        <StatsCard title="已結案" value={recoveredPosts} icon="task_alt" color="bg-slate-500" />
                    </div>
                )}

                {activeTab === 'Posts' && (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex gap-4 border border-slate-100 dark:border-white/5">
                                <img src={item.mainImageUrl} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.adminHidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.adminHidden ? 'Hidden' : 'Visible'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
                                    <p className="text-xs text-slate-400 mt-1">By: {item.ownerName} • Reports: {item.fakeReports}</p>

                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleHidePost(item.id, item.adminHidden || false)}
                                            className="flex-1 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                                        >
                                            {item.adminHidden ? 'Unhide' : 'Hide'}
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(item.id)}
                                            className="flex-1 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs font-bold text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="space-y-4">
                        {loading ? <div className="text-center p-4">Loading users...</div> : users.map(u => (
                            <div key={u.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4 border border-slate-100 dark:border-white/5">
                                <img src={u.avatar_url || 'https://via.placeholder.com/50'} className="size-10 rounded-full bg-slate-100" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{u.name || 'Unknown'}</h3>
                                    <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleBanUser(u.id, false)} // Todo: check is_banned
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300"
                                >
                                    Block
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

const StatsCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2">
        <div className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{title}</p>
        </div>
    </div>
);

export default AdminDashboard;
