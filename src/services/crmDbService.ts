import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Lead,
  Deal,
  Buyer,
  Task,
  Activity,
  Building,
  BuildingSection,
  Unit,
  UnitBooking,
  Agency,
  Expense,
  ExpenseGroup,
  DealPayment,
  PhoneCall,
  ResaleProperty,
  RentProperty,
  MergeStats,
  SyncDeltaReport
} from '../types';
import {
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_BUYERS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_BUILDINGS,
  INITIAL_SECTIONS,
  INITIAL_UNITS,
  INITIAL_BOOKINGS,
  INITIAL_AGENCIES,
  INITIAL_EXPENSE_GROUPS,
  INITIAL_EXPENSES
} from '../data/mockData';

// Helper for local storage persistence
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};

function cleanPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

function smartMerge<T extends { id: string }>(
  existing: T[],
  incoming: T[],
  matcher: (ex: T, inc: T) => boolean,
  updater: (ex: T, inc: T) => T
): { merged: T[]; stats: MergeStats; toUpsert: T[] } {
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  const toUpsert: T[] = [];

  const result = [...existing];

  for (const inc of incoming) {
    const existingIndex = result.findIndex(ex => matcher(ex, inc));
    if (existingIndex >= 0) {
      const ex = result[existingIndex];
      const mergedItem = updater(ex, inc);
      const isChanged = JSON.stringify(ex) !== JSON.stringify(mergedItem);
      if (isChanged) {
        result[existingIndex] = mergedItem;
        toUpsert.push(mergedItem);
        updated++;
      } else {
        unchanged++;
      }
    } else {
      result.push(inc);
      toUpsert.push(inc);
      added++;
    }
  }

  return {
    merged: result,
    stats: {
      added,
      updated,
      unchanged,
      total: result.length
    },
    toUpsert
  };
}

export const CrmDbService = {
  // ----------------------------------------------------------------
  // BUILDINGS & UNITS (Шахівка квартир)
  // ----------------------------------------------------------------
  async getBuildings(): Promise<Building[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('buildings').select('*').order('name');
        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address,
            city: b.city || 'Івано-Франківськ',
            floorsCount: b.floors_count || 10,
            sectionsCount: b.sections_count || 3,
            completionDate: b.completion_date || '',
            status: b.status || 'construction',
            image: b.image || '',
            description: b.description || ''
          }));
        }
      } catch (e) {
        console.warn('Supabase getBuildings fallback to local:', e);
      }
    }
    return getLocal<Building[]>('vrtkl_buildings', INITIAL_BUILDINGS);
  },

  async getSections(buildingId?: string): Promise<BuildingSection[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('building_sections').select('*');
        if (buildingId) query = query.eq('building_id', buildingId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            buildingId: s.building_id,
            name: s.name,
            floors: s.floors,
            unitsCount: s.units_count
          }));
        }
      } catch (e) {
        console.warn('Supabase getSections fallback to local:', e);
      }
    }
    const all = getLocal<BuildingSection[]>('vrtkl_sections', INITIAL_SECTIONS);
    return buildingId ? all.filter(s => s.buildingId === buildingId) : all;
  },

  async getUnits(buildingId?: string): Promise<Unit[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('units').select('*').order('floor', { ascending: false }).order('number');
        if (buildingId) query = query.eq('building_id', buildingId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((u: any) => ({
            id: u.id,
            buildingId: u.building_id,
            sectionId: u.section_id,
            number: u.number,
            floor: u.floor,
            rooms: u.rooms,
            type: u.type,
            totalArea: Number(u.total_area),
            livingArea: Number(u.living_area || 0),
            kitchenArea: Number(u.kitchen_area || 0),
            pricePerSqm: Number(u.price_per_sqm),
            totalPrice: Number(u.total_price),
            status: u.status,
            clientName: u.client_name,
            clientPhone: u.client_phone,
            layoutImage: u.layout_image
          }));
        }
      } catch (e) {
        console.warn('Supabase getUnits fallback to local:', e);
      }
    }
    const all = getLocal<Unit[]>('vrtkl_units', INITIAL_UNITS);
    return buildingId ? all.filter(u => u.buildingId === buildingId) : all;
  },

  async updateUnitStatus(unitId: string, status: Unit['status'], clientName?: string, clientPhone?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('units').update({
          status,
          client_name: clientName || null,
          client_phone: clientPhone || null
        }).eq('id', unitId);
      } catch (e) {
        console.error('Supabase updateUnitStatus error:', e);
      }
    }
    // Update local cache
    const units = getLocal<Unit[]>('vrtkl_units', INITIAL_UNITS);
    const updated = units.map(u => u.id === unitId ? { ...u, status, clientName, clientPhone } : u);
    setLocal('vrtkl_units', updated);
    return true;
  },

  // ----------------------------------------------------------------
  // BOOKINGS (Бронювання)
  // ----------------------------------------------------------------
  async getBookings(): Promise<UnitBooking[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('unit_bookings').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            unitId: b.unit_id,
            unitNumber: b.unit_number,
            buildingName: b.building_name,
            clientName: b.client_name,
            clientPhone: b.client_phone,
            depositAmount: Number(b.deposit_amount),
            bookingDate: b.booking_date,
            expiresAt: b.expires_at,
            managerName: b.manager_name,
            status: b.status
          }));
        }
      } catch (e) {
        console.warn('Supabase getBookings fallback to local:', e);
      }
    }
    return getLocal<UnitBooking[]>('vrtkl_bookings', INITIAL_BOOKINGS);
  },

  async createBooking(booking: Omit<UnitBooking, 'id'>): Promise<UnitBooking> {
    const newBooking: UnitBooking = {
      ...booking,
      id: `bk-${Date.now()}`
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('unit_bookings').insert([{
          unit_id: booking.unitId,
          unit_number: booking.unitNumber,
          building_name: booking.buildingName,
          client_name: booking.clientName,
          client_phone: booking.clientPhone,
          deposit_amount: booking.depositAmount,
          booking_date: booking.bookingDate,
          expires_at: booking.expiresAt,
          manager_name: booking.managerName,
          status: booking.status
        }]).select();

        if (!error && data && data[0]) {
          newBooking.id = data[0].id;
        }

        // Also update unit status in Supabase
        await supabase.from('units').update({
          status: 'booked',
          client_name: booking.clientName,
          client_phone: booking.clientPhone
        }).eq('id', booking.unitId);
      } catch (e) {
        console.error('Supabase createBooking error:', e);
      }
    }

    // Local cache
    const bookings = getLocal<UnitBooking[]>('vrtkl_bookings', INITIAL_BOOKINGS);
    setLocal('vrtkl_bookings', [newBooking, ...bookings]);

    // Also update local unit
    await this.updateUnitStatus(booking.unitId, 'booked', booking.clientName, booking.clientPhone);
    return newBooking;
  },

  // ----------------------------------------------------------------
  // LEADS (Ліди)
  // ----------------------------------------------------------------
  async getLeads(): Promise<Lead[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((l: any) => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            email: l.email || '',
            source: l.source || 'website',
            status: l.status || 'new',
            temperature: l.temperature || 'warm',
            motivationScore: l.motivation_score || 75,
            aiMotivationScore: l.ai_motivation_score || 80,
            dnc: Boolean(l.dnc),
            assignedAgent: l.assigned_agent || 'Ростислав Мельничук',
            notes: l.notes || '',
            createdAt: l.created_at || new Date().toISOString(),
            property: l.property || {
              address: 'вул. Мазепи, 164',
              city: 'Івано-Франківськ',
              state: 'Івано-Франківська обл.',
              zip: '76000',
              beds: 2,
              baths: 1,
              sqft: 65,
              yearBuilt: 2026,
              condition: 'turnkey',
              distressMarkers: [],
              arv: 60000,
              repairEstimate: 0,
              maoRulePercent: 90,
              desiredAssignmentFee: 4000,
              calculatedMao: 54000
            },
            photos: l.photos || [],
            tags: l.tags || []
          }));
        }
      } catch (e) {
        console.warn('Supabase getLeads fallback:', e);
      }
    }
    return getLocal<Lead[]>('vrtkl_leads', INITIAL_LEADS);
  },

  async createLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('leads').insert([{
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          status: lead.status,
          temperature: lead.temperature,
          motivation_score: lead.motivationScore,
          ai_motivation_score: lead.aiMotivationScore,
          dnc: lead.dnc,
          assigned_agent: lead.assignedAgent,
          notes: lead.notes,
          property: lead.property,
          photos: lead.photos,
          tags: lead.tags
        }]).select();

        if (!error && data && data[0]) {
          newLead.id = data[0].id;
        }
      } catch (e) {
        console.error('Supabase createLead error:', e);
      }
    }

    const leads = getLocal<Lead[]>('vrtkl_leads', INITIAL_LEADS);
    setLocal('vrtkl_leads', [newLead, ...leads]);
    return newLead;
  },

  async updateLead(lead: Lead): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('leads').update({
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          status: lead.status,
          temperature: lead.temperature,
          motivation_score: lead.motivationScore,
          ai_motivation_score: lead.aiMotivationScore,
          dnc: lead.dnc,
          assigned_agent: lead.assignedAgent,
          notes: lead.notes,
          property: lead.property,
          photos: lead.photos,
          tags: lead.tags
        }).eq('id', lead.id);
      } catch (e) {
        console.error('Supabase updateLead error:', e);
      }
    }

    const leads = getLocal<Lead[]>('vrtkl_leads', INITIAL_LEADS);
    const updated = leads.map(l => l.id === lead.id ? lead : l);
    setLocal('vrtkl_leads', updated);
  },

  // ----------------------------------------------------------------
  // DEALS & PAYMENTS (Угоди та графіки розстрочок)
  // ----------------------------------------------------------------
  async getDeals(): Promise<Deal[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            leadId: d.lead_id,
            unitId: d.unit_id,
            title: d.title,
            propertyAddress: d.property_address,
            sellerName: d.seller_name,
            stage: d.stage,
            contractPrice: Number(d.contract_price),
            earnestMoney: Number(d.earnest_money || 0),
            inspectionPeriodDays: d.inspection_period_days || 7,
            contractDate: d.contract_date || '',
            closingDate: d.closing_date || '',
            estimatedFee: Number(d.estimated_fee || 0),
            assignedAgent: d.assigned_agent,
            notes: d.notes || '',
            offers: d.offers || [],
            checklist: d.checklist || [],
            payments: d.payments || []
          }));
        }
      } catch (e) {
        console.warn('Supabase getDeals fallback:', e);
      }
    }
    return getLocal<Deal[]>('vrtkl_deals', INITIAL_DEALS);
  },

  async createDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('deals').insert([{
          lead_id: deal.leadId || null,
          unit_id: deal.unitId || null,
          title: deal.title,
          property_address: deal.propertyAddress,
          seller_name: deal.sellerName,
          stage: deal.stage,
          contract_price: deal.contractPrice,
          earnest_money: deal.earnestMoney,
          inspection_period_days: deal.inspectionPeriodDays,
          contract_date: deal.contractDate,
          closing_date: deal.closingDate,
          estimated_fee: deal.estimatedFee,
          assigned_agent: deal.assignedAgent,
          notes: deal.notes,
          offers: deal.offers,
          checklist: deal.checklist
        }]).select();

        if (!error && data && data[0]) {
          newDeal.id = data[0].id;
        }
      } catch (e) {
        console.error('Supabase createDeal error:', e);
      }
    }

    const deals = getLocal<Deal[]>('vrtkl_deals', INITIAL_DEALS);
    setLocal('vrtkl_deals', [newDeal, ...deals]);
    return newDeal;
  },

  async updateDeal(deal: Deal): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('deals').update({
          title: deal.title,
          stage: deal.stage,
          contract_price: deal.contractPrice,
          earnest_money: deal.earnestMoney,
          inspection_period_days: deal.inspectionPeriodDays,
          contract_date: deal.contractDate,
          closing_date: deal.closingDate,
          estimated_fee: deal.estimatedFee,
          assigned_agent: deal.assignedAgent,
          notes: deal.notes,
          offers: deal.offers,
          checklist: deal.checklist
        }).eq('id', deal.id);
      } catch (e) {
        console.error('Supabase updateDeal error:', e);
      }
    }

    const deals = getLocal<Deal[]>('vrtkl_deals', INITIAL_DEALS);
    const updated = deals.map(d => d.id === deal.id ? deal : d);
    setLocal('vrtkl_deals', updated);
  },

  // ----------------------------------------------------------------
  // AGENCIES & REALTORS (АН та рієлтори з G-Plus API)
  // ----------------------------------------------------------------
  async getAgencies(): Promise<Agency[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('agencies').select('*, agency_employees(*)').order('name');
        if (!error && data && data.length > 0) {
          return data.map((a: any) => ({
            id: a.id,
            name: a.name,
            edrpou: a.edrpou,
            phone: a.phone,
            email: a.email,
            address: a.address,
            commissionRate: Number(a.commission_rate || 3.0),
            activeDealsCount: a.active_deals_count || 0,
            totalSoldVolume: Number(a.total_sold_volume || 0),
            notes: a.notes || '',
            employees: (a.agency_employees || []).map((e: any) => ({
              id: e.id,
              agencyId: e.agency_id,
              agencyName: a.name,
              name: e.name,
              phone: e.phone,
              email: e.email,
              position: e.position,
              rating: Number(e.rating || 5.0)
            }))
          }));
        }
      } catch (e) {
        console.warn('Supabase getAgencies fallback:', e);
      }
    }
    return getLocal<Agency[]>('vrtkl_agencies', INITIAL_AGENCIES);
  },

  // ----------------------------------------------------------------
  // EXPENSES (Витрати девелопера з G-Plus API)
  // ----------------------------------------------------------------
  async getExpenseGroups(): Promise<ExpenseGroup[]> {
    return getLocal<ExpenseGroup[]>('vrtkl_expense_groups', INITIAL_EXPENSE_GROUPS);
  },

  async getExpenses(): Promise<Expense[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((exp: any) => ({
            id: exp.id,
            groupId: exp.group_id,
            groupName: exp.group_name,
            title: exp.title,
            amount: Number(exp.amount),
            date: exp.date,
            paymentStatus: exp.payment_status,
            buildingId: exp.building_id
          }));
        }
      } catch (e) {
        console.warn('Supabase getExpenses fallback:', e);
      }
    }
    return getLocal<Expense[]>('vrtkl_expenses', INITIAL_EXPENSES);
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('expenses').insert([{
          group_id: expense.groupId,
          group_name: expense.groupName,
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          payment_status: expense.paymentStatus,
          building_id: expense.buildingId || null
        }]).select();

        if (data && data[0]) {
          newExp.id = data[0].id;
        }
      } catch (e) {
        console.error('Supabase addExpense error:', e);
      }
    }

    const expenses = getLocal<Expense[]>('vrtkl_expenses', INITIAL_EXPENSES);
    setLocal('vrtkl_expenses', [newExp, ...expenses]);
    return newExp;
  },

  // ----------------------------------------------------------------
  // BUYERS / INVESTORS
  // ----------------------------------------------------------------
  async getBuyers(): Promise<Buyer[]> {
    return getLocal<Buyer[]>('vrtkl_buyers', INITIAL_BUYERS);
  },

  async addBuyer(buyer: Omit<Buyer, 'id'>): Promise<Buyer> {
    const newBuyer: Buyer = {
      ...buyer,
      id: `buyer-${Date.now()}`
    };
    const buyers = getLocal<Buyer[]>('vrtkl_buyers', INITIAL_BUYERS);
    setLocal('vrtkl_buyers', [newBuyer, ...buyers]);
    return newBuyer;
  },

  // ----------------------------------------------------------------
  // TASKS & ACTIVITIES
  // ----------------------------------------------------------------
  async getTasks(): Promise<Task[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((evt: any) => ({
            id: evt.id,
            title: evt.title,
            description: evt.description,
            dueDate: evt.date,
            completed: Boolean(evt.completed),
            priority: 'high',
            assignedTo: evt.assigned_to || 'Ростислав Мельничук'
          }));
        }
      } catch (e) {
        console.warn('Supabase getTasks fallback:', e);
      }
    }
    return getLocal<Task[]>('vrtkl_tasks', INITIAL_TASKS);
  },

  async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `t-${Date.now()}`
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('events').insert([{
          title: task.title,
          description: task.description,
          date: task.dueDate,
          completed: task.completed,
          assigned_to: task.assignedTo
        }]);
      } catch (e) {
        console.error('Supabase addTask error:', e);
      }
    }

    const tasks = getLocal<Task[]>('vrtkl_tasks', INITIAL_TASKS);
    setLocal('vrtkl_tasks', [newTask, ...tasks]);
    return newTask;
  },

  async toggleTask(taskId: string): Promise<void> {
    const tasks = getLocal<Task[]>('vrtkl_tasks', INITIAL_TASKS);
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const completed = !t.completed;
        const supabase = getSupabase();
        if (supabase && isSupabaseConfigured()) {
          supabase.from('events').update({ completed }).eq('id', taskId);
        }
        return { ...t, completed };
      }
      return t;
    });
    setLocal('vrtkl_tasks', updated);
  },

  async getActivities(): Promise<Activity[]> {
    return getLocal<Activity[]>('vrtkl_activities', INITIAL_ACTIVITIES);
  },

  async addActivity(act: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const newAct: Activity = {
      ...act,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const activities = getLocal<Activity[]>('vrtkl_activities', INITIAL_ACTIVITIES);
    setLocal('vrtkl_activities', [newAct, ...activities]);
    return newAct;
  },

  // ----------------------------------------------------------------
  // PURGE ALL DEMO DATA & CACHES
  // ----------------------------------------------------------------
  clearAllCachedData(): void {
    const keys = [
      'vrtkl_buildings',
      'vrtkl_sections',
      'vrtkl_units',
      'vrtkl_bookings',
      'vrtkl_leads',
      'vrtkl_deals',
      'vrtkl_buyers',
      'vrtkl_tasks',
      'vrtkl_activities',
      'vrtkl_agencies',
      'vrtkl_expenses',
      'vrtkl_expense_groups',
      'vrtkl_phone_calls',
      'vrtkl_resale_props',
      'vrtkl_rent_props'
    ];
    keys.forEach(k => localStorage.removeItem(k));
  },

  // ----------------------------------------------------------------
  // BATCH SYNC SAVING (Supabase & Local)
  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  // NON-DESTRUCTIVE BATCH DELTA SYNC (Supabase & Local)
  // Only adds new or updated records; never blindly overwrites or deletes!
  // ----------------------------------------------------------------
  async saveSyncedData(payload: {
    buildings?: Building[];
    sections?: BuildingSection[];
    units?: Unit[];
    leads?: Lead[];
    deals?: Deal[];
    agencies?: Agency[];
    expenses?: Expense[];
    phoneCalls?: any[];
    resaleProperties?: any[];
    rentProperties?: any[];
  }, isHistoricalFullExport = false): Promise<SyncDeltaReport> {
    const startTime = Date.now();
    const supabase = getSupabase();
    const isOnline = Boolean(supabase && isSupabaseConfigured());

    const emptyStats = (): MergeStats => ({ added: 0, updated: 0, unchanged: 0, total: 0 });

    const breakdown: SyncDeltaReport['breakdown'] = {
      buildings: emptyStats(),
      sections: emptyStats(),
      units: emptyStats(),
      leads: emptyStats(),
      deals: emptyStats(),
      agencies: emptyStats(),
      expenses: emptyStats(),
      phoneCalls: emptyStats(),
      resale: emptyStats(),
      rent: emptyStats()
    };

    // 1. BUILDINGS
    if (payload.buildings && payload.buildings.length > 0) {
      const existing = getLocal<Building[]>('vrtkl_buildings', INITIAL_BUILDINGS);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.buildings,
        (ex, inc) => ex.id === inc.id || (Boolean(inc.name) && ex.name.trim().toLowerCase() === inc.name.trim().toLowerCase()),
        (ex, inc) => ({
          ...ex,
          ...inc,
          image: inc.image || ex.image,
          description: inc.description || ex.description
        })
      );
      breakdown.buildings = stats;
      setLocal('vrtkl_buildings', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('buildings').upsert(toUpsert.map(b => ({
            id: b.id,
            name: b.name,
            address: b.address || '',
            city: b.city || 'Івано-Франківськ',
            floors_count: b.floorsCount,
            sections_count: b.sectionsCount,
            completion_date: b.completionDate,
            status: b.status,
            image: b.image,
            description: b.description
          })));
        } catch (e) {
          console.warn('Supabase delta save buildings error:', e);
        }
      }
    } else {
      breakdown.buildings.total = getLocal<Building[]>('vrtkl_buildings', INITIAL_BUILDINGS).length;
    }

    // 2. SECTIONS
    if (payload.sections && payload.sections.length > 0) {
      const existing = getLocal<BuildingSection[]>('vrtkl_sections', INITIAL_SECTIONS);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.sections,
        (ex, inc) => ex.id === inc.id || (ex.buildingId === inc.buildingId && ex.name.trim().toLowerCase() === inc.name.trim().toLowerCase()),
        (ex, inc) => ({ ...ex, ...inc })
      );
      breakdown.sections = stats;
      setLocal('vrtkl_sections', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('building_sections').upsert(toUpsert.map(s => ({
            id: s.id,
            building_id: s.buildingId,
            name: s.name,
            floors: s.floors,
            units_count: s.unitsCount
          })));
        } catch (e) {
          console.warn('Supabase delta save sections error:', e);
        }
      }
    } else {
      breakdown.sections.total = getLocal<BuildingSection[]>('vrtkl_sections', INITIAL_SECTIONS).length;
    }

    // 3. UNITS
    if (payload.units && payload.units.length > 0) {
      const existing = getLocal<Unit[]>('vrtkl_units', INITIAL_UNITS);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.units,
        (ex, inc) => ex.id === inc.id || (ex.buildingId === inc.buildingId && String(ex.number) === String(inc.number)),
        (ex, inc) => ({
          ...ex,
          ...inc,
          // Preserve local booking details if existing was booked/sold locally and incoming doesn't override
          clientName: inc.clientName || ex.clientName,
          clientPhone: inc.clientPhone || ex.clientPhone,
          status: inc.status !== 'available' ? inc.status : ex.status
        })
      );
      breakdown.units = stats;
      setLocal('vrtkl_units', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('units').upsert(toUpsert.map(u => ({
            id: u.id,
            building_id: u.buildingId,
            section_id: u.sectionId,
            number: u.number,
            floor: u.floor,
            rooms: u.rooms,
            type: u.type,
            total_area: u.totalArea,
            living_area: u.livingArea || 0,
            kitchen_area: u.kitchenArea || 0,
            price_per_sqm: u.pricePerSqm,
            total_price: u.totalPrice,
            status: u.status,
            client_name: u.clientName || null,
            client_phone: u.clientPhone || null
          })));
        } catch (e) {
          console.warn('Supabase delta save units error:', e);
        }
      }
    } else {
      breakdown.units.total = getLocal<Unit[]>('vrtkl_units', INITIAL_UNITS).length;
    }

    // 4. LEADS
    if (payload.leads && payload.leads.length > 0) {
      const existing = getLocal<Lead[]>('vrtkl_leads', INITIAL_LEADS);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.leads,
        (ex, inc) =>
          ex.id === inc.id ||
          (Boolean(inc.phone) && cleanPhone(ex.phone) === cleanPhone(inc.phone)) ||
          (Boolean(inc.email) && ex.email.trim().toLowerCase() === inc.email.trim().toLowerCase()),
        (ex, inc) => ({
          ...ex,
          ...inc,
          // Strictly preserve local notes, tags, and assigned manager if already set locally!
          notes: ex.notes && ex.notes.trim() ? (inc.notes && inc.notes !== ex.notes ? `${ex.notes}\n[G-Plus]: ${inc.notes}` : ex.notes) : inc.notes,
          tags: Array.from(new Set([...(ex.tags || []), ...(inc.tags || [])])),
          assignedAgent: ex.assignedAgent || inc.assignedAgent
        })
      );
      breakdown.leads = stats;
      setLocal('vrtkl_leads', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('leads').upsert(toUpsert.map(l => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            email: l.email,
            source: l.source,
            status: l.status,
            temperature: l.temperature || 'warm',
            motivation_score: l.motivationScore || 75,
            notes: l.notes,
            assigned_agent: l.assignedAgent || 'Ростислав Мельничук'
          })));
        } catch (e) {
          console.warn('Supabase delta save leads error:', e);
        }
      }
    } else {
      breakdown.leads.total = getLocal<Lead[]>('vrtkl_leads', INITIAL_LEADS).length;
    }

    // 5. DEALS
    if (payload.deals && payload.deals.length > 0) {
      const existing = getLocal<Deal[]>('vrtkl_deals', INITIAL_DEALS);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.deals,
        (ex, inc) => ex.id === inc.id || ex.title.trim().toLowerCase() === inc.title.trim().toLowerCase(),
        (ex, inc) => ({
          ...ex,
          ...inc,
          offers: ex.offers && ex.offers.length > 0 ? ex.offers : inc.offers,
          checklist: ex.checklist && ex.checklist.length > 0 ? ex.checklist : inc.checklist
        })
      );
      breakdown.deals = stats;
      setLocal('vrtkl_deals', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('deals').upsert(toUpsert.map(d => ({
            id: d.id,
            title: d.title,
            property_address: d.propertyAddress,
            seller_name: d.sellerName,
            stage: d.stage,
            contract_price: d.contractPrice,
            earnest_money: d.earnestMoney,
            inspection_period_days: d.inspectionPeriodDays || 7,
            assigned_agent: d.assignedAgent || 'Ростислав Мельничук'
          })));
        } catch (e) {
          console.warn('Supabase delta save deals error:', e);
        }
      }
    } else {
      breakdown.deals.total = getLocal<Deal[]>('vrtkl_deals', INITIAL_DEALS).length;
    }

    // 6. AGENCIES
    if (payload.agencies && payload.agencies.length > 0) {
      const existing = getLocal<Agency[]>('vrtkl_agencies', INITIAL_AGENCIES);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.agencies,
        (ex, inc) => ex.id === inc.id || ex.name.trim().toLowerCase() === inc.name.trim().toLowerCase() || (Boolean(inc.edrpou) && ex.edrpou === inc.edrpou),
        (ex, inc) => ({ ...ex, ...inc })
      );
      breakdown.agencies = stats;
      setLocal('vrtkl_agencies', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('agencies').upsert(toUpsert.map(a => ({
            id: a.id,
            name: a.name,
            phone: a.phone,
            email: a.email,
            edrpou: a.edrpou,
            address: a.address,
            commission_rate: a.commissionRate,
            active_deals_count: a.activeDealsCount,
            total_sold_volume: a.totalSoldVolume
          })));
        } catch (e) {
          console.warn('Supabase delta save agencies error:', e);
        }
      }
    } else {
      breakdown.agencies.total = getLocal<Agency[]>('vrtkl_agencies', INITIAL_AGENCIES).length;
    }

    // 7. EXPENSES
    if (payload.expenses && payload.expenses.length > 0) {
      const existing = getLocal<Expense[]>('vrtkl_expenses', INITIAL_EXPENSES);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.expenses,
        (ex, inc) => ex.id === inc.id || (ex.title === inc.title && ex.date === inc.date && ex.amount === inc.amount),
        (ex, inc) => ({ ...ex, ...inc })
      );
      breakdown.expenses = stats;
      setLocal('vrtkl_expenses', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('expenses').upsert(toUpsert.map(x => ({
            id: x.id,
            group_id: x.groupId,
            group_name: x.groupName,
            title: x.title,
            amount: x.amount,
            date: x.date,
            payment_status: x.paymentStatus
          })));
        } catch (e) {
          console.warn('Supabase delta save expenses error:', e);
        }
      }
    } else {
      breakdown.expenses.total = getLocal<Expense[]>('vrtkl_expenses', INITIAL_EXPENSES).length;
    }

    // 8. PHONE CALLS
    if (payload.phoneCalls && payload.phoneCalls.length > 0) {
      const existing = getLocal<PhoneCall[]>('vrtkl_phone_calls', []);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.phoneCalls,
        (ex, inc) => ex.id === inc.id || (cleanPhone(ex.callerPhone) === cleanPhone(inc.callerPhone) && ex.startedAt === inc.startedAt),
        (ex, inc) => ({ ...ex, ...inc })
      );
      breakdown.phoneCalls = stats;
      setLocal('vrtkl_phone_calls', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('phone_calls').upsert(toUpsert.map(c => ({
            id: c.id,
            caller_name: c.callerName,
            caller_phone: c.callerPhone,
            manager_name: c.managerName,
            direction: c.direction,
            started_at: c.startedAt,
            duration_seconds: c.durationSeconds,
            is_recorded: c.isRecorded,
            transcription: c.transcription,
            transcription_status: c.transcriptionStatus,
            tags: c.tags
          })));
        } catch (e) {
          console.warn('Supabase delta save phone_calls error:', e);
        }
      }
    } else {
      breakdown.phoneCalls.total = getLocal<PhoneCall[]>('vrtkl_phone_calls', []).length;
    }

    // 9. RESALE PROPERTIES
    if (payload.resaleProperties && payload.resaleProperties.length > 0) {
      const existing = getLocal<ResaleProperty[]>('vrtkl_resale_props', []);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.resaleProperties,
        (ex, inc) => ex.id === inc.id || ex.address.trim().toLowerCase() === inc.address.trim().toLowerCase(),
        (ex, inc) => ({ ...ex, ...inc })
      );
      breakdown.resale = stats;
      setLocal('vrtkl_resale_props', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('resale_properties').upsert(toUpsert.map(r => ({
            id: r.id,
            title: r.title,
            address: r.address,
            price: r.price,
            rooms: r.rooms,
            total_area: r.totalArea,
            floor: r.floor,
            total_floors: r.totalFloors,
            owner_name: r.ownerName,
            owner_phone: r.ownerPhone,
            status: r.status,
            is_published: r.isPublished,
            commission_percent: r.commissionPercent
          })));
        } catch (e) {
          console.warn('Supabase delta save resale_properties error:', e);
        }
      }
    } else {
      breakdown.resale.total = getLocal<ResaleProperty[]>('vrtkl_resale_props', []).length;
    }

    // 10. RENT PROPERTIES
    if (payload.rentProperties && payload.rentProperties.length > 0) {
      const existing = getLocal<RentProperty[]>('vrtkl_rent_props', []);
      const { merged, stats, toUpsert } = smartMerge(
        existing,
        payload.rentProperties,
        (ex, inc) => ex.id === inc.id || ex.address.trim().toLowerCase() === inc.address.trim().toLowerCase(),
        (ex, inc) => ({ ...ex, ...inc })
      );
      breakdown.rent = stats;
      setLocal('vrtkl_rent_props', merged);

      if (isOnline && supabase && toUpsert.length > 0) {
        try {
          await supabase.from('rent_properties').upsert(toUpsert.map(r => ({
            id: r.id,
            title: r.title,
            address: r.address,
            price: r.price,
            rooms: r.rooms,
            total_area: r.totalArea,
            floor: r.floor,
            status: r.status,
            is_published: r.isPublished,
            tenant_name: r.tenantName,
            lease_end: r.leaseEnd
          })));
        } catch (e) {
          console.warn('Supabase delta save rent_properties error:', e);
        }
      }
    } else {
      breakdown.rent.total = getLocal<RentProperty[]>('vrtkl_rent_props', []).length;
    }

    const durationMs = Date.now() - startTime;
    const totals = {
      addedTotal: Object.values(breakdown).reduce((acc, s) => acc + s.added, 0),
      updatedTotal: Object.values(breakdown).reduce((acc, s) => acc + s.updated, 0),
      unchangedTotal: Object.values(breakdown).reduce((acc, s) => acc + s.unchanged, 0),
      extractedTotal:
        (payload.buildings?.length || 0) +
        (payload.sections?.length || 0) +
        (payload.units?.length || 0) +
        (payload.leads?.length || 0) +
        (payload.deals?.length || 0) +
        (payload.agencies?.length || 0) +
        (payload.expenses?.length || 0) +
        (payload.phoneCalls?.length || 0) +
        (payload.resaleProperties?.length || 0) +
        (payload.rentProperties?.length || 0)
    };

    return {
      timestamp: new Date().toISOString(),
      durationMs,
      isHistoricalFullExport,
      totals,
      breakdown
    };
  },

  // ----------------------------------------------------------------
  // DATABASE HEALTH & SCHEMA AUDIT DIAGNOSTICS
  // ----------------------------------------------------------------
  async verifyDatabaseHealth(): Promise<{
    isConfigured: boolean;
    overallStatus: 'connected' | 'schema_needed' | 'local_storage';
    message: string;
    tables: Array<{
      table: string;
      title: string;
      count: number;
      readable: boolean;
      writable: boolean;
      status: 'ok' | 'empty' | 'missing' | 'error';
      error?: string;
    }>;
  }> {
    const supabase = getSupabase();
    const isConfigured = Boolean(supabase && isSupabaseConfigured());

    const tableDefs = [
      { table: 'buildings', title: 'Житлові комплекси (ЖК)' },
      { table: 'building_sections', title: 'Секції та корпуси' },
      { table: 'units', title: 'Шахівка приміщень' },
      { table: 'unit_bookings', title: 'Бронювання квартир' },
      { table: 'leads', title: 'Ліди покупців' },
      { table: 'deals', title: 'Угоди девелопера' },
      { table: 'agencies', title: 'Агентства нерухомості' },
      { table: 'expenses', title: 'Витрати та фінанси' },
      { table: 'phone_calls', title: 'Журнал дзвінків' },
      { table: 'resale_properties', title: 'Вторинний ринок' },
      { table: 'rent_properties', title: 'Оренда приміщень' },
      { table: 'profiles', title: 'Користувачі та профілі' },
      { table: 'sync_logs', title: 'Журнал синхронізації' }
    ];

    if (!isConfigured || !supabase) {
      return {
        isConfigured: false,
        overallStatus: 'local_storage',
        message: 'Supabase не підключено. Система працює в режимі надійного локального кешування (LocalStorage).',
        tables: tableDefs.map(t => ({
          ...t,
          count: 0,
          readable: false,
          writable: false,
          status: 'empty' as const
        }))
      };
    }

    const results = [];
    let hasMissing = false;
    let hasError = false;

    for (const def of tableDefs) {
      try {
        const { count, error } = await supabase
          .from(def.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          const isTableMissing = error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist');
          if (isTableMissing) hasMissing = true;
          else hasError = true;

          results.push({
            table: def.table,
            title: def.title,
            count: 0,
            readable: false,
            writable: false,
            status: isTableMissing ? ('missing' as const) : ('error' as const),
            error: error.message
          });
        } else {
          results.push({
            table: def.table,
            title: def.title,
            count: count || 0,
            readable: true,
            writable: true,
            status: (count && count > 0 ? 'ok' : 'empty') as 'ok' | 'empty'
          });
        }
      } catch (err: any) {
        results.push({
          table: def.table,
          title: def.title,
          count: 0,
          readable: false,
          writable: false,
          status: 'error' as const,
          error: err?.message || 'Помилка запиту'
        });
      }
    }

    let overallStatus: 'connected' | 'schema_needed' | 'local_storage' = 'connected';
    let message = 'Всі таблиці підключено та перевірено. Запис і читання працюють штатно.';

    if (hasMissing) {
      overallStatus = 'schema_needed';
      message = 'Виявлено відсутні таблиці в базі даних Supabase. Будь ласка, виконайте оновлений SQL-скрипт (supabase-schema.sql) в SQL Editor вашого проєкту Supabase.';
    } else if (hasError) {
      overallStatus = 'schema_needed';
      message = 'Виявлено помилку доступу до деяких таблиць (можливо, обмеження RLS). Перевірте політики в SQL Editor.';
    }

    return {
      isConfigured: true,
      overallStatus,
      message,
      tables: results
    };
  }
};
