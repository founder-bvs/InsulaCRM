export type BusinessMode = 'wholesale' | 'realestate' | 'developer';

export type LeadStatus =
  | 'new'
  | 'attempted_contact'
  | 'contacted'
  | 'appointment_set'
  | 'offer_made'
  | 'under_contract'
  | 'dispositions'
  | 'assigned'
  | 'closed_won'
  | 'closed_lost';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

export type LeadSource =
  | 'cold_call'
  | 'direct_mail'
  | 'driving_for_dollars'
  | 'website'
  | 'referral'
  | 'ppc'
  | 'seo'
  | 'social_media'
  | 'list_import'
  | 'facebook'
  | 'instagram'
  | 'google'
  | 'billboard'
  | 'agency'
  | 'other';

export type PropertyCondition = 'turnkey' | 'cosmetic' | 'moderate' | 'full_rehab' | 'teardown';

export interface PropertyDetails {
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  condition: PropertyCondition;
  distressMarkers: string[];
  arv: number;
  repairEstimate: number;
  maoRulePercent: number; // e.g. 70
  desiredAssignmentFee: number;
  calculatedMao: number;
  listPrice?: number;
  daysOnMarket?: number;
  buildingId?: string;
  unitId?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  temperature: LeadTemperature;
  motivationScore: number;
  aiMotivationScore: number;
  dnc: boolean;
  assignedAgent: string;
  notes: string;
  createdAt: string;
  property: PropertyDetails;
  photos: string[];
  tags: string[];
  externalId?: string;
  duplicatesCount?: number;
}

export type WholesaleDealStage =
  | 'prospecting'
  | 'under_contract'
  | 'dispositions'
  | 'assigned'
  | 'closing'
  | 'closed_won'
  | 'closed_lost';

export type AgentDealStage =
  | 'listing_agreement'
  | 'active_listing'
  | 'showing'
  | 'under_contract'
  | 'closing'
  | 'closed_won'
  | 'closed_lost';

export type DealStage = WholesaleDealStage | AgentDealStage;

export interface DealOffer {
  id: string;
  buyerName: string;
  amount: number;
  depositAmount: number;
  contingencies: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

// -------------------------------------------------------------------
// G-PLUS PUBLIC API & DEVELOPER ENTITIES
// -------------------------------------------------------------------

// 1. Buildings & Chessboard (Шахівка девелопера)
export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  floorsCount: number;
  sectionsCount: number;
  completionDate: string;
  status: 'planning' | 'construction' | 'completed';
  image: string;
  description: string;
  externalId?: number;
}

export interface BuildingSection {
  id: string;
  buildingId: string;
  name: string;
  floors: number;
  unitsCount: number;
  externalId?: number;
}

export type UnitStatus = 'available' | 'booked' | 'sold' | 'reserved';
export type UnitType = 'apartment' | 'commercial' | 'parking' | 'storage';

export interface Unit {
  id: string;
  buildingId: string;
  sectionId?: string;
  number: string;
  floor: number;
  rooms: number;
  type: UnitType;
  totalArea: number; // m²
  livingArea?: number;
  kitchenArea?: number;
  pricePerSqm: number; // $ or UAH
  totalPrice: number;
  status: UnitStatus;
  clientName?: string;
  clientPhone?: string;
  layoutImage?: string;
  externalId?: number;
}

export interface UnitBooking {
  id: string;
  unitId: string;
  unitNumber: string;
  buildingName: string;
  clientName: string;
  clientPhone: string;
  depositAmount: number;
  bookingDate: string;
  expiresAt: string;
  managerName: string;
  status: 'active' | 'expired' | 'converted_to_deal' | 'cancelled';
  externalId?: number;
}

// 2. Deals with Payment Schedules (Графік оплат та розстрочка з G-Plus API)
export interface DealPayment {
  id: string;
  dealId: string;
  paymentNumber: number;
  dueDate: string;
  plannedAmount: number;
  currency: 'USD' | 'UAH' | 'EUR';
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAmount: number;
  description: string;
  externalId?: number;
}

export interface DealActualPayment {
  id: string;
  dealPaymentId: string;
  dealId: string;
  paymentDate: string;
  amount: number;
  currency: 'USD' | 'UAH' | 'EUR';
  exchangeRate: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'card';
  receiptNumber: string;
}

export interface Deal {
  id: string;
  leadId?: string;
  contactId?: string;
  unitId?: string;
  title: string;
  propertyAddress: string;
  sellerName: string;
  stage: DealStage;
  contractPrice: number;
  earnestMoney: number;
  inspectionPeriodDays: number;
  contractDate: string;
  closingDate: string;
  estimatedFee: number;
  assignedAgent: string;
  notes: string;
  offers: DealOffer[];
  checklist: ChecklistItem[];
  payments?: DealPayment[];
  buyerAssignedId?: string;
  buyerAssignedName?: string;
  finalSalePrice?: number;
  externalId?: number;
}

// 3. Real Estate Agencies & Partners (АН та рієлтори з G-Plus API)
export interface Agency {
  id: string;
  name: string;
  edrpou?: string;
  phone: string;
  email: string;
  address: string;
  commissionRate: number; // percentage, e.g. 3.0
  activeDealsCount: number;
  totalSoldVolume: number;
  notes: string;
  employees?: AgencyEmployee[];
  externalId?: number;
}

export interface AgencyEmployee {
  id: string;
  agencyId: string;
  agencyName: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  rating: number;
  externalId?: number;
}

// 4. Contacts (База клієнтів з G-Plus API)
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  passport?: string;
  taxId?: string;
  city: string;
  address?: string;
  notes?: string;
  externalId?: number;
}

// 5. Developer Expenses (Фінанси та витрати девелопера з G-Plus API)
export interface ExpenseGroup {
  id: string;
  name: string;
  color: string;
  externalId?: number;
}

export interface Expense {
  id: string;
  groupId: string;
  groupName: string;
  title: string;
  amount: number;
  date: string;
  paymentStatus: 'paid' | 'scheduled';
  buildingId?: string;
  externalId?: number;
}

// 6. Telephony & Phone Calls (Телефонія з G-Plus API /api/v1/phone_calls)
export interface PhoneCall {
  id: string;
  callerName: string;
  callerPhone: string;
  managerName: string;
  direction: 'inbound' | 'outbound' | 'missed';
  startedAt: string;
  durationSeconds: number;
  recordingUrl?: string;
  isRecorded: boolean;
  transcription?: string;
  transcriptionStatus: 'none' | 'processing' | 'ready' | 'failed';
  leadId?: string;
  notes?: string;
  tags?: string[];
  externalId?: number;
}

// 7. Secondary Market & Rent (Вторинний ринок та Оренда /api/v1/resale & /api/v1/rent)
export interface ResaleProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  rooms: number;
  totalArea: number;
  floor: number;
  totalFloors: number;
  ownerName: string;
  ownerPhone: string;
  status: 'active' | 'under_contract' | 'sold';
  isPublished: boolean;
  commissionPercent: number;
  createdAt: string;
  externalId?: number;
}

export interface RentProperty {
  id: string;
  title: string;
  address: string;
  monthlyPrice: number;
  depositAmount: number;
  rooms: number;
  totalArea: number;
  floor: number;
  status: 'available' | 'rented' | 'reserved';
  isPublished: boolean;
  tenantName?: string;
  leaseEnd?: string;
  externalId?: number;
}

// 8. Buyers / Investors (Взаємодія з базою інвесторів)
export interface Buyer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tier: 'VIP' | 'Active' | 'Casual';
  proofOfFundsVerified: boolean;
  verifiedAmount: number;
  targetZips: string[];
  maxPrice: number;
  minBeds: number;
  preferredTypes: string[];
  dealsClosedCount: number;
  rating: number; // 1-5
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  relatedEntityId?: string;
  relatedEntityType?: 'lead' | 'deal' | 'buyer' | 'unit';
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'offer' | 'showing';
  title: string;
  description: string;
  createdAt: string;
  userName: string;
  relatedEntityId?: string;
  relatedEntityType?: 'lead' | 'deal' | 'buyer' | 'unit';
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface NbuRate {
  usd: number;
  eur: number;
  updatedAt: string;
}

// 9. G-Plus Synchronization Engine Types
export interface GPlusSyncConfig {
  apiToken: string;
  baseUrl: string;
  intervalSeconds: number; // default: 900
  isAutoSyncEnabled: boolean;
  lastSyncTime: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  durationMs: number;
  status: 'success' | 'error';
  recordsFetched: {
    buildings: number;
    units: number;
    leads: number;
    deals: number;
    contacts: number;
    agencies: number;
    expenses: number;
    phoneCalls: number;
    resale: number;
    rent: number;
  };
  message?: string;
  error?: string;
  sampleItems?: {
    buildings?: string[];
    leads?: string[];
    deals?: string[];
  };
}

export interface SyncEntityAudit {
  category: string;
  count: number;
  endpoint: string;
  lastUpdated: string;
  status: 'synced' | 'empty' | 'error';
  details: string;
  sampleItems?: string[];
}

export interface MergeStats {
  added: number;
  updated: number;
  unchanged: number;
  total: number;
}

export interface SyncDeltaReport {
  timestamp: string;
  durationMs: number;
  isHistoricalFullExport: boolean;
  totals: {
    addedTotal: number;
    updatedTotal: number;
    unchangedTotal: number;
    extractedTotal: number;
  };
  breakdown: {
    buildings: MergeStats;
    sections: MergeStats;
    units: MergeStats;
    leads: MergeStats;
    deals: MergeStats;
    agencies: MergeStats;
    expenses: MergeStats;
    phoneCalls: MergeStats;
    resale: MergeStats;
    rent: MergeStats;
  };
}

export interface HistoricalSyncProgress {
  currentStage: string;
  stageProgress: number;
  totalExtracted: number;
  addedNew: number;
  updated: number;
  unchanged: number;
  details: string;
}

export interface SyncTelemetry {
  lastSyncTimestamp: string | null;
  lastSyncDurationMs: number;
  lastSyncStatus: 'idle' | 'success' | 'partial' | 'error';
  lastSyncMessage: string;
  totalSyncedEntities: number;
  isAutoSyncEnabled: boolean;
  intervalSeconds: number;
  nextSyncTimestamp: number;
  isHistoricalFullExport?: boolean;
  deltaReport?: SyncDeltaReport;
  entities: Record<string, SyncEntityAudit>;
}
