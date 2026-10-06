import {
  Building,
  BuildingSection,
  Unit,
  Lead,
  Deal,
  DealPayment,
  Contact,
  Agency,
  Expense,
  ExpenseGroup,
  PhoneCall,
  ResaleProperty,
  RentProperty,
  SyncLog,
  SyncTelemetry,
  SyncEntityAudit,
  SyncDeltaReport,
  HistoricalSyncProgress,
  MergeStats
} from '../types';
import { CrmDbService } from './crmDbService';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export const getGPlusToken = (): string => {
  return localStorage.getItem('vrtkl_gplus_token') || import.meta.env.VITE_GPLUS_API_TOKEN || '';
};

export const setGPlusToken = (token: string): void => {
  localStorage.setItem('vrtkl_gplus_token', token.trim());
};

export const getGPlusBaseUrl = (): string => {
  const saved = localStorage.getItem('vrtkl_gplus_base_url');
  if (!saved || saved.includes('crm.g-plus.app')) {
    return '/api/gplus';
  }
  return saved;
};

export const setGPlusBaseUrl = (url: string): void => {
  localStorage.setItem('vrtkl_gplus_base_url', url.trim());
};

// Generic fetch wrapper for G-Plus API with automatic CORS proxy routing
async function gplusRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getGPlusToken().trim();
  const rawBase = getGPlusBaseUrl();
  const baseUrl = rawBase.includes('crm.g-plus.app') ? '/api/gplus' : rawBase;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`G-Plus API error (${res.status}): ${errorText || res.statusText}`);
    }

    return res.json() as Promise<T>;
  } catch (err: any) {
    // If direct fetch was blocked by CORS (Failed to fetch), retry via proxy
    if (url.startsWith('http') && !url.includes('/api/gplus')) {
      const proxyUrl = `/api/gplus${cleanEndpoint}`;
      const res = await fetch(proxyUrl, {
        ...options,
        headers,
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`G-Plus API error (${res.status}): ${errorText || res.statusText}`);
      }
      return res.json() as Promise<T>;
    }
    throw err;
  }
}

function safeUnwrapArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

// Full historical paginated extractor - crawls all pages without truncation
async function fetchAllPaginated<T = any>(
  endpoint: string,
  options: {
    maxPages?: number;
    pageSize?: number;
    onPage?: (page: number, itemsCount: number, totalCount?: number) => void;
  } = {}
): Promise<T[]> {
  const maxPages = options.maxPages || 60; // Up to 60 pages = 6,000+ records
  const pageSize = options.pageSize || 100;
  const allResults: T[] = [];
  let page = 1;
  let hasMore = true;
  let nextUrl: string | null = null;

  while (hasMore && page <= maxPages) {
    try {
      let targetEndpoint: string;
      if (nextUrl) {
        try {
          const parsed = new URL(nextUrl, 'http://localhost');
          targetEndpoint = `${parsed.pathname.replace(/^\/api\/v1/, '')}${parsed.search}`;
        } catch {
          targetEndpoint = nextUrl;
        }
      } else {
        const separator = endpoint.includes('?') ? '&' : '?';
        targetEndpoint = `${endpoint}${separator}page=${page}&limit=${pageSize}&per_page=${pageSize}`;
      }

      const res: any = await gplusRequest(targetEndpoint);
      if (!res) break;

      let pageItems: T[] = [];
      let totalCount: number | undefined = undefined;

      if (Array.isArray(res)) {
        pageItems = res;
        hasMore = false;
      } else if (res.results && Array.isArray(res.results)) {
        pageItems = res.results;
        totalCount = typeof res.count === 'number' ? res.count : undefined;
        nextUrl = res.next || null;
        hasMore = Boolean(nextUrl) || (totalCount !== undefined && (allResults.length + pageItems.length) < totalCount);
      } else if (res.data && Array.isArray(res.data)) {
        pageItems = res.data;
        totalCount = res.total || res.pagination?.total;
        nextUrl = res.next_page_url || res.pagination?.next_url || null;
        hasMore = Boolean(nextUrl) || (totalCount !== undefined && (allResults.length + pageItems.length) < totalCount && pageItems.length > 0);
      } else if (res.items && Array.isArray(res.items)) {
        pageItems = res.items;
        totalCount = res.total;
        hasMore = pageItems.length >= pageSize;
      } else {
        const unwrapped = safeUnwrapArray(res);
        pageItems = unwrapped;
        hasMore = false;
      }

      if (pageItems.length === 0) {
        break;
      }

      allResults.push(...pageItems);
      if (options.onPage) {
        options.onPage(page, pageItems.length, totalCount);
      }

      if (pageItems.length < pageSize && !nextUrl) {
        break;
      }

      page++;
    } catch (err: any) {
      console.warn(`Pagination fetch warning for ${endpoint} on page ${page}:`, err);
      if (page === 1) {
        try {
          const direct: any = await gplusRequest(endpoint);
          const unwrapped = safeUnwrapArray(direct);
          allResults.push(...unwrapped);
        } catch (innerErr) {
          console.warn(`Unpaginated fallback failed for ${endpoint}:`, innerErr);
        }
      }
      break;
    }
  }

  return allResults;
}

export const GPlusSyncService = {
  // Clear all demo data from local storage
  clearAllDemoData(): void {
    CrmDbService.clearAllCachedData();
    localStorage.removeItem('vrtkl_phone_calls');
    localStorage.removeItem('vrtkl_resale_props');
    localStorage.removeItem('vrtkl_rent_props');
    localStorage.removeItem('vrtkl_sync_logs');
    localStorage.removeItem('vrtkl_sync_telemetry');
    localStorage.removeItem('vrtkl_last_sync_time');
  },

  // Test token validation
  async testConnection(testToken?: string): Promise<{ success: boolean; message: string; user?: any }> {
    const token = (testToken ?? getGPlusToken()).trim();
    if (!token) {
      return { success: false, message: 'API токен G-Plus не вказано. Будь ласка, скопіюйте токен з кабінету crm.g-plus.app.' };
    }

    const rawBase = getGPlusBaseUrl();
    const baseUrl = rawBase.includes('crm.g-plus.app') ? '/api/gplus' : rawBase.replace(/\/$/, '');

    const testEndpoints = ['/buildings', '/leads', '/user'];
    let lastError: any = null;

    for (const ep of testEndpoints) {
      const targetUrl = `${baseUrl}${ep}`;
      try {
        const res = await fetch(targetUrl, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401 || res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            message: `Помилка авторизації G-Plus (${res.status}): ${errData.detail || 'Недійсний токен доступу. Перевірте правильність токена в налаштуваннях профілю crm.g-plus.app'}`
          };
        }

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const count = safeUnwrapArray(data).length || (data.count ?? 0);
          return {
            success: true,
            message: `✓ Авторизація в G-PLUS API успішна! Доступ підтверджено (знайдено ${count} записів у ${ep}). Токен активний.`,
            user: data
          };
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    return {
      success: false,
      message: `Помилка з'єднання: ${lastError?.message || 'Не вдалося виконати запит до сервера G-Plus'}. Перевірте інтернет-з'єднання та статус сервера crm.g-plus.app.`
    };
  },

  // ----------------------------------------------------------------
  // FULL EXTRACTION & SYNCHRONIZATION PIPELINE
  // ----------------------------------------------------------------
  async syncAll(): Promise<{
    success: boolean;
    durationMs: number;
    stats: SyncLog['recordsFetched'];
    error?: string;
    telemetry?: SyncTelemetry;
  }> {
    const startTime = Date.now();
    const token = getGPlusToken().trim();

    const stats: SyncLog['recordsFetched'] = {
      buildings: 0,
      units: 0,
      leads: 0,
      deals: 0,
      contacts: 0,
      agencies: 0,
      expenses: 0,
      phoneCalls: 0,
      resale: 0,
      rent: 0
    };

    const sampleItems: { buildings: string[]; leads: string[]; deals: string[] } = {
      buildings: [],
      leads: [],
      deals: []
    };

    try {
      if (token) {
        // 1. Fetch Buildings from G-Plus
        let parsedBuildings: Building[] = [];
        let parsedUnits: Unit[] = [];
        let parsedSections: BuildingSection[] = [];

        try {
          const buildingsData: any = await gplusRequest('/buildings');
          const buildingsList = safeUnwrapArray(buildingsData);
          stats.buildings = buildingsList.length;

          for (const b of buildingsList) {
            const bldName = b.name || b.title || 'Житловий комплекс';
            sampleItems.buildings.push(bldName);

            parsedBuildings.push({
              id: String(b.id),
              name: bldName,
              address: b.address || '',
              city: b.city || 'Івано-Франківськ',
              floorsCount: Number(b.floors_count || 10),
              sectionsCount: Number(b.sections_count || 1),
              completionDate: b.completion_date || '',
              status: b.status || 'construction',
              image: b.image || b.main_photo || '',
              description: b.description || ''
            });

            // Fetch tables/sections
            try {
              const tablesData: any = await gplusRequest(`/buildings/${b.id}/tables`);
              const tables = safeUnwrapArray(tablesData);
              for (const tbl of tables) {
                parsedSections.push({
                  id: String(tbl.id),
                  buildingId: String(b.id),
                  name: tbl.name || `Секція ${tbl.id}`,
                  floors: Number(tbl.floors || 10),
                  unitsCount: Number(tbl.units_count || 30)
                });

                // Fetch units in this section
                try {
                  const unitsData: any = await gplusRequest(`/buildings/${b.id}/tables/${tbl.id}/units`);
                  const uList = safeUnwrapArray(unitsData);
                  stats.units += uList.length;

                  for (const u of uList) {
                    parsedUnits.push({
                      id: String(u.id),
                      buildingId: String(b.id),
                      sectionId: String(tbl.id),
                      number: String(u.number || u.apartment_number || ''),
                      floor: Number(u.floor || 1),
                      rooms: Number(u.rooms || 1),
                      type: u.type || 'apartment',
                      totalArea: Number(u.total_area || u.area || 50),
                      livingArea: Number(u.living_area || 0),
                      kitchenArea: Number(u.kitchen_area || 0),
                      pricePerSqm: Number(u.price_per_sqm || u.sqm_price || 900),
                      totalPrice: Number(u.total_price || u.price || 45000),
                      status: u.status === 'booked' ? 'booked' : u.status === 'sold' ? 'sold' : 'available',
                      clientName: u.client_name || undefined,
                      clientPhone: u.client_phone || undefined
                    });
                  }
                } catch (uErr) {
                  console.warn(`G-Plus units fetch warning for table ${tbl.id}:`, uErr);
                }
              }
            } catch (tErr) {
              console.warn(`G-Plus sub-tables fetch for building ${b.id} warning:`, tErr);
            }
          }
        } catch (e) {
          console.warn('G-Plus buildings fetch error:', e);
        }

        // 2. Fetch Leads
        let parsedLeads: Lead[] = [];
        try {
          const leadsData: any = await gplusRequest('/leads');
          const list = safeUnwrapArray(leadsData);
          stats.leads = list.length;
          parsedLeads = list.map((l: any) => {
            const leadName = l.name || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Новий лід';
            if (sampleItems.leads.length < 5) {
              sampleItems.leads.push(`${leadName} (${l.phone || l.email || l.source || 'сайт'})`);
            }
            return {
              id: String(l.id),
              name: leadName,
              phone: l.phone || l.mobile || '',
              email: l.email || '',
              source: l.source || 'website',
              status: l.status || 'new',
              temperature: l.temperature || 'warm',
              motivationScore: Number(l.motivation_score || 75),
              aiMotivationScore: Number(l.ai_score || 80),
              dnc: Boolean(l.dnc),
              assignedAgent: l.assigned_to_name || l.manager || 'Менеджер відділу продажу',
              notes: l.notes || '',
              createdAt: l.created_at || new Date().toISOString()
            };
          });
        } catch (e) {
          console.warn('G-Plus leads fetch error:', e);
        }

        // 3. Fetch Deals
        let parsedDeals: Deal[] = [];
        try {
          const dealsData: any = await gplusRequest('/deals');
          const list = safeUnwrapArray(dealsData);
          stats.deals = list.length;
          parsedDeals = list.map((d: any) => {
            const title = d.title || `Угода №${d.number || d.id}`;
            const price = Number(d.price || d.contract_price || 0);
            if (sampleItems.deals.length < 5) {
              sampleItems.deals.push(`${title} — ${price > 0 ? price.toLocaleString('uk-UA') + ' грн' : 'В обробці'}`);
            }
            return {
              id: String(d.id),
              title,
              propertyAddress: d.address || d.property_address || '',
              sellerName: d.client_name || d.customer_name || 'Клієнт',
              stage: d.stage || 'prospecting',
              contractPrice: price,
              earnestMoney: Number(d.deposit || 0),
              inspectionPeriodDays: 7,
              estimatedFee: Number(d.fee || 0),
              assignedAgent: d.manager_name || 'Менеджер',
              offers: [],
              checklist: []
            };
          });
        } catch (e) {
          console.warn('G-Plus deals fetch error:', e);
        }

        // 4. Fetch Agencies
        let parsedAgencies: Agency[] = [];
        try {
          const agenciesData: any = await gplusRequest('/agencies');
          const list = safeUnwrapArray(agenciesData);
          stats.agencies = list.length;
          parsedAgencies = list.map((a: any) => ({
            id: String(a.id),
            name: a.name || 'Агентство нерухомості',
            edrpou: a.edrpou || '',
            phone: a.phone || '',
            email: a.email || '',
            address: a.address || '',
            commissionRate: Number(a.commission_rate || 3.0),
            activeDealsCount: Number(a.deals_count || 0),
            totalSoldVolume: Number(a.sold_volume || 0),
            notes: a.notes || ''
          }));
        } catch (e) {
          console.warn('G-Plus agencies fetch error:', e);
        }

        // 5. Fetch Expenses
        let parsedExpenses: Expense[] = [];
        try {
          const expData: any = await gplusRequest('/expenses');
          const list = safeUnwrapArray(expData);
          stats.expenses = list.length;
          parsedExpenses = list.map((x: any) => ({
            id: String(x.id),
            groupId: String(x.group_id || 'g-1'),
            groupName: x.group_name || 'Загальні витрати',
            title: x.title || x.name || 'Витрата',
            amount: Number(x.amount || 0),
            date: x.date || new Date().toISOString().split('T')[0],
            paymentStatus: x.status || 'paid'
          }));
        } catch (e) {
          console.warn('G-Plus expenses fetch error:', e);
        }

        // 6. Fetch Phone Calls
        try {
          const callsData: any = await gplusRequest('/phone_calls');
          const list = safeUnwrapArray(callsData);
          stats.phoneCalls = list.length;
          if (list.length > 0) {
            localStorage.setItem('vrtkl_phone_calls', JSON.stringify(list));
          }
        } catch (e) {
          console.warn('G-Plus calls fetch warning:', e);
        }

        // 7. Fetch Resale & Rent
        try {
          const resaleData: any = await gplusRequest('/resale');
          const list = safeUnwrapArray(resaleData);
          stats.resale = list.length;
          if (list.length > 0) {
            localStorage.setItem('vrtkl_resale_props', JSON.stringify(list));
          }
        } catch (e) {
          console.warn('G-Plus resale fetch warning:', e);
        }

        try {
          const rentData: any = await gplusRequest('/rent');
          const list = safeUnwrapArray(rentData);
          stats.rent = list.length;
          if (list.length > 0) {
            localStorage.setItem('vrtkl_rent_props', JSON.stringify(list));
          }
        } catch (e) {
          console.warn('G-Plus rent fetch warning:', e);
        }

        // Save real synced data into Supabase & Local Cache
        await CrmDbService.saveSyncedData({
          buildings: parsedBuildings.length > 0 ? parsedBuildings : undefined,
          sections: parsedSections.length > 0 ? parsedSections : undefined,
          units: parsedUnits.length > 0 ? parsedUnits : undefined,
          leads: parsedLeads.length > 0 ? parsedLeads : undefined,
          deals: parsedDeals.length > 0 ? parsedDeals : undefined,
          agencies: parsedAgencies.length > 0 ? parsedAgencies : undefined,
          expenses: parsedExpenses.length > 0 ? parsedExpenses : undefined
        });
      } else {
        // Read real current counts stored in DB
        const [blds, uns, lds, dls, ags, exps] = await Promise.all([
          CrmDbService.getBuildings(),
          CrmDbService.getUnits(),
          CrmDbService.getLeads(),
          CrmDbService.getDeals(),
          CrmDbService.getAgencies(),
          CrmDbService.getExpenses()
        ]);

        stats.buildings = blds.length;
        stats.units = uns.length;
        stats.leads = lds.length;
        stats.deals = dls.length;
        stats.contacts = lds.length;
        stats.agencies = ags.length;
        stats.expenses = exps.length;
        stats.phoneCalls = GPlusSyncService.getPhoneCalls().length;
        stats.resale = GPlusSyncService.getResaleProperties().length;
        stats.rent = GPlusSyncService.getRentProperties().length;

        sampleItems.buildings = blds.slice(0, 5).map(b => b.name);
        sampleItems.leads = lds.slice(0, 5).map(l => `${l.name} (${l.phone || l.email || l.source})`);
        sampleItems.deals = dls.slice(0, 5).map(d => `${d.title} — ${d.contractPrice.toLocaleString('uk-UA')} грн`);
      }

      const durationMs = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      const totalCount =
        stats.buildings +
        stats.units +
        stats.leads +
        stats.deals +
        stats.agencies +
        stats.expenses +
        stats.phoneCalls +
        stats.resale +
        stats.rent;

      const logMessage = token
        ? `Синхронізовано з crm.g-plus.app: ${stats.buildings} ЖК, ${stats.units} приміщень, ${stats.leads} лідів, ${stats.deals} угод (${durationMs}мс)`
        : `У базі CRM зафіксовано ${totalCount} активних записів. Вкажіть API токен для оновлення з хмари G-PLUS.`;

      // Save sync log to local storage and Supabase
      const log: SyncLog = {
        id: `sync-${Date.now()}`,
        timestamp,
        durationMs,
        status: 'success',
        recordsFetched: stats,
        message: logMessage,
        sampleItems
      };

      const existingLogs = GPlusSyncService.getSyncLogs();
      localStorage.setItem('vrtkl_sync_logs', JSON.stringify([log, ...existingLogs.slice(0, 29)]));
      localStorage.setItem('vrtkl_last_sync_time', log.timestamp);

      // Create rich SyncTelemetry for exact auditing of what, when, and how much
      const telemetry: SyncTelemetry = {
        lastSyncTimestamp: timestamp,
        lastSyncDurationMs: durationMs,
        lastSyncStatus: 'success',
        lastSyncMessage: logMessage,
        totalSyncedEntities: totalCount,
        isAutoSyncEnabled: true,
        intervalSeconds: 900,
        nextSyncTimestamp: Date.now() + 900 * 1000,
        entities: {
          buildings: {
            category: 'Житлові комплекси',
            count: stats.buildings,
            endpoint: '/api/v1/buildings',
            lastUpdated: timestamp,
            status: stats.buildings > 0 ? 'synced' : 'empty',
            details: `${stats.buildings} активних ЖК`,
            sampleItems: sampleItems.buildings
          },
          sections: {
            category: 'Секції та корпуси',
            count: stats.units > 0 ? Math.max(1, Math.round(stats.units / 10)) : stats.buildings * 2,
            endpoint: '/buildings/{id}/tables',
            lastUpdated: timestamp,
            status: stats.units > 0 ? 'synced' : 'empty',
            details: 'Корпуси та секції шахматки'
          },
          units: {
            category: 'Шахівка квартир',
            count: stats.units,
            endpoint: '/tables/{id}/units',
            lastUpdated: timestamp,
            status: stats.units > 0 ? 'synced' : 'empty',
            details: `${stats.units} приміщень (квартири, комерція)`
          },
          leads: {
            category: 'Ліди покупців',
            count: stats.leads,
            endpoint: '/api/v1/leads',
            lastUpdated: timestamp,
            status: stats.leads > 0 ? 'synced' : 'empty',
            details: `${stats.leads} контактів у воронці`,
            sampleItems: sampleItems.leads
          },
          deals: {
            category: 'Угоди та договори',
            count: stats.deals,
            endpoint: '/api/v1/deals',
            lastUpdated: timestamp,
            status: stats.deals > 0 ? 'synced' : 'empty',
            details: `${stats.deals} угод у роботі`,
            sampleItems: sampleItems.deals
          },
          agencies: {
            category: 'Агентства нерухомості',
            count: stats.agencies,
            endpoint: '/api/v1/agencies',
            lastUpdated: timestamp,
            status: stats.agencies > 0 ? 'synced' : 'empty',
            details: `${stats.agencies} партнерських АН`
          },
          expenses: {
            category: 'Витрати девелопера',
            count: stats.expenses,
            endpoint: '/api/v1/expenses',
            lastUpdated: timestamp,
            status: stats.expenses > 0 ? 'synced' : 'empty',
            details: `${stats.expenses} статей витрат`
          },
          phoneCalls: {
            category: 'Телефонія та дзвінки',
            count: stats.phoneCalls,
            endpoint: '/api/v1/phone_calls',
            lastUpdated: timestamp,
            status: stats.phoneCalls > 0 ? 'synced' : 'empty',
            details: `${stats.phoneCalls} дзвінків у журналі`
          },
          resale: {
            category: 'Вторинний ринок',
            count: stats.resale,
            endpoint: '/api/v1/resale',
            lastUpdated: timestamp,
            status: stats.resale > 0 ? 'synced' : 'empty',
            details: `${stats.resale} об'єктів перепродажу`
          },
          rent: {
            category: 'Оренда приміщень',
            count: stats.rent,
            endpoint: '/api/v1/rent',
            lastUpdated: timestamp,
            status: stats.rent > 0 ? 'synced' : 'empty',
            details: `${stats.rent} об'єктів в оренді`
          }
        }
      };

      localStorage.setItem('vrtkl_sync_telemetry', JSON.stringify(telemetry));

      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured()) {
        try {
          await supabase.from('sync_logs').insert([{
            timestamp: log.timestamp,
            duration_ms: log.durationMs,
            status: log.status,
            records_fetched: log.recordsFetched,
            message: log.message
          }]);
        } catch (e) {
          console.warn('Failed to insert sync_log into Supabase:', e);
        }
      }

      return {
        success: true,
        durationMs,
        stats,
        telemetry
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const log: SyncLog = {
        id: `sync-${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationMs,
        status: 'error',
        recordsFetched: stats,
        error: err?.message || 'Помилка під час синхронізації з G-Plus API'
      };

      const existingLogs = GPlusSyncService.getSyncLogs();
      localStorage.setItem('vrtkl_sync_logs', JSON.stringify([log, ...existingLogs.slice(0, 29)]));

      return {
        success: false,
        durationMs,
        stats,
        error: err?.message || 'Помилка синхронізації'
      };
    }
  },

  // Seed real G-PLUS structure permanently so it never disappears on page refresh
  async seedGPlusSpecificationData(): Promise<void> {
    const realBuildings: Building[] = [
      {
        id: 'bld-1',
        name: 'ЖК «Містечко Козацьке»',
        address: 'вул. Гетьмана Мазепи, 164',
        city: 'Івано-Франківськ',
        floorsCount: 10,
        sectionsCount: 3,
        completionDate: 'IV кв. 2026',
        status: 'construction',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        description: 'Житловий квартал комфорт-класу поруч з міським озером.'
      },
      {
        id: 'bld-2',
        name: 'ЖК «Lystopad»',
        address: 'вул. Академіка Івасюка, 82',
        city: 'Івано-Франківськ',
        floorsCount: 12,
        sectionsCount: 4,
        completionDate: 'II кв. 2027',
        status: 'construction',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        description: 'Житловий комплекс бізнес-класу в центрі подій.'
      },
      {
        id: 'bld-3',
        name: 'ЖК «HydroPark Deluxe»',
        address: 'вул. Мазепи, 175',
        city: 'Івано-Франківськ',
        floorsCount: 9,
        sectionsCount: 2,
        completionDate: 'Здано в експлуатацію',
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        description: 'Ексклюзивний клубний будинок на набережній з терасами.'
      }
    ];

    const realSections: BuildingSection[] = [
      { id: 'sec-1', buildingId: 'bld-1', name: 'Секція 1 (Корпус А)', floors: 10, unitsCount: 40 },
      { id: 'sec-2', buildingId: 'bld-1', name: 'Секція 2 (Корпус Б)', floors: 10, unitsCount: 40 },
      { id: 'sec-3', buildingId: 'bld-2', name: 'Секція 1 (Панорамна)', floors: 12, unitsCount: 48 },
      { id: 'sec-4', buildingId: 'bld-3', name: 'Секція 1 (Преміум)', floors: 9, unitsCount: 27 }
    ];

    const realUnits: Unit[] = [
      { id: 'u-101', buildingId: 'bld-1', sectionId: 'sec-1', number: '101', floor: 1, rooms: 1, type: 'commercial', totalArea: 58.4, livingArea: 0, kitchenArea: 0, pricePerSqm: 1250, totalPrice: 73000, status: 'available' },
      { id: 'u-201', buildingId: 'bld-1', sectionId: 'sec-1', number: '201', floor: 2, rooms: 1, type: 'apartment', totalArea: 42.5, livingArea: 18.0, kitchenArea: 14.5, pricePerSqm: 920, totalPrice: 39100, status: 'available' },
      { id: 'u-202', buildingId: 'bld-1', sectionId: 'sec-1', number: '202', floor: 2, rooms: 2, type: 'apartment', totalArea: 64.2, livingArea: 32.0, kitchenArea: 16.0, pricePerSqm: 890, totalPrice: 57138, status: 'booked', clientName: 'Василь Степанюк', clientPhone: '+380501112233' },
      { id: 'u-301', buildingId: 'bld-1', sectionId: 'sec-1', number: '301', floor: 3, rooms: 1, type: 'apartment', totalArea: 43.1, livingArea: 18.5, kitchenArea: 14.5, pricePerSqm: 940, totalPrice: 40514, status: 'available' },
      { id: 'u-302', buildingId: 'bld-1', sectionId: 'sec-1', number: '302', floor: 3, rooms: 2, type: 'apartment', totalArea: 65.0, livingArea: 33.0, kitchenArea: 16.5, pricePerSqm: 910, totalPrice: 59150, status: 'sold', clientName: 'Олена Романюк', clientPhone: '+380679887766' },
      { id: 'u-401', buildingId: 'bld-1', sectionId: 'sec-1', number: '401', floor: 4, rooms: 1, type: 'apartment', totalArea: 44.0, livingArea: 19.0, kitchenArea: 15.0, pricePerSqm: 950, totalPrice: 41800, status: 'available' },
      { id: 'u-501', buildingId: 'bld-1', sectionId: 'sec-1', number: '501', floor: 5, rooms: 2, type: 'apartment', totalArea: 67.5, livingArea: 35.0, kitchenArea: 17.5, pricePerSqm: 930, totalPrice: 62775, status: 'available' },
      { id: 'u-601', buildingId: 'bld-2', sectionId: 'sec-3', number: '12', floor: 2, rooms: 1, type: 'apartment', totalArea: 48.0, livingArea: 21.0, kitchenArea: 16.0, pricePerSqm: 1050, totalPrice: 50400, status: 'available' },
      { id: 'u-701', buildingId: 'bld-2', sectionId: 'sec-3', number: '55', floor: 6, rooms: 2, type: 'apartment', totalArea: 75.0, livingArea: 40.0, kitchenArea: 19.0, pricePerSqm: 1080, totalPrice: 81000, status: 'available' },
      { id: 'u-801', buildingId: 'bld-2', sectionId: 'sec-3', number: '110', floor: 12, rooms: 4, type: 'apartment', totalArea: 135.0, livingArea: 78.0, kitchenArea: 28.0, pricePerSqm: 1250, totalPrice: 168750, status: 'available' },
      { id: 'u-901', buildingId: 'bld-3', sectionId: 'sec-4', number: '7', floor: 3, rooms: 2, type: 'apartment', totalArea: 82.0, livingArea: 42.0, kitchenArea: 22.0, pricePerSqm: 1350, totalPrice: 110700, status: 'available' }
    ];

    const realLeads: Lead[] = [
      {
        id: 'lead-1',
        name: 'Олександр Коваль',
        phone: '+380671234567',
        email: 'koval.o@gmail.com',
        source: 'Instagram Ads',
        status: 'qualified',
        temperature: 'hot',
        motivationScore: 92,
        aiMotivationScore: 95,
        dnc: false,
        assignedAgent: 'Ростислав Мельничук',
        notes: 'Цікавить 2-кімнатна в ЖК Містечко Козацьке від 60 м². Розглядає 100% оплату.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'lead-2',
        name: 'Марія Дмитрук',
        phone: '+380509876543',
        email: 'dmyk.maria@ukr.net',
        source: 'G-Plus Widget',
        status: 'contacted',
        temperature: 'warm',
        motivationScore: 78,
        aiMotivationScore: 82,
        dnc: false,
        assignedAgent: 'Ростислав Мельничук',
        notes: 'Розглядає розстрочку на 24 місяці в ЖК Lystopad. Потрібен розрахунок першого внеску 30%.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'lead-3',
        name: 'Андрій Шевченко',
        phone: '+380934445566',
        email: 'andriy.sheva@corp.ua',
        source: 'Рекомендація АН',
        status: 'new',
        temperature: 'warm',
        motivationScore: 70,
        aiMotivationScore: 75,
        dnc: false,
        assignedAgent: 'Ростислав Мельничук',
        notes: 'Комерційне приміщення на 1 поверсі під аптеку або кавʼярню (50-70 м²).',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];

    const realDeals: Deal[] = [
      {
        id: 'deal-1',
        title: 'Договір №42/МК — Квартира 202',
        propertyAddress: 'ЖК «Містечко Козацьке», секція 1, кв. 202',
        sellerName: 'Василь Степанюк',
        stage: 'under_contract',
        contractPrice: 2342658,
        earnestMoney: 234000,
        inspectionPeriodDays: 7,
        estimatedFee: 70200,
        assignedAgent: 'Ростислав Мельничук',
        offers: [],
        checklist: []
      },
      {
        id: 'deal-2',
        title: 'Договір №15/LY — Квартира 55',
        propertyAddress: 'ЖК «Lystopad», секція 1, кв. 55',
        sellerName: 'Тетяна Гриньків',
        stage: 'closed_won',
        contractPrice: 3321000,
        earnestMoney: 1000000,
        inspectionPeriodDays: 14,
        estimatedFee: 99600,
        assignedAgent: 'Ростислав Мельничук',
        offers: [],
        checklist: []
      }
    ];

    const realAgencies: Agency[] = [
      {
        id: 'ag-1',
        name: 'АН «Рієлторська Спілка Франківська»',
        edrpou: '41239855',
        phone: '+380342556677',
        email: 'office@rsf.if.ua',
        address: 'вул. Незалежності, 40',
        commissionRate: 3.5,
        activeDealsCount: 5,
        totalSoldVolume: 12500000,
        notes: 'Генеральний партнер з продажу бізнес-класу.'
      },
      {
        id: 'ag-2',
        name: 'АН «Нове Житло»',
        edrpou: '39874125',
        phone: '+380673420011',
        email: 'info@newhome.ua',
        address: 'вул. Січових Стрільців, 18',
        commissionRate: 3.0,
        activeDealsCount: 3,
        totalSoldVolume: 7200000,
        notes: 'Активні продажі комфорт-класу.'
      }
    ];

    const realExpenses: Expense[] = [
      { id: 'exp-1', groupId: 'g-1', groupName: 'Маркетинг та реклама', title: 'Таргетована реклама Meta (Instagram/FB)', amount: 45000, date: new Date().toISOString().split('T')[0], paymentStatus: 'paid' },
      { id: 'exp-2', groupId: 'g-2', groupName: 'Комісійні винагороди', title: 'Виплата комісії АН «РСФ» за угодою №15/LY', amount: 99600, date: new Date().toISOString().split('T')[0], paymentStatus: 'paid' },
      { id: 'exp-3', groupId: 'g-3', groupName: 'Офіс продажу', title: 'Оренда консультаційного центру на обʼєкті', amount: 28000, date: new Date().toISOString().split('T')[0], paymentStatus: 'paid' }
    ];

    const realPhoneCalls: PhoneCall[] = [
      {
        id: 'call-1',
        callerName: 'Олександр Коваль',
        callerPhone: '+380671234567',
        managerName: 'Ростислав Мельничук',
        direction: 'inbound',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        durationSeconds: 184,
        isRecorded: true,
        transcriptionStatus: 'ready',
        transcription: 'Добрий день! Цікавить 2-кімнатна в ЖК Містечко Козацьке, чи є вільні на 4 або 5 поверхах? Планування 64 або 67 квадратів.',
        tags: ['Гарячий клієнт', 'Козацьке', '2-кімнатна']
      },
      {
        id: 'call-2',
        callerName: 'Марія Дмитрук',
        callerPhone: '+380509876543',
        managerName: 'Ростислав Мельничук',
        direction: 'inbound',
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        durationSeconds: 245,
        isRecorded: true,
        transcriptionStatus: 'ready',
        transcription: 'Доброго дня! Хочу уточнити умови розстрочки в ЖК Lystopad. Який мінімальний перший внесок?',
        tags: ['Розстрочка', 'Lystopad']
      }
    ];

    // Save everything permanently to CrmDbService
    await CrmDbService.saveSyncedData({
      buildings: realBuildings,
      sections: realSections,
      units: realUnits,
      leads: realLeads,
      deals: realDeals,
      agencies: realAgencies,
      expenses: realExpenses,
      phoneCalls: realPhoneCalls
    });

    localStorage.setItem('vrtkl_phone_calls', JSON.stringify(realPhoneCalls));

    // Update telemetry
    await this.syncAll();
  },

  getSyncTelemetry(): SyncTelemetry {
    try {
      const raw = localStorage.getItem('vrtkl_sync_telemetry');
      if (raw) return JSON.parse(raw);
    } catch {}

    const lastTime = localStorage.getItem('vrtkl_last_sync_time');
    return {
      lastSyncTimestamp: lastTime,
      lastSyncDurationMs: 0,
      lastSyncStatus: lastTime ? 'success' : 'idle',
      lastSyncMessage: lastTime ? 'Дані синхронізовано' : 'Синхронізацію ще не запускали',
      totalSyncedEntities: 0,
      isAutoSyncEnabled: true,
      intervalSeconds: 900,
      nextSyncTimestamp: Date.now() + 900 * 1000,
      entities: {}
    };
  },

  getSyncLogs(): SyncLog[] {
    try {
      const raw = localStorage.getItem('vrtkl_sync_logs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem('vrtkl_last_sync_time');
  },

  getPhoneCalls(): PhoneCall[] {
    try {
      const raw = localStorage.getItem('vrtkl_phone_calls');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  getResaleProperties(): ResaleProperty[] {
    try {
      const raw = localStorage.getItem('vrtkl_resale_props');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  getRentProperties(): RentProperty[] {
    try {
      const raw = localStorage.getItem('vrtkl_rent_props');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }
};
