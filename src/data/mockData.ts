import {
  Lead,
  Deal,
  Buyer,
  Task,
  Activity,
  SystemUser,
  Building,
  BuildingSection,
  Unit,
  UnitBooking,
  Agency,
  ExpenseGroup,
  Expense
} from '../types';

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'u1',
    name: 'Ростислав Мельничук',
    email: 'rostislavmelnicuk2000@gmail.com',
    role: 'Керівник відділу продажу'
  }
];

// Production state: All demo data deleted. Data is loaded dynamically from Supabase or synced from G-Plus CRM API.
export const INITIAL_BUILDINGS: Building[] = [];
export const INITIAL_SECTIONS: BuildingSection[] = [];
export const INITIAL_UNITS: Unit[] = [];
export const INITIAL_BOOKINGS: UnitBooking[] = [];
export const INITIAL_BUYERS: Buyer[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_DEALS: Deal[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_AGENCIES: Agency[] = [];
export const INITIAL_EXPENSE_GROUPS: ExpenseGroup[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
