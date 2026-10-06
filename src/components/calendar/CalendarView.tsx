import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, deals, setSelectedDealId, language, t } = useCrm();

  const [currentDate, setCurrentDate] = useState(new Date('2026-04-01'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesUk = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const monthNames = language === 'uk' ? monthNamesUk : monthNamesEn;

  const dayHeadersUk = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dayHeadersEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayHeaders = language === 'uk' ? dayHeadersUk : dayHeadersEn;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-04-01'));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  interface CalendarEvent {
    id: string;
    title: string;
    type: 'task' | 'closing' | 'inspection';
    date: string;
    dealId?: string;
  }

  const events: CalendarEvent[] = [];

  tasks.forEach((tItem) => {
    if (tItem.dueDate) {
      events.push({
        id: `t-${tItem.id}`,
        title: language === 'uk' ? `Завдання: ${tItem.title}` : `Task: ${tItem.title}`,
        type: 'task',
        date: tItem.dueDate
      });
    }
  });

  deals.forEach((d) => {
    if (d.closingDate) {
      events.push({
        id: `d-close-${d.id}`,
        title: language === 'uk' ? `Закриття: ${d.propertyAddress.split(',')[0]}` : `Closing: ${d.propertyAddress.split(',')[0]}`,
        type: 'closing',
        date: d.closingDate,
        dealId: d.id
      });
    }
  });

  const getEventsForDay = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
            {t('calendarTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            {t('calendarSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-[#0c1e2b] border border-[#e2e8f0] dark:border-[#163042] rounded-xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#f4f6f8] dark:hover:bg-[#163042] text-[#64748b] dark:text-[#94a3b8]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#01283c] dark:text-[#f8fafc]">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#f4f6f8] dark:hover:bg-[#163042] text-[#64748b] dark:text-[#94a3b8]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3.5 py-2 bg-white dark:bg-[#0c1e2b] hover:bg-[#f4f6f8] text-[#01283c] dark:text-[#f8fafc] text-xs font-bold rounded-xl border border-[#e2e8f0] dark:border-[#163042]"
          >
            {t('todayBtn')}
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#e2e8f0] dark:border-[#163042] text-center text-xs font-bold text-[#64748b] dark:text-[#94a3b8] py-3 bg-[#f4f6f8] dark:bg-[#06131c] uppercase">
          {dayHeaders.map((dh, i) => (
            <div key={i}>{dh}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#e2e8f0] dark:divide-[#163042]">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-[#f4f6f8]/40 dark:bg-[#06131c]/40 p-2" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isToday = dayNum === 1 && month === 3;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 transition-colors ${
                  isToday ? 'bg-[#ffb012]/10 dark:bg-[#ffb012]/10' : 'hover:bg-[#f4f6f8] dark:hover:bg-[#06131c]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-[#01283c] text-[#ffb012] font-black'
                        : 'text-[#01283c] dark:text-[#f8fafc]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8] font-bold">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        if (evt.dealId) setSelectedDealId(evt.dealId);
                      }}
                      className={`text-[10px] p-1.5 rounded-lg font-bold truncate cursor-pointer transition-all ${
                        evt.type === 'closing'
                          ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c]'
                          : 'bg-[#01283c]/5 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012] border border-[#01283c]/10 dark:border-[#ffb012]/20'
                      }`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
