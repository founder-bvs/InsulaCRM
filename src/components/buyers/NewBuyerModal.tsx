import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { X, Briefcase, ShieldCheck } from 'lucide-react';

interface NewBuyerModalProps {
  onClose: () => void;
}

export const NewBuyerModal: React.FC<NewBuyerModalProps> = ({ onClose }) => {
  const { addBuyer, t } = useCrm();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<'VIP' | 'Active' | 'Casual'>('VIP');
  const [proofOfFundsVerified, setProofOfFundsVerified] = useState(true);
  const [verifiedAmount, setVerifiedAmount] = useState(1000000);
  const [targetZips, setTargetZips] = useState('76000, 76008, 76018');
  const [maxPrice, setMaxPrice] = useState(350000);
  const [minBeds, setMinBeds] = useState(2);
  const [preferredTypes, setPreferredTypes] = useState('Квартири, Новобудови, Комерція');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addBuyer({
      name,
      company: company || `${name} Investments`,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@investor.ua`,
      phone: phone || '+380 (50) 999-00-11',
      tier,
      proofOfFundsVerified,
      verifiedAmount,
      targetZips: targetZips.split(',').map((z) => z.trim()),
      maxPrice,
      minBeds,
      preferredTypes: preferredTypes.split(',').map((t) => t.trim()),
      dealsClosedCount: 0,
      rating: tier === 'VIP' ? 5 : 4,
      notes: notes || 'Перевірений готівковий покупець в мережі VRTKL CRM.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between bg-[#f4f6f8] dark:bg-[#06131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
                {t('newBuyerModalTitle')}
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{t('newBuyerModalSubtitle')}</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('buyerNameLabel')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. ТОВ «Прикарпаття Інвест»"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('companyNameField')}</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Vertical Partner LLC"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('emailAddress')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@vertykal.if.ua"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('phoneNumber')}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380 (50) 338-70-70"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('buyerTierLabel')}</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as 'VIP' | 'Active' | 'Casual')}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-semibold text-[#01283c] dark:text-[#f8fafc]"
              >
                <option value="VIP">{t('tierVipDesc')}</option>
                <option value="Active">{t('tierActiveDesc')}</option>
                <option value="Casual">{t('tierCasualDesc')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('maxPurchasePrice')} ($)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-bold text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>
          </div>

          {/* Proof of Funds Verification */}
          <div className="p-3.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#ffb012]" />
              <div>
                <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">
                  {t('pofCheckboxLabel')}
                </span>
                <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">{t('pofCheckboxDesc')}</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={proofOfFundsVerified}
              onChange={(e) => setProofOfFundsVerified(e.target.checked)}
              className="w-4 h-4 text-[#01283c] rounded accent-[#01283c] dark:accent-[#ffb012]"
            />
          </div>

          <div>
            <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('targetZipsLabel')}</label>
            <input
              type="text"
              value={targetZips}
              onChange={(e) => setTargetZips(e.target.value)}
              placeholder="76000, 76008, 76018"
              className="w-full mt-1 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
            />
          </div>

          <div>
            <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('dispoNotesLabel')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="напр. Прямий інвестор, швидке закриття протягом 5 банківських днів."
              rows={2}
              className="w-full mt-1 p-2.5 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
            />
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
              {t('addCashBuyerBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
