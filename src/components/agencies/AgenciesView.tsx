import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Agency } from '../../types';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  DollarSign,
  Briefcase,
  ChevronRight
} from 'lucide-react';

export const AgenciesView: React.FC = () => {
  const { agencies, setActiveTab } = useCrm();
  const [searchFilter, setSearchFilter] = useState('');

  const filteredAgencies = agencies.filter((a) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchPhone = a.phone.includes(q);
      const matchCity = a.address.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  const totalDeals = agencies.reduce((sum, a) => sum + a.activeDealsCount, 0);
  const totalVolume = agencies.reduce((sum, a) => sum + a.totalSoldVolume, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              Агентства нерухомості та рієлтори
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
              G-PLUS API v1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Партнерська мережа агентств, рієлторів, облік угод та виплата комісійних девелопера
          </p>
        </div>

        <button
          onClick={() => alert('Форма додавання нового агентства нерухомості відкрита')}
          className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Додати агентство (АН)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Акредитованих АН</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            {agencies.length}
          </p>
          <span className="text-[11px] text-[#01283c] dark:text-[#ffb012] font-semibold mt-0.5 block">
            Офіційні партнери девелопера Вертикаль
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Активних партнерських угод</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#ffb012] mt-1 tracking-tight">
            {totalDeals}
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">
            У процесі оформлення або закриття
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Обсяг проданого пулу</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            ${(totalVolume / 1000).toLocaleString()}k
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">
            Загальний обсяг партнерських продажів
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Пошук АН за назвою або адресою..."
            className="w-full pl-10 pr-3 py-1.5 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>
      </div>

      {/* Agencies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgencies.map((agency) => (
          <div
            key={agency.id}
            className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                    {agency.name}
                  </h3>
                  {agency.edrpou && (
                    <span className="text-[10px] text-[#64748b] font-mono">
                      ЄДРПОУ: {agency.edrpou}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012] border border-[#ffb012]/30">
                  {agency.commissionRate}% комісія
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-[#64748b] dark:text-[#94a3b8]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#01283c] dark:text-[#ffb012]" />
                  <span>{agency.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#01283c] dark:text-[#ffb012]" />
                  <span>{agency.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#01283c] dark:text-[#ffb012]" />
                  <span>{agency.address}</span>
                </div>
              </div>

              {/* Agency Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs text-center">
                <div>
                  <span className="text-[10px] text-[#64748b]">Угод закрито</span>
                  <p className="font-black text-[#01283c] dark:text-[#f8fafc]">{agency.activeDealsCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b]">Обсяг продажів</span>
                  <p className="font-black text-[#01283c] dark:text-[#ffb012]">${(agency.totalSoldVolume / 1000).toFixed(0)}k</p>
                </div>
              </div>

              {/* Attached Employees */}
              {agency.employees && agency.employees.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                    Рієлтори агентства ({agency.employees.length})
                  </span>
                  <div className="space-y-1.5">
                    {agency.employees.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#f4f6f8] dark:bg-[#06131c]/60">
                        <div>
                          <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">{emp.name}</span>
                          <span className="text-[10px] text-[#64748b]">{emp.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#ffb012] font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{emp.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#64748b]">{agency.notes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
