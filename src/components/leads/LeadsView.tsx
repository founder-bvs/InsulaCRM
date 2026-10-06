import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { LeadStatus } from '../../types';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

interface LeadsViewProps {
  onOpenNewLead: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenNewLead }) => {
  const { leads, setSelectedLeadId, t } = useCrm();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDncOnly, setShowDncOnly] = useState(false);

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    if (showDncOnly && !lead.dnc) return false;
    if (selectedTemperature !== 'all' && lead.temperature !== selectedTemperature) return false;
    if (selectedStatus !== 'all' && lead.status !== selectedStatus) return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchAddr = lead.property.address.toLowerCase().includes(q);
      const matchCity = lead.property.city.toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      if (!matchName && !matchAddr && !matchCity && !matchPhone) return false;
    }

    return true;
  });

  const hotCount = leads.filter(l => l.temperature === 'hot').length;
  const avgMotivation = Math.round(
    leads.reduce((sum, l) => sum + l.motivationScore, 0) / (leads.length || 1)
  );

  const kanbanColumns: { status: LeadStatus; labelKey: string }[] = [
    { status: 'new', labelKey: 'status_new' },
    { status: 'attempted_contact', labelKey: 'status_attempted_contact' },
    { status: 'contacted', labelKey: 'status_contacted' },
    { status: 'appointment_set', labelKey: 'status_appointment_set' },
    { status: 'offer_made', labelKey: 'status_offer_made' },
    { status: 'under_contract', labelKey: 'status_under_contract' },
    { status: 'closed_won', labelKey: 'status_closed_won' }
  ];

  const getMarkerLabel = (marker: string): string => {
    const key = `marker_${marker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return t(key as any) || marker;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
            {t('leadsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            {t('leadsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-1 rounded-xl flex items-center border border-[#e2e8f0] dark:border-[#163042]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#ffb012] shadow-xs'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tableView')}</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#ffb012] shadow-xs'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('kanbanView')}</span>
            </button>
          </div>

          <button
            onClick={onOpenNewLead}
            className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSellerLeadBtn')}</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">{t('totalLeads')}</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#f8fafc] mt-0.5 tracking-tight">{leads.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">{t('hotMotivation')}</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#ffb012] mt-0.5 tracking-tight">{hotCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">{t('avgMotivationScore')}</span>
          <p className="text-xl font-black text-[#01283c] dark:text-[#ffb012] mt-0.5 tracking-tight">{avgMotivation} / 100</p>
        </div>
        <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] text-xs shadow-xs">
          <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">{t('dncCardTitle')}</span>
          <p className="text-xl font-black text-[#64748b] dark:text-[#94a3b8] mt-0.5 tracking-tight">
            {leads.filter(l => l.dnc).length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('searchLeadsPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Temperature */}
          <select
            value={selectedTemperature}
            onChange={(e) => setSelectedTemperature(e.target.value)}
            className="px-3 py-2 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-semibold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">{t('allTemperatures')}</option>
            <option value="hot">{t('hotOnly')}</option>
            <option value="warm">{t('warmOnly')}</option>
            <option value="cold">{t('coldOnly')}</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-semibold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="new">{t('status_new')}</option>
            <option value="attempted_contact">{t('status_attempted_contact')}</option>
            <option value="contacted">{t('status_contacted')}</option>
            <option value="appointment_set">{t('status_appointment_set')}</option>
            <option value="offer_made">{t('status_offer_made')}</option>
            <option value="under_contract">{t('status_under_contract')}</option>
            <option value="closed_won">{t('status_closed_won')}</option>
          </select>

          {/* DNC Toggle */}
          <button
            onClick={() => setShowDncOnly(!showDncOnly)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              showDncOnly
                ? 'bg-[#01283c] text-white border-[#01283c] dark:bg-[#ffb012] dark:text-[#01283c] dark:border-[#ffb012]'
                : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] border-[#e2e8f0] dark:border-[#163042]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t('dncOnly')}</span>
          </button>
        </div>
      </div>

      {/* Leads Content View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] uppercase text-[10px] font-bold border-b border-[#e2e8f0] dark:border-[#163042]">
                <tr>
                  <th className="px-5 py-3.5">{t('thSellerContact')}</th>
                  <th className="px-5 py-3.5">{t('thPropertyDistress')}</th>
                  <th className="px-5 py-3.5">{t('thFinancials')}</th>
                  <th className="px-5 py-3.5 text-center">{t('thMotivation')}</th>
                  <th className="px-5 py-3.5">{t('thStatus')}</th>
                  <th className="px-5 py-3.5 text-right">{t('thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#64748b] dark:text-[#94a3b8]">
                      {t('noLeadsMatch')}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="hover:bg-[#f4f6f8] dark:hover:bg-[#06131c] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[#01283c] dark:text-[#f8fafc]">
                            {lead.name}
                          </span>
                          {lead.dnc && (
                            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              DNC
                            </span>
                          )}
                        </div>
                        <p className="text-[#64748b] dark:text-[#94a3b8] mt-0.5">{lead.phone}</p>
                        <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 capitalize">
                          {t('sourceLabel')}: {lead.source.replace(/_/g, ' ')}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                          {lead.property.address}
                        </p>
                        <p className="text-[#64748b] dark:text-[#94a3b8] text-[11px]">
                          {lead.property.city}, {lead.property.state} {lead.property.zip}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {lead.property.distressMarkers.slice(0, 2).map((m, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#01283c]/5 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/10 dark:border-[#ffb012]/30"
                            >
                              {getMarkerLabel(m)}
                            </span>
                          ))}
                          {lead.property.distressMarkers.length > 2 && (
                            <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                              {t('moreDistress', { count: lead.property.distressMarkers.length - 2 })}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-[#64748b] dark:text-[#94a3b8]">
                          ARV: <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">${lead.property.arv.toLocaleString()}</span>
                        </p>
                        <p className="text-[#01283c] dark:text-[#ffb012] font-black mt-0.5">
                          MAO: ${lead.property.calculatedMao.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                          Ремонт: ${lead.property.repairEstimate.toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              lead.temperature === 'hot'
                                ? 'bg-[#ffb012] text-[#01283c]'
                                : lead.temperature === 'warm'
                                ? 'bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/20 dark:text-[#ffb012]'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {lead.motivationScore} / 100
                          </span>
                          <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-1 uppercase font-bold">
                            {lead.temperature === 'hot' ? t('temp_hot') : lead.temperature === 'warm' ? t('temp_warm') : t('temp_cold')}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="capitalize px-2.5 py-1 rounded-lg bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] font-bold text-[11px] border border-[#e2e8f0] dark:border-[#163042]">
                          {t(`status_${lead.status}` as any) || lead.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeadId(lead.id);
                          }}
                          className="p-1.5 rounded-lg text-[#64748b] hover:text-[#01283c] dark:hover:text-[#ffb012] hover:bg-[#f4f6f8] dark:hover:bg-[#06131c]"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-white dark:bg-[#0c1e2b] rounded-2xl p-3 border border-[#e2e8f0] dark:border-[#163042] min-w-[220px] shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0] dark:border-[#163042]">
                  <span className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc]">
                    {t(col.labelKey as any)}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#ffb012] border border-[#e2e8f0] dark:border-[#163042]">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[300px]">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="bg-[#f4f6f8] dark:bg-[#06131c] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#01283c] dark:text-[#f8fafc] truncate">
                          {lead.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            lead.temperature === 'hot'
                              ? 'bg-[#ffb012] text-[#01283c]'
                              : 'bg-slate-200 dark:bg-slate-800 text-[#01283c] dark:text-[#f8fafc]'
                          }`}
                        >
                          {lead.motivationScore}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-1 truncate">
                        {lead.property.address}
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-[10px]">
                        <span className="text-[#01283c] dark:text-[#ffb012] font-black">
                          MAO: ${lead.property.calculatedMao.toLocaleString()}
                        </span>
                        <span className="text-[#64748b] dark:text-[#94a3b8]">
                          {lead.source.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
