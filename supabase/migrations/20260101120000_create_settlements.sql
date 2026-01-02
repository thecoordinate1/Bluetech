-- Create settlements table
create type settlement_status as enum ('pending', 'cleared', 'frozen', 'disputed');

create table if not exists public.settlements (
  id uuid default gen_random_uuid() primary key,
  store_id uuid not null references public.stores(id) on delete cascade,
  amount numeric not null,
  status settlement_status not null default 'pending',
  reference text, -- e.g., order_id
  lenco_transaction_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone,
  
  constraint settlements_amount_check check (amount >= 0)
);

-- RLS Policies
alter table public.settlements enable row level security;

-- Vendors can view their own settlements via the store
create policy "Vendors can view their own settlements"
  on public.settlements
  for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = settlements.store_id
      and stores.vendor_id = auth.uid()
    )
  );

-- Only service role (backend) can insert/update for now (or specific functions)
-- Implied by lack of other policies, but good to be explicit about intent if expanded later.
