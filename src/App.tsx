import React, { useState, useEffect, useCallback } from 'react';
import {
  Client,
  AppSettings,
  ActivePage,
  ToastMessage,
  AdvancedFilterOptions,
} from './types';
import {
  getClients,
  saveClients,
  getTrash,
  saveTrash,
  getSettings,
  saveSettings,
  getIsLoggedIn,
  setIsLoggedIn,
  clearAllData,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ToastContainer } from './components/Toast';
import { ClientFormModal } from './components/ClientFormModal';
import { ClientViewModal } from './components/ClientViewModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AIChatModal } from './components/AIChatModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { TrashPage } from './pages/TrashPage';
import { BackupPage } from './pages/BackupPage';
import { SettingsPage } from './pages/SettingsPage';

const INITIAL_ADVANCED_FILTERS: AdvancedFilterOptions = {
  name: '',
  phone: '',
  city: '',
  notes: '',
  gender: 'all',
  propertiesCondition: 'any',
  propertiesCount: undefined,
  startDate: '',
  endDate: '',
};

export default function App() {
  // Splash Screen State (shown only once per browser session for 1.5s, not on every refresh)
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('tax_archive_splash_seen');
    } catch {
      return false;
    }
  });

  // Loading Screen State (shown on backup restore or heavy load)
  const [loadingState, setLoadingState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: 'جاري التحميل...',
  });

  // Auth State (Persists indefinitely in localStorage once logged in, until user clicks logout)
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => getIsLoggedIn());

  // Settings & Theme
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('tax_archive_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        return savedTheme;
      }
      const saved = getSettings().theme;
      if (saved === 'dark') document.documentElement.classList.add('dark');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const isOnline = useOnlineStatus();

  // Data States
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [trash, setTrash] = useState<Client[]>(() => getTrash());

  // Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [clientToView, setClientToView] = useState<Client | null>(null);

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>(INITIAL_ADVANCED_FILTERS);

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Ctrl+K / Cmd+K -> Quick search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
      // Alt+N -> New client
      else if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setClientToEdit(null);
        setIsAddEditModalOpen(true);
      }
      // Alt+A -> AI Chat
      else if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAIChatOpen((prev) => !prev);
      }
      // Alt+D -> Toggle theme
      else if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      }
      // Alt+B -> Backup page
      else if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setActivePage('backup');
      }
      // ? -> Shortcuts modal
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      // Escape -> close any open modals
      else if (e.key === 'Escape') {
        setIsAddEditModalOpen(false);
        setIsViewModalOpen(false);
        setIsQuickSearchOpen(false);
        setIsAdvancedSearchOpen(false);
        setIsAIChatOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Confirm Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme to <html> tag and persist
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('tax_archive_theme', theme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  }, [theme]);

  // Keyboard shortcut Ctrl+K / Cmd+K to open Quick Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('tax_archive_theme', nextTheme);
    } catch {}
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettingsState(updated);
    saveSettings(updated);
  };

  // Settings update
  const handleUpdateSettings = (newProps: Partial<AppSettings>) => {
    const updated = { ...settings, ...newProps };
    setSettingsState(updated);
    saveSettings(updated);
  };

  // Login handler
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoggedInState(true);
    showToast('تم تسجيل الدخول بنجاح إلى أرشيف الضرائب', 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setConfirmModalData({
      isOpen: true,
      title: 'تسجيل الخروج',
      message: 'هل أنت متأكد من رغبتك في تسجيل الخروج من منظومة أرشيف الضرائب؟',
      confirmText: 'تسجيل الخروج',
      isDangerous: false,
      onConfirm: () => {
        setIsLoggedIn(false);
        setIsLoggedInState(false);
        showToast('تم تسجيل الخروج بنجاح', 'info');
      },
    });
  };

  // Save / Update Client
  const handleSaveClient = (
    data: Omit<Client, 'id' | 'serialNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();

    if (existingId) {
      // Edit existing
      const updatedList = clients.map((c) => {
        if (c.id === existingId) {
          return {
            ...c,
            ...data,
            updatedAt: now,
          };
        }
        return c;
      });
      setClients(updatedList);
      saveClients(updatedList);
      setIsAddEditModalOpen(false);
      setClientToEdit(null);
      showToast('تم تعديل بيانات العميل بنجاح', 'success');
    } else {
      // Add new
      const nextSerial =
        clients.length > 0 ? Math.max(...clients.map((c) => c.serialNumber || 0)) + 1 : 1;

      const newClient: Client = {
        ...data,
        id: 'client_' + Date.now(),
        serialNumber: nextSerial,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      const updatedList = [newClient, ...clients];
      setClients(updatedList);
      saveClients(updatedList);
      setIsAddEditModalOpen(false);
      showToast('تم إضافة العميل بنجاح', 'success');
    }
  };

  // Move client to Trash (Soft Delete)
  const handleDeleteClient = (client: Client) => {
    setConfirmModalData({
      isOpen: true,
      title: 'نقل العميل إلى سلة المهملات',
      message: `هل أنت متأكد من نقل العميل "${client.fullName}" إلى سلة المهملات؟ يمكنك استعادته في أي وقت لاحقاً.`,
      confirmText: 'نقل إلى السلة',
      isDangerous: true,
      onConfirm: () => {
        const now = new Date().toISOString();
        const updatedClients = clients.filter((c) => c.id !== client.id);
        const trashedClient: Client = { ...client, deletedAt: now };
        const updatedTrash = [trashedClient, ...trash];

        setClients(updatedClients);
        saveClients(updatedClients);

        setTrash(updatedTrash);
        saveTrash(updatedTrash);

        showToast('تم نقل العميل إلى سلة المهملات', 'warning');
      },
    });
  };

  // Bulk move clients to Trash
  const handleBulkDeleteClients = (clientIds: string[]) => {
    if (clientIds.length === 0) return;
    const now = new Date().toISOString();
    const toTrash = clients.filter((c) => clientIds.includes(c.id)).map((c) => ({ ...c, deletedAt: now }));
    const remaining = clients.filter((c) => !clientIds.includes(c.id));

    setClients(remaining);
    saveClients(remaining);

    const updatedTrash = [...toTrash, ...trash];
    setTrash(updatedTrash);
    saveTrash(updatedTrash);

    showToast(`تم نقل ${clientIds.length} عميل إلى سلة المهملات بنجاح`, 'warning');
  };

  // Restore client from Trash
  const handleRestoreClient = (client: Client) => {
    const updatedTrash = trash.filter((c) => c.id !== client.id);
    const restoredClient: Client = { ...client, deletedAt: null };
    const updatedClients = [restoredClient, ...clients];

    setTrash(updatedTrash);
    saveTrash(updatedTrash);

    setClients(updatedClients);
    saveClients(updatedClients);

    showToast(`تم استعادة العميل "${client.fullName}" بنجاح`, 'success');
  };

  // Restore All from Trash
  const handleRestoreAllTrash = () => {
    if (trash.length === 0) return;

    setConfirmModalData({
      isOpen: true,
      title: 'استعادة جميع العملاء',
      message: `هل أنت متأكد من رغبتك في استعادة جميع العملاء (${trash.length} عميل) إلى القائمة الرئيسية؟`,
      confirmText: 'استعادة الكل',
      isDangerous: false,
      onConfirm: () => {
        const restored = trash.map((c) => ({ ...c, deletedAt: null }));
        const updatedClients = [...restored, ...clients];

        setClients(updatedClients);
        saveClients(updatedClients);

        setTrash([]);
        saveTrash([]);

        showToast('تم استعادة جميع العملاء بنجاح', 'success');
      },
    });
  };

  // Empty Trash permanently
  const handleEmptyTrash = () => {
    if (trash.length === 0) return;

    setConfirmModalData({
      isOpen: true,
      title: 'تفريغ سلة المهملات نهائياً',
      message: `تحذير: سيتم حذف جميع العملاء الموجودين في سلة المهملات (${trash.length} عميل) نهائياً ولا يمكن التراجع أو الاستعادة بعد ذلك!`,
      confirmText: 'حذف نهائي للكل',
      isDangerous: true,
      onConfirm: () => {
        setTrash([]);
        saveTrash([]);
        showToast('تم تفريغ سلة المهملات نهائياً', 'error');
      },
    });
  };

  // Permanent Delete single client from Trash
  const handlePermanentDelete = (client: Client) => {
    setConfirmModalData({
      isOpen: true,
      title: 'حذف العميل نهائياً',
      message: `هل أنت متأكد من الحذف النهائي للعميل "${client.fullName}"؟ لا يمكن استعادته مرة أخرى نهائياً.`,
      confirmText: 'حذف نهائي',
      isDangerous: true,
      onConfirm: () => {
        const updatedTrash = trash.filter((c) => c.id !== client.id);
        setTrash(updatedTrash);
        saveTrash(updatedTrash);
        showToast('تم حذف العميل نهائياً', 'error');
      },
    });
  };

  // Copy full client data to clipboard
  const handleCopyClientData = (client: Client) => {
    const textToCopy = `📋 بيانات العميل - أرشيف الضرائب:
------------------------------------
• رقم مسلسل: #${client.serialNumber}
• الاسم بالكامل: ${client.fullName}
• رقم الموبايل: ${client.phone}
• الرقم القومي: ${client.nationalId}
• كلمة سر الحساب: ${client.password}
• المدينة / القرية: ${client.city || 'غير محدد'}
• العنوان بالتفصيل: ${client.detailedAddress || 'غير محدد'}
• عدد المنشآت والبيوت: ${client.propertiesCount ?? 0}
• النوع: ${client.gender || 'غير محدد'}
${client.alternativePhones && client.alternativePhones.length > 0 ? `• أرقام هواتف بديلة: ${client.alternativePhones.join(' - ')}\n` : ''}${client.declarationLink ? `• رابط الإقرار: ${client.declarationLink}\n` : ''}${client.notes ? `• الملاحظات: ${client.notes}\n` : ''}• تاريخ الإضافة: ${new Date(client.createdAt).toLocaleString('ar-EG')}`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showToast('تم نسخ جميع بيانات العميل بنجاح بنقرة واحدة (📋)', 'success');
      })
      .catch(() => {
        showToast('فشل نسخ البيانات، يرجى منح الإذن للمتصفح', 'error');
      });
  };

  // Clear All Data
  const handleClearAllData = () => {
    clearAllData();
    setClients([]);
    setTrash([]);
    showToast('تم مسح جميع بيانات التطبيق والبدء من الصفر', 'info');
  };

  // Trigger temporary loading spinner (e.g. for backup restore)
  const triggerLoading = (msg: string, callback: () => void) => {
    setLoadingState({ show: true, message: msg });
    setTimeout(() => {
      callback();
      setLoadingState({ show: false, message: '' });
    }, 1500);
  };

  // Backup Restored callback
  const handleBackupRestored = () => {
    setClients(getClients());
    setTrash(getTrash());
    setSettingsState(getSettings());
  };

  // AI Actions execution handlers
  const handleAddClientFromAI = (clientData: any) => {
    if (!clientData || !clientData.fullName || !clientData.phone) return;
    const now = new Date().toISOString();
    const nextSerial =
      clients.length > 0 ? Math.max(...clients.map((c) => c.serialNumber || 0)) + 1 : 1;

    const newClient: Client = {
      fullName: clientData.fullName,
      phone: clientData.phone,
      nationalId: clientData.nationalId || '2900101' + Math.floor(1000000 + Math.random() * 9000000),
      password: clientData.password || 'Client#2026',
      city: clientData.city || '',
      detailedAddress: clientData.detailedAddress || '',
      propertiesCount: clientData.propertiesCount ?? 1,
      notes: clientData.notes || 'تمت الإضافة عبر المساعد الذكي',
      gender: clientData.gender || 'ذكر',
      alternativePhones: [],
      declarationLink: '',
      colorTag: 'green',
      id: 'client_' + Date.now(),
      serialNumber: nextSerial,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const updated = [newClient, ...clients];
    setClients(updated);
    saveClients(updated);
    showToast(`تمت إضافة العميل "${newClient.fullName}" بنجاح عبر المساعد الذكي`, 'success');
  };

  const handleDeleteClientFromAI = (identifier: string) => {
    const target = clients.find(
      (c) =>
        c.fullName.includes(identifier) ||
        c.phone.includes(identifier) ||
        c.nationalId.includes(identifier)
    );
    if (target) {
      handleDeleteClient(target);
    }
  };

  // 1. Show Splash Screen if active
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Show Login Screen if not authenticated
  if (!isLoggedIn) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar */}
      <TopBar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSearch={() => setIsQuickSearchOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onSelectPage={(page) => {
            if (page === 'ai') {
              setIsAIChatOpen(true);
            } else {
              setActivePage(page);
            }
          }}
          clientsCount={clients.length}
          trashCount={trash.length}
          showCounts={settings.showSidebarClientCount}
          userEmail={settings.adminEmail || DEFAULT_ADMIN_EMAIL}
          onOpenAddClient={() => {
            setClientToEdit(null);
            setIsAddEditModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:mr-72 transition-all">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && (
              <DashboardPage
                clients={clients}
                onNavigateToClients={(cityFilter) => {
                  if (cityFilter && cityFilter !== 'غير محدد') {
                    setAdvancedFilters({ ...INITIAL_ADVANCED_FILTERS, city: cityFilter });
                  }
                  setActivePage('clients');
                }}
                onOpenAddClient={() => {
                  setClientToEdit(null);
                  setIsAddEditModalOpen(true);
                }}
                onOpenAIChat={() => setIsAIChatOpen(true)}
                onViewClient={(client) => {
                  setClientToView(client);
                  setIsViewModalOpen(true);
                }}
                onEditClient={(client) => {
                  setClientToEdit(client);
                  setIsAddEditModalOpen(true);
                }}
                onCopyClient={handleCopyClientData}
              />
            )}

            {activePage === 'clients' && (
              <ClientsPage
                clients={clients}
                onOpenAddClient={() => {
                  setClientToEdit(null);
                  setIsAddEditModalOpen(true);
                }}
                onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
                onViewClient={(client) => {
                  setClientToView(client);
                  setIsViewModalOpen(true);
                }}
                onEditClient={(client) => {
                  setClientToEdit(client);
                  setIsAddEditModalOpen(true);
                }}
                onDeleteClient={handleDeleteClient}
                onCopyClient={handleCopyClientData}
                onBulkDeleteClients={handleBulkDeleteClients}
                activeAdvancedFilters={advancedFilters}
                onResetAdvancedFilters={() => setAdvancedFilters(INITIAL_ADVANCED_FILTERS)}
              />
            )}

            {activePage === 'trash' && (
              <TrashPage
                trashClients={trash}
                onRestoreClient={handleRestoreClient}
                onPermanentDeleteClient={handlePermanentDelete}
                onRestoreAll={handleRestoreAllTrash}
                onEmptyTrash={handleEmptyTrash}
              />
            )}

            {activePage === 'backup' && (
              <BackupPage
                clients={clients}
                onBackupRestored={handleBackupRestored}
                showToast={showToast}
                onTriggerLoading={triggerLoading}
              />
            )}

            {activePage === 'settings' && (
              <SettingsPage
                settings={settings}
                clients={clients}
                onUpdateSettings={handleUpdateSettings}
                onClearAllData={handleClearAllData}
                showToast={showToast}
              />
            )}

            {/* Main Application Copyright & WhatsApp Footer */}
            <footer className="mt-12 pt-6 pb-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">أرشيف الضرائب © 2026</span>
                <span>·</span>
                <span>جميع الحقوق الملكية محفوظة للمطور</span>
              </div>

              <a
                href="https://wa.me/201050543116?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%A3%D8%B1%D8%B4%D9%8A%D9%81%20%D8%A7%D9%84%D8%B6%D8%B1%D8%A7%D8%A6%D8%A8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-xs"
              >
                <span>للتواصل والدعم الفني عبر واتساب:</span>
                <span className="font-mono text-xs font-black" dir="ltr">01050543116</span>
              </a>
            </footer>
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}

      {/* Add / Edit Client Modal */}
      <ClientFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      {/* Client View Modal */}
      <ClientViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setClientToView(null);
        }}
        client={clientToView}
        onEdit={(client) => {
          setIsViewModalOpen(false);
          setClientToEdit(client);
          setIsAddEditModalOpen(true);
        }}
        onCopy={handleCopyClientData}
      />

      {/* Quick Search Modal (🔍) */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        clients={clients}
        onSelectClient={(client) => {
          setClientToView(client);
          setIsViewModalOpen(true);
        }}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        filters={advancedFilters}
        onApplyFilters={(filters) => {
          setAdvancedFilters(filters);
          setActivePage('clients');
        }}
        onResetFilters={() => setAdvancedFilters(INITIAL_ADVANCED_FILTERS)}
      />

      {/* AI Chatbot Assistant Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        clients={clients}
        onAddClientFromAI={handleAddClientFromAI}
        onDeleteClientFromAI={handleDeleteClientFromAI}
        isOnline={isOnline}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalData.onConfirm}
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText={confirmModalData.confirmText}
        isDangerous={confirmModalData.isDangerous}
      />

      {/* Temporary Loading Screen */}
      {loadingState.show && <LoadingScreen message={loadingState.message} />}

      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
