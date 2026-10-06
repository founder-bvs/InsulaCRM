import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { X, CheckSquare } from 'lucide-react';

interface NewTaskModalProps {
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose }) => {
  const { addTask, currentUser, language, t } = useCrm();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [assignedTo] = useState(currentUser.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      description,
      dueDate,
      completed: false,
      priority,
      assignedTo
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1e2b] rounded-3xl border border-[#e2e8f0] dark:border-[#163042] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-[#e2e8f0] dark:border-[#163042] flex items-center justify-between bg-[#f4f6f8] dark:bg-[#06131c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#01283c] text-[#ffb012] dark:bg-[#ffb012] dark:text-[#01283c]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#01283c] dark:text-[#f8fafc]">{t('newTaskModalTitle')}</h2>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{t('newTaskModalSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#f8fafc] rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#163042] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#64748b] dark:text-[#94a3b8]">{t('taskTitleLabel')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'uk' ? "напр. Узгодити договір купівлі-продажу" : "e.g. Follow up on title lien payoff"}
              className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#64748b] dark:text-[#94a3b8]">{t('taskDescLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'uk' ? "Деталі завдання, контактна інформація або нотатки..." : "Add details, notes, or contact instructions..."}
              rows={2}
              className="w-full mt-1.5 p-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc] focus:outline-none focus:border-[#01283c] dark:focus:border-[#ffb012]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-[#64748b] dark:text-[#94a3b8]">{t('dueDateLabel')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#64748b] dark:text-[#94a3b8]">{t('priorityLabel')}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full mt-1.5 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-semibold capitalize text-[#01283c] dark:text-[#f8fafc]"
              >
                <option value="high">{t('priorityHigh')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="low">{t('priorityLow')}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              {t('saveTaskBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
