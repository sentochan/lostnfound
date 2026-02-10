
import { LostItem, User, AppNotification } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: '陳大文',
  gender: 'Male',
  location: '香港 中西區',
  joinDate: '2023年10月15日',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR3NxjLsiI4kSq820pD3mlps-jzJM4bVn29ZuEqkIPFrQrR1ks0Njhxh-GOy55JsIKPxInVFYkpdqZPoqsGMN1O6jEtE00ZJlDqZHi5c38vIQujWyks-58pTar1bUnHrGRfD0C_FKflC1RbyxQxlnLIm80sXfHDSoHjFhMSupLzbDENfYCvVmk-G9cpbMizSINiq27ykXTla9L7JaEaAQBdKUGqebomX2a7IL7SIciheLZOTo_8kLLSov10sVTmT2syjAWN1CVWINx',
  stats: {
    posts: 12,
    found: 5,
    clues: 28
  }
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'Nearby',
    title: '附近走失提醒',
    body: '有一隻黃金獵犬在您附近 200 米處走失，請幫忙留意。',
    timestamp: '現在',
    isRead: false,
    relatedItemId: '1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6CLXqVi3wb6iPFKfWPZjycHD36J02LkSZc5MGLcUzxwSG-cdXNJO1ZVhtTe-lFIqSHnocIM6s8fClUU3mEeZEPqmqm70Ssht0F3wek5k5XYdKz98gSAhAEdJlp7gpdCCeP3UFAtbyQN2QU5tuBbFd0h-_YtBbO51o7eUtXugVV5Gi7SKVe98GkV5bw-HTx7owyFhGYpSRKdlyoKWg7g_ti7tHz9ZbDj7IGuu3XmtdJnqE4IiEH1xwmNj-NmtlUxI9GulZK9yqubmo'
  },
  {
    id: 'n2',
    type: 'Sighting',
    title: '新的目擊回報',
    body: '您的「賓士貓」啟事有新的目擊資訊！',
    timestamp: '20 分鐘前',
    isRead: false,
    relatedItemId: '2',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3FZnLyXCmpzKqddLzNTHq9nthTFL7sPevW4tjytM-EzDN9WCmxG8DWhBfec4nf3rHCQWwnX07wfSr09zBLENJE4G2WMDHfHtS_djfsyVuq8RP2BWAsWuQZ3IAZgIo5HiXSf9VDjs8ruuCPp4AQaa6zzikePwIY-glB9kvRpEKHFX97B470UEni2X1mQzgr2UESNQ1MvD1tNwaDcmSgmnCiHfh-MeY-v3kn5u1n1bjOOSApscUbozXmOSMY1XJOJA6CLW5dYoWaqtK'
  }
];

export const MOCK_LOST_ITEMS: LostItem[] = [
  {
    id: '1',
    title: '黃金獵犬 - 波比 (Bobby)',
    category: 'Pet',
    petType: 'Dog',
    description: '親人的黃金獵犬，胸前有一塊白毛，走失時戴著紅色項圈。最後見於中環纜車站附近。',
    reward: 5000,
    rewardHistory: [
      { amount: 3000, timestamp: '2023-10-16 14:30' },
      { amount: 4000, timestamp: '2023-10-18 09:15' }
    ],
    lastSeenLocation: '中環 太平山頂纜車站',
    lastSeenTimestamp: '2小時前',
    mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6CLXqVi3wb6iPFKfWPZjycHD36J02LkSZc5MGLcUzxwSG-cdXNJO1ZVhtTe-lFIqSHnocIM6s8fClUU3mEeZEPqmqm70Ssht0F3wek5k5XYdKz98gSAhAEdJlp7gpdCCeP3UFAtbyQN2QU5tuBbFd0h-_YtBbO51o7eUtXugVV5Gi7SKVe98GkV5bw-HTx7owyFhGYpSRKdlyoKWg7g_ti7tHz9ZbDj7IGuu3XmtdJnqE4IiEH1xwmNj-NmtlUxI9GulZK9yqubmo',
    secondaryImageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAK-MHiQEw8aKNNiT0NCncfRnNAgAf1zE3hQqT7syvv55Fdl1bZbNy_B0cBpihwnUUnBDPm3L5KC_rri_eOL7dJqbs22wVF6dQKkcPJlijvi6e4ve3meNmL8sk907uNpAKPt4SAo2CzOxwuQrZw9JjEBA4ND0MXt7BsPLjOgLIrjKbxXUm8MsExPR8vPNNI9U4575F8qUMziEfm2W6alsqxuYEoHdLfMPWKGkrOO8wA7fUYoWRVkT4PsNbwjteB7edJWQJZKe6roZxi'
    ],
    status: 'Lost',
    ownerName: '陳先生',
    ownerId: 'u2',
    distance: '200 米',
    sightings: [
      {
        id: 's1',
        reporterName: '林小姐',
        reporterAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnI1yqFz6zB_XzL6T2l_k5G_4V5gGfXo0-Q2V0uV8z8Rz9Lz0zVz8Rz9Lz0zVz8Rz9Lz0zVz8Rz9Lz0zVz8Rz9Lz0zVz8Rz9Lz0zVz8Rz9Lz0',
        timestamp: '1小時前',
        locationName: '中環 皇后大道中',
        description: '在過馬路時看到一隻很像波比的狗狗，看起來有點慌張。',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK-MHiQEw8aKNNiT0NCncfRnNAgAf1zE3hQqT7syvv55Fdl1bZbNy_B0cBpihwnUUnBDPm3L5KC_rri_eOL7dJqbs22wVF6dQKkcPJlijvi6e4ve3meNmL8sk907uNpAKPt4SAo2CzOxwuQrZw9JjEBA4ND0MXt7BsPLjOgLIrjKbxXUm8MsExPR8vPNNI9U4575F8qUMziEfm2W6alsqxuYEoHdLfMPWKGkrOO8wA7fUYoWRVkT4PsNbwjteB7edJWQJZKe6roZxi',
        reliability: 'High',
        distance: '400 米'
      }
    ],
    fakeReports: 0,
    ownerVoiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: '黑白貓 (賓士貓)',
    category: 'Pet',
    petType: 'Cat',
    description: '在旺角花園街發現，已帶往診所檢查。尋找主人。',
    reward: 0,
    rewardHistory: [],
    lastSeenLocation: '旺角 花園街',
    lastSeenTimestamp: '5小時前',
    mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3FZnLyXCmpzKqddLzNTHq9nthTFL7sPevW4tjytM-EzDN9WCmxG8DWhBfec4nf3rHCQWwnX07wfSr09zBLENJE4G2WMDHfHtS_djfsyVuq8RP2BWAsWuQZ3IAZgIo5HiXSf9VDjs8ruuCPp4AQaa6zzikePwIY-glB9kvRpEKHFX97B470UEni2X1mQzgr2UESNQ1MvD1tNwaDcmSgmnCiHfh-MeY-v3kn5u1n1bjOOSApscUbozXmOSMY1XJOJA6CLW5dYoWaqtK',
    secondaryImageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAmtvsORnzL9CLytYdcoiM3fzCmDqXdT41IwEkWRDAsbj6zF-iTUnVTTjq26xQkCFGUVe_TOk9xQbBFNCpPzr2cvyYlAOPfRLhBVzqhXX589EZEMboxp_kpOW2_yzK4WLVLcNzn5JDQj6ymMstOaL8VWvdk6bHfnsmdI1e3fMMoyIzhDKq18pCxQ_1OpC2DaHBffwM3VLEznR5vyqD2PYngN1z369g9yjmcWVaq2DzS21q7P0nfzytnKD3JeebbCKbOjZbVv6C9iUzJ'
    ],
    status: 'Found',
    ownerName: '王小姐',
    ownerId: 'u3',
    distance: '1.2 公里',
    sightings: [],
    fakeReports: 0,
    storageLocation: '已交到旺角警署 (二樓報案大廳)'
  },
  {
    id: '3',
    title: 'MacBook Pro 14"',
    category: 'Electronics',
    description: '灰色 MacBook Pro，裝在黑色電腦包內。內有重要工作文件。',
    reward: 2000,
    rewardHistory: [],
    lastSeenLocation: '中環 IFC 商場',
    lastSeenTimestamp: '1天前',
    mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlnqU6gh_qckfH5T7WCQgZb6JInvA8k2pwvUEpImUt-AsR3pj-tkslaDQpwTT-mOUY_YsaQUEZEkzknYyi6qp6hYE00hgqIUxGU6_q-axfyDXmyMX_Sg1Z_FF9mAOz3EUNUzYSznFZVIvFvQafXnsJhzOBmsBrnJh4FST5NCHobTtdvxB2_XeEs2WKYPiQxN4NzOi6x6TgZFVdP7LzgWup94by9V9ozgOPzgNhfBBj_fufqKgBlYuwDHt7hkl90Nqbr5_uchsaKra4',
    secondaryImageUrls: [],
    status: 'Lost',
    ownerName: 'Lee Sir',
    ownerId: 'u4',
    distance: '3.5 公里',
    sightings: [],
    fakeReports: 0
  }
];
