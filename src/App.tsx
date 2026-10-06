import React, { useState } from 'react';
import { useCrm } from './context/CrmContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BuildingChessboardView } from './components/chess/BuildingChessboardView';
import { Dashboard } from './components/dashboard/Dashboard';
import { LeadsView } from './components/leads/LeadsView';
import { LeadDetailModal } from './components/leads/LeadDetailModal';
import { NewLeadModal } from './components/leads/NewLeadModal';
import { DealsPipelineView } from './components/deals/DealsPipelineView';
import { DealDetailModal } from './components/deals/DealDetailModal';
import { NewDealModal } from './components/deals/NewDealModal';
import { DispositionRoomModal } from './components/deals/DispositionRoomModal';
import { FinancesView } from './components/finances/FinancesView';
import { AgenciesView } from './components/agencies/AgenciesView';
import { PropertiesView } from './components/properties/PropertiesView';
import { BuyersView } from './components/buyers/BuyersView';
import { NewBuyerModal } from './components/buyers/NewBuyerModal';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { NewTaskModal } from './components/tasks/NewTaskModal';
import { SettingsView } from './components/settings/SettingsView';
import { SearchResultsView } from './components/search/SearchResultsView';
import { SupabaseConfigModal } from './components/database/SupabaseConfigModal';
import { AuthModal } from './components/auth/AuthModal';
import { GPlusSyncView } from './components/sync/GPlusSyncView';
import { PhoneCallsView } from './components/telephony/PhoneCallsView';
import { ResaleRentView } from './components/resale/ResaleRentView';

export const AppContent: React.FC = () => {
  const {
    activeTab,
    selectedLeadId,
    setSelectedLeadId,
    selectedDealId,
    setSelectedDealId,
    dispositionDealId,
    setDispositionDealId,
    isSupabaseConfigModalOpen,
    setIsSupabaseConfigModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    deals,
    t
  } = useCrm();

  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showNewBuyerModal, setShowNewBuyerModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8] dark:bg-[#06131c] text-[#01283c] dark:text-[#f8fafc] transition-colors">
      <Navbar
        onOpenNewLead={() => setShowNewLeadModal(true)}
        onOpenNewDeal={() => setShowNewDealModal(true)}
        onOpenNewBuyer={() => setShowNewBuyerModal(true)}
        onOpenNewTask={() => setShowNewTaskModal(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'chessboard' && <BuildingChessboardView />}
          {activeTab === 'sync' && <GPlusSyncView />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'leads' && (
            <LeadsView onOpenNewLead={() => setShowNewLeadModal(true)} />
          )}
          {activeTab === 'deals' && (
            <DealsPipelineView
              onOpenNewDeal={() => setShowNewDealModal(true)}
              onOpenDispoRoom={(id) => setDispositionDealId(id)}
            />
          )}
          {activeTab === 'finances' && <FinancesView />}
          {activeTab === 'telephony' && <PhoneCallsView />}
          {activeTab === 'resale' && <ResaleRentView />}
          {activeTab === 'agencies' && <AgenciesView />}
          {activeTab === 'properties' && <PropertiesView />}
          {activeTab === 'disposition' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
                <h2 className="text-xl font-bold mb-2 text-[#01283c] dark:text-[#f8fafc]">
                  {t('dispositionRoom')}
                </h2>
                <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-4">
                  Оберіть активну угоду під контрактом для запуску підбору інвесторів та маркетингової розсилки:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deals.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDispositionDealId(d.id)}
                      className="p-4 text-left rounded-xl border border-[#e2e8f0] dark:border-[#163042] hover:border-[#01283c] dark:hover:border-[#ffb012] bg-[#f4f6f8] dark:bg-[#06131c] transition-all"
                    >
                      <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
                        {d.title}
                      </h3>
                      <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">{d.propertyAddress}</p>
                      <div className="mt-2 text-xs flex justify-between">
                        <span className="text-[#64748b] dark:text-[#94a3b8]">{t('contractPrice')}: ${d.contractPrice.toLocaleString()}</span>
                        <span className="font-bold text-[#01283c] dark:text-[#ffb012]">
                          {t('projectedSpread')}: ${d.estimatedFee.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'buyers' && (
            <BuyersView onOpenNewBuyer={() => setShowNewBuyerModal(true)} />
          )}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'tasks' && (
            <TasksView onOpenNewTask={() => setShowNewTaskModal(true)} />
          )}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'search' && <SearchResultsView />}
        </main>
      </div>

      {/* Global Modals */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}

      {selectedDealId && (
        <DealDetailModal
          dealId={selectedDealId}
          onClose={() => setSelectedDealId(null)}
          onOpenDispoRoom={(id) => setDispositionDealId(id)}
        />
      )}

      {dispositionDealId && (
        <DispositionRoomModal
          dealId={dispositionDealId}
          onClose={() => setDispositionDealId(null)}
        />
      )}

      {showNewLeadModal && (
        <NewLeadModal onClose={() => setShowNewLeadModal(false)} />
      )}

      {showNewDealModal && (
        <NewDealModal onClose={() => setShowNewDealModal(false)} />
      )}

      {showNewBuyerModal && (
        <NewBuyerModal onClose={() => setShowNewBuyerModal(false)} />
      )}

      {showNewTaskModal && (
        <NewTaskModal onClose={() => setShowNewTaskModal(false)} />
      )}

      {isSupabaseConfigModalOpen && (
        <SupabaseConfigModal onClose={() => setIsSupabaseConfigModalOpen(false)} />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
};
