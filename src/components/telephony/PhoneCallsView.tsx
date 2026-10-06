import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { PhoneCall } from '../../types';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Pause,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const PhoneCallsView: React.FC = () => {
  const { phoneCalls, setSelectedLeadId, leads } = useCrm();

  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  const filteredCalls = phoneCalls.filter((c) => {
    if (directionFilter !== 'all' && c.direction !== directionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.callerName.toLowerCase().includes(q);
      const matchPhone = c.callerPhone.includes(q);
      const matchMgr = c.managerName.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMgr) return false;
    }
    return true;
  });

  const togglePlay = (id: string) => {
    setPlayingCallId(prev => prev === id ? null : id);
  };

  const toggleTranscript = (id: string) => {
    setExpandedTranscriptId(prev => prev === id ? null : id);
  };

  const formatDuration = (secs: number) => {
    if (!secs) return '0 сек';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} хв ${s < 10 ? '0' : ''}${s} сек`;
  };

  const getDirectionBadge = (dir: PhoneCall['direction']) => {
    switch (dir) {
      case 'inbound':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            <PhoneIncoming className="w-3 h-3" />
            <span>Вхідний</span>
          </span>
        );
      case 'outbound':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#01283c] dark:text-[#ffb012] bg-[#01283c]/10 dark:bg-[#ffb012]/20 px-2 py-0.5 rounded-full">
            <PhoneOutgoing className="w-3 h-3" />
            <span>Вихідний</span>
          </span>
        );
      case 'missed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
            <PhoneMissed className="w-3 h-3" />
            <span>Пропущений</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              Телефонія та записи дзвінків
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
              G-PLUS API v1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Журнал телефонних розмов, аудіозаписи клієнтів та автоматична транскрипція розмов (/api/v1/phone_calls)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Всього викликів</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1">{phoneCalls.length}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Вхідних звернень</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {phoneCalls.filter(c => c.direction === 'inbound').length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Вихідних розмов</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#ffb012] mt-1">
            {phoneCalls.filter(c => c.direction === 'outbound').length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">З аудіозаписом</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1">
            {phoneCalls.filter(c => c.isRecorded).length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0c1e2b] p-3.5 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за номером або ім'ям клієнта..."
            className="w-full pl-10 pr-3 py-1.5 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl font-bold text-[#01283c] dark:text-[#f8fafc]"
          >
            <option value="all">Усі типи дзвінків</option>
            <option value="inbound">Вхідні</option>
            <option value="outbound">Вихідні</option>
            <option value="missed">Пропущені</option>
          </select>
        </div>
      </div>

      {/* Calls List Table */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
        <div className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
          {filteredCalls.map((call) => {
            const isPlaying = playingCallId === call.id;
            const isTranscriptOpen = expandedTranscriptId === call.id;

            return (
              <div key={call.id} className="p-4 space-y-3 hover:bg-[#f4f6f8]/50 dark:hover:bg-[#06131c]/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] flex items-center justify-center text-[#01283c] dark:text-[#ffb012]">
                      <Phone className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                          {call.callerName}
                        </span>
                        {getDirectionBadge(call.direction)}
                      </div>
                      <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{call.callerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#01283c] dark:text-[#f8fafc] block">
                        {formatDuration(call.durationSeconds)}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {new Date(call.startedAt).toLocaleString('uk-UA')}
                      </span>
                    </div>

                    {/* Audio Player Button */}
                    {call.isRecorded && (
                      <button
                        onClick={() => togglePlay(call.id)}
                        className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                          isPlaying
                            ? 'bg-[#01283c] text-[#ffb012] border-[#01283c] dark:bg-[#ffb012] dark:text-[#01283c]'
                            : 'bg-white dark:bg-[#0c1e2b] border-[#e2e8f0] dark:border-[#163042] text-[#01283c] dark:text-[#f8fafc]'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Пауза' : 'Запис'}</span>
                      </button>
                    )}

                    {/* Transcription Button */}
                    {call.transcription && (
                      <button
                        onClick={() => toggleTranscript(call.id)}
                        className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#163042] bg-white dark:bg-[#0c1e2b] text-[#01283c] dark:text-[#ffb012] font-bold text-xs flex items-center gap-1.5 hover:border-[#01283c]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Транскрипт</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated Audio Playing Bar */}
                {isPlaying && (
                  <div className="p-3 rounded-xl bg-[#01283c] text-white flex items-center gap-3 text-xs animate-in fade-in">
                    <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#ffb012] h-full w-2/3 animate-pulse" />
                    </div>
                    <span className="font-mono text-[11px] text-[#ffb012]">01:42 / {formatDuration(call.durationSeconds)}</span>
                  </div>
                )}

                {/* Expanded AI Transcript Box */}
                {isTranscriptOpen && call.transcription && (
                  <div className="p-3.5 rounded-xl bg-[#01283c]/5 dark:bg-[#ffb012]/10 border border-[#e2e8f0] dark:border-[#163042] text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-[#01283c] dark:text-[#ffb012] font-black text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Розшифровка розмови (AI Transcription)</span>
                    </div>
                    <p className="text-[#01283c] dark:text-[#f8fafc] leading-relaxed italic bg-white dark:bg-[#0c1e2b] p-3 rounded-lg border border-[#e2e8f0] dark:border-[#163042]">
                      «{call.transcription}»
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
