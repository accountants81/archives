export type Gender = 'ذكر' | 'أنثى';
export type ColorTag = 'green' | 'blue' | 'red' | 'yellow' | 'gray';

export interface Client {
  id: string;
  serialNumber: number;
  fullName: string;
  phone: string;
  nationalId: string;
  password: string;
  city?: string;
  detailedAddress?: string;
  propertiesCount?: number;
  notes?: string;
  gender?: Gender;
  alternativePhones?: string[];
  declarationLink?: string;
  colorTag?: ColorTag;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  showSidebarClientCount: boolean;
  adminEmail: string;
  adminPasswordHash: string;
}

export interface AdvancedFilterOptions {
  name: string;
  phone: string;
  city: string;
  notes: string;
  gender: 'all' | 'ذكر' | 'أنثى';
  propertiesCondition: 'any' | 'gt' | 'lt' | 'eq';
  propertiesCount?: number;
  startDate?: string;
  endDate?: string;
}

export type ActivePage = 'dashboard' | 'clients' | 'trash' | 'backup' | 'settings' | 'ai';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionTaken?: string;
}
