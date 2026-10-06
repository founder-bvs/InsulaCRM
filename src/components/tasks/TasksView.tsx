import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2
} from 'lucide-react';

interface TasksViewProps {
  onOpenNewTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenNewTask }) => {
  const { tasks, toggleTaskComplete, deleteTask, t } = useCrm();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
            {t('tasksTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            {t('tasksSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newTask')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#e2e8f0] dark:border-[#163042] pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === 'pending'
              ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] shadow-xs'
              : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          {t('pendingTab', { count: pendingCount })}
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === 'completed'
              ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] shadow-xs'
              : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          {t('completedTab', { count: completedCount })}
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-[#01283c] text-white dark:bg-[#ffb012] dark:text-[#01283c] shadow-xs'
              : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#01283c] dark:hover:text-[#f8fafc]'
          }`}
        >
          {t('allTab', { count: tasks.length })}
        </button>
      </div>

      {/* Task List Container */}
      <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs divide-y divide-[#e2e8f0] dark:divide-[#163042] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-[#64748b] text-xs">
            <CheckSquare className="w-8 h-8 mx-auto text-[#64748b] mb-2 opacity-50" />
            {t('noTasksFound')}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                task.completed ? 'bg-slate-50 dark:bg-slate-900/40' : 'hover:bg-[#f4f6f8] dark:hover:bg-[#06131c]/60'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mt-1 text-[#64748b] hover:text-[#01283c] dark:hover:text-[#ffb012] transition-colors flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#ffb012]" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm font-bold text-[#01283c] dark:text-[#f8fafc] leading-tight ${
                      task.completed ? 'line-through text-[#64748b] dark:text-[#94a3b8]' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#64748b] dark:text-[#94a3b8] flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-[#01283c] dark:text-[#f8fafc]">
                      <Clock className="w-3.5 h-3.5 text-[#ffb012]" />
                      {task.dueDate}
                    </span>
                    <span>•</span>
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-[#ffb012] text-[#01283c]'
                          : task.priority === 'medium'
                          ? 'bg-[#01283c]/10 text-[#01283c] dark:bg-[#ffb012]/15 dark:text-[#ffb012]'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#64748b]'
                      }`}
                    >
                      {task.priority === 'high' ? t('priorityHigh') : task.priority === 'medium' ? t('priorityMedium') : t('priorityLow')}
                    </span>
                    <span>•</span>
                    <span>{t('assignedToLabel', { name: task.assignedTo })}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 text-[#64748b] hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                title="Видалити завдання"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
