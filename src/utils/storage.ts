import { Client, AppSettings } from '../types';
import { validateAndSanitizeBackup, sanitizeClient } from './security';

const CLIENTS_KEY = 'tax_archive_clients_v2';
const TRASH_KEY = 'tax_archive_trash_v2';
const SETTINGS_KEY = 'tax_archive_settings_v2';
const AUTH_KEY = 'tax_archive_auth_v2';

// Clean up any legacy dummy seed data from previous test run
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('tax_archive_clients_v1');
    localStorage.removeItem('tax_archive_trash_v1');
    localStorage.removeItem('tax_archive_seeded_v1');
  } catch {}
}

export const DEFAULT_ADMIN_EMAIL = 'A12026@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'A12026';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  showSidebarClientCount: true,
  adminEmail: DEFAULT_ADMIN_EMAIL,
  adminPasswordHash: DEFAULT_ADMIN_PASSWORD,
};

// No dummy seed data — fresh real database starting with 0 records as requested
export function getClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading clients from localStorage:', err);
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  try {
    const cleanList = Array.isArray(clients) ? clients.map(sanitizeClient) : [];
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(cleanList));
  } catch (err) {
    console.error('Error saving clients to localStorage:', err);
  }
}

export function getTrash(): Client[] {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading trash from localStorage:', err);
    return [];
  }
}

export function saveTrash(trash: Client[]): void {
  try {
    const cleanList = Array.isArray(trash) ? trash.map(sanitizeClient) : [];
    localStorage.setItem(TRASH_KEY, JSON.stringify(cleanList));
  } catch (err) {
    console.error('Error saving trash to localStorage:', err);
  }
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function getIsLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setIsLoggedIn(loggedIn: boolean): void {
  try {
    if (loggedIn) {
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (err) {
    console.error('Error saving auth status:', err);
  }
}

// Backup & Restore
export interface BackupData {
  appName: string;
  version: string;
  exportedAt: string;
  clients: Client[];
  trash: Client[];
  settings: AppSettings;
}

export function exportBackupJSON(): string {
  const clients = getClients();
  const trash = getTrash();
  const settings = getSettings();

  const backup: BackupData = {
    appName: 'أرشيف الضرائب (Tax Archive)',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    clients,
    trash,
    settings,
  };

  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonString: string): { success: boolean; message: string; count?: number } {
  try {
    const validation = validateAndSanitizeBackup(jsonString);
    if (!validation.isValid || !validation.data) {
      return { success: false, message: validation.error || 'ملف غير صالح أو تالف' };
    }

    const data = validation.data;

    saveClients(data.clients);
    if (Array.isArray(data.trash)) {
      saveTrash(data.trash);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }

    return {
      success: true,
      message: `تم فحص واستعادة النسخة الاحتياطية بأمان تام (${data.clients.length} عميل)`,
      count: data.clients.length,
    };
  } catch (err: any) {
    return { success: false, message: 'فشل تحليل وفحص ملف النسخة الاحتياطية: ' + (err.message || 'خطأ غير معروف') };
  }
}

export function clearAllData(): void {
  localStorage.removeItem(CLIENTS_KEY);
  localStorage.removeItem(TRASH_KEY);
}

export function calculateStorageUsage(): { usedKb: number; percent: number } {
  try {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    const usedKb = Math.round(total / 1024);
    const percent = Math.min(100, Math.round((usedKb / 5120) * 100));
    return { usedKb, percent };
  } catch {
    return { usedKb: 0, percent: 0 };
  }
}
