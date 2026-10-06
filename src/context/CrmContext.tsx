import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BusinessMode,
  Lead,
  Deal,
  Buyer,
  Task,
  Activity,
  SystemUser,
  DealStage,
  DealOffer,
  Building,
  BuildingSection,
  Unit,
  UnitBooking,
  Agency,
  Expense,
  ExpenseGroup,
  NbuRate,
  PhoneCall,
  ResaleProperty,
  RentProperty
} from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import { CrmDbService } from '../services/crmDbService';
import { getSupabase, isSupabaseConfigured, getStoredSupabaseConfig, saveStoredSupabaseConfig, clearStoredSupabaseConfig } from '../lib/supabase';
import { fetchNbuRates, getNbuRates } from '../services/nbuService';
import { GPlusSyncService } from '../services/gplusSyncService';
import { cronSyncEngine } from '../services/cronSyncEngine';

export type TranslationKey = keyof typeof translations['en'];

interface CrmContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;

  businessMode: BusinessMode;
  setBusinessMode: (mode: BusinessMode) => void;
  toggleBusinessMode: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  users: SystemUser[];
  currentUser: SystemUser;

  // Supabase connection & Auth
  isSupabaseOnline: boolean;
  isSupabaseConfigModalOpen: boolean;
  setIsSupabaseConfigModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  supabaseUser: any;
  saveSupabaseSettings: (url: string, key: string) => Promise<boolean>;
  disconnectSupabase: () => void;
  signOutSupabase: () => Promise<void>;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  toggleLeadDnc: (id: string) => Promise<void>;

  // Deals
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'offers' | 'checklist'>) => Promise<Deal>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  updateDealStage: (id: string, newStage: DealStage) => Promise<void>;
  addDealOffer: (dealId: string, offer: Omit<DealOffer, 'id' | 'date'>) => Promise<void>;
  updateOfferStatus: (dealId: string, offerId: string, status: DealOffer['status']) => Promise<void>;
  toggleChecklistItem: (dealId: string, itemId: string) => Promise<void>;
  assignBuyerToDeal: (dealId: string, buyerId: string, buyerName: string, finalPrice: number) => Promise<void>;

  // Buyers
  buyers: Buyer[];
  addBuyer: (buyer: Omit<Buyer, 'id'>) => Promise<Buyer>;
  updateBuyer: (id: string, updates: Partial<Buyer>) => Promise<void>;
  deleteBuyer: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>;
  toggleTaskComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;

  // G-PLUS DEVELOPER ENTITIES
  buildings: Building[];
  sections: BuildingSection[];
  units: Unit[];
  bookings: UnitBooking[];
  agencies: Agency[];
  expenses: Expense[];
  expenseGroups: ExpenseGroup[];
  phoneCalls: PhoneCall[];
  resaleProperties: ResaleProperty[];
  rentProperties: RentProperty[];
  nbuRate: NbuRate;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  updateUnitStatus: (unitId: string, status: Unit['status'], clientName?: string, clientPhone?: string) => Promise<void>;
  createBooking: (booking: Omit<UnitBooking, 'id'>) => Promise<UnitBooking>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;

  // Global navigation & filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;
  dispositionDealId: string | null;
  setDispositionDealId: (id: string | null) => void;

  refreshAllData: () => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vrtkl_lang') as Language) || 'uk';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vrtkl_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'uk' ? 'en' : 'uk');
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.uk;
    let text: string = dict[key] || translations.en[key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }
    return text;
  };

  const [businessMode, setBusinessModeState] = useState<BusinessMode>(() => {
    return (localStorage.getItem('vrtkl_business_mode') as BusinessMode) || 'wholesale';
  });

  const setBusinessMode = (mode: BusinessMode) => {
    setBusinessModeState(mode);
    localStorage.setItem('vrtkl_business_mode', mode);
  };

  const toggleBusinessMode = () => {
    const next = businessMode === 'wholesale' ? 'realestate' : 'wholesale';
    setBusinessMode(next);
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('vrtkl_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vrtkl_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vrtkl_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Modals & Navigation
  const [activeTab, setActiveTab] = useState<string>('chessboard'); // default to developer chessboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [dispositionDealId, setDispositionDealId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Supabase states
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(isSupabaseConfigured());
  const [isSupabaseConfigModalOpen, setIsSupabaseConfigModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  // Team
  const [users] = useState<SystemUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<SystemUser>(INITIAL_USERS[0]);

  // Data collections
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sections, setSections] = useState<BuildingSection[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<UnitBooking[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [phoneCalls, setPhoneCalls] = useState<PhoneCall[]>(() => GPlusSyncService.getPhoneCalls());
  const [resaleProperties, setResaleProperties] = useState<ResaleProperty[]>(() => GPlusSyncService.getResaleProperties());
  const [rentProperties, setRentProperties] = useState<RentProperty[]>(() => GPlusSyncService.getRentProperties());
  const [nbuRate, setNbuRate] = useState<NbuRate>(getNbuRates());

  // Supabase Auth listener
  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSupabaseUser(session?.user ?? null);
        if (session?.user?.email) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            role: 'Керівник відділу'
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSupabaseUser(session?.user ?? null);
        if (session?.user?.email) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            role: 'Керівник відділу'
          });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Fetch initial data from CrmDbService (Supabase or Local)
  const refreshAllData = useCallback(async () => {
    try {
      const [
        fetchedBuildings,
        fetchedSections,
        fetchedUnits,
        fetchedBookings,
        fetchedLeads,
        fetchedDeals,
        fetchedBuyers,
        fetchedTasks,
        fetchedActivities,
        fetchedAgencies,
        fetchedExpenses,
        fetchedGroups,
        fetchedNbu
      ] = await Promise.all([
        CrmDbService.getBuildings(),
        CrmDbService.getSections(),
        CrmDbService.getUnits(),
        CrmDbService.getBookings(),
        CrmDbService.getLeads(),
        CrmDbService.getDeals(),
        CrmDbService.getBuyers(),
        CrmDbService.getTasks(),
        CrmDbService.getActivities(),
        CrmDbService.getAgencies(),
        CrmDbService.getExpenses(),
        CrmDbService.getExpenseGroups(),
        fetchNbuRates()
      ]);

      setBuildings(fetchedBuildings);
      setSections(fetchedSections);
      setUnits(fetchedUnits);
      setBookings(fetchedBookings);
      setLeads(fetchedLeads);
      setDeals(fetchedDeals);
      setBuyers(fetchedBuyers);
      setTasks(fetchedTasks);
      setActivities(fetchedActivities);
      setAgencies(fetchedAgencies);
      setExpenses(fetchedExpenses);
      setExpenseGroups(fetchedGroups);
      setPhoneCalls(GPlusSyncService.getPhoneCalls());
      setResaleProperties(GPlusSyncService.getResaleProperties());
      setRentProperties(GPlusSyncService.getRentProperties());
      setNbuRate(fetchedNbu);

      if (fetchedBuildings.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(fetchedBuildings[0].id);
      }
    } catch (err) {
      console.error('Error refreshing CRM data:', err);
    }
  }, [selectedBuildingId]);

  useEffect(() => {
    refreshAllData();

    // Subscribe to cron background sync completion so CRM state always stays updated automatically
    const unsubscribe = cronSyncEngine.subscribe(
      () => {},
      () => {
        refreshAllData();
      }
    );
    return () => unsubscribe();
  }, [refreshAllData]);

  // Supabase Configuration Management
  const saveSupabaseSettings = async (url: string, key: string): Promise<boolean> => {
    saveStoredSupabaseConfig(url, key);
    const configured = isSupabaseConfigured();
    setIsSupabaseOnline(configured);
    await refreshAllData();
    return configured;
  };

  const disconnectSupabase = () => {
    clearStoredSupabaseConfig();
    setIsSupabaseOnline(false);
  };

  const signOutSupabase = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      setSupabaseUser(null);
    }
  };

  // Unit and Booking mutations
  const updateUnitStatus = async (unitId: string, status: Unit['status'], clientName?: string, clientPhone?: string) => {
    await CrmDbService.updateUnitStatus(unitId, status, clientName, clientPhone);
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status, clientName, clientPhone } : u));
  };

  const createBooking = async (bookingData: Omit<UnitBooking, 'id'>): Promise<UnitBooking> => {
    const newBooking = await CrmDbService.createBooking(bookingData);
    setBookings(prev => [newBooking, ...prev]);
    // Also reflect in unit
    setUnits(prev => prev.map(u => u.id === bookingData.unitId ? {
      ...u,
      status: 'booked',
      clientName: bookingData.clientName,
      clientPhone: bookingData.clientPhone
    } : u));
    return newBooking;
  };

  const addExpense = async (exp: Omit<Expense, 'id'>): Promise<Expense> => {
    const created = await CrmDbService.addExpense(exp);
    setExpenses(prev => [created, ...prev]);
    return created;
  };

  // Leads CRUD
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
    const created = await CrmDbService.createLead(leadData);
    setLeads(prev => [created, ...prev]);
    addActivity({
      type: 'note',
      title: 'Створено нового ліда',
      description: `Створено картку клієнта: ${created.name} (${created.property.address})`,
      userName: currentUser.name,
      relatedEntityId: created.id,
      relatedEntityType: 'lead'
    });
    return created;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const current = leads.find(l => l.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    await CrmDbService.updateLead(updated);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const toggleLeadDnc = async (id: string) => {
    const current = leads.find(l => l.id === id);
    if (!current) return;
    await updateLead(id, { dnc: !current.dnc });
  };

  // Deals CRUD
  const addDeal = async (dealData: Omit<Deal, 'id' | 'offers' | 'checklist'>): Promise<Deal> => {
    const fullDeal: Omit<Deal, 'id'> = {
      ...dealData,
      offers: [],
      checklist: [
        { id: `c-${Date.now()}-1`, title: 'Отримати документи клієнта (паспорт, ІПН)', completed: false },
        { id: `c-${Date.now()}-2`, title: 'Узгодити графік платежів або розстрочки', completed: false },
        { id: `c-${Date.now()}-3`, title: 'Підписання нотаріального договору', completed: false }
      ]
    };
    const created = await CrmDbService.createDeal(fullDeal);
    setDeals(prev => [created, ...prev]);
    addActivity({
      type: 'stage_change',
      title: 'Створено нову угоду',
      description: `Угоду «${created.title}» додано на стадію ${created.stage}`,
      userName: currentUser.name,
      relatedEntityId: created.id,
      relatedEntityType: 'deal'
    });
    return created;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const current = deals.find(d => d.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    await CrmDbService.updateDeal(updated);
    setDeals(prev => prev.map(d => d.id === id ? updated : d));
  };

  const deleteDeal = async (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  const updateDealStage = async (id: string, newStage: DealStage) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    await updateDeal(id, { stage: newStage });
    addActivity({
      type: 'stage_change',
      title: 'Зміна стадії угоди',
      description: `Угоду «${deal.title}» переведено на стадію ${newStage}`,
      userName: currentUser.name,
      relatedEntityId: id,
      relatedEntityType: 'deal'
    });
  };

  const addDealOffer = async (dealId: string, offerData: Omit<DealOffer, 'id' | 'date'>) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    const newOffer: DealOffer = {
      ...offerData,
      id: `off-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    await updateDeal(dealId, { offers: [...deal.offers, newOffer] });
  };

  const updateOfferStatus = async (dealId: string, offerId: string, status: DealOffer['status']) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    const updatedOffers = deal.offers.map(o => o.id === offerId ? { ...o, status } : o);
    await updateDeal(dealId, { offers: updatedOffers });
  };

  const toggleChecklistItem = async (dealId: string, itemId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    const updatedChecklist = deal.checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c);
    await updateDeal(dealId, { checklist: updatedChecklist });
  };

  const assignBuyerToDeal = async (dealId: string, buyerId: string, buyerName: string, finalPrice: number) => {
    await updateDeal(dealId, {
      buyerAssignedId: buyerId,
      buyerAssignedName: buyerName,
      finalSalePrice: finalPrice,
      stage: 'under_contract'
    });
  };

  // Buyers CRUD
  const addBuyer = async (buyerData: Omit<Buyer, 'id'>): Promise<Buyer> => {
    const created = await CrmDbService.addBuyer(buyerData);
    setBuyers(prev => [created, ...prev]);
    return created;
  };

  const updateBuyer = async (id: string, updates: Partial<Buyer>) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBuyer = async (id: string) => {
    setBuyers(prev => prev.filter(b => b.id !== id));
  };

  // Tasks
  const addTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
    const created = await CrmDbService.addTask(taskData);
    setTasks(prev => [created, ...prev]);
    return created;
  };

  const toggleTaskComplete = async (id: string) => {
    await CrmDbService.toggleTask(id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Activities
  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    const created = await CrmDbService.addActivity(activityData);
    setActivities(prev => [created, ...prev]);
  };

  return (
    <CrmContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        businessMode,
        setBusinessMode,
        toggleBusinessMode,
        isDarkMode,
        toggleDarkMode,
        users,
        currentUser,
        isSupabaseOnline,
        isSupabaseConfigModalOpen,
        setIsSupabaseConfigModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        supabaseUser,
        saveSupabaseSettings,
        disconnectSupabase,
        signOutSupabase,
        leads,
        addLead,
        updateLead,
        deleteLead,
        toggleLeadDnc,
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
        updateDealStage,
        addDealOffer,
        updateOfferStatus,
        toggleChecklistItem,
        assignBuyerToDeal,
        buyers,
        addBuyer,
        updateBuyer,
        deleteBuyer,
        tasks,
        addTask,
        toggleTaskComplete,
        deleteTask,
        activities,
        addActivity,
        buildings,
        sections,
        units,
        bookings,
        agencies,
        expenses,
        expenseGroups,
        phoneCalls,
        resaleProperties,
        rentProperties,
        nbuRate,
        selectedBuildingId,
        setSelectedBuildingId,
        updateUnitStatus,
        createBooking,
        addExpense,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedLeadId,
        setSelectedLeadId,
        selectedDealId,
        setSelectedDealId,
        dispositionDealId,
        setDispositionDealId,
        refreshAllData
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = (): CrmContextType => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
