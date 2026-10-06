import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Flame, Layers, Briefcase, ChevronRight } from 'lucide-react';

export const SearchResultsView: React.FC = () => {
  const { searchQuery, leads, deals, buyers, setSelectedLeadId, setSelectedDealId, t } = useCrm();

  const q = searchQuery.toLowerCase().trim();

  const matchedLeads = q
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.property.address.toLowerCase().includes(q) ||
          l.phone.includes(q)
      )
    : [];

  const matchedDeals = q
    ? deals.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.propertyAddress.toLowerCase().includes(q) ||
          d.sellerName.toLowerCase().includes(q)
      )
    : [];

  const matchedBuyers = q
    ? buyers.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.company.toLowerCase().includes(q) ||
          b.targetZips.some((zip) => zip.includes(q))
      )
    : [];

  const totalMatches = matchedLeads.length + matchedDeals.length + matchedBuyers.length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
          {t('searchResultsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
          {t('showingResultsFor', { query: searchQuery, count: totalMatches })}
        </p>
      </div>

      {totalMatches === 0 ? (
        <div className="p-12 text-center text-[#64748b] dark:text-[#94a3b8] bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042]">
          <Search className="w-8 h-8 mx-auto text-[#64748b] dark:text-[#94a3b8] mb-2 opacity-50" />
          <p className="text-sm">{t('noSearchResults')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Matched Leads */}
          {matchedLeads.length > 0 && (
            <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ffb012]" />
                <span>{t('sellerLeads')} ({matchedLeads.length})</span>
              </h2>
              <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
                {matchedLeads.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLeadId(l.id)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#f4f6f8] dark:hover:bg-[#06131c] rounded-xl px-2 transition-colors text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#01283c] dark:text-[#f8fafc] text-sm">{l.name}</p>
                      <p className="text-[#64748b] dark:text-[#94a3b8]">{l.property.address}, {l.property.city}</p>
                      <span className="text-[10px] text-[#01283c] dark:text-[#ffb012] font-semibold">MAO: ${l.property.calculatedMao.toLocaleString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Deals */}
          {matchedDeals.length > 0 && (
            <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#01283c] dark:text-[#ffb012]" />
                <span>{t('dealPipeline')} ({matchedDeals.length})</span>
              </h2>
              <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
                {matchedDeals.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDealId(d.id)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#f4f6f8] dark:hover:bg-[#06131c] rounded-xl px-2 transition-colors text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#01283c] dark:text-[#f8fafc] text-sm">{d.title}</p>
                      <p className="text-[#64748b] dark:text-[#94a3b8]">${d.contractPrice.toLocaleString()} | Fee: ${d.estimatedFee.toLocaleString()}</p>
                      <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8] capitalize">Stage: {t(`stage_${d.stage}` as any) || d.stage.replace(/_/g, ' ')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Buyers */}
          {matchedBuyers.length > 0 && (
            <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#ffb012]" />
                <span>{t('cashBuyers')} ({matchedBuyers.length})</span>
              </h2>
              <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
                {matchedBuyers.map((b) => (
                  <div
                    key={b.id}
                    className="py-3 flex items-center justify-between text-xs px-2"
                  >
                    <div>
                      <p className="font-bold text-[#01283c] dark:text-[#f8fafc] text-sm">{b.name} ({b.company})</p>
                      <p className="text-[#64748b] dark:text-[#94a3b8]">{t('maxPurchase')}: ${b.maxPrice.toLocaleString()} | {t('targetZips')}: {b.targetZips.join(', ')}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] border border-[#e2e8f0] dark:border-[#163042]">
                      {b.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
