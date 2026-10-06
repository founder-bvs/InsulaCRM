import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Plus,
  ShieldCheck,
  Search,
  Phone,
  Mail,
  Star
} from 'lucide-react';

interface BuyersViewProps {
  onOpenNewBuyer: () => void;
}

export const BuyersView: React.FC<BuyersViewProps> = ({ onOpenNewBuyer }) => {
  const { buyers, businessMode, t } = useCrm();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showPofOnly, setShowPofOnly] = useState(false);

  const filteredBuyers = buyers.filter((buyer) => {
    if (selectedTier !== 'all' && buyer.tier !== selectedTier) return false;
    if (showPofOnly && !buyer.proofOfFundsVerified) return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = buyer.name.toLowerCase().includes(q);
      const matchComp = buyer.company.toLowerCase().includes(q);
      const matchZips = buyer.targetZips.some((z) => z.includes(q));
      if (!matchName && !matchComp && !matchZips) return false;
    }

    return true;
  });

  const vipCount = buyers.filter(b => b.tier === 'VIP').length;
  const pofCount = buyers.filter(b => b.proofOfFundsVerified).length;
  const totalVerifiedFunds = buyers
    .filter(b => b.proofOfFundsVerified)
    .reduce((sum, b) => sum + b.verifiedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
            {businessMode === 'wholesale' ? t('buyersTitleWholesale') : t('buyersTitleAgent')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            {businessMode === 'wholesale'
              ? t('buyersSubtitleWholesale')
              : t('buyersSubtitleAgent')}
          </p>
        </div>

        <button
          onClick={onOpenNewBuyer}
          className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addBuyerBtn')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{t('totalBuyersInNetwork')}</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            {buyers.length}
          </p>
          <span className="text-[11px] text-[#01283c] dark:text-[#ffb012] font-semibold mt-0.5 block">
            {t('tier1VipBuyers', { count: vipCount })}
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{t('pofVerifiedCard')}</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#ffb012] mt-1 tracking-tight">
            {pofCount}
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">{t('liquidCapitalVerified')}</span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{t('totalVerifiedBuyingPower')}</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            ${(totalVerifiedFunds / 1000000).toFixed(2)}M
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">{t('readyToDeploy')}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('searchBuyersPlaceholder')}
            className="w-full pl-10 pr-3 py-1.5 text-xs sm:text-sm bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">{t('allTiers')}</option>
            <option value="VIP">{t('vipBuyers')}</option>
            <option value="Active">{t('activeBuyers')}</option>
            <option value="Casual">{t('casualBuyers')}</option>
          </select>

          <button
            onClick={() => setShowPofOnly(!showPofOnly)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
              showPofOnly
                ? 'bg-[#01283c] text-white border-[#01283c] dark:bg-[#ffb012] dark:text-[#01283c] dark:border-[#ffb012]'
                : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] border-[#e2e8f0] dark:border-[#163042]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffb012]" />
            <span>{t('pofVerifiedOnly')}</span>
          </button>
        </div>
      </div>

      {/* Buyers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 shadow-xs hover:border-[#01283c] dark:hover:border-[#ffb012] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                    {buyer.name}
                  </h3>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{buyer.company}</p>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    buyer.tier === 'VIP'
                      ? 'bg-[#ffb012] text-[#01283c]'
                      : 'bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012]'
                  }`}
                >
                  {buyer.tier}
                </span>
              </div>

              {/* POF status */}
              <div className="mt-3">
                {buyer.proofOfFundsVerified ? (
                  <div className="p-2 rounded-xl bg-[#01283c]/5 dark:bg-[#ffb012]/15 border border-[#01283c]/15 dark:border-[#ffb012]/30 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-[#01283c] dark:text-[#ffb012] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#ffb012]" />
                      {t('pofVerifiedBadge')}
                    </span>
                    <span className="font-black text-[#01283c] dark:text-[#ffb012]">
                      ${buyer.verifiedAmount.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs text-[#64748b] dark:text-[#94a3b8]">
                    {t('pofPendingBadge')}
                  </div>
                )}
              </div>

              {/* Buy Box Specifications */}
              <div className="mt-4 space-y-1.5 text-xs text-[#64748b] dark:text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>{t('maxPurchase')}:</span>
                  <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                    ${buyer.maxPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('targetZips')}:</span>
                  <span className="font-semibold text-[#01283c] dark:text-[#f8fafc]">
                    {buyer.targetZips.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('dealsClosed')}:</span>
                  <span className="font-bold text-[#01283c] dark:text-[#ffb012]">
                    {buyer.dealsClosedCount}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-3 p-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] italic">
                "{buyer.notes}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${buyer.phone}`}
                  className="p-2 rounded-lg bg-[#f4f6f8] hover:bg-[#e2e8f0] dark:bg-[#06131c] dark:hover:bg-[#163042] text-[#01283c] dark:text-[#f8fafc] border border-[#e2e8f0] dark:border-[#163042] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#ffb012]" />
                </a>
                <a
                  href={`mailto:${buyer.email}`}
                  className="p-2 rounded-lg bg-[#f4f6f8] hover:bg-[#e2e8f0] dark:bg-[#06131c] dark:hover:bg-[#163042] text-[#01283c] dark:text-[#f8fafc] border border-[#e2e8f0] dark:border-[#163042] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ffb012]" />
                </a>
              </div>

              <div className="flex items-center gap-1 text-[#ffb012]">
                {Array.from({ length: buyer.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
