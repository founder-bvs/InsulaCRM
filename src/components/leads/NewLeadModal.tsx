import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { LeadSource, LeadTemperature, PropertyCondition } from '../../types';
import { X, Building2 } from 'lucide-react';

interface NewLeadModalProps {
  onClose: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose }) => {
  const { addLead, currentUser, t } = useCrm();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('cold_call');
  const [temperature, setTemperature] = useState<LeadTemperature>('hot');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Івано-Франківськ');
  const [state, setState] = useState('Івано-Франківська обл.');
  const [zip, setZip] = useState('76000');
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  const [sqft, setSqft] = useState(85);
  const [yearBuilt, setYearBuilt] = useState(2018);
  const [condition, setCondition] = useState<PropertyCondition>('moderate');
  const [arv, setArv] = useState(90000);
  const [repairEstimate, setRepairEstimate] = useState(12000);
  const [maoRulePercent, setMaoRulePercent] = useState(70);
  const [desiredAssignmentFee, setDesiredAssignmentFee] = useState(8000);
  const [distressMarkers, setDistressMarkers] = useState<string[]>(['Tax Delinquent']);

  const calculatedMao = Math.round(
    (arv * (maoRulePercent / 100)) - repairEstimate - desiredAssignmentFee
  );

  const availableMarkers = [
    'Tax Delinquent',
    'Vacant',
    'Probate',
    'Pre-Foreclosure',
    'Code Violations',
    'Water Shutoff',
    'Out of State Owner',
    'Fire Damaged',
    'Tired Landlord'
  ];

  const getMarkerLabel = (marker: string): string => {
    const key = `marker_${marker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return t(key as any) || marker;
  };

  const toggleMarker = (marker: string) => {
    setDistressMarkers((prev) =>
      prev.includes(marker) ? prev.filter((m) => m !== marker) : [...prev, marker]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    addLead({
      name,
      phone: phone || '+380 (50) 123-45-67',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      source,
      status: 'new',
      temperature,
      motivationScore: temperature === 'hot' ? 88 : temperature === 'warm' ? 65 : 40,
      aiMotivationScore: temperature === 'hot' ? 90 : temperature === 'warm' ? 68 : 38,
      dnc: false,
      assignedAgent: currentUser.name,
      notes: notes || 'Новий лід успішно додано в базу VRTKL CRM.',
      property: {
        address,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        yearBuilt,
        condition,
        distressMarkers,
        arv,
        repairEstimate,
        maoRulePercent,
        desiredAssignmentFee,
        calculatedMao
      },
      photos: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['Вхідний лід', source.replace(/_/g, ' ')]
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
                {t('newLeadModalTitle')}
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{t('newLeadModalSubtitle')}</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seller Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-3">
              {t('step1SellerInfo')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('sellerFullName')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="напр. Володимир Мельник"
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('phoneNumber')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+380 (50) 123-45-67"
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('emailAddress')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@gmail.com"
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('leadSource')}</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-semibold text-[#01283c] dark:text-[#f8fafc]"
                >
                  <option value="cold_call">Холодний дзвінок</option>
                  <option value="direct_mail">Пряма пошта / Листівки</option>
                  <option value="driving_for_dollars">Польовий пошук (Driving for Dollars)</option>
                  <option value="website">Заявка з сайту</option>
                  <option value="referral">Рекомендація / Партнер</option>
                  <option value="ppc">Реклама Google / Facebook</option>
                  <option value="social_media">Соціальні мережі</option>
                  <option value="list_import">Імпорт реєстру</option>
                  <option value="other">Інше</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Address & Specs */}
          <div>
            <h3 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-3">
              {t('step2PropertySpecs')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('streetAddress')}</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="напр. вул. Івасюка, 82"
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('zipCode')}</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('bedrooms')}</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('bathrooms')}</label>
                <input
                  type="number"
                  step="1"
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">{t('sqFt')} (м²)</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>
            </div>
          </div>

          {/* Distress Markers Selection */}
          <div>
            <h3 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-2">
              {t('step3DistressSignals')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableMarkers.map((marker) => {
                const isSelected = distressMarkers.includes(marker);
                return (
                  <button
                    type="button"
                    key={marker}
                    onClick={() => toggleMarker(marker)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                      isSelected
                        ? 'bg-[#ffb012] text-[#01283c] shadow-xs'
                        : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] border border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c]'
                    }`}
                  >
                    {getMarkerLabel(marker)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time ARV / MAO Worksheet */}
          <div className="p-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
                {t('instantMaoWorksheet')}
              </span>
              <span className="text-sm font-black text-[#01283c] dark:text-[#ffb012]">
                MAO: ${calculatedMao.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[#64748b] dark:text-[#94a3b8] font-bold">ARV ($)</label>
                <input
                  type="number"
                  value={arv}
                  onChange={(e) => setArv(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div>
                <label className="text-[#64748b] dark:text-[#94a3b8] font-bold">{t('calcRepairsLabel')} ($)</label>
                <input
                  type="number"
                  value={repairEstimate}
                  onChange={(e) => setRepairEstimate(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div>
                <label className="text-[#64748b] dark:text-[#94a3b8] font-bold">Правило %</label>
                <input
                  type="number"
                  value={maoRulePercent}
                  onChange={(e) => setMaoRulePercent(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
                />
              </div>

              <div>
                <label className="text-[#64748b] dark:text-[#94a3b8] font-bold">{t('targetFeeLabel')} ($)</label>
                <input
                  type="number"
                  value={desiredAssignmentFee}
                  onChange={(e) => setDesiredAssignmentFee(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#ffb012]"
                />
              </div>
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
              {t('saveMotivatedLeadBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
