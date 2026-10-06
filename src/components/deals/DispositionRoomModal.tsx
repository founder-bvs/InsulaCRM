import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  Megaphone,
  CheckCircle,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface DispositionRoomModalProps {
  dealId: string;
  onClose: () => void;
}

export const DispositionRoomModal: React.FC<DispositionRoomModalProps> = ({ dealId, onClose }) => {
  const { deals, buyers, assignBuyerToDeal, addDealOffer, language, t } = useCrm();

  const deal = deals.find((d) => d.id === dealId);
  const [copiedBlast, setCopiedBlast] = useState(false);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(5000);

  if (!deal) return null;

  const zipMatch = deal.propertyAddress.match(/\b\d{5}\b/);
  const dealZip = zipMatch ? zipMatch[0] : '';

  const matchedBuyers = buyers.map((buyer) => {
    let score = 50;
    const zipMatchFound = buyer.targetZips.includes(dealZip);
    if (zipMatchFound) score += 30;
    if (buyer.maxPrice >= deal.contractPrice + deal.estimatedFee) score += 15;
    if (buyer.proofOfFundsVerified) score += 15;

    return {
      buyer,
      score: Math.min(99, score),
      zipMatchFound
    };
  }).sort((a, b) => b.score - a.score);

  const askingPrice = deal.contractPrice + deal.estimatedFee;

  const marketingPitch = language === 'uk'
    ? `🔥 ЕКСКЛЮЗИВНА ОФФ-МАРКЕТ УГОДА VRTKL CRM 🔥
Об'єкт: ${deal.propertyAddress}
Ціна контракту: $${deal.contractPrice.toLocaleString()}
Ціна для інвестора: $${askingPrice.toLocaleString()}
Прогнозована маржа переуступки: $${deal.estimatedFee.toLocaleString()}
Дата закриття: ${deal.closingDate}
Період інспекції: ${deal.inspectionPeriodDays} днів

Юридичну чистоту перевірено. Завдаток $5,000 під час підписання договору переуступки прав в офісі Vertical Development.`
    : `🔥 EXCLUSIVE OFF-MARKET VRTKL CRM DEAL 🔥
Property: ${deal.propertyAddress}
Contract Price: $${deal.contractPrice.toLocaleString()}
Asking Investor Price: $${askingPrice.toLocaleString()}
Projected Assignment Spread: $${deal.estimatedFee.toLocaleString()}
Closing Date: ${deal.closingDate}
Inspection Period: ${deal.inspectionPeriodDays} Days remaining

Clean title escrow in place. Buyer must provide $5,000 earnest deposit with signed assignment contract at Vertical Development.`;

  const handleCopyBlast = () => {
    navigator.clipboard.writeText(marketingPitch);
    setCopiedBlast(true);
    setTimeout(() => setCopiedBlast(false), 2000);
  };

  const handleQuickAssign = (buyerId: string, buyerName: string) => {
    assignBuyerToDeal(deal.id, buyerId, buyerName, askingPrice);
    onClose();
  };

  const handleLogBuyerOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyerForOffer || offerAmount <= 0) return;

    const buyer = buyers.find((b) => b.id === selectedBuyerForOffer);
    if (!buyer) return;

    addDealOffer(deal.id, {
      buyerName: buyer.name,
      amount: offerAmount,
      depositAmount: depositAmount,
      contingencies: language === 'uk' ? 'Готівкова пропозиція, закриття за 10 днів' : 'Cash offer, 10-day close',
      status: 'pending'
    });

    setSelectedBuyerForOffer(null);
    setOfferAmount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#f4f6f8] dark:bg-[#06131c] border-b border-[#e2e8f0] dark:border-[#163042] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-black tracking-wider bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/15 dark:border-[#ffb012]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" />
                {t('dispoRoomTitle')}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-[#01283c] dark:text-[#f8fafc]">{deal.propertyAddress}</h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#64748b] dark:text-[#94a3b8] flex-wrap">
              <span>{t('contractPrice')}: <strong className="text-[#01283c] dark:text-[#f8fafc]">${deal.contractPrice.toLocaleString()}</strong></span>
              <span>•</span>
              <span>{t('askingPrice')}: <strong className="text-[#01283c] dark:text-[#ffb012] font-black">${askingPrice.toLocaleString()}</strong></span>
              <span>•</span>
              <span>{t('targetSpreadFee')}: <strong className="text-[#01283c] dark:text-[#ffb012] font-black">${deal.estimatedFee.toLocaleString()}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] hover:bg-[#e2e8f0] dark:hover:bg-[#163042] rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Deal Sheet & Blast Generator */}
          <div className="p-5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#ffb012]" />
                <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc]">
                  {t('marketingKitTitle')}
                </h3>
              </div>
              <button
                onClick={handleCopyBlast}
                className="px-3.5 py-1.5 rounded-xl bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                {copiedBlast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBlast ? t('copiedText') : t('copyBlastBtn')}</span>
              </button>
            </div>
            <pre className="text-xs bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] font-mono text-[#01283c] dark:text-[#f8fafc] whitespace-pre-wrap">
              {marketingPitch}
            </pre>
          </div>

          {/* Matched Cash Buyers Engine */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#01283c] dark:text-[#f8fafc] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ffb012]" />
                  <span>{t('matchingCashBuyersTitle', { count: matchedBuyers.length })}</span>
                </h3>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                  {t('matchingCashBuyersSubtitle', { zip: dealZip || 'all' })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {matchedBuyers.map(({ buyer, score }) => {
                const isAssigned = deal.buyerAssignedId === buyer.id;
                return (
                  <div
                    key={buyer.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isAssigned
                        ? 'bg-[#01283c]/5 dark:bg-[#ffb012]/15 border-[#01283c]/20 dark:border-[#ffb012]/30'
                        : 'bg-white dark:bg-[#0c1e2b] border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c] dark:hover:border-[#ffb012]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                          {buyer.name}
                        </span>
                        <span className="text-xs text-[#64748b]">({buyer.company})</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            buyer.tier === 'VIP'
                              ? 'bg-[#ffb012] text-[#01283c]'
                              : 'bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/20 dark:text-[#ffb012]'
                          }`}
                        >
                          {buyer.tier}
                        </span>
                        {buyer.proofOfFundsVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#01283c] dark:text-[#ffb012] bg-[#01283c]/5 dark:bg-[#ffb012]/15 px-2 py-0.5 rounded-full border border-[#01283c]/15 dark:border-[#ffb012]/30">
                            <ShieldCheck className="w-3 h-3 text-[#ffb012]" />
                            {t('pofVerifiedBadge')} (${(buyer.verifiedAmount / 1000000).toFixed(1)}M)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748b] dark:text-[#94a3b8] flex-wrap">
                        <span>{t('maxPurchase')}: ${buyer.maxPrice.toLocaleString()}</span>
                        <span>•</span>
                        <span>{t('targetZips')}: {buyer.targetZips.join(', ')}</span>
                        <span>•</span>
                        <span>{t('dealsClosed')}: {buyer.dealsClosedCount}</span>
                      </div>

                      <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-1 italic">"{buyer.notes}"</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012] font-black text-xs border border-[#ffb012]/30">
                          <span>{t('matchScore', { score })}</span>
                        </div>
                      </div>

                      {isAssigned ? (
                        <span className="px-3.5 py-1.5 rounded-xl bg-[#01283c] text-[#ffb012] font-bold text-xs flex items-center gap-1 shadow-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('assignedBadge')}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBuyerForOffer(buyer.id);
                              setOfferAmount(askingPrice);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#f4f6f8] hover:bg-[#e2e8f0] dark:bg-[#06131c] dark:hover:bg-[#163042] text-[#01283c] dark:text-[#f8fafc] text-xs font-bold"
                          >
                            {t('logOfferBtn')}
                          </button>
                          <button
                            onClick={() => handleQuickAssign(buyer.id, buyer.name)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] text-xs font-bold shadow-xs"
                          >
                            {t('assignDealBtn')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log Offer Modal Sub-form */}
          {selectedBuyerForOffer && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e2b] border border-[#01283c] dark:border-[#ffb012] space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] uppercase tracking-wider">
                {t('logOfferFromBuyerTitle')}
              </h4>
              <form onSubmit={handleLogBuyerOffer} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] block mb-1">{t('offerAmountLabel')}</label>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-sm font-bold text-[#01283c] dark:text-[#f8fafc]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] block mb-1">{t('depositAmountLabel')}</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-sm font-bold text-[#01283c] dark:text-[#f8fafc]"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-lg text-xs font-bold h-[34px]"
                  >
                    {t('submitOfferBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBuyerForOffer(null)}
                    className="px-3 py-1.5 text-xs font-bold text-[#64748b] h-[34px]"
                  >
                    {t('cancelBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
