import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { DealStage } from '../../types';
import {
  Plus,
  AlertTriangle,
  Megaphone,
  UserCheck,
  Search
} from 'lucide-react';

interface DealsPipelineViewProps {
  onOpenNewDeal: () => void;
  onOpenDispoRoom: (dealId: string) => void;
}

export const DealsPipelineView: React.FC<DealsPipelineViewProps> = ({
  onOpenNewDeal,
  onOpenDispoRoom
}) => {
  const { deals, businessMode, setSelectedDealId, t } = useCrm();

  const [searchFilter, setSearchFilter] = useState('');

  const wholesaleStages: { id: DealStage; labelKey: string }[] = [
    { id: 'prospecting', labelKey: 'stage_prospecting' },
    { id: 'under_contract', labelKey: 'stage_under_contract' },
    { id: 'dispositions', labelKey: 'stage_dispositions' },
    { id: 'assigned', labelKey: 'stage_assigned' },
    { id: 'closing', labelKey: 'stage_closing' },
    { id: 'closed_won', labelKey: 'stage_closed_won' }
  ];

  const agentStages: { id: DealStage; labelKey: string }[] = [
    { id: 'listing_agreement', labelKey: 'stage_listing_agreement' },
    { id: 'active_listing', labelKey: 'stage_active_listing' },
    { id: 'showing', labelKey: 'stage_showing' },
    { id: 'under_contract', labelKey: 'stage_under_contract' },
    { id: 'closing', labelKey: 'stage_closing' },
    { id: 'closed_won', labelKey: 'stage_closed_won' }
  ];

  const currentStages = businessMode === 'wholesale' ? wholesaleStages : agentStages;

  const filteredDeals = deals.filter((deal) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = deal.title.toLowerCase().includes(q);
      const matchAddress = deal.propertyAddress.toLowerCase().includes(q);
      const matchSeller = deal.sellerName.toLowerCase().includes(q);
      if (!matchTitle && !matchAddress && !matchSeller) return false;
    }
    return true;
  });

  const totalContractVolume = deals.reduce((sum, d) => sum + d.contractPrice, 0);
  const totalFees = deals.reduce((sum, d) => sum + d.estimatedFee, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
            {businessMode === 'wholesale' ? t('dealsTitleWholesale') : t('dealsTitleAgent')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            {businessMode === 'wholesale'
              ? t('dealsSubtitleWholesale')
              : t('dealsSubtitleAgent')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewDeal}
            className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createDealBtn')}</span>
          </button>
        </div>
      </div>

      {/* Financial Pipeline Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{t('totalPipelineValue')}</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            ${totalContractVolume.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">{deals.length} активних угод</span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
            {businessMode === 'wholesale' ? t('totalSpread') : t('totalCommission')}
          </span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#ffb012] mt-1 tracking-tight">
            ${totalFees.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#01283c] dark:text-[#ffb012] font-semibold mt-0.5 block">
            {t('readyForAssignment')}
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{t('dueDiligenceAlert')}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-[#01283c] dark:text-[#ffb012] tracking-tight">
              {deals.filter(d => d.stage === 'under_contract' || d.stage === 'dispositions').length}
            </span>
            <span className="text-xs text-[#01283c] dark:text-[#ffb012] font-bold">{t('underInspection')}</span>
          </div>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">{t('dueDiligenceAlertDesc')}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('searchDealsPlaceholder')}
            className="w-full pl-10 pr-3 py-1.5 text-xs sm:text-sm bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>
      </div>

      {/* Responsive Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-6">
        {currentStages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageTotalVolume = stageDeals.reduce((sum, d) => sum + d.contractPrice, 0);
          const stageTotalFee = stageDeals.reduce((sum, d) => sum + d.estimatedFee, 0);

          return (
            <div
              key={stage.id}
              className="bg-white dark:bg-[#0c1e2b] rounded-2xl p-3 border border-[#e2e8f0] dark:border-[#163042] min-w-[250px] shadow-xs"
            >
              {/* Stage Header */}
              <div className="pb-3 border-b border-[#e2e8f0] dark:border-[#163042] mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] truncate">
                    {t(stage.labelKey as any)}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#ffb012] border border-[#e2e8f0] dark:border-[#163042]">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-[#64748b] dark:text-[#94a3b8] font-semibold">
                  <span>${(stageTotalVolume / 1000).toFixed(0)} {t('volumeShort')}</span>
                  <span className="text-[#01283c] dark:text-[#ffb012] font-black">
                    +${(stageTotalFee / 1000).toFixed(0)} {t('feeShort')}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 min-h-[320px]">
                {stageDeals.length === 0 ? (
                  <div className="h-28 border-2 border-dashed border-[#e2e8f0] dark:border-[#163042] rounded-xl flex items-center justify-center text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                    {t('noDealsInStage')}
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const isInspectionUrgent =
                      deal.inspectionPeriodDays > 0 &&
                      (deal.stage === 'under_contract' || deal.stage === 'dispositions');

                    return (
                      <div
                        key={deal.id}
                        onClick={() => setSelectedDealId(deal.id)}
                        className="bg-[#f4f6f8] dark:bg-[#06131c] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-[#01283c] dark:text-[#f8fafc] leading-tight">
                            {deal.propertyAddress.split(',')[0]}
                          </span>
                          {isInspectionUrgent && (
                            <span
                              title={`${deal.inspectionPeriodDays} days inspection remaining`}
                              className="p-1 rounded-md bg-[#ffb012] text-[#01283c] flex-shrink-0"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] truncate">
                          {t('sellerLabel', { name: deal.sellerName })}
                        </p>

                        <div className="bg-white dark:bg-[#0c1e2b] p-2.5 rounded-lg text-[11px] space-y-1 border border-[#e2e8f0] dark:border-[#163042]">
                          <div className="flex justify-between">
                            <span className="text-[#64748b] dark:text-[#94a3b8]">{t('contractPrice')}:</span>
                            <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                              ${deal.contractPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#64748b] dark:text-[#94a3b8]">
                              {businessMode === 'wholesale' ? t('projectedSpread') : t('brokerCommission')}:
                            </span>
                            <span className="font-black text-[#01283c] dark:text-[#ffb012]">
                              ${deal.estimatedFee.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {deal.buyerAssignedName && (
                          <div className="text-[10px] text-[#01283c] dark:text-[#ffb012] bg-[#01283c]/5 dark:bg-[#ffb012]/15 px-2 py-1 rounded-md font-bold flex items-center gap-1 border border-[#01283c]/10 dark:border-[#ffb012]/30">
                            <UserCheck className="w-3 h-3 text-[#ffb012]" />
                            <span>{deal.buyerAssignedName}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                          <span>{t('closeLabel')}: {deal.closingDate.slice(5)}</span>

                          {businessMode === 'wholesale' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDispoRoom(deal.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] font-bold hover:opacity-90 flex items-center gap-1 shadow-2xs"
                            >
                              <Megaphone className="w-3 h-3" />
                              <span>{t('dispoBtn')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
