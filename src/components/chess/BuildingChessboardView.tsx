import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Unit, UnitStatus } from '../../types';
import { UnitBookingModal } from './UnitBookingModal';
import {
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  Home,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Search,
  Database
} from 'lucide-react';
import { convertUsdToUah, formatCurrency } from '../../services/nbuService';

export const BuildingChessboardView: React.FC = () => {
  const {
    buildings,
    sections,
    units,
    selectedBuildingId,
    setSelectedBuildingId,
    nbuRate,
    isSupabaseOnline,
    setIsSupabaseConfigModalOpen,
    setActiveTab,
    refreshAllData
  } = useCrm();

  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRooms, setSelectedRooms] = useState<string>('all');
  const [currency, setCurrency] = useState<'USD' | 'UAH'>('USD');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active building
  const activeBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  // Sections for active building
  const buildingSections = sections.filter(s => s.buildingId === (activeBuilding?.id || ''));

  // Units for active building
  const buildingUnits = units.filter(u => {
    if (activeBuilding && u.buildingId !== activeBuilding.id) return false;
    if (selectedSectionId !== 'all' && u.sectionId !== selectedSectionId) return false;
    if (selectedStatus !== 'all' && u.status !== selectedStatus) return false;
    if (selectedRooms !== 'all') {
      if (selectedRooms === 'commercial' && u.type !== 'commercial') return false;
      if (selectedRooms !== 'commercial' && u.rooms !== Number(selectedRooms)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = u.number.toLowerCase().includes(q);
      const matchClient = u.clientName?.toLowerCase().includes(q);
      if (!matchNum && !matchClient) return false;
    }
    return true;
  });

  // Calculate building stats
  const totalUnits = buildingUnits.length;
  const availableUnits = buildingUnits.filter(u => u.status === 'available').length;
  const bookedUnits = buildingUnits.filter(u => u.status === 'booked').length;
  const soldUnits = buildingUnits.filter(u => u.status === 'sold').length;
  const totalGdvUsd = buildingUnits.reduce((sum, u) => sum + u.totalPrice, 0);

  // Group units by floors (descending: 12, 11, 10 ... 1)
  const floorMap = new Map<number, Unit[]>();
  buildingUnits.forEach(u => {
    const arr = floorMap.get(u.floor) || [];
    arr.push(u);
    floorMap.set(u.floor, arr);
  });
  const sortedFloors = Array.from(floorMap.keys()).sort((a, b) => b - a);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllData();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            Вільна
          </span>
        );
      case 'booked':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012]/20 text-[#01283c] dark:bg-[#ffb012]/20 dark:text-[#ffb012] border border-[#ffb012]/40">
            Бронь
          </span>
        );
      case 'reserved':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-400 border border-sky-300 dark:border-sky-800">
            Резерв
          </span>
        );
      case 'sold':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#01283c] text-white dark:bg-slate-800 dark:text-slate-300">
            Продана
          </span>
        );
    }
  };

  if (buildings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
                Шахівка квартир та об'єктів девелопменту
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
                G-PLUS API v1
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
              Інтерактивний план поверхів, управління статусами та миттєве бронювання квартир у реальному часі
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-12 rounded-3xl border border-[#e2e8f0] dark:border-[#163042] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#01283c]/5 dark:bg-[#ffb012]/10 flex items-center justify-center text-[#01283c] dark:text-[#ffb012]">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
              База об'єктів порожня (всі демо-дані видалено)
            </h3>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] max-w-md mx-auto mt-1">
              Система працює у чистому продуктовому режимі. Запустіть синхронізацію з crm.g-plus.app або завантажте структуру ЖК у розділі синхронізації.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('sync')}
              className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Перейти до синхронізації G-PLUS</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Supabase Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              Шахівка квартир та об'єктів девелопменту
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
              G-PLUS API v1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Інтерактивний план поверхів, управління статусами та миттєве бронювання квартир у реальному часі
          </p>
        </div>

        {/* Currency & Refresh Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Supabase Status Button */}
          <button
            onClick={() => setIsSupabaseConfigModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSupabaseOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseOnline ? '🟢 Supabase активний' : '🟡 Підключити Supabase'}</span>
          </button>

          {/* Currency Toggle */}
          <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-1 rounded-xl flex items-center border border-[#e2e8f0] dark:border-[#163042]">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#ffb012] shadow-xs'
                  : 'text-[#64748b]'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency('UAH')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === 'UAH'
                  ? 'bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#ffb012] shadow-xs'
                  : 'text-[#64748b]'
              }`}
            >
              ₴ UAH ({nbuRate.usd} ₴)
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#163042] bg-white dark:bg-[#0c1e2b] text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] transition-colors"
            title="Оновити дані"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Residential Complex Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setSelectedBuildingId(b.id);
              setSelectedSectionId('all');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
              activeBuilding?.id === b.id
                ? 'bg-[#01283c] text-white border-[#01283c] dark:bg-[#ffb012] dark:text-[#01283c] dark:border-[#ffb012] shadow-xs'
                : 'bg-white dark:bg-[#0c1e2b] text-[#64748b] dark:text-[#94a3b8] border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{b.name}</span>
            <span className="text-[10px] opacity-80">({b.address})</span>
          </button>
        ))}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-bold">Всього приміщень</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#f8fafc] mt-0.5">{totalUnits}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-bold">Вільних до продажу</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{availableUnits}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-bold">Заброньовано</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#ffb012] mt-0.5">{bookedUnits}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-bold">Продано</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#f8fafc] mt-0.5">
            {soldUnits} <span className="text-xs text-[#64748b]">({totalUnits ? Math.round((soldUnits / totalUnits) * 100) : 0}%)</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-bold">Валовий пул (GDV)</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#ffb012] mt-0.5">
            {currency === 'USD'
              ? `$${(totalGdvUsd / 1000000).toFixed(2)}M`
              : `${(convertUsdToUah(totalGdvUsd, nbuRate.usd) / 1000000).toFixed(1)}M ₴`}
          </p>
        </div>
      </div>

      {/* Filter and Section Selector Toolbar */}
      <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Section selector */}
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="px-3 py-2 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">Усі секції комплексу</option>
            {buildingSections.map((sec) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>

          {/* Rooms selector */}
          <select
            value={selectedRooms}
            onChange={(e) => setSelectedRooms(e.target.value)}
            className="px-3 py-2 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">Всі планування</option>
            <option value="1">1-кімнатні</option>
            <option value="2">2-кімнатні</option>
            <option value="3">3-кімнатні</option>
            <option value="4">4-кімнатні / Пентхауси</option>
            <option value="commercial">Комерційні площі</option>
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">Всі статуси</option>
            <option value="available">Вільні</option>
            <option value="booked">Заброньовані</option>
            <option value="reserved">Резерв</option>
            <option value="sold">Продані</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за номером квартири..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>
      </div>

      {/* Visual Interactive Chessboard Grid */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#163042]">
          <h2 className="text-sm font-black text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#ffb012]" />
            <span>План поверхів та шахівка квартир</span>
          </h2>
          <span className="text-xs text-[#64748b]">Натисніть на квартиру для зміни статусу або бронювання</span>
        </div>

        {sortedFloors.length === 0 ? (
          <div className="p-12 text-center text-[#64748b] text-sm">
            Не знайдено квартир за обраними фільтрами.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedFloors.map((floorNum) => {
              const floorUnits = floorMap.get(floorNum) || [];
              return (
                <div key={floorNum} className="flex items-center gap-3">
                  {/* Floor Label Badge */}
                  <div className="w-16 shrink-0 text-center py-3 bg-[#f4f6f8] dark:bg-[#06131c] rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
                    <span className="text-xs font-black text-[#01283c] dark:text-[#ffb012] block">
                      {floorNum} пов.
                    </span>
                  </div>

                  {/* Units Row */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                    {floorUnits.map((u) => {
                      const displayPrice = currency === 'USD'
                        ? `$${u.totalPrice.toLocaleString()}`
                        : `${convertUsdToUah(u.totalPrice, nbuRate.usd).toLocaleString()} ₴`;

                      const displaySqm = currency === 'USD'
                        ? `$${u.pricePerSqm}/м²`
                        : `${convertUsdToUah(u.pricePerSqm, nbuRate.usd)} ₴/м²`;

                      return (
                        <div
                          key={u.id}
                          onClick={() => setEditingUnit(u)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                            u.status === 'available'
                              ? 'bg-white dark:bg-[#081824] border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 shadow-xs'
                              : u.status === 'booked'
                              ? 'bg-[#ffb012]/5 dark:bg-[#ffb012]/10 border-[#ffb012] hover:border-[#ffb012]'
                              : u.status === 'reserved'
                              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 hover:border-sky-500'
                              : 'bg-slate-100 dark:bg-[#040d13] border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className="font-black text-xs text-[#01283c] dark:text-[#f8fafc]">
                              {u.type === 'commercial' ? `Ком. ${u.number}` : `№ ${u.number}`}
                            </span>
                            {getStatusBadge(u.status)}
                          </div>

                          <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] space-y-0.5">
                            <div className="flex justify-between font-bold">
                              <span>{u.rooms} кімн.</span>
                              <span>{u.totalArea} м²</span>
                            </div>
                            <div className="text-[10px] text-[#64748b]">{displaySqm}</div>
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-dashed border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
                            <span className="text-xs font-black text-[#01283c] dark:text-[#ffb012]">
                              {displayPrice}
                            </span>
                          </div>

                          {u.clientName && (
                            <p className="text-[10px] text-[#01283c] dark:text-[#f8fafc] font-bold truncate mt-1">
                              👤 {u.clientName}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {editingUnit && (
        <UnitBookingModal
          unit={editingUnit}
          buildingName={activeBuilding?.name || 'Житловий комплекс'}
          onClose={() => setEditingUnit(null)}
        />
      )}
    </div>
  );
};
