import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { X, User, Lock, Mail, Check, AlertCircle, LogOut, Shield, KeyRound, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { supabaseUser, currentUser, signOutSupabase, setIsSupabaseConfigModalOpen } = useCrm();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Менеджер відділу продажу');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      setErrorMsg('Спочатку підключіть базу даних Supabase у налаштуваннях.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role
            }
          }
        });
        if (error) throw error;
        setSuccessMsg('Реєстрація успішна! Ви можете увійти до системи або підтвердити email.');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        setSuccessMsg('Авторизація успішна! Завантаження робочого простору...');
        setTimeout(() => onClose(), 800);
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        setSuccessMsg('Інструкції з відновлення пароля надіслано на вашу пошту.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка виконання операції авторизації.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutSupabase();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-3xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between bg-[#f4f6f8] dark:bg-[#06131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
                {supabaseUser
                  ? 'Обліковий запис'
                  : mode === 'signin'
                  ? 'Вхід у VRTKL CRM'
                  : mode === 'signup'
                  ? 'Створення облікового запису'
                  : 'Відновлення доступу'}
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">Supabase PostgreSQL & Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#163042]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged in state */}
        {supabaseUser ? (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#01283c]/5 dark:bg-[#ffb012]/10 border border-[#e2e8f0] dark:border-[#163042] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#01283c] dark:text-[#f8fafc] text-sm">
                  {currentUser.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  АКТИВНА СЕСІЯ
                </span>
              </div>
              <p className="text-[#64748b] dark:text-[#94a3b8] font-mono">{supabaseUser.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#01283c] text-[#ffb012] font-bold text-[10px]">
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-[#64748b]">
                  ID: {supabaseUser.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsSupabaseConfigModalOpen(true);
                }}
                className="text-xs font-bold text-[#01283c] dark:text-[#ffb012] hover:underline flex items-center gap-1"
              >
                <span>Налаштування бази даних</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Вийти</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for sign in / sign up / reset */
          <div className="p-6 space-y-4 text-xs">
            {/* Mode Tabs */}
            <div className="flex border-b border-[#e2e8f0] dark:border-[#163042]">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
                  mode === 'signin'
                    ? 'border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012]'
                    : 'border-transparent text-[#64748b]'
                }`}
              >
                Вхід
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
                  mode === 'signup'
                    ? 'border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012]'
                    : 'border-transparent text-[#64748b]'
                }`}
              >
                Реєстрація
              </button>
              <button
                type="button"
                onClick={() => { setMode('reset'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
                  mode === 'reset'
                    ? 'border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012]'
                    : 'border-transparent text-[#64748b]'
                }`}
              >
                Скидання
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block">ПІБ співробітника</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ростислав Мельничук"
                      className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block">Посада у компанії</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                    >
                      <option value="Керівник відділу продажу">Керівник відділу продажу</option>
                      <option value="Менеджер з первинної нерухомості">Менеджер з первинної нерухомості</option>
                      <option value="Спеціаліст з диспозицій та інвесторів">Спеціаліст з диспозицій та інвесторів</option>
                      <option value="Партнер-рієлтор">Партнер-рієлтор</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block">Email адреса</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@vertykal.if.ua"
                    className="w-full pl-9 pr-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block">Пароль</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {isLoading
                      ? 'Обробка...'
                      : mode === 'signin'
                      ? 'Увійти в кабінет'
                      : mode === 'signup'
                      ? 'Створити акаунт у Supabase'
                      : 'Надіслати лінк відновлення'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
