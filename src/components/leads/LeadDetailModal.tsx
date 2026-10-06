import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead } from '../../types';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  AlertOctagon,
  Flame,
  Home,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

interface LeadDetailModalProps {
  leadId: string;
  onClose: () => void;
  onConvertToDeal?: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  onClose
}) => {
  const {
    leads,
    updateLead,
    toggleLeadDnc,
    addActivity,
    addTask,
    activities,
    currentUser,
    addDeal,
    setActiveTab,
    language,
    t
  } = useCrm();

  const lead = leads.find((l) => l.id === leadId);

  const [activeTab, setActiveModalTab] = useState<'overview' | 'financials' | 'photos' | 'activity'>('overview');
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!lead) return null;

  const p = lead.property;

  const handleUpdatePropertyFinancials = (field: string, value: number) => {
    const updatedProp = { ...p, [field]: value };
    const mao = Math.round(
      (updatedProp.arv * (updatedProp.maoRulePercent / 100)) -
      updatedProp.repairEstimate -
      updatedProp.desiredAssignmentFee
    );
    updatedProp.calculatedMao = mao;
    updateLead(lead.id, { property: updatedProp });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addActivity({
      type: 'note',
      title: language === 'uk' ? 'Додано нотатку' : 'Note logged',
      description: newNote,
      userName: currentUser.name,
      relatedEntityId: lead.id,
      relatedEntityType: 'lead'
    });
    setNewNote('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      completed: false,
      priority: 'high',
      assignedTo: lead.assignedAgent || currentUser.name,
      relatedEntityId: lead.id,
      relatedEntityType: 'lead'
    });
    setNewTaskTitle('');
  };

  const handleMakeDeal = () => {
    addDeal({
      leadId: lead.id,
      title: `${lead.property.address} (${language === 'uk' ? 'Оптова угода' : 'Wholesale'})`,
      propertyAddress: `${lead.property.address}, ${lead.property.city} ${lead.property.state} ${lead.property.zip}`,
      sellerName: lead.name,
      stage: 'under_contract',
      contractPrice: lead.property.calculatedMao,
      earnestMoney: 2000,
      inspectionPeriodDays: 14,
      contractDate: new Date().toISOString().split('T')[0],
      closingDate: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0],
      estimatedFee: lead.property.desiredAssignmentFee,
      assignedAgent: lead.assignedAgent,
      notes: lead.notes
    });
    updateLead(lead.id, { status: 'under_contract' });
    onClose();
    setActiveTab('deals');
  };

  const relatedActivities = activities.filter(
    (a) => a.relatedEntityId === lead.id || a.relatedEntityType === 'lead'
  );

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const whatsAppGreeting = language === 'uk'
    ? `Доброго дня, ${lead.name}! Це ${currentUser.name} з VRTKL CRM щодо вашого об'єкта за адресою ${lead.property.address}.`
    : `Hello ${lead.name}, this is ${currentUser.name} from VRTKL CRM following up regarding your property on ${lead.property.address}.`;

  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppGreeting)}`;

  const getMarkerLabel = (marker: string): string => {
    const key = `marker_${marker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return t(key as any) || marker;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-start justify-between gap-4 bg-[#f4f6f8] dark:bg-[#06131c]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#01283c] dark:text-[#f8fafc]">
                {lead.name}
              </h2>
              {lead.dnc ? (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {t('dncFlagged')}
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/15 dark:border-[#ffb012]/30">
                  {t('contactAllowed')}
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#0c1e2b] text-[#64748b] dark:text-[#94a3b8] border border-[#e2e8f0] dark:border-[#163042] capitalize">
                {t('thStatus')}: {t(`status_${lead.status}` as any) || lead.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1.5 flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-[#ffb012]" />
              <span>
                {lead.property.address}, {lead.property.city}, {lead.property.state} {lead.property.zip}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMakeDeal}
              className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('convertToDealBtn')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] hover:bg-[#e2e8f0] dark:hover:bg-[#163042]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Ribbon */}
        <div className="px-6 py-3 bg-white dark:bg-[#0c1e2b] border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {!lead.dnc ? (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs font-bold text-[#01283c] dark:text-[#f8fafc] hover:border-[#01283c] dark:hover:border-[#ffb012] flex items-center gap-1.5 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#ffb012]" />
                  <span>{t('callBtn')} {lead.phone}</span>
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="px-3 py-1.5 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] text-xs font-bold text-[#01283c] dark:text-[#f8fafc] hover:border-[#01283c] dark:hover:border-[#ffb012] flex items-center gap-1.5 shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ffb012]" />
                  <span>{t('emailBtn')}</span>
                </a>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#ffb012] text-[#01283c] text-xs font-bold hover:bg-[#e59e10] flex items-center gap-1.5 shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#01283c]" />
                  <span>{t('whatsAppBtn')}</span>
                </a>
              </>
            ) : (
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <AlertOctagon className="w-4 h-4" />
                {t('dncDisabledWarning')}
              </span>
            )}
          </div>

          <button
            onClick={() => toggleLeadDnc(lead.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              lead.dnc
                ? 'bg-[#01283c] text-white border-[#01283c]'
                : 'bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] border-[#e2e8f0] dark:border-[#163042] hover:text-[#01283c]'
            }`}
          >
            {lead.dnc ? t('removeFromDnc') : t('flagAsDnc')}
          </button>
        </div>

        {/* Tab Navigation in Modal */}
        <div className="flex border-b border-[#e2e8f0] dark:border-[#163042] px-6 bg-[#f4f6f8] dark:bg-[#06131c]">
          <button
            onClick={() => setActiveModalTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
            }`}
          >
            {t('tabOverview')}
          </button>
          <button
            onClick={() => setActiveModalTab('financials')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'financials'
                ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
            }`}
          >
            {t('tabFinancials')}
          </button>
          <button
            onClick={() => setActiveModalTab('photos')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'photos'
                ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
            }`}
          >
            {t('tabPhotos', { count: lead.photos.length })}
          </button>
          <button
            onClick={() => setActiveModalTab('activity')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
                : 'border-transparent text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
            }`}
          >
            {t('tabActivity')}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dual Motivation Score Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
                      {t('systemMotivationScore')}
                    </span>
                    <p className="text-3xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
                      {lead.motivationScore} <span className="text-xs text-[#64748b]">/ 100</span>
                    </p>
                    <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-1">
                      {t('systemMotivationDesc')}
                    </p>
                  </div>
                  <Flame className="w-8 h-8 text-[#ffb012]" />
                </div>

                <div className="p-4 rounded-xl bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ffb012]" />
                      {t('aiSentimentScore')}
                    </span>
                    <p className="text-3xl font-black text-[#01283c] dark:text-[#ffb012] mt-1 tracking-tight">
                      {lead.aiMotivationScore} <span className="text-xs text-[#64748b]">/ 100</span>
                    </p>
                    <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-1">
                      {t('aiSentimentDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Details Specs */}
              <div className="bg-white dark:bg-[#0c1e2b] p-5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8] mb-3">
                  {t('propertySpecsTitle')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748b] dark:text-[#94a3b8]">{t('bedsBaths')}:</span>
                    <p className="font-bold text-[#01283c] dark:text-[#f8fafc] mt-0.5">
                      {p.beds} / {p.baths}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748b] dark:text-[#94a3b8]">{t('sqFootage')}:</span>
                    <p className="font-bold text-[#01283c] dark:text-[#f8fafc] mt-0.5">
                      {p.sqft.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748b] dark:text-[#94a3b8]">{t('yearBuilt')}:</span>
                    <p className="font-bold text-[#01283c] dark:text-[#f8fafc] mt-0.5">
                      {p.yearBuilt}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748b] dark:text-[#94a3b8]">{t('condition')}:</span>
                    <p className="font-bold capitalize text-[#01283c] dark:text-[#f8fafc] mt-0.5">
                      {p.condition.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Distress Markers */}
                <div className="mt-4 pt-4 border-t border-[#e2e8f0] dark:border-[#163042]">
                  <span className="text-xs text-[#64748b] dark:text-[#94a3b8] block mb-2 font-semibold">
                    {t('distressMarkersLabel')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.distressMarkers.map((marker, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#01283c]/5 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/10 dark:border-[#ffb012]/30"
                      >
                        {getMarkerLabel(marker)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white dark:bg-[#0c1e2b] p-5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8] mb-2">
                  {t('acquisitionNotes')}
                </h3>
                <p className="text-sm text-[#01283c] dark:text-[#f8fafc] leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#01283c] dark:text-[#ffb012] uppercase tracking-wider">
                      {t('maoTitle')}
                    </p>
                    <p className="text-4xl font-black mt-1 tracking-tight">
                      ${p.calculatedMao.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                      (ARV × {p.maoRulePercent}%) − ${p.repairEstimate.toLocaleString()} − ${p.desiredAssignmentFee.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-[#01283c]/5 dark:bg-[#ffb012]/15 text-[#01283c] dark:text-[#ffb012] rounded-2xl border border-[#01283c]/10 dark:border-[#ffb012]/20">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Interactive Calculation Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
                  <label className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
                    {t('arvLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
                    <input
                      type="number"
                      value={p.arv}
                      onChange={(e) => handleUpdatePropertyFinancials('arv', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
                  <label className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
                    {t('repairsLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
                    <input
                      type="number"
                      value={p.repairEstimate}
                      onChange={(e) => handleUpdatePropertyFinancials('repairEstimate', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
                  <label className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
                    {t('maoRuleLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={p.maoRulePercent}
                      onChange={(e) => handleUpdatePropertyFinancials('maoRulePercent', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042]">
                  <label className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">
                    {t('targetFeeLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
                    <input
                      type="number"
                      value={p.desiredAssignmentFee}
                      onChange={(e) => handleUpdatePropertyFinancials('desiredAssignmentFee', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-sm font-bold text-[#01283c] dark:text-[#ffb012]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {lead.photos.length === 0 ? (
                <div className="text-center py-12 text-[#64748b]">
                  <Home className="w-12 h-12 mx-auto text-[#64748b] mb-2 opacity-50" />
                  <p className="text-sm">{t('noPhotosYet')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lead.photos.map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
                      <img src={url} alt={`Property view ${i + 1}`} className="w-full h-48 object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t('logNotePlaceholder')}
                  className="w-full p-3 text-sm bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-bold"
                  >
                    {t('addNoteBtn')}
                  </button>
                </div>
              </form>

              {/* Add Task Quick */}
              <form onSubmit={handleCreateTask} className="p-4 bg-[#f4f6f8] dark:bg-[#06131c] rounded-xl border border-[#e2e8f0] dark:border-[#163042] flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={t('createTaskPlaceholder')}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-lg text-[#01283c] dark:text-[#f8fafc]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#01283c] dark:bg-[#ffb012] text-white dark:text-[#01283c] text-xs font-bold rounded-lg hover:opacity-90"
                >
                  {t('addTaskBtn')}
                </button>
              </form>

              {/* Activity Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
                  {t('timeline')}
                </h4>
                {relatedActivities.map((act) => (
                  <div key={act.id} className="p-3 bg-white dark:bg-[#0c1e2b] rounded-xl border border-[#e2e8f0] dark:border-[#163042] flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#ffb012] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-[#01283c] dark:text-[#f8fafc]">{act.title}</p>
                      <p className="text-[#64748b] dark:text-[#94a3b8] mt-0.5">{act.description}</p>
                      <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] mt-1">{act.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
