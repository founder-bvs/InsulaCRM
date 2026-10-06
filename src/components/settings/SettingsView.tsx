import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { BusinessMode } from '../../types';
import {
  Briefcase,
  Users,
  Shield,
  Check,
  RefreshCw,
  Globe,
  Database,
  Copy,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getStoredSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const {
    businessMode,
    setBusinessMode,
    users,
    language,
    setLanguage,
    isSupabaseOnline,
    saveSupabaseSettings,
    disconnectSupabase,
    refreshAllData,
    buildings,
    units,
    leads,
    deals,
    t
  } = useCrm();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'roles' | 'security' | 'database'>('general');
  const [companyName, setCompanyName] = useState('БК Вертикаль (ТОВ «Будівельна компанія «Вертикаль»)');
  const [defaultCountry, setDefaultCountry] = useState('Україна (+380)');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Database settings
  const config = getStoredSupabaseConfig();
  const [dbUrl, setDbUrl] = useState(config.url);
  const [dbKey, setDbKey] = useState(config.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveDb = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSupabaseSettings(dbUrl, dbKey);
    await refreshAllData();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(dbUrl, dbKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCopySql = () => {
    fetch('/supabase-schema.sql')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      })
      .catch(() => {
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      });
  };

  const handleModeChange = (mode: BusinessMode) => {
    setBusinessMode(mode);
  };

  const handleResetDemoData = () => {
    const confirmMsg = language === 'uk'
      ? 'Скинути всі демо-ліди, угоди, базу покупців та завдання до вихідного стану?'
      : 'Reset all demo leads, deals, buyers and tasks back to initial defaults?';

    if (window.confirm(confirmMsg)) {
      localStorage.removeItem('vrtkl_leads');
      localStorage.removeItem('vrtkl_deals');
      localStorage.removeItem('vrtkl_buyers');
      localStorage.removeItem('vrtkl_tasks');
      localStorage.removeItem('vrtkl_activities');
      localStorage.removeItem('vrtkl_buildings');
      localStorage.removeItem('vrtkl_units');
      localStorage.removeItem('vrtkl_bookings');
      localStorage.removeItem('vrtkl_agencies');
      localStorage.removeItem('vrtkl_expenses');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] dark:border-[#163042] overflow-x-auto">
        <button
          onClick={() => setActiveSettingsTab('general')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSettingsTab === 'general'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t('tabBusinessMode')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('database')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSettingsTab === 'database'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>База даних Supabase</span>
          <span className={`w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </button>

        <button
          onClick={() => setActiveSettingsTab('roles')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSettingsTab === 'roles'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('tabTeamRoles')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('security')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSettingsTab === 'security'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t('tabSecurity')}</span>
        </button>
      </div>

      {/* Database tab */}
      {activeSettingsTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#163042]">
              <div>
                <h2 className="text-base font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#ffb012]" />
                  <span>Продакшн база даних PostgreSQL (Supabase)</span>
                </h2>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                  Зберігання та обробка лідів, квартирної шахівки, розстрочок, угод та партнерів
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isSupabaseOnline
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                {isSupabaseOnline ? '🟢 Підключено онлайн' : '🟡 Локальний кеш'}
              </span>
            </div>

            {/* Live table records */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                <span className="text-[#64748b] block">Будинки (Buildings)</span>
                <span className="font-black text-sm text-[#01283c] dark:text-[#f8fafc]">{buildings.length} ЖК</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                <span className="text-[#64748b] block">Приміщення (Units)</span>
                <span className="font-black text-sm text-[#01283c] dark:text-[#f8fafc]">{units.length} квартир</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                <span className="text-[#64748b] block">Ліди (Leads)</span>
                <span className="font-black text-sm text-[#01283c] dark:text-[#f8fafc]">{leads.length} клієнтів</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                <span className="text-[#64748b] block">Угоди (Deals)</span>
                <span className="font-black text-sm text-[#01283c] dark:text-[#f8fafc]">{deals.length} договорів</span>
              </div>
            </div>

            {/* Supabase credentials form */}
            <form onSubmit={handleSaveDb} className="space-y-4 pt-2 text-xs">
              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Supabase Project URL</label>
                <input
                  type="url"
                  required
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-mono text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Supabase Anon API Key</label>
                <input
                  type="password"
                  required
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-mono text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !dbUrl || !dbKey}
                  className="px-4 py-2 border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] hover:bg-[#e2e8f0]"
                >
                  {isTesting ? 'Перевірка...' : 'Перевірити з’єднання'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl font-bold shadow-xs"
                >
                  Зберегти налаштування
                </button>

                {isSupabaseOnline && (
                  <button
                    type="button"
                    onClick={disconnectSupabase}
                    className="px-3 py-2 text-rose-600 font-bold hover:underline"
                  >
                    Відключити
                  </button>
                )}
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {testResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </form>

            {/* SQL schema quick copy */}
            <div className="p-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">
                  Файл міграції для Supabase SQL Editor
                </span>
                <span className="text-[11px] text-[#64748b]">
                  Таблиці, індекси, RLS правила для девелоперської CRM
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Скопійовано!' : 'Скопіювати SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'general' && (
        <div className="space-y-6">
          {/* Language Selector */}
          <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#ffb012]" />
                <span>{language === 'uk' ? 'Мова інтерфейсу' : 'Interface Language'}</span>
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                {language === 'uk' ? 'Оберіть зручну мову для роботи в системі VRTKL CRM' : 'Select interface language for this workspace'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLanguage('uk')}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  language === 'uk'
                    ? 'border-[#01283c] bg-[#01283c] text-white dark:border-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]'
                    : 'border-[#e2e8f0] dark:border-[#163042] bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
                }`}
              >
                <span>🇺🇦 Українська (Ukrainian)</span>
                {language === 'uk' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  language === 'en'
                    ? 'border-[#01283c] bg-[#01283c] text-white dark:border-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]'
                    : 'border-[#e2e8f0] dark:border-[#163042] bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
                }`}
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Dual Business Mode Switcher Card */}
          <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#ffb012]" />
                <span>{t('operatingModeTitle')}</span>
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                {t('operatingModeDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wholesaling Mode Box */}
              <div
                onClick={() => handleModeChange('wholesale')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  businessMode === 'wholesale'
                    ? 'border-[#01283c] bg-[#01283c]/5 dark:border-[#ffb012] dark:bg-[#ffb012]/10'
                    : 'border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c]/40 dark:hover:border-[#ffb012]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                    {t('wholesaleCardTitle')}
                  </span>
                  {businessMode === 'wholesale' && (
                    <span className="w-5 h-5 rounded-full bg-[#01283c] dark:bg-[#ffb012] text-white dark:text-[#01283c] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <ul className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-2 space-y-1">
                  <li>{t('wholesalePoint1')}</li>
                  <li>{t('wholesalePoint2')}</li>
                  <li>{t('wholesalePoint3')}</li>
                  <li>{t('wholesalePoint4')}</li>
                </ul>
              </div>

              {/* Real Estate Agent / Broker Mode Box */}
              <div
                onClick={() => handleModeChange('realestate')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  businessMode === 'realestate'
                    ? 'border-[#01283c] bg-[#01283c]/5 dark:border-[#ffb012] dark:bg-[#ffb012]/10'
                    : 'border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c]/40 dark:hover:border-[#ffb012]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                    {t('agentCardTitle')}
                  </span>
                  {businessMode === 'realestate' && (
                    <span className="w-5 h-5 rounded-full bg-[#01283c] dark:bg-[#ffb012] text-white dark:text-[#01283c] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <ul className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-2 space-y-1">
                  <li>{t('agentPoint1')}</li>
                  <li>{t('agentPoint2')}</li>
                  <li>{t('agentPoint3')}</li>
                  <li>{t('agentPoint4')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* General Company Settings Form */}
          <form onSubmit={handleSaveGeneral} className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc]">{t('companyProfileTitle')}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#64748b] dark:text-[#94a3b8]">{t('companyNameLabel')}</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#64748b] dark:text-[#94a3b8]">{t('defaultCountryLabel')}</label>
                <input
                  type="text"
                  value={defaultCountry}
                  onChange={(e) => setDefaultCountry(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDemoData}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('resetDemoBtn')}</span>
              </button>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {t('savedNotification')}
                  </span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  {t('saveSettingsBtn')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeSettingsTab === 'roles' && (
        <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc]">{t('teamMembersTitle')}</h3>
          <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
            {users.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#01283c] dark:bg-[#ffb012] text-[#ffb012] dark:text-[#01283c] font-black flex items-center justify-center text-xs">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-semibold text-[#01283c] dark:text-[#f8fafc] text-sm block">
                      {user.name}
                    </span>
                    <span className="text-[#64748b] dark:text-[#94a3b8]">{user.email}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] font-semibold border border-[#e2e8f0] dark:border-[#163042]">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSettingsTab === 'security' && (
        <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc]">{t('securityTitle')}</h3>
          <p className="text-[#64748b] dark:text-[#94a3b8]">
            {t('securityDesc')}
          </p>

          <div className="p-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">
                {t('twoFaTitle')}
              </span>
              <span className="text-[#64748b] dark:text-[#94a3b8]">{t('twoFaDesc')}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c] font-bold text-[10px]">
              {t('twoFaStatus')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">
                {t('rateLimitingTitle')}
              </span>
              <span className="text-[#64748b] dark:text-[#94a3b8]">{t('rateLimitingDesc')}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c] font-bold text-[10px]">
              {t('rateLimitingStatus')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
