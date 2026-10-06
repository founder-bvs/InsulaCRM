import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { DealStage } from '../../types';
import {
  X,
  AlertTriangle,
  Megaphone,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface DealDetailModalProps {
  dealId: string;
  onClose: () => void;
  onOpenDispoRoom: (dealId: string) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  dealId,
  onClose,
  onOpenDispoRoom
}) => {
  const {
    deals,
    updateDealStage,
    toggleChecklistItem,
    businessMode,
    updateOfferStatus,
    t
  } = useCrm();

  const deal = deals.find((d) => d.id === dealId);
  if (!deal) return null;

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

  const isInspectionUrgent =
    deal.inspectionPeriodDays > 0 &&
    (deal.stage === 'under_contract' || deal.stage === 'dispositions');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-start justify-between gap-4 bg-[#f4f6f8] dark:bg-[#06131c]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/15 dark:border-[#ffb012]/30">
                {t('dealDetailsTitle')}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#0c1e2b] text-[#64748b] dark:text-[#94a3b8] border border-[#e2e8f0] dark:border-[#163042] capitalize">
                {t('thStatus')}: {t(`stage_${deal.stage}` as any) || deal.stage.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1.5">
              {deal.title}
            </h2>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
              {deal.propertyAddress} • {t('sellerLabel', { name: deal.sellerName })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {businessMode === 'wholesale' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDispoRoom(deal.id);
                }}
                className="px-3.5 py-1.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>{t('openDispoRoomBtn')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#163042]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Progression Bar */}
        <div className="p-4 bg-white dark:bg-[#0c1e2b] border-b border-[#e2e8f0] dark:border-[#163042] flex items-center gap-2 overflow-x-auto">
          {currentStages.map((st, idx) => {
            const isCurrent = deal.stage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => updateDealStage(deal.id, st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] shadow-xs'
                    : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] border border-[#e2e8f0] dark:border-[#163042] hover:bg-white'
                }`}
              >
                <span className="text-[10px] opacity-75">{idx + 1}.</span>
                <span>{t(st.labelKey as any)}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Due Diligence Alert */}
          {isInspectionUrgent && (
            <div className="p-4 rounded-xl bg-[#ffb012]/15 border border-[#ffb012]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#01283c] dark:text-[#ffb012]" />
                <div>
                  <h4 className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc]">
                    {t('inspectionCountdownTitle')}
                  </h4>
                  <p className="text-xs text-[#01283c]/80 dark:text-[#f8fafc]/80 mt-0.5">
                    {t('inspectionCountdownDesc', { days: deal.inspectionPeriodDays })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase">{t('contractPrice')}</span>
              <p className="text-xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
                ${deal.contractPrice.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase">{t('earnestMoneyEmd')}</span>
              <p className="text-xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
                ${deal.earnestMoney.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase">
                {businessMode === 'wholesale' ? t('projectedSpread') : t('brokerCommission')}
              </span>
              <p className="text-xl font-black text-[#01283c] dark:text-[#ffb012] mt-1 tracking-tight">
                ${deal.estimatedFee.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase">{t('closingTarget')}</span>
              <p className="text-base font-black text-[#01283c] dark:text-[#f8fafc] mt-1">
                {deal.closingDate}
              </p>
            </div>
          </div>

          {/* Assigned Buyer if wholesale deal is assigned */}
          {deal.buyerAssignedName && (
            <div className="p-4 rounded-xl bg-[#01283c]/5 dark:bg-[#ffb012]/15 border border-[#01283c]/15 dark:border-[#ffb012]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-[#ffb012]" />
                <div>
                  <h4 className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc]">
                    {t('assignedCashBuyerTitle', { name: deal.buyerAssignedName })}
                  </h4>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {t('finalBuyerPriceDesc', {
                      price: deal.finalSalePrice?.toLocaleString() || '',
                      fee: deal.estimatedFee.toLocaleString()
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Checklist */}
          <div>
            <h3 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-3">
              {t('closingChecklistTitle')}
            </h3>
            <div className="space-y-2">
              {deal.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(deal.id, item.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-slate-100 dark:bg-slate-900 border-[#e2e8f0] dark:border-[#163042] text-[#64748b] line-through'
                      : 'bg-[#f4f6f8] dark:bg-[#06131c] border-[#e2e8f0] dark:border-[#163042] text-[#01283c] dark:text-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        item.completed ? 'text-[#ffb012]' : 'text-[#64748b]'
                      }`}
                    />
                    <span className="font-semibold">{item.title}</span>
                  </div>
                  {item.dueDate && (
                    <span className="text-[10px] text-[#64748b] font-medium">
                      {t('dueOn', { date: item.dueDate })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cash Buyer Offers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
                {t('buyerOffersTitle', { count: deal.offers.length })}
              </h3>
            </div>

            {deal.offers.length === 0 ? (
              <p className="text-xs text-[#64748b] italic">
                {t('noOffersYet')}
              </p>
            ) : (
              <div className="space-y-2.5">
                {deal.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                        {offer.buyerName}
                      </span>
                      <p className="text-[#64748b] dark:text-[#94a3b8] mt-0.5 font-semibold">
                        ${offer.amount.toLocaleString()} (Завдаток: ${offer.depositAmount.toLocaleString()})
                      </p>
                      <p className="text-[10px] text-[#64748b]">{offer.contingencies}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          offer.status === 'accepted'
                            ? 'bg-[#01283c] text-[#ffb012]'
                            : offer.status === 'rejected'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-[#ffb012] text-[#01283c]'
                        }`}
                      >
                        {offer.status}
                      </span>
                      {offer.status === 'pending' && (
                        <button
                          onClick={() => updateOfferStatus(deal.id, offer.id, 'accepted')}
                          className="px-2.5 py-1 bg-[#01283c] hover:bg-[#023854] text-white dark:bg-[#ffb012] dark:text-[#01283c] rounded-lg text-[10px] font-bold"
                        >
                          {t('acceptOffer')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
