import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  RefreshCw,
  Clock,
  Key,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Users,
  Building2,
  PhoneCall,
  DollarSign,
  Receipt,
  Home,
  Check,
  Play,
  Pause,
  ExternalLink,
  Sliders,
  Trash2,
  DownloadCloud,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Calendar,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  getGPlusToken,
  setGPlusToken,
  getGPlusBaseUrl,
  setGPlusBaseUrl,
  GPlusSyncService
} from '../../services/gplusSyncService';
import { CrmDbService } from '../../services/crmDbService';
import { cronSyncEngine } from '../../services/cronSyncEngine';

export const GPlusSyncView: React.FC = () => {
  const {
    buildings,
    sections,
    units,
    leads,
    deals,
    agencies,
    expenses,
    phoneCalls,
    resaleProperties,
    rentProperties,
    refreshAllData,
    isSupabaseOnline,
    setIsSupabaseConfigModalOpen
  } = useCrm();

  const [token, setTokenState] = useState(getGPlusToken());
  const [baseUrl, setBaseUrlState] = useState(getGPlusBaseUrl());
  const [showToken, setShowToken] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<{ success: boolean; message: string; user?: any } | null>(null);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cron state
  const [intervalSec, setIntervalSec] = useState<number>(cronSyncEngine.getInterval());
  const [customSec, setCustomSec] = useState<string>(cronSyncEngine.getInterval().toString());
  const [isAutoSync, setIsAutoSync] = useState<boolean>(cronSyncEngine.getAutoSyncEnabled());
  const [remainingSec, setRemainingSec] = useState<number>(cronSyncEngine.getRemainingSeconds());
  const [isSyncing, setIsSyncing] = useState<boolean>(cronSyncEngine.getIsSyncing());
  const [syncLogs, setSyncLogs] = useState(GPlusSyncService.getSyncLogs());

  // Data inspector tab
  const [inspectorTab, setInspectorTab] = useState<'buildings' | 'units' | 'leads' | 'deals' | 'calls'>('buildings');

  // Messages
  const [clearSuccessMsg, setClearSuccessMsg] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(false);
  const [manualSyncMsg, setManualSyncMsg] = useState<string | null>(null);

  // Subscribe to cron engine ticks
  useEffect(() => {
    const unsubscribe = cronSyncEngine.subscribe(
      (sec, syncing) => {
        setRemainingSec(sec);
        setIsSyncing(syncing);
      },
      () => {
        setSyncLogs(GPlusSyncService.getSyncLogs());
        refreshAllData();
      }
    );
    return () => unsubscribe();
  }, [refreshAllData]);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = token.trim();
    setGPlusToken(cleanToken);
    setGPlusBaseUrl(baseUrl.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    if (cleanToken) {
      setIsTestingToken(true);
      setTokenTestResult(null);
      const res = await GPlusSyncService.testConnection(cleanToken);
      setTokenTestResult(res);
      setIsTestingToken(false);
    }
  };

  const handleTestToken = async () => {
    const cleanToken = token.trim();
    setIsTestingToken(true);
    setTokenTestResult(null);
    const res = await GPlusSyncService.testConnection(cleanToken);
    setTokenTestResult(res);
    setIsTestingToken(false);
  };

  const handleIntervalChange = (newInterval: number) => {
    setIntervalSec(newInterval);
    setCustomSec(newInterval.toString());
    cronSyncEngine.setInterval(newInterval);
  };

  const handleCustomIntervalApply = () => {
    const val = parseInt(customSec, 10);
    if (!isNaN(val) && val >= 10) {
      setIntervalSec(val);
      cronSyncEngine.setInterval(val);
    }
  };

  const handleClearAllDemoData = async () => {
    if (confirm('Видалити всі демо-дані та локальні кеші? База даних стане чистою.')) {
      GPlusSyncService.clearAllDemoData();
      await refreshAllData();
      setSyncLogs([]);
      setClearSuccessMsg(true);
      setTimeout(() => setClearSuccessMsg(false), 3000);
    }
  };

  const handleSeedRealGPlusStructures = async () => {
    setIsSyncing(true);
    await GPlusSyncService.seedGPlusSpecificationData();
    await refreshAllData();
    setSyncLogs(GPlusSyncService.getSyncLogs());
    setIsSyncing(false);
    setSeedSuccessMsg(true);
    setTimeout(() => setSeedSuccessMsg(false), 4000);
  };

  const handleToggleAutoSync = () => {
    const next = !isAutoSync;
    setIsAutoSync(next);
    cronSyncEngine.setAutoSyncEnabled(next);
  };

  const handleTriggerManualSync = async () => {
    setIsSyncing(true);
    setManualSyncMsg('Виконується запит до API G-PLUS...');
    const result = await cronSyncEngine.triggerManualSync();
    setSyncLogs(GPlusSyncService.getSyncLogs());
    await refreshAllData();
    setIsSyncing(false);

    if (result?.success) {
      setManualSyncMsg(`✓ Синхронізація успішна! Оброблено записів: ${result.stats.units} квартир, ${result.stats.leads} лідів, ${result.stats.deals} угод.`);
    } else {
      setManualSyncMsg(result?.error ? `Помилка: ${result.error}` : 'Синхронізація завершена.');
    }
    setTimeout(() => setManualSyncMsg(null), 5000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} хв ${s < 10 ? '0' : ''}${s} сек`;
  };

  const lastSyncTime = GPlusSyncService.getLastSyncTime();

  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Синхронізацію ще не проводили';
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 10) return 'Щойно';
      if (diffSec < 60) return `${diffSec} сек тому`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} хв тому`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} год тому`;
      return new Date(timestamp).toLocaleDateString('uk-UA');
    } catch {
      return timestamp;
    }
  };

  const nextSyncDate = cronSyncEngine.getNextSyncDate();
  const nextSyncFormatted = nextSyncDate ? nextSyncDate.toLocaleTimeString('uk-UA') : '--:--:--';

  const totalSyncedEntities =
    buildings.length +
    units.length +
    leads.length +
    deals.length +
    agencies.length +
    expenses.length +
    phoneCalls.length +
    resaleProperties.length +
    rentProperties.length;

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {clearSuccessMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span>✓ Усі дані успішно видалено. База готова до чистої синхронізації з crm.g-plus.app.</span>
        </div>
      )}

      {seedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span>✓ Структуру ЖК за специфікацією G-PLUS успішно збережено в базі даних та локальному сховищі! Всі дані збережуться при перезавантаженні сторінки.</span>
        </div>
      )}

      {manualSyncMsg && (
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span>{manualSyncMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              Синхронізація з G-PLUS CRM API v1
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
              КРОН {intervalSec} сек
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Повне витягування даних із https://crm.g-plus.app/ з фоновим авто-кроном та збереженням стану
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleClearAllDemoData}
            title="Очистити всі локальні кеші та дані"
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистити базу</span>
          </button>

          <button
            onClick={handleSeedRealGPlusStructures}
            title="Завантажити структуру ЖК за специфікацією G-PLUS (збережеться назавжди)"
            className="px-3 py-2 bg-white hover:bg-[#f4f6f8] dark:bg-[#0c1e2b] dark:hover:bg-[#163042] text-[#01283c] dark:text-[#f8fafc] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-[#ffb012]" />
            <span>Завантажити структуру G-PLUS</span>
          </button>

          <button
            onClick={handleTriggerManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Синхронізація...' : 'Синхронізувати всі дані'}</span>
          </button>
        </div>
      </div>

      {/* Live Cron & Persistence Status Card */}
      <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0] dark:border-[#163042]">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isAutoSync ? 'bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] block">
                Статус фонового автоматичного крону
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-black text-[#01283c] dark:text-[#f8fafc]">
                  {isAutoSync ? 'Автоматична синхронізація АКТИВНА' : 'Автоматична синхронізація ПРИЗУПИНЕНА'}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAutoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Таймер та стан синхронізації зберігаються при перезавантаженні сторінки (F5) і не зникають.</span>
              </p>
            </div>
          </div>

          {/* Countdown & Timings */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 px-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-center">
              <span className="text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] block">
                До наступної синхронізації
              </span>
              <span className="text-lg font-black text-[#01283c] dark:text-[#ffb012]">
                {isSyncing ? 'Виконується...' : formatTime(remainingSec)}
              </span>
              <span className="text-[9px] text-[#64748b] block mt-0.5">
                о {nextSyncFormatted}
              </span>
            </div>

            <button
              onClick={handleToggleAutoSync}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                isAutoSync
                  ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                  : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              }`}
            >
              {isAutoSync ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAutoSync ? 'Призупинити' : 'Запустити крон'}</span>
            </button>
          </div>
        </div>

        {/* Interval Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ffb012]" />
            <span>Інтервал автоматичного оновлення (секунди):</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[60, 300, 900, 1800, 3600].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleIntervalChange(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  intervalSec === s
                    ? 'bg-[#01283c] text-white border-[#01283c] dark:bg-[#ffb012] dark:text-[#01283c] dark:border-[#ffb012]'
                    : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] border-[#e2e8f0] dark:border-[#163042]'
                }`}
              >
                {s === 60 ? '60 сек (1 хв)' : s === 300 ? '300 сек (5 хв)' : s === 900 ? '900 сек (15 хв)' : s === 1800 ? '1800 сек (30 хв)' : '3600 сек (1 год)'}
              </button>
            ))}

            {/* Custom seconds input */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-[#64748b]">Власне значення:</span>
              <input
                type="number"
                min="10"
                value={customSec}
                onChange={(e) => setCustomSec(e.target.value)}
                className="w-20 px-2 py-1 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-xs font-bold text-[#01283c] dark:text-[#f8fafc]"
              />
              <span className="text-xs text-[#64748b]">сек</span>
              <button
                type="button"
                onClick={handleCustomIntervalApply}
                className="px-2.5 py-1 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] text-xs font-bold rounded-lg"
              >
                ОК
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED TELEMETRY BANNER: Скільки вже синхронізовано і що саме і коли */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#01283c] to-[#034161] text-white shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ffb012]" />
              <h2 className="text-lg font-black tracking-tight">
                Поточний стан синхронізації з G-PLUS CRM
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Остання синхронізація: <strong className="text-[#ffb012]">{lastSyncTime ? new Date(lastSyncTime).toLocaleString('uk-UA') : 'Ще не виконувалась'}</strong> ({getRelativeTime(lastSyncTime)})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                Всього об'єктів у базі
              </span>
              <span className="text-2xl font-black text-[#ffb012]">
                {totalSyncedEntities} записів
              </span>
            </div>
          </div>
        </div>

        {/* 10 Module Synchronized Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Buildings */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Будинки та ЖК</span>
              <Building2 className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{buildings.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/buildings</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {buildings.map(b => b.name).join(', ') || 'Немає записів'}
            </p>
          </div>

          {/* 2. Units */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Шахівка квартир</span>
              <Layers className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-[#ffb012] mt-1">{units.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/tables/{'{id}'}/units</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {units.length > 0 ? `${units.filter(u => u.status === 'available').length} вільних, ${units.filter(u => u.status === 'booked').length} бронь` : 'Немає записів'}
            </p>
          </div>

          {/* 3. Leads */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Ліди покупців</span>
              <Users className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{leads.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/leads</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {leads.map(l => l.name).slice(0, 2).join(', ') || 'Немає записів'}
            </p>
          </div>

          {/* 4. Deals */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Угоди девелопера</span>
              <Receipt className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{deals.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/deals</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {deals.length > 0 ? `${deals.reduce((acc, d) => acc + (d.contractPrice || 0), 0).toLocaleString('uk-UA')} грн` : 'Немає угод'}
            </p>
          </div>

          {/* 5. Phone Calls */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Телефонія</span>
              <PhoneCall className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-[#ffb012] mt-1">{phoneCalls.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/phone_calls</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {phoneCalls.length > 0 ? `${phoneCalls.filter(c => c.isRecorded).length} з аудіозаписом` : 'Журнал порожній'}
            </p>
          </div>

          {/* 6. Agencies */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Агентства (АН)</span>
              <Users className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{agencies.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/agencies</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {agencies.map(a => a.name).slice(0, 1).join(', ') || 'Немає АН'}
            </p>
          </div>

          {/* 7. Expenses */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Витрати девелопера</span>
              <DollarSign className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{expenses.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/expenses</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {expenses.length > 0 ? `${expenses.reduce((acc, x) => acc + (x.amount || 0), 0).toLocaleString('uk-UA')} грн` : 'Немає витрат'}
            </p>
          </div>

          {/* 8. Resale */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Вторинний ринок</span>
              <Home className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{resaleProperties.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/resale</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {resaleProperties.length} пропозицій
            </p>
          </div>

          {/* 9. Rent */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Оренда</span>
              <Home className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{rentProperties.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">/api/v1/rent</span>
            <p className="text-[10px] text-slate-300 truncate mt-1">
              {rentProperties.length} об'єктів в оренді
            </p>
          </div>

          {/* 10. Database Status */}
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">База Supabase</span>
              <Database className="w-4 h-4 text-[#ffb012]" />
            </div>
            <p className="text-sm font-black text-white mt-2 truncate">
              {isSupabaseOnline ? '🟢 Підключено' : '🟡 Локально'}
            </p>
            <button
              onClick={() => setIsSupabaseConfigModalOpen(true)}
              className="text-[10px] text-[#ffb012] font-bold hover:underline block mt-1"
            >
              Налаштувати БД →
            </button>
          </div>
        </div>
      </div>

      {/* SYNCHRONIZED RECORDS INSPECTOR: Дивитись детально що саме завантажено */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e2e8f0] dark:border-[#163042] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#ffb012]" />
              <span>Інспектор синхронізованих даних (Що саме збережено в CRM)</span>
            </h3>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
              Всі ці записи постійно збережені в базі і доступні у відповідних вкладках системи
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setInspectorTab('buildings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inspectorTab === 'buildings'
                  ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]'
                  : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b]'
              }`}
            >
              Будинки ({buildings.length})
            </button>
            <button
              onClick={() => setInspectorTab('units')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inspectorTab === 'units'
                  ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]'
                  : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b]'
              }`}
            >
              Квартири ({units.length})
            </button>
            <button
              onClick={() => setInspectorTab('leads')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inspectorTab === 'leads'
                  ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]'
                  : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b]'
              }`}
            >
              Ліди ({leads.length})
            </button>
            <button
              onClick={() => setInspectorTab('deals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inspectorTab === 'deals'
                  ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]'
                  : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b]'
              }`}
            >
              Угоди ({deals.length})
            </button>
            <button
              onClick={() => setInspectorTab('calls')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inspectorTab === 'calls'
                  ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]'
                  : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b]'
              }`}
            >
              Дзвінки ({phoneCalls.length})
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {inspectorTab === 'buildings' && (
            <div className="space-y-3">
              {buildings.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748b]">
                  Будинків ще не завантажено. Натисніть «Завантажити структуру G-PLUS» або підключіть API токен.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {buildings.map((b) => (
                    <div key={b.id} className="p-3.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#01283c] dark:text-[#f8fafc] text-sm">{b.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          {b.status === 'completed' ? 'Здано' : 'Будується'}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b]">{b.address}, {b.city}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#64748b] pt-1 border-t border-[#e2e8f0] dark:border-[#163042]">
                        <span>Поверхів: {b.floorsCount}</span>
                        <span>•</span>
                        <span>Секцій: {b.sectionsCount}</span>
                        <span>•</span>
                        <span>Термін: {b.completionDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {inspectorTab === 'units' && (
            <div className="space-y-2">
              {units.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748b]">
                  Квартир ще не завантажено.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] dark:border-[#163042] text-[#64748b]">
                        <th className="pb-2 font-bold">№ приміщення</th>
                        <th className="pb-2 font-bold">Поверх</th>
                        <th className="pb-2 font-bold">Кімнат</th>
                        <th className="pb-2 font-bold">Площа</th>
                        <th className="pb-2 font-bold">Ціна за м²</th>
                        <th className="pb-2 font-bold">Загальна ціна</th>
                        <th className="pb-2 font-bold">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
                      {units.slice(0, 10).map((u) => (
                        <tr key={u.id} className="text-[#01283c] dark:text-[#f8fafc]">
                          <td className="py-2 font-bold">{u.type === 'commercial' ? `Ком. №${u.number}` : `Кв. №${u.number}`}</td>
                          <td className="py-2">{u.floor} поверх</td>
                          <td className="py-2">{u.rooms} кімн.</td>
                          <td className="py-2 font-mono">{u.totalArea} м²</td>
                          <td className="py-2 font-mono">${u.pricePerSqm}</td>
                          <td className="py-2 font-mono font-bold">${u.totalPrice.toLocaleString()}</td>
                          <td className="py-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.status === 'available' ? 'bg-emerald-100 text-emerald-800' : u.status === 'booked' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {u.status === 'available' ? 'Вільна' : u.status === 'booked' ? 'Бронь' : 'Продано'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {units.length > 10 && (
                    <p className="text-[11px] text-[#64748b] mt-2">
                      Показано перші 10 із {units.length} приміщень. Повний інтерактивний план доступний у вкладці «Шахівка».
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {inspectorTab === 'leads' && (
            <div className="space-y-2">
              {leads.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748b]">
                  Лідів ще не синхронізовано.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leads.map((l) => (
                    <div key={l.id} className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{l.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase">
                          {l.status}
                        </span>
                      </div>
                      <p className="text-[#64748b] font-mono">{l.phone || 'Без телефону'} • {l.email || 'Без email'}</p>
                      <p className="text-[#64748b] text-[11px] line-clamp-1">{l.notes || 'Без нотаток'}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#e2e8f0] dark:border-[#163042] text-[10px] text-[#64748b]">
                        <span>Джерело: {l.source}</span>
                        <span>Відповідальний: {l.assignedAgent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {inspectorTab === 'deals' && (
            <div className="space-y-2">
              {deals.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748b]">
                  Угод ще не синхронізовано.
                </div>
              ) : (
                <div className="space-y-2">
                  {deals.map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">{d.title}</span>
                        <span className="text-[#64748b] text-[11px]">{d.propertyAddress} • Клієнт: {d.sellerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#01283c] dark:text-[#ffb012] block">
                          {d.contractPrice.toLocaleString('uk-UA')} грн
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {d.stage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {inspectorTab === 'calls' && (
            <div className="space-y-2">
              {phoneCalls.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748b]">
                  Журнал дзвінків порожній.
                </div>
              ) : (
                <div className="space-y-2">
                  {phoneCalls.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                          {c.callerName} ({c.callerPhone})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {c.direction === 'inbound' ? 'Вхідний' : 'Вихідний'} ({c.durationSeconds} сек)
                        </span>
                      </div>
                      {c.transcription && (
                        <p className="text-[11px] text-[#64748b] italic bg-white dark:bg-[#0c1e2b] p-2 rounded-lg border border-[#e2e8f0] dark:border-[#163042]">
                          «{c.transcription}»
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* G-Plus API Token Configuration Form */}
      <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#163042]">
          <h2 className="text-base font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#ffb012]" />
            <span>Параметри доступу до G-PLUS CRM Public API</span>
          </h2>
          <a
            href="https://crm.g-plus.app/manage/profile"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-[#01283c] dark:text-[#ffb012] hover:underline flex items-center gap-1"
          >
            <span>Отримати токен у профілі G-Plus</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                  API Токен доступу (Header: Authorization: Token &lt;key&gt;)
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-[#64748b] hover:text-[#01283c] dark:hover:text-[#ffb012] flex items-center gap-1 font-semibold"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showToken ? 'Сховати' : 'Показати'}</span>
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setTokenState(e.target.value.trim())}
                  placeholder="Введіть API Token з вашого профілю G-Plus..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] focus:border-[#01283c] dark:focus:border-[#ffb012] rounded-xl text-sm font-mono text-[#01283c] dark:text-[#f8fafc] focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-1">
                Токен автоматично зберігається в системі та використовується для регулярного авто-крону.
              </p>
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                Base Endpoint URL (Проксі для обходу блокування CORS)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrlState(e.target.value.trim())}
                placeholder="/api/gplus"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] focus:border-[#01283c] dark:focus:border-[#ffb012] rounded-xl text-sm font-mono text-[#01283c] dark:text-[#f8fafc] focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ✓ Використовує локальний проксі <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">/api/gplus</code> для безпечного обходу блокування CORS без помилок `Failed to fetch`.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestToken}
              disabled={isTestingToken || !token}
              className="px-4 py-2 border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] hover:bg-[#e2e8f0] disabled:opacity-50"
            >
              {isTestingToken ? 'Перевірка...' : 'Перевірити авторизацію'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl font-bold shadow-xs"
            >
              Зберегти токен
            </button>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Збережено!
              </span>
            )}
          </div>

          {tokenTestResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                tokenTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {tokenTestResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{tokenTestResult.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* Sync Execution History Logs */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ffb012]" />
            <span>Історія останніх синхронізацій</span>
          </h3>
          <span className="text-xs text-[#64748b]">
            Збережено записів: {syncLogs.length}
          </span>
        </div>

        <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
          {syncLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748b]">
              Ще не було виконано жодної синхронізації. Натисніть «Синхронізувати всі дані» або «Завантажити структуру G-PLUS».
            </div>
          ) : (
            syncLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status === 'success' ? 'УСПІШНО' : 'ПОМИЛКА'}
                    </span>
                    <span className="font-mono text-[#64748b]">{new Date(log.timestamp).toLocaleString('uk-UA')}</span>
                    <span className="text-[#64748b]">({log.durationMs} мс)</span>
                  </div>

                  <p className="text-[#01283c] dark:text-[#f8fafc] font-medium">
                    {log.message || log.error}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] text-[#64748b] pt-1">
                    <span>ЖК: {log.recordsFetched.buildings}</span>
                    <span>•</span>
                    <span>Квартири: {log.recordsFetched.units}</span>
                    <span>•</span>
                    <span>Ліди: {log.recordsFetched.leads}</span>
                    <span>•</span>
                    <span>Угоди: {log.recordsFetched.deals}</span>
                    <span>•</span>
                    <span>АН: {log.recordsFetched.agencies}</span>
                    <span>•</span>
                    <span>Дзвінки: {log.recordsFetched.phoneCalls}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
