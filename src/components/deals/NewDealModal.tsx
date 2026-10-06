import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { DealStage } from '../../types';
import { X, Layers } from 'lucide-react';

interface NewDealModalProps {
  onClose: () => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({ onClose }) => {
  const { addDeal, businessMode, currentUser, leads, t } = useCrm();

  const [title, setTitle] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [stage, setStage] = useState<DealStage>(
    businessMode === 'wholesale' ? 'under_contract' : 'active_listing'
  );
  const [contractPrice, setContractPrice] = useState(60000);
  const [earnestMoney, setEarnestMoney] = useState(2000);
  const [inspectionPeriodDays, setInspectionPeriodDays] = useState(14);
  const [contractDate, setContractDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [closingDate, setClosingDate] = useState(
    new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0]
  );
  const [estimatedFee, setEstimatedFee] = useState(8000);
  const [notes, setNotes] = useState('');

  const handleSelectLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setTitle(`${lead.property.address} (${businessMode === 'wholesale' ? 'Оптова угода' : 'Лістинг'})`);
    setPropertyAddress(`${lead.property.address}, ${lead.property.city} ${lead.property.state} ${lead.property.zip}`);
    setSellerName(lead.name);
    setContractPrice(lead.property.calculatedMao || 60000);
    setEstimatedFee(lead.property.desiredAssignmentFee || 8000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !propertyAddress.trim()) return;

    addDeal({
      leadId: `lead-${Date.now()}`,
      title,
      propertyAddress,
      sellerName: sellerName || 'Власник нерухомості',
      stage,
      contractPrice,
      earnestMoney,
      inspectionPeriodDays,
      contractDate,
      closingDate,
      estimatedFee,
      assignedAgent: currentUser.name,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between bg-[#f4f6f8] dark:bg-[#06131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
                {t('newDealModalTitle')}
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                {businessMode === 'wholesale'
                  ? t('newDealModalSubtitleWholesale')
                  : t('newDealModalSubtitleAgent')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#163042]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {leads.length > 0 && (
            <div className="p-3 bg-[#f4f6f8] dark:bg-[#06131c] rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
              <label className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] block mb-1">
                {t('linkExistingLead')}
              </label>
              <select
                onChange={(e) => handleSelectLead(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-semibold text-[#01283c] dark:text-[#f8fafc]"
                defaultValue=""
              >
                <option value="">{t('chooseSellerLead')}</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} - {l.property.address} (MAO: ${l.property.calculatedMao.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('dealTitle')}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="напр. вул. Івасюка, 82 (Оптова угода)"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('streetAddress')}</label>
              <input
                type="text"
                required
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="напр. м. Івано-Франківськ, вул. Івасюка, 82"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('sellerFullName')}</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Володимир Мельник"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('startingStage')}</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-semibold text-[#01283c] dark:text-[#f8fafc]"
              >
                {businessMode === 'wholesale' ? (
                  <>
                    <option value="prospecting">{t('stage_prospecting')}</option>
                    <option value="under_contract">{t('stage_under_contract')}</option>
                    <option value="dispositions">{t('stage_dispositions')}</option>
                    <option value="assigned">{t('stage_assigned')}</option>
                    <option value="closing">{t('stage_closing')}</option>
                  </>
                ) : (
                  <>
                    <option value="listing_agreement">{t('stage_listing_agreement')}</option>
                    <option value="active_listing">{t('stage_active_listing')}</option>
                    <option value="showing">{t('stage_showing')}</option>
                    <option value="under_contract">{t('stage_under_contract')}</option>
                    <option value="closing">{t('stage_closing')}</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('contractLockupPrice')} ($)</label>
              <input
                type="number"
                value={contractPrice}
                onChange={(e) => setContractPrice(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('emdDeposit')} ($)</label>
              <input
                type="number"
                value={earnestMoney}
                onChange={(e) => setEarnestMoney(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                {businessMode === 'wholesale' ? t('targetSpreadFee') : t('brokerCommissionLabel')} ($)
              </label>
              <input
                type="number"
                value={estimatedFee}
                onChange={(e) => setEstimatedFee(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('inspectionPeriodLabel')} (днів)</label>
              <input
                type="number"
                value={inspectionPeriodDays}
                onChange={(e) => setInspectionPeriodDays(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('contractExecutionDate')}</label>
              <input
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('targetClosingDate')}</label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748b] hover:text-[#01283c]"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-black shadow-xs"
            >
              {t('originateDealBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
