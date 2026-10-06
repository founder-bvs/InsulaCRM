-- ====================================================================
-- VRTKL CRM & G-PLUS PUBLIC API DATABASE SCHEMA FOR SUPABASE (Postgres)
-- Complete Production Database Schema for Real Estate Developer CRM
-- Compatible with all ID formats (UUIDs, G-Plus integer IDs, string IDs)
-- Includes full tables, RLS policies, triggers, and performance indexes
-- ====================================================================

-- 1. PROFILES & USERS (Зв'язок із Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'Менеджер з продажу',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Автоматичний тригер для створення профілю при реєстрації через Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Менеджер відділу продажу'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. BUILDINGS & SECTIONS (Житлові комплекси, будинки, секції з G-Plus API)
CREATE TABLE IF NOT EXISTS public.buildings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Івано-Франківськ',
  floors_count INT NOT NULL DEFAULT 10,
  sections_count INT NOT NULL DEFAULT 3,
  completion_date TEXT,
  status TEXT NOT NULL DEFAULT 'construction',
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.building_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floors INT NOT NULL DEFAULT 10,
  units_count INT NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. UNITS (Шахівка квартир, комерції та паркінгів з G-Plus API)
CREATE TABLE IF NOT EXISTS public.units (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  apartment_id TEXT,
  building_id TEXT REFERENCES public.buildings(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES public.building_sections(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  rooms INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'apartment',
  total_area NUMERIC(8,2) NOT NULL DEFAULT 50,
  living_area NUMERIC(8,2) DEFAULT 0,
  kitchen_area NUMERIC(8,2) DEFAULT 0,
  price_per_sqm NUMERIC(12,2) NOT NULL DEFAULT 900,
  total_price NUMERIC(14,2) NOT NULL DEFAULT 45000,
  status TEXT NOT NULL DEFAULT 'available',
  client_name TEXT,
  client_phone TEXT,
  layout_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. UNIT BOOKINGS (Бронювання квартир)
CREATE TABLE IF NOT EXISTS public.unit_bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  unit_id TEXT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  building_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  deposit_amount NUMERIC(12,2) DEFAULT 1000.00,
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE NOT NULL,
  manager_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LEADS (Ліди покупців та інвесторів)
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  temperature TEXT NOT NULL DEFAULT 'warm',
  motivation_score INT DEFAULT 75,
  ai_motivation_score INT DEFAULT 80,
  dnc BOOLEAN DEFAULT false,
  assigned_agent TEXT NOT NULL DEFAULT 'Ростислав Мельничук',
  notes TEXT,
  property JSONB,
  photos TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CONTACTS (Клієнтська база)
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  passport TEXT,
  tax_id TEXT,
  city TEXT DEFAULT 'Івано-Франківськ',
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DEALS & PAYMENTS (Договори та розстрочки)
CREATE TABLE IF NOT EXISTS public.deals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE SET NULL,
  contact_id TEXT REFERENCES public.contacts(id) ON DELETE SET NULL,
  unit_id TEXT REFERENCES public.units(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  property_address TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospecting',
  contract_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  earnest_money NUMERIC(14,2) DEFAULT 0,
  inspection_period_days INT DEFAULT 7,
  contract_date DATE,
  closing_date DATE,
  estimated_fee NUMERIC(14,2) DEFAULT 0,
  assigned_agent TEXT NOT NULL,
  notes TEXT,
  offers JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deal_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  deal_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  payment_number INT NOT NULL,
  due_date DATE NOT NULL,
  planned_amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  paid_amount NUMERIC(14,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BUYERS / INVESTORS (База інвесторів)
CREATE TABLE IF NOT EXISTS public.buyers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  tier TEXT DEFAULT 'Active',
  proof_of_funds_verified BOOLEAN DEFAULT false,
  verified_amount NUMERIC(14,2) DEFAULT 0,
  target_zips TEXT[],
  max_price NUMERIC(14,2) DEFAULT 0,
  min_beds INT DEFAULT 1,
  preferred_types TEXT[],
  deals_closed_count INT DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 5.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TASKS & ACTIVITIES (Завдання та активності CRM)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT NOT NULL,
  related_entity_id TEXT,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_name TEXT NOT NULL,
  related_entity_id TEXT,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AGENCIES & REALTORS (Агентства нерухомості з G-Plus API)
CREATE TABLE IF NOT EXISTS public.agencies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  name TEXT NOT NULL,
  edrpou TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 3.00,
  active_deals_count INT DEFAULT 0,
  total_sold_volume NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agency_employees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  position TEXT DEFAULT 'Провідний рієлтор',
  rating NUMERIC(3,2) DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. EXPENSES & GROUPS (Фінанси та витрати девелопера)
CREATE TABLE IF NOT EXISTS public.expense_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#01283c',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT,
  group_name TEXT NOT NULL DEFAULT 'Загальні витрати',
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  building_id TEXT REFERENCES public.buildings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PHONE CALLS (Телефонія та записи розмов з G-Plus API)
CREATE TABLE IF NOT EXISTS public.phone_calls (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gplus_id TEXT UNIQUE,
  caller_name TEXT NOT NULL,
  caller_phone TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INT NOT NULL DEFAULT 0,
  is_recorded BOOLEAN DEFAULT false,
  recording_url TEXT,
  transcription_status TEXT DEFAULT 'none',
  transcription TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. RESALE & RENT (Вторинний ринок та оренда)
CREATE TABLE IF NOT EXISTS public.resale_properties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  rooms INT NOT NULL DEFAULT 1,
  total_area NUMERIC(8,2) NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  total_floors INT NOT NULL DEFAULT 10,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  is_published BOOLEAN DEFAULT true,
  commission_percent NUMERIC(5,2) DEFAULT 3.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rent_properties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  rooms INT NOT NULL DEFAULT 1,
  total_area NUMERIC(8,2) NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'available',
  is_published BOOLEAN DEFAULT true,
  tenant_name TEXT,
  lease_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SYNC LOGS (Аудит синхронізації з G-Plus API)
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  records_fetched JSONB NOT NULL DEFAULT '{}'::jsonb,
  delta_report JSONB DEFAULT '{}'::jsonb,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column migrations for existing databases
ALTER TABLE public.sync_logs ADD COLUMN IF NOT EXISTS delta_report JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.buildings ADD COLUMN IF NOT EXISTS gplus_id TEXT;
ALTER TABLE public.building_sections ADD COLUMN IF NOT EXISTS gplus_id TEXT;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS gplus_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gplus_id TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS gplus_id TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS gplus_id TEXT;
ALTER TABLE public.phone_calls ADD COLUMN IF NOT EXISTS gplus_id TEXT;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies allowing the application to read and write data seamlessly
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "crm_open_access_%I" ON public.%I', tbl.tablename, tbl.tablename);
    EXECUTE format('CREATE POLICY "crm_open_access_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl.tablename, tbl.tablename);
  END LOOP;
END $$;

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_units_building_id ON public.units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_section_id ON public.units(section_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON public.units(status);
CREATE INDEX IF NOT EXISTS idx_building_sections_bld ON public.building_sections(building_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_unit ON public.deals(unit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit ON public.unit_bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_phone_calls_started ON public.phone_calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_ts ON public.sync_logs(timestamp DESC);
