import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { getStoredSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';
import { CrmDbService } from '../../services/crmDbService';
import {
  X,
  Database,
  Check,
  AlertCircle,
  Copy,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Table,
  UploadCloud,
  FileCode,
  Sliders
} from 'lucide-react';

interface SupabaseConfigModalProps {
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ onClose }) => {
  const {
    isSupabaseOnline,
    saveSupabaseSettings,
    disconnectSupabase,
    refreshAllData,
    buildings,
    sections,
    units,
    leads,
    deals,
    agencies,
    expenses,
    phoneCalls,
    resaleProperties,
    rentProperties
  } = useCrm();

  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Tab view inside modal
  const [activeTab, setActiveTab] = useState<'config' | 'audit' | 'sql'>('config');

  // Database Health Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // Sync to Supabase state
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    const res = await CrmDbService.verifyDatabaseHealth();
    setAuditResult(res);
    setIsAuditing(false);
  };

  const handlePushAllToSupabase = async () => {
    setIsPushing(true);
    setPushResult(null);
    try {
      await CrmDbService.saveSyncedData({
        buildings,
        sections,
        units,
        leads,
        deals,
        agencies,
        expenses,
        phoneCalls,
        resaleProperties,
        rentProperties
      });
      await refreshAllData();
      setPushResult(`✓ Успішно синхронізовано з Supabase: ${buildings.length} ЖК, ${units.length} квартир, ${leads.length} лідів, ${deals.length} угод!`);
      // re-run audit
      await handleRunAudit();
    } catch (err: any) {
      setPushResult(`Помилка запису: ${err?.message || 'Не вдалося зберегти дані в Supabase'}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSupabaseSettings(url, anonKey);
    await refreshAllData();
    onClose();
  };

  const handleDisconnect = () => {
    disconnectSupabase();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    setAuditResult(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-3xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between bg-[#f4f6f8] dark:bg-[#06131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
                Керування та аудит бази даних Supabase
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                Перевірка налаштування схеми, таблиць та коректності запису даних
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#163042]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e2e8f0] dark:border-[#163042] px-6 bg-slate-50 dark:bg-[#081824] text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Параметри підключення</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              if (!auditResult) handleRunAudit();
            }}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Аудит таблиць БД ({auditResult?.tables?.length || 13})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Оновлена SQL-схема</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* TAB 1: Config */}
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Status Indicator */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isSupabaseOnline
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5" />
                  <div>
                    <span className="font-bold text-sm block">
                      {isSupabaseOnline ? 'Supabase підключено та активно' : 'Працює в режимі автономного кешу (LocalStorage)'}
                    </span>
                    <span className="text-[11px] opacity-80 block">
                      {isSupabaseOnline
                        ? 'Усі операції CRM записуються в хмарний PostgreSQL'
                        : 'Вкажіть URL та anon-ключ для синхронізації з хмарою'}
                    </span>
                  </div>
                </div>
                {isSupabaseOnline && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black">
                    ONLINE
                  </span>
                )}
              </div>

              {/* Form fields */}
              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block">
                  Project URL (URL проекту Supabase)
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-mono text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block">
                  Anon Public API Key (Публічний ключ anon)
                </label>
                <input
                  type="password"
                  required
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-mono text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              {/* Test connection & Result feedback */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !url || !anonKey}
                  className="px-4 py-2 rounded-xl border border-[#e2e8f0] dark:border-[#163042] bg-[#f4f6f8] dark:bg-[#06131c] font-bold text-[#01283c] dark:text-[#f8fafc] hover:bg-[#e2e8f0] transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Перевірка...' : 'Перевірити з’єднання (Ping)'}</span>
                </button>

                {isSupabaseOnline && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 font-bold"
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

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0] dark:border-[#163042]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[#64748b] hover:text-[#01283c] font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl font-bold transition-all shadow-xs"
                >
                  Зберегти налаштування
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Table Health & Write Audit */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                <div>
                  <span className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc] block">
                    Діагностика схеми та запису в таблиці
                  </span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Перевіряє наявність кожної таблиці, права RLS та успішність запису/читання
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunAudit}
                    disabled={isAuditing}
                    className="px-3 py-1.5 rounded-xl bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>{isAuditing ? 'Аналіз...' : 'Перевірити знову'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushAllToSupabase}
                    disabled={isPushing || !isSupabaseOnline}
                    className="px-3 py-1.5 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
                    <span>{isPushing ? 'Запис...' : 'Синхронізувати все в БД'}</span>
                  </button>
                </div>
              </div>

              {pushResult && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                  {pushResult}
                </div>
              )}

              {auditResult && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border text-xs font-medium ${
                    auditResult.overallStatus === 'connected'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : auditResult.overallStatus === 'schema_needed'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {auditResult.message}
                  </div>

                  <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042] border border-[#e2e8f0] dark:border-[#163042] rounded-2xl overflow-hidden">
                    {auditResult.tables.map((tbl: any) => (
                      <div key={tbl.table} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-[#0c1e2b]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{tbl.title}</span>
                            <code className="text-[10px] font-mono text-[#64748b]">public.{tbl.table}</code>
                          </div>
                          {tbl.error && (
                            <p className="text-[11px] text-rose-600 mt-0.5">{tbl.error}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#64748b] text-[11px]">
                            {tbl.count} рядків
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tbl.status === 'ok'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tbl.status === 'empty'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tbl.status === 'ok' ? 'АКТИВНА' : tbl.status === 'empty' ? 'ПОРОЖНЯ' : 'ВІДСУТНЯ'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Updated SQL Schema */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                <div>
                  <span className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc] block">
                    Повний SQL-скрипт структури Supabase
                  </span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Скопіюйте та вставте в <strong>Supabase Dashboard → SQL Editor → New query → Run</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-xl bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Скопійовано в буфер!' : 'Скопіювати SQL-скрипт'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto space-y-1">
                <p className="text-emerald-400">-- 1. Створено всі таблиці з підтримкою текстових та UUID ідентифікаторів</p>
                <p className="text-emerald-400">-- 2. Додано зв'язки FOREIGN KEY (buildings, building_sections, units, bookings, leads, deals)</p>
                <p className="text-emerald-400">-- 3. Налаштовано RLS-політики відкритого читання/запису для клієнта</p>
                <p className="text-emerald-400">-- 4. Створено тригер авто-створення профілю при реєстрації через Supabase Auth</p>
                <p className="text-slate-400 mt-2">CREATE TABLE IF NOT EXISTS public.buildings ( id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, ... );</p>
                <p className="text-slate-400">CREATE TABLE IF NOT EXISTS public.units ( id TEXT PRIMARY KEY, building_id TEXT REFERENCES public.buildings(id), ... );</p>
                <p className="text-slate-400">CREATE TABLE IF NOT EXISTS public.leads ( id TEXT PRIMARY KEY, name TEXT NOT NULL, ... );</p>
                <p className="text-slate-400">CREATE TABLE IF NOT EXISTS public.deals ( id TEXT PRIMARY KEY, lead_id TEXT REFERENCES public.leads(id), ... );</p>
                <p className="text-slate-400">CREATE TABLE IF NOT EXISTS public.phone_calls ( id TEXT PRIMARY KEY, caller_name TEXT NOT NULL, ... );</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
