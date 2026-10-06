import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Search,
  Moon,
  Sun,
  Plus,
  Building2,
  Briefcase,
  Layers,
  Users,
  UserCheck,
  CheckSquare,
  Globe,
  Database,
  User,
  Clock,
  RefreshCw
} from 'lucide-react';
import { cronSyncEngine } from '../../services/cronSyncEngine';

interface NavbarProps {
  onOpenNewLead: () => void;
  onOpenNewDeal: () => void;
  onOpenNewBuyer: () => void;
  onOpenNewTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewLead,
  onOpenNewDeal,
  onOpenNewBuyer,
  onOpenNewTask
}) => {
  const {
    isDarkMode,
    toggleDarkMode,
    currentUser,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    language,
    toggleLanguage,
    isSupabaseOnline,
    setIsSupabaseConfigModalOpen,
    setIsAuthModalOpen,
    supabaseUser,
    t
  } = useCrm();

  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [cronSec, setCronSec] = useState<number>(cronSyncEngine.getRemainingSeconds());
  const [isSyncing, setIsSyncing] = useState<boolean>(cronSyncEngine.getIsSyncing());

  useEffect(() => {
    const unsub = cronSyncEngine.subscribe((sec, syncing) => {
      setCronSec(sec);
      setIsSyncing(syncing);
    });
    return () => unsub();
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1e2b]/95 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#163042] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('chessboard')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c] font-black text-sm shadow-xs transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#01283c] dark:text-[#f8fafc]">
                VRTKL <span className="text-[#ffb012]">CRM</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#01283c]/5 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/10 dark:border-[#ffb012]/30">
                G-PLUS PROD
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] hidden sm:block">
              Девелопмент нерухомості • Шахівка • Угоди • Фінанси
            </p>
          </div>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук квартири, ліда, угоди, інвестора або АН..."
              className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] focus:border-[#01283c] dark:focus:border-[#ffb012] focus:bg-white dark:focus:bg-[#0c1e2b] rounded-xl text-[#01283c] dark:text-[#f8fafc] placeholder-[#64748b] dark:placeholder-[#94a3b8] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] font-semibold"
              >
                {t('clear')}
              </button>
            )}
          </form>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* G-Plus Cron Auto-Sync status button */}
          <button
            onClick={() => setActiveTab('sync')}
            title={`Крон авто-синхронізації G-PLUS. Натисніть для налаштування (зараз кожні ${cronSyncEngine.getInterval()}с)`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              activeTab === 'sync'
                ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] border-[#01283c] dark:border-[#ffb012]'
                : isSyncing
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 animate-pulse'
                : 'bg-white dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c] dark:hover:border-[#ffb012]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ffb012] dark:text-[#ffb012] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Крон:</span>
            <span className="font-mono">{isSyncing ? 'Синхронізація...' : formatCountdown(cronSec)}</span>
          </button>

          {/* Supabase status button */}
          <button
            onClick={() => setIsSupabaseConfigModalOpen(true)}
            title={isSupabaseOnline ? 'Supabase підключено. Натисніть для налаштувань' : 'Підключити базу даних Supabase'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isSupabaseOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSupabaseOnline ? 'Supabase' : 'Підключити БД'}</span>
          </button>

          {/* Language Switcher Button (UA / EN) */}
          <button
            onClick={toggleLanguage}
            title={language === 'uk' ? 'Перемкнути на англійську (Switch to English)' : 'Перемкнути на українську'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] border border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c] dark:hover:border-[#ffb012] transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[#01283c] dark:text-[#ffb012]" />
            <span className="font-bold">{language === 'uk' ? '🇺🇦 УКР' : '🇬🇧 ENG'}</span>
          </button>

          {/* Quick Add Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              className="flex items-center gap-1.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Створити</span>
            </button>

            {showQuickAddMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0c1e2b] rounded-xl shadow-lg border border-[#e2e8f0] dark:border-[#163042] py-1.5 z-50 animate-in fade-in"
                onClick={() => setShowQuickAddMenu(false)}
              >
                <button
                  onClick={() => setActiveTab('chessboard')}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#01283c] dark:text-[#f8fafc] hover:bg-[#f4f6f8] dark:hover:bg-[#163042] flex items-center gap-2.5"
                >
                  <Building2 className="w-4 h-4 text-[#01283c] dark:text-[#ffb012]" />
                  Шахівка / Бронювання
                </button>
                <button
                  onClick={onOpenNewLead}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#01283c] dark:text-[#f8fafc] hover:bg-[#f4f6f8] dark:hover:bg-[#163042] flex items-center gap-2.5"
                >
                  <Users className="w-4 h-4 text-[#01283c] dark:text-[#ffb012]" />
                  {t('newSellerLead')}
                </button>
                <button
                  onClick={onOpenNewDeal}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#01283c] dark:text-[#f8fafc] hover:bg-[#f4f6f8] dark:hover:bg-[#163042] flex items-center gap-2.5"
                >
                  <Layers className="w-4 h-4 text-[#01283c] dark:text-[#ffb012]" />
                  {t('newPipelineDeal')}
                </button>
                <button
                  onClick={onOpenNewBuyer}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#01283c] dark:text-[#f8fafc] hover:bg-[#f4f6f8] dark:hover:bg-[#163042] flex items-center gap-2.5"
                >
                  <UserCheck className="w-4 h-4 text-[#01283c] dark:text-[#ffb012]" />
                  {t('newCashBuyer')}
                </button>
                <button
                  onClick={onOpenNewTask}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#01283c] dark:text-[#f8fafc] hover:bg-[#f4f6f8] dark:hover:bg-[#163042] flex items-center gap-2.5"
                >
                  <CheckSquare className="w-4 h-4 text-[#01283c] dark:text-[#ffb012]" />
                  {t('newTask')}
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Світла тема' : 'Темна тема'}
            className="p-2 rounded-xl text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f4f6f8] dark:hover:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#ffb012]" /> : <Moon className="w-4 h-4 text-[#01283c]" />}
          </button>

          {/* User profile avatar / Login button -> opens AuthModal */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-2 pl-2 border-l border-[#e2e8f0] dark:border-[#163042] hover:opacity-90 transition-all ${
              !supabaseUser
                ? 'px-3 py-1.5 rounded-xl bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] font-bold text-xs shadow-xs'
                : ''
            }`}
          >
            {supabaseUser ? (
              <>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#01283c] text-[#ffb012] font-black flex items-center justify-center text-xs border border-[#01283c] dark:border-[#ffb012]/40">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1e2b]" />
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-tight flex items-center gap-1">
                    <span>Supabase Auth</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Увійти (Supabase)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
