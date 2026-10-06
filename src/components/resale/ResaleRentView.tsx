import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { ResaleProperty, RentProperty } from '../../types';
import {
  Home,
  Key,
  Plus,
  Search,
  Globe,
  CheckCircle2,
  Share2,
  Clock,
  Phone,
  DollarSign
} from 'lucide-react';
import { convertUsdToUah } from '../../services/nbuService';

export const ResaleRentView: React.FC = () => {
  const { resaleProperties, rentProperties, nbuRate } = useCrm();

  const [activeTab, setActiveTab] = useState<'resale' | 'rent'>('resale');
  const [publishedSuccessId, setPublishedSuccessId] = useState<string | null>(null);

  const handlePublishToggle = (id: string) => {
    setPublishedSuccessId(id);
    setTimeout(() => setPublishedSuccessId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              Вторинний ринок та Оренда нерухомості
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
              G-PLUS API v1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Управління квартирами перепродажу від інвесторів та об'єктами оренди (/api/v1/resale & /api/v1/rent)
          </p>
        </div>

        <button
          onClick={() => alert('Форма додавання об’єкта відкрита')}
          className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'resale' ? 'Додати об’єкт на перепродаж' : 'Додати об’єкт під оренду'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] dark:border-[#163042]">
        <button
          onClick={() => setActiveTab('resale')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'resale'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Вторинний ринок / Перепродаж ({resaleProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rent')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rent'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Оренда житлової та комерційної нерухомості ({rentProperties.length})</span>
        </button>
      </div>

      {/* Resale List */}
      {activeTab === 'resale' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resaleProperties.map((prop) => {
            const priceUah = convertUsdToUah(prop.price, nbuRate.usd);
            const isJustPublished = publishedSuccessId === prop.id;

            return (
              <div
                key={prop.id}
                className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">{prop.title}</h3>
                      <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{prop.address}</p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Активний
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs text-center">
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Кімнат</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.rooms}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Площа</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.totalArea} м²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Поверх</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.floor}/{prop.totalFloors}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Власник / Інвестор:</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.ownerName}</span>
                      <span className="text-[10px] text-[#64748b] block">{prop.ownerPhone}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-[#01283c] dark:text-[#ffb012] block">
                        ${prop.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#64748b] block">
                        (~{priceUah.toLocaleString()} ₴)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#64748b]">Комісія: {prop.commissionPercent}%</span>

                  <button
                    onClick={() => handlePublishToggle(prop.id)}
                    className="px-3 py-1.5 rounded-xl border border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012] font-bold text-xs flex items-center gap-1.5 hover:bg-[#01283c]/5 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{isJustPublished ? 'Опубліковано на портали!' : 'Опублікувати на портали'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rent List */}
      {activeTab === 'rent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rentProperties.map((prop) => {
            const isJustPublished = publishedSuccessId === prop.id;

            return (
              <div
                key={prop.id}
                className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">{prop.title}</h3>
                      <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{prop.address}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prop.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {prop.status === 'available' ? 'Вільна' : 'Орендована'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs text-center">
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Кімнат</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.rooms}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Площа</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.totalArea} м²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Поверх</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">{prop.floor}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Орендар:</span>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                        {prop.tenantName || 'Пошук орендаря'}
                      </span>
                      {prop.leaseEnd && (
                        <span className="text-[10px] text-[#64748b] block">Договір до: {prop.leaseEnd}</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-[#01283c] dark:text-[#ffb012] block">
                        ${prop.monthlyPrice} / міс
                      </span>
                      <span className="text-[10px] text-[#64748b] block">
                        Завдаток: ${prop.depositAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#64748b]">Завантажено з G-PLUS</span>

                  <button
                    onClick={() => handlePublishToggle(prop.id)}
                    className="px-3 py-1.5 rounded-xl border border-[#01283c] dark:border-[#ffb012] text-[#01283c] dark:text-[#ffb012] font-bold text-xs flex items-center gap-1.5 hover:bg-[#01283c]/5 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{isJustPublished ? 'Опубліковано!' : 'Опублікувати'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
