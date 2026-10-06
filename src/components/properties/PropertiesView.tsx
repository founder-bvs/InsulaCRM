import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Calculator,
  Search,
  ChevronRight
} from 'lucide-react';

export const PropertiesView: React.FC = () => {
  const { leads, setSelectedLeadId, t } = useCrm();

  const [searchFilter, setSearchFilter] = useState('');

  // Interactive standalone ARV calculator state
  const [calcArv, setCalcArv] = useState(90000);
  const [calcRepairs, setCalcRepairs] = useState(12000);
  const [calcRule, setCalcRule] = useState(70);
  const [calcFee, setCalcFee] = useState(8000);

  const standaloneMao = Math.round((calcArv * (calcRule / 100)) - calcRepairs - calcFee);

  const propertiesList = leads.map((l) => ({
    leadId: l.id,
    leadName: l.name,
    leadTemperature: l.temperature,
    property: l.property
  })).filter((item) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchAddr = item.property.address.toLowerCase().includes(q);
      const matchCity = item.property.city.toLowerCase().includes(q);
      const matchSeller = item.leadName.toLowerCase().includes(q);
      if (!matchAddr && !matchCity && !matchSeller) return false;
    }
    return true;
  });

  const getMarkerLabel = (marker: string): string => {
    const key = `marker_${marker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return t(key as any) || marker;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
            {t('propertiesTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            {t('propertiesSubtitle')}
          </p>
        </div>
      </div>

      {/* Standalone Live ARV / MAO Worksheet Card */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl p-6 border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] dark:border-[#163042] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#01283c] dark:text-[#f8fafc]">{t('underwritingEngineTitle')}</h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{t('underwritingEngineDesc')}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#01283c] dark:text-[#ffb012] font-black uppercase tracking-wider block">
              MAO
            </span>
            <span className="text-3xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              ${standaloneMao.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
            <label className="text-[#64748b] dark:text-[#94a3b8] font-bold block mb-1">
              {t('calcArvLabel')} ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
              <input
                type="number"
                value={calcArv}
                onChange={(e) => setCalcArv(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>
          </div>

          <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
            <label className="text-[#64748b] dark:text-[#94a3b8] font-bold block mb-1">
              {t('calcRepairsLabel')} ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
              <input
                type="number"
                value={calcRepairs}
                onChange={(e) => setCalcRepairs(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>
          </div>

          <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
            <label className="text-[#64748b] dark:text-[#94a3b8] font-bold block mb-1">
              {t('calcRuleLabel')} (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={calcRule}
                onChange={(e) => setCalcRule(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>
          </div>

          <div className="bg-[#f4f6f8] dark:bg-[#06131c] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
            <label className="text-[#64748b] dark:text-[#94a3b8] font-bold block mb-1">
              {t('calcFeeLabel')} ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
              <input
                type="number"
                value={calcFee}
                onChange={(e) => setCalcFee(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#ffb012] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Search */}
      <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] dark:text-[#94a3b8]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('searchPropertiesPlaceholder')}
            className="w-full pl-10 pr-3 py-1.5 text-xs sm:text-sm bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>
      </div>

      {/* Properties Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertiesList.map(({ leadId, leadName, property }) => (
          <div
            key={leadId}
            onClick={() => setSelectedLeadId(leadId)}
            className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-5 shadow-xs hover:border-[#01283c] dark:hover:border-[#ffb012] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                    {property.address}
                  </h3>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#01283c]/5 dark:bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012] border border-[#01283c]/10 dark:border-[#ffb012]/30 capitalize">
                  {property.condition.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Specs */}
              <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">{t('bedsBathsLabel')}</span>
                  <p className="font-bold text-[#01283c] dark:text-[#f8fafc]">{property.beds} / {property.baths}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">{t('sqFtLabel')} (м²)</span>
                  <p className="font-bold text-[#01283c] dark:text-[#f8fafc]">{property.sqft.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">{t('yearLabel')}</span>
                  <p className="font-bold text-[#01283c] dark:text-[#f8fafc]">{property.yearBuilt}</p>
                </div>
              </div>

              {/* Distress signals */}
              <div className="mt-3 flex flex-wrap gap-1">
                {property.distressMarkers.map((marker, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#01283c]/5 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/10 dark:border-[#ffb012]/30"
                  >
                    {getMarkerLabel(marker)}
                  </span>
                ))}
              </div>

              {/* Financial values */}
              <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b] dark:text-[#94a3b8]">ARV:</span>
                  <span className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                    ${property.arv.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b] dark:text-[#94a3b8]">{t('calcRepairsLabel')}:</span>
                  <span className="font-medium text-[#64748b] dark:text-[#94a3b8]">
                    ${property.repairEstimate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b] dark:text-[#94a3b8]">MAO:</span>
                  <span className="font-black text-[#01283c] dark:text-[#ffb012]">
                    ${property.calculatedMao.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between text-xs">
              <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">{t('sellerLabel', { name: leadName })}</span>
              <span className="text-[#01283c] dark:text-[#ffb012] font-bold flex items-center gap-1 hover:underline">
                <span>{t('viewSheetBtn')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
