
export type Category = 'Pet' | 'Electronics' | 'Wallet' | 'Documents' | 'People' | 'Other';
export type PetType = 'Dog' | 'Cat' | 'Bird' | 'Other';
export type SightingReliability = 'High' | 'Medium' | 'Low';
export type Language = 'zh-TW' | 'zh-CN' | 'en';
export type Theme = 'light' | 'dark';
export type NotificationType = 'Sighting' | 'Nearby' | 'System' | 'Message';
export type Gender = 'Male' | 'Female' | 'Secret';

export interface UserSettings {
  language: Language;
  theme: Theme;
  notificationDistance: number;
  pushSound: boolean;
  pushVibration: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  relatedItemId?: string;
  imageUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  itemId: string;
  itemTitle: string;
  itemImage: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  messages: Message[];
  lastUpdate: string;
}

export interface Sighting {
  id: string;
  reporterName: string;
  reporterAvatar: string;
  timestamp: string;
  locationName: string;
  description: string;
  imageUrl?: string;
  mapPreviewUrl?: string;
  reliability: SightingReliability;
  distance: string;
}

export interface RewardHistory {
  amount: number;
  timestamp: string;
}

export interface LostItem {
  id: string;
  title: string;
  category: Category;
  petType?: PetType;
  description: string;
  reward: number;
  rewardHistory: RewardHistory[];
  lastSeenLocation: string;
  lastSeenTimestamp: string;
  mainImageUrl: string;
  secondaryImageUrls: string[];
  status: 'Lost' | 'Found' | 'Recovered' | 'Closed';
  ownerName: string;
  ownerId: string;
  distance: string;
  sightings: Sighting[];
  isFavorite?: boolean;
  fakeReports: number;
  storageLocation?: string;
  ownerVoiceUrl?: string;
  isBoosted?: boolean;
  boostExpiry?: string;
  adminHidden?: boolean;
}

export interface User {
  id: string;
  name: string;
  gender: Gender;
  location: string;
  joinDate: string;
  avatarUrl: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  stats: {
    posts: number;
    found: number;
    clues: number;
  };
}
