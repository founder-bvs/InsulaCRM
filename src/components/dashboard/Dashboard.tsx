import React from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Users,
  Layers,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  CheckSquare,
  Building2,
  Receipt
} from 'lucide-react';
import { convertUsdToUah } from '../../services/nbuService';

export const Dashboard: React.FC = () => {
  const {
    leads,
    deals,
    buyers,
    tasks,
    activities,
    businessMode,
    buildings,
    units,
    nbuRate,
    setActiveTab,
    setSelectedLeadId,
    setSelectedDealId,
    setSelectedBuildingId,
    toggleTaskComplete,
    t
  } = useCrm();

  // Financial and pipeline stats
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
  const totalProjectedFees = activeDeals.reduce((sum, d) => sum + (d.estimatedFee || 0), 0);
  const totalContractVolume = activeDeals.reduce((sum, d) => sum + (d.contractPrice || 0), 0);
  const hotLeadsCount = leads.filter(l => l.temperature === 'hot').length;
  const verifiedBuyersCount = buyers.filter(b => b.proofOfFundsVerified).length;

  const urgentDeals = deals.filter(
    d => d.stage === 'under_contract' || d.stage === 'dispositions'
  );

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

  const availableUnitsCount = units.filter(u => u.status === 'available').length;
  const bookedUnitsCount = units.filter(u => u.status === 'booked').length;
  const soldUnitsCount = units.filter(u => u.status === 'sold').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with clean VRTKL aesthetic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#01283c] bg-[#ffb012] px-2.5 py-0.5 rounded-full">
              G-PLUS PROD CRM
            </span>
            <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8]">
              БК ВЕРТИКАЛЬ (ІВАНО-ФРАНКІВСЬК)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#01283c] dark:text-[#f8fafc]">
            {t('dashboardBannerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1.5 max-w-xl leading-relaxed">
            Єдина система управління девелопментом: інтерактивна шахівка квартир, воронка лідів, розстрочки за договорами та партнерська мережа агентств нерухомості.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('chessboard')}
            className="px-4 py-2.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <span>Відкрити шахівку квартир</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards (2-Color Discipline: #01283c & #ffb012) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Units in stock */}
        <div
          onClick={() => setActiveTab('chessboard')}
          className="bg-white dark:bg-[#0c1e2b] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs transition-all hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
              Вільні квартири (Шахівка)
            </span>
            <div className="p-2 rounded-xl bg-[#01283c]/5 dark:bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
                {availableUnitsCount}
              </p>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {bookedUnitsCount} бронь
              </span>
            </div>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
              {buildings.length} активні житлові комплекси
            </p>
          </div>
        </div>

        {/* Card 2: Active Pipeline Volume */}
        <div
          onClick={() => setActiveTab('deals')}
          className="bg-white dark:bg-[#0c1e2b] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs transition-all hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
              Обсяг угод у роботі
            </span>
            <div className="p-2 rounded-xl bg-[#01283c]/5 dark:bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              ${totalContractVolume.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
              ~{convertUsdToUah(totalContractVolume, nbuRate.usd).toLocaleString()} ₴
            </p>
          </div>
        </div>

        {/* Card 3: Motivated Seller Leads */}
        <div
          onClick={() => setActiveTab('leads')}
          className="bg-white dark:bg-[#0c1e2b] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs transition-all hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
              Ліди та звернення
            </span>
            <div className="p-2 rounded-xl bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
                {leads.length}
              </p>
              <span className="text-xs font-bold text-[#01283c] bg-[#ffb012] px-2 py-0.5 rounded-full">
                {hotLeadsCount} гарячих
              </span>
            </div>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
              Джерела: сайт, інстаграм, рекомендації
            </p>
          </div>
        </div>

        {/* Card 4: Cash Buyers Network */}
        <div
          onClick={() => setActiveTab('buyers')}
          className="bg-white dark:bg-[#0c1e2b] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs transition-all hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
              База інвесторів
            </span>
            <div className="p-2 rounded-xl bg-[#01283c]/5 dark:bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
                {buyers.length}
              </p>
              <span className="text-xs font-bold text-[#01283c] dark:text-[#ffb012]">
                {verifiedBuyersCount} верифіковано
              </span>
            </div>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
              Підтверджена ліквідність для викупу
            </p>
          </div>
        </div>
      </div>

      {/* Developer Projects Overview (ЖК девелопера Вертикаль з G-Plus API) */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#163042]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#ffb012]" />
            <div>
              <h2 className="text-sm font-black text-[#01283c] dark:text-[#f8fafc]">
                Житлові комплекси та девелоперські проекти
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                Оперативний статус будівництва, поверховість та інвентар приміщень
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('chessboard')}
            className="text-xs font-bold text-[#01283c] dark:text-[#ffb012] hover:underline flex items-center gap-1"
          >
            <span>Вся шахівка</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buildings.map((bld) => {
            const bldUnits = units.filter(u => u.buildingId === bld.id);
            const bldAvail = bldUnits.filter(u => u.status === 'available').length;
            const bldBooked = bldUnits.filter(u => u.status === 'booked').length;
            const bldSold = bldUnits.filter(u => u.status === 'sold').length;

            return (
              <div
                key={bld.id}
                onClick={() => {
                  setSelectedBuildingId(bld.id);
                  setActiveTab('chessboard');
                }}
                className="p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] bg-[#f4f6f8] dark:bg-[#06131c] hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-sm text-[#01283c] dark:text-[#f8fafc]">{bld.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#01283c] text-white">
                      {bld.completionDate}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-3">{bld.address}</p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-lg bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042]">
                    <div>
                      <span className="text-[10px] text-emerald-600 font-bold block">Вільні</span>
                      <span className="font-black text-xs text-[#01283c] dark:text-[#f8fafc]">{bldAvail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#ffb012] font-bold block">Бронь</span>
                      <span className="font-black text-xs text-[#01283c] dark:text-[#f8fafc]">{bldBooked}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] font-bold block">Продано</span>
                      <span className="font-black text-xs text-[#01283c] dark:text-[#f8fafc]">{bldSold}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#64748b]">{bld.floorsCount} поверхів • {bld.sectionsCount} секції</span>
                  <span className="font-bold text-[#01283c] dark:text-[#ffb012]">Перейти →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mid Section: Pipeline Alert Banner & Urgent Deals */}
      {urgentDeals.length > 0 && (
        <div className="bg-white dark:bg-[#0c1e2b] border-l-4 border-l-[#ffb012] border border-[#e2e8f0] dark:border-[#163042] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ffb012] text-[#01283c]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#01283c] dark:text-[#f8fafc]">
                {t('dueDiligenceWatchlist', { count: urgentDeals.length })}
              </h3>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                {t('dueDiligenceWatchlistDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {urgentDeals.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDealId(d.id)}
                className="px-3 py-1.5 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-[#01283c] dark:text-[#f8fafc] rounded-xl text-xs font-semibold hover:border-[#01283c] dark:hover:border-[#ffb012] transition-all flex items-center gap-1.5"
              >
                <span>{d.propertyAddress.split(',')[0]}</span>
                <span className="text-[10px] bg-[#01283c] text-[#ffb012] px-1.5 py-0.5 rounded font-bold">
                  ${d.contractPrice.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Split Grid: Recent Leads & Tasks/Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): High Priority Leads */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ffb012]" />
                <span>Гарячі ліди та звернення клієнтів</span>
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                Потенційні покупці нерухомості з високим показником зацікавленості
              </p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-bold text-[#01283c] dark:text-[#ffb012] hover:underline flex items-center gap-1"
            >
              <span>Всі ліди ({leads.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="p-4 hover:bg-[#f4f6f8] dark:hover:bg-[#06131c] cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#01283c] dark:text-[#f8fafc] truncate">
                      {lead.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        lead.temperature === 'hot'
                          ? 'bg-[#ffb012] text-[#01283c]'
                          : lead.temperature === 'warm'
                          ? 'bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/20 dark:text-[#ffb012]'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {lead.temperature === 'hot' ? t('temp_hot') : lead.temperature === 'warm' ? t('temp_warm') : t('temp_cold')}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] truncate mt-0.5">
                    {lead.property.address}, {lead.property.city}
                  </p>
                  <p className="text-[11px] text-[#64748b] truncate mt-0.5 italic">
                    «{lead.notes}»
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
                    <span className="text-[10px] font-semibold text-[#64748b] dark:text-[#94a3b8]">Бал:</span>
                    <span className="text-xs font-black text-[#01283c] dark:text-[#f8fafc]">
                      {lead.motivationScore}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-1 capitalize font-medium">
                    {t(`status_${lead.status}` as any) || lead.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Tasks & Activities */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#ffb012]" />
                <span>Термінові покази та завдання ({pendingTasks.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-[#01283c] dark:text-[#ffb012] hover:underline"
              >
                Всі ({tasks.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] text-center py-4">{t('noPendingTasks')}</p>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-start gap-3"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#ffb012] transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#01283c] dark:text-[#f8fafc]">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#01283c] dark:text-[#ffb012]">
                          {task.assignedTo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs p-5">
            <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ffb012]" />
              <span>Остання активність у CRM</span>
            </h3>

            <div className="space-y-3.5">
              {activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#ffb012] mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                      {activity.title}
                    </p>
                    <p className="text-[#64748b] dark:text-[#94a3b8] text-[11px] line-clamp-2 mt-0.5">
                      {activity.description}
                    </p>
                    <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-1 block">
                      {activity.userName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
