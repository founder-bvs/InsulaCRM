import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  Home,
  Megaphone,
  Briefcase,
  Calendar,
  CheckSquare,
  Settings,
  Receipt,
  Building,
  Database,
  Building2,
  RefreshCw,
  PhoneCall,
  KeyRound
} from 'lucide-react';
import { cronSyncEngine } from '../../services/cronSyncEngine';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    leads,
    deals,
    buyers,
    tasks,
    units,
    agencies,
    phoneCalls,
    resaleProperties,
    rentProperties,
    isSupabaseOnline,
    setIsSupabaseConfigModalOpen,
    t
  } = useCrm();

  const [remainingSec, setRemainingSec] = useState<number>(cronSyncEngine.getRemainingSeconds());
  const [isSyncing, setIsSyncing] = useState<boolean>(cronSyncEngine.getIsSyncing());

  useEffect(() => {
    const unsub = cronSyncEngine.subscribe((sec, syncing) => {
      setRemainingSec(sec);
      setIsSyncing(syncing);
    });
    return () => unsub();
  }, []);

  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const activeDealsCount = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
  const availableUnitsCount = units.filter(u => u.status === 'available').length;
  const resaleTotalCount = resaleProperties.length + rentProperties.length;

  const navItems = [
    {
      id: 'chessboard',
      label: 'Шахівка квартир',
      icon: Building2,
      badge: `${availableUnitsCount} вільних`,
      highlight: true
    },
    {
      id: 'sync',
      label: 'Синхронізація G-PLUS',
      icon: RefreshCw,
      badge: isSyncing ? 'Синхр...' : cronSyncEngine.formatCountdown(remainingSec),
      highlight: false
    },
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'leads',
      label: 'Ліди та звернення',
      icon: Users,
      badge: leads.length
    },
    {
      id: 'deals',
      label: 'Угоди та договори',
      icon: Layers,
      badge: activeDealsCount
    },
    {
      id: 'finances',
      label: 'Фінанси та розстрочки',
      icon: Receipt,
      badge: 'НБУ'
    },
    {
      id: 'telephony',
      label: 'Телефонія та дзвінки',
      icon: PhoneCall,
      badge: phoneCalls.length > 0 ? phoneCalls.length : null
    },
    {
      id: 'resale',
      label: 'Вторинний ринок / Оренда',
      icon: KeyRound,
      badge: resaleTotalCount > 0 ? resaleTotalCount : null
    },
    {
      id: 'agencies',
      label: 'Агентства нерухомості',
      icon: Building,
      badge: agencies.length
    },
    {
      id: 'buyers',
      label: 'База інвесторів',
      icon: Briefcase,
      badge: buyers.length
    },
    {
      id: 'properties',
      label: 'Об’єкти та розрахунки',
      icon: Home,
      badge: null
    },
    {
      id: 'tasks',
      label: 'Завдання та нагадування',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null
    },
    {
      id: 'calendar',
      label: 'Календар показів',
      icon: Calendar,
      badge: null
    },
    {
      id: 'settings',
      label: 'Налаштування та БД',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#f4f6f8] dark:bg-[#06131c] border-r border-[#e2e8f0] dark:border-[#163042] flex flex-col justify-between transition-colors hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8] flex items-center justify-between">
          <span>{t('navTitle')}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#01283c]/10 dark:bg-[#ffb012]/20 text-[#01283c] dark:text-[#ffb012] font-black">
            VRTKL
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] shadow-xs'
                  : 'text-[#01283c]/80 dark:text-[#f8fafc]/80 hover:text-[#01283c] dark:hover:text-[#f8fafc] hover:bg-white dark:hover:bg-[#0c1e2b]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ffb012] dark:text-[#01283c]' : 'text-[#64748b] dark:text-[#94a3b8]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#ffb012] text-[#01283c] dark:bg-[#01283c] dark:text-white'
                      : 'bg-[#e2e8f0] dark:bg-[#163042] text-[#01283c] dark:text-[#f8fafc]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Supabase status block at bottom of sidebar */}
      <div className="p-3.5 border-t border-[#e2e8f0] dark:border-[#163042] space-y-2">
        <div
          onClick={() => setIsSupabaseConfigModalOpen(true)}
          className="p-3 rounded-xl bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] cursor-pointer hover:border-[#01283c] dark:hover:border-[#ffb012] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className={`w-4 h-4 ${isSupabaseOnline ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-xs font-black text-[#01283c] dark:text-[#f8fafc]">
                {isSupabaseOnline ? 'Supabase Online' : 'Підключити БД'}
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>
          <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-1">
            {isSupabaseOnline ? 'Синхронізація з PostgreSQL' : 'Натисніть для підключення'}
          </p>
        </div>
      </div>
    </aside>
  );
};
