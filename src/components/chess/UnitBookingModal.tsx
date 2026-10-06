import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Unit, UnitStatus } from '../../types';
import { X, Building2, Check, Clock, DollarSign, UserCheck } from 'lucide-react';
import { formatCurrency, convertUsdToUah } from '../../services/nbuService';

interface UnitBookingModalProps {
  unit: Unit;
  buildingName: string;
  onClose: () => void;
}

export const UnitBookingModal: React.FC<UnitBookingModalProps> = ({ unit, buildingName, onClose }) => {
  const { createBooking, updateUnitStatus, currentUser, nbuRate, language } = useCrm();

  const [status, setStatus] = useState<UnitStatus>(unit.status);
  const [clientName, setClientName] = useState(unit.clientName || '');
  const [clientPhone, setClientPhone] = useState(unit.clientPhone || '');
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [bookingDays, setBookingDays] = useState<number>(7);
  const [currency, setCurrency] = useState<'USD' | 'UAH'>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (status === 'booked' && clientName.trim()) {
        const expires = new Date(Date.now() + bookingDays * 86400000).toISOString().split('T')[0];
        await createBooking({
          unitId: unit.id,
          unitNumber: unit.number,
          buildingName,
          clientName,
          clientPhone,
          depositAmount,
          bookingDate: new Date().toISOString().split('T')[0],
          expiresAt: expires,
          managerName: currentUser.name,
          status: 'active'
        });
      } else {
        await updateUnitStatus(unit.id, status, clientName, clientPhone);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceUah = convertUsdToUah(unit.totalPrice, nbuRate.usd);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-3xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between bg-[#f4f6f8] dark:bg-[#06131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#01283c] dark:text-[#f8fafc]">
                {unit.type === 'commercial' ? 'Комерційне приміщення' : `Квартира №${unit.number}`}
              </h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{buildingName} • Поверх {unit.floor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#163042]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Specs & Pricing Banner */}
        <div className="p-4 bg-[#01283c]/5 dark:bg-[#ffb012]/10 border-b border-[#e2e8f0] dark:border-[#163042] grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[#64748b] dark:text-[#94a3b8] font-bold block">Площа</span>
            <span className="text-sm font-black text-[#01283c] dark:text-[#f8fafc]">{unit.totalArea} м²</span>
          </div>
          <div>
            <span className="text-[#64748b] dark:text-[#94a3b8] font-bold block">Ціна за м²</span>
            <span className="text-sm font-black text-[#01283c] dark:text-[#ffb012]">${unit.pricePerSqm}</span>
          </div>
          <div>
            <span className="text-[#64748b] dark:text-[#94a3b8] font-bold block">Загальна вартість</span>
            <span className="text-sm font-black text-[#01283c] dark:text-[#f8fafc]">
              ${unit.totalPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8] block">
              (~{priceUah.toLocaleString()} ₴)
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Status selector */}
          <div>
            <label className="font-bold text-[#01283c] dark:text-[#f8fafc] block mb-1.5">
              Статус приміщення в системі
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('available')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition-all ${
                  status === 'available'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] border-[#e2e8f0] dark:border-[#163042]'
                }`}
              >
                Вільна
              </button>
              <button
                type="button"
                onClick={() => setStatus('booked')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition-all ${
                  status === 'booked'
                    ? 'bg-[#ffb012] text-[#01283c] border-[#ffb012] shadow-xs'
                    : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] border-[#e2e8f0] dark:border-[#163042]'
                }`}
              >
                Бронь
              </button>
              <button
                type="button"
                onClick={() => setStatus('reserved')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition-all ${
                  status === 'reserved'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] border-[#e2e8f0] dark:border-[#163042]'
                }`}
              >
                Резерв
              </button>
              <button
                type="button"
                onClick={() => setStatus('sold')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition-all ${
                  status === 'sold'
                    ? 'bg-[#01283c] text-white border-[#01283c] shadow-xs'
                    : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] border-[#e2e8f0] dark:border-[#163042]'
                }`}
              >
                Продана
              </button>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                ПІБ клієнта / Назва компанії
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="напр. Іваненко Сергій Васильович"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>

            <div>
              <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">
                Контактний номер телефону
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+380 (50) 123-45-67"
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
              />
            </div>
          </div>

          {/* Booking specific fields */}
          {status === 'booked' && (
            <div className="p-3.5 rounded-2xl bg-[#ffb012]/10 border border-[#ffb012]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#01283c] dark:text-[#ffb012] font-black">
                <Clock className="w-4 h-4" />
                <span>Параметри бронювання з фіксацією ціни</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Термін броні (днів)</label>
                  <select
                    value={bookingDays}
                    onChange={(e) => setBookingDays(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-xs font-bold text-[#01283c] dark:text-[#f8fafc]"
                  >
                    <option value={3}>3 дні (експрес)</option>
                    <option value={7}>7 днів (стандарт)</option>
                    <option value={14}>14 днів (розширений)</option>
                    <option value={30}>30 днів (завдаток)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Сума завдатку ($)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-xs font-bold text-[#01283c] dark:text-[#f8fafc]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0] dark:border-[#163042]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Збереження...' : 'Зберегти зміни'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
