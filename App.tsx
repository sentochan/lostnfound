
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './screens/Home';
import MapView from './screens/MapView';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import Login from './screens/Login';
import Register from './screens/Register';
import ItemDetail from './screens/ItemDetail';
import ErrorBoundary from './components/ErrorBoundary';
import SightingDetail from './screens/SightingDetail';
import CreatePost from './screens/CreatePost';
import ManagePost from './screens/ManagePost';
import LockScreen from './screens/LockScreen';
import ReportSighting from './screens/ReportSighting';
import Chat from './screens/Chat';
import Messages from './screens/Messages';
import Notifications from './screens/Notifications';
import Feedback from './screens/Feedback';
import EditProfile from './screens/EditProfile';
import BoostPage from './screens/BoostPage';
import { MOCK_LOST_ITEMS, MOCK_USER, MOCK_NOTIFICATIONS } from './constants';
import { LostItem, Conversation, Message, UserSettings, AppNotification, Theme, User } from './types';
import { supabase } from './src/lib/supabaseClient';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<LostItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{ title: string, body: string, type?: 'info' | 'error' | 'success' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const [settings, setSettings] = useState<UserSettings>({
    language: 'zh-TW',
    theme: 'dark',
    notificationDistance: 500,
    pushSound: true,
    pushVibration: true
  });

  // Theme effect
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Supabase Auth & Data Fetching
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        fetchProfile(session.user.id);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        fetchProfile(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(MOCK_USER); // Reset or Keep mock for demo?
      }
    });

    fetchItems();
    // fetchNotifications(); // TODO: Implement fetch
    // setNotifications(MOCK_NOTIFICATIONS); // Keep mock for now if table empty

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setUser({
        id: data.id,
        name: data.name || 'User',
        gender: data.gender as any || 'Secret',
        location: data.location || '',
        joinDate: new Date(data.join_date).toLocaleDateString(),
        avatarUrl: data.avatar_url || MOCK_USER.avatarUrl,
        stats: {
          posts: data.stats_posts || 0,
          found: data.stats_found || 0,
          clues: data.stats_clues || 0
        }
      });
    }
  };

  /* Distance Calculation Helper */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const parseItemLocation = (loc: string): { lat: number, lng: number } | null => {
    // Format 1: "Location Name (lat, lng)"
    const match = loc.match(/\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[3]) };

    // Format 2: "lat, lng"
    const simpleMatch = loc.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (simpleMatch) return { lat: parseFloat(simpleMatch[1]), lng: parseFloat(simpleMatch[3]) };

    return null;
  };

  // User Location State
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        sightings (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      setItems([]); // Fallback to empty
      return;
    }

    if (data) {
      const mappedItems: LostItem[] = data.map((item: any) => {
        let distanceStr = 'Unknown';

        // Calculate Distance if user location exists
        const itemCoords = parseItemLocation(item.last_seen_location);
        if (userLocation && itemCoords) {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, itemCoords.lat, itemCoords.lng);
          distanceStr = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        } else if (item.distance) {
          distanceStr = item.distance;
        }

        return {
          id: item.id,
          title: item.title,
          category: item.category,
          petType: item.pet_type,
          description: item.description,
          reward: item.reward,
          rewardHistory: item.reward_history || [],
          lastSeenLocation: item.last_seen_location,
          lastSeenTimestamp: new Date(item.last_seen_timestamp).toLocaleString(),
          mainImageUrl: item.main_image_url,
          secondaryImageUrls: item.secondary_image_urls || [],
          status: item.status,
          ownerName: item.owner_name || 'Anonymous',
          ownerId: item.owner_id,
          distance: distanceStr,
          sightings: item.sightings?.map((s: any) => ({
            id: s.id,
            reporterName: s.reporter_name,
            reporterAvatar: s.reporter_avatar,
            timestamp: new Date(s.created_at).toLocaleString(),
            locationName: s.location_name,
            description: s.description,
            imageUrl: s.image_url,
            reliability: s.reliability,
            distance: 'Unknown'
          })) || [],
          fakeReports: item.fake_reports || 0,
          isFavorite: false, // Handle locally or fetch separate table
          isBoosted: item.is_boosted,
          adminHidden: item.admin_hidden,
          boostExpiry: item.boost_expiry
        };
      });
      setItems(mappedItems);
    }
  };

  // Re-fetch or re-calc when user location changes
  useEffect(() => {
    if (userLocation) {
      fetchItems();
    }
  }, [userLocation]);

  const triggerNotification = (title: string, body: string, type: 'info' | 'error' | 'success' = 'info') => {
    setNotification({ title, body, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleFavorite = (itemId: string) => {
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const updateItemStatus = (itemId: string, newStatus: 'Lost' | 'Found' | 'Recovered' | 'Closed') => {
    // Optimistic update
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ));

    // DB update
    supabase.from('items').update({ status: newStatus }).eq('id', itemId).then(({ error }) => {
      if (error) triggerNotification("更新失敗", error.message, 'error');
    });

    let msg = "";
    if (newStatus === 'Recovered') msg = "祝賀您尋回物品！案件已移至結案。";
    if (newStatus === 'Closed') msg = "案件已成功關閉。";
    if (newStatus === 'Lost') msg = "狀態已重新設為遺失中。";

    if (msg) triggerNotification("狀態已更新", msg, 'success');
  };

  const updateItemReward = (itemId: string, newAmount: number) => {
    // Optimistic Update
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let updatedHistory: any[] = [];

    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        updatedHistory = [
          ...item.rewardHistory,
          { amount: item.reward, timestamp }
        ];
        return {
          ...item,
          reward: newAmount,
          rewardHistory: updatedHistory
        };
      }
      return item;
    }));

    // DB Update
    supabase.from('items').update({
      reward: newAmount,
      reward_history: updatedHistory
    }).eq('id', itemId).then(({ error }) => {
      if (error) {
        console.error("Reward update failed:", error);
        triggerNotification("更新失敗", error.message, 'error');
      } else {
        triggerNotification("報酬已更新", `金額已調整為 $${newAmount.toLocaleString()}`, 'success');
      }
    });
  };

  const updateItemLocation = (itemId: string, newLocation: string) => {
    // Optimistic Update
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, lastSeenLocation: newLocation } : item
    ));

    // DB Update
    supabase.from('items').update({ last_seen_location: newLocation }).eq('id', itemId).then(({ error }) => {
      if (error) {
        console.error("Location update failed:", error);
        triggerNotification("更新失敗", error.message, 'error');
      } else {
        triggerNotification("地點已更新", `地點已更改為 ${newLocation}`, 'success');
      }
    });
  };

  const handleFakeReport = (itemId: string) => {
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, fakeReports: item.fakeReports + 1 } : item
    ));
    triggerNotification("舉報成功", "我們已收到您的反饋，將進行審核。", 'error');
  };

  const addSighting = (itemId: string, sighting: any, newLocation: string) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          // We update lastSeenLocation so the main card shows the LATEST info
          lastSeenLocation: newLocation,
          lastSeenTimestamp: '剛剛',
          sightings: [sighting, ...item.sightings]
        };
      }
      return item;
    }));
  };

  const sendMessage = (itemId: string, text: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // DB Insert would go here (messages table)

    setConversations(prev => {
      const existing = prev.find(c => c.itemId === itemId);
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        text,
        timestamp: '剛剛'
      };

      if (existing) {
        return prev.map(c => c.itemId === itemId ? {
          ...c,
          messages: [...c.messages, newMessage],
          lastUpdate: '剛剛'
        } : c);
      } else {
        return [...prev, {
          itemId: item.id,
          itemTitle: item.title,
          itemImage: item.mainImageUrl,
          ownerId: item.ownerId,
          ownerName: item.ownerName,
          ownerAvatar: user.avatarUrl,
          messages: [newMessage],
          lastUpdate: '剛剛'
        }];
      }
    });

    triggerNotification("訊息已送達", `已將您的訊息發送給 ${item.ownerName}`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleUnlock = (targetPath?: string) => {
    setIsLocked(false);
    if (targetPath) {
      navigate(targetPath);
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  };

  const handleLogin = () => {
    // This might be redundant if we listen to onAuthStateChange, but useful for navigation
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // TODO: Update profiles table
    triggerNotification("更新成功", "您的個人資料已成功儲存。", 'success');
  };

  const showGlobalSearch = location.pathname === '/' || location.pathname === '/map';

  // Protected Route Component
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">正在載入...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  /* LockScreen is disabled/bypassed for now to make Login the effective "first page" */
  /*
  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }
  */

  return (
    <div className="flex justify-center min-h-screen bg-neutral-100 dark:bg-black transition-colors duration-500">
      <div className="relative w-full max-w-md bg-background-light dark:bg-background-dark shadow-2xl min-h-screen flex flex-col overflow-hidden animate-in fade-in duration-500">

        {/* Global Search Header */}
        {showGlobalSearch && isAuthenticated && (
          <div className="sticky top-[72px] z-[45] px-4 py-2 bg-background-light/40 dark:bg-background-dark/40 backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-primary/40 rounded-2xl py-3 pl-12 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 outline-none transition-all shadow-sm"
                placeholder="搜尋關鍵字、標題或地點..."
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center bg-slate-200 dark:bg-white/10 rounded-full text-slate-500"
                >
                  <span className="material-symbols-outlined text-sm font-black">close</span>
                </button>
              )}
            </div>
          </div>
        )}

        {notification && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-top duration-300 ${notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-green-600' : 'bg-slate-900 dark:bg-background-dark/95'}`}>
            <div className="flex items-center gap-4">
              <div className={`size-11 rounded-full flex items-center justify-center shrink-0 shadow-inner ${notification.type === 'error' ? 'bg-white text-red-600' : notification.type === 'success' ? 'bg-white text-green-600' : 'bg-primary text-slate-900'}`}>
                <span className="material-symbols-outlined font-black text-2xl">
                  {notification.type === 'error' ? 'report' : notification.type === 'success' ? 'check' : 'chat'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-base font-black leading-tight mb-0.5">{notification.title}</p>
                <p className="text-white/90 text-xs font-bold leading-snug">{notification.body}</p>
              </div>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Home items={items} user={user} onToggleFavorite={toggleFavorite} unreadNotifications={notifications.filter(n => !n.isRead).length} searchQuery={searchQuery} />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <MapView items={items} searchQuery={searchQuery} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile items={items} user={user} unreadNotifications={notifications.filter(n => !n.isRead).length} onUpdateStatus={updateItemStatus} />
            </ProtectedRoute>
          } />
          <Route path="/manage/:id" element={
            <ProtectedRoute>
              <ManagePost items={items} onUpdateStatus={updateItemStatus} onUpdateReward={updateItemReward} onUpdateLocation={updateItemLocation} />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={<EditProfile user={user} onUpdate={handleUpdateUser} />} />
          <Route path="/settings" element={<Settings settings={settings} onUpdateSettings={setSettings} onLogout={handleLogout} />} />
          <Route path="/feedback" element={<Feedback onComplete={() => triggerNotification("感謝您的回饋", "我們將儘快處理您的寶貴意見。", 'success')} />} />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages conversations={conversations} />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={<Notifications notifications={notifications} onMarkAsRead={markNotificationAsRead} />} />
          <Route path="/chat/:itemId" element={<Chat items={items} conversations={conversations} onSendMessage={sendMessage} />} />
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/item/:id" element={
            <ErrorBoundary>
              <ItemDetail items={items} onToggleFavorite={toggleFavorite} onReportFake={handleFakeReport} />
            </ErrorBoundary>
          } />
          <Route path="/sighting/:itemId/:sightingId" element={<SightingDetail items={items} />} />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="/report/:id" element={<ReportSighting items={items} onReport={addSighting} />} />
          <Route path="/boost/:id" element={<ProtectedRoute><BoostPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
