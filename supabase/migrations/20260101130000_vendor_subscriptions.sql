-- Create subscription status enum
create type public.subscription_status as enum ('trial', 'active', 'past_due', 'canceled', 'expired');

-- Create vendor_subscriptions table
create table if not exists public.vendor_subscriptions (
  vendor_id uuid not null primary key references public.vendors(id) on delete cascade,
  status public.subscription_status not null default 'trial',
  plan_id text not null default 'premium_monthly',
  trial_ends_at timestamp with time zone,
  current_period_end timestamp with time zone,
  lenco_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.vendor_subscriptions enable row level security;

create policy "Vendors can view their own subscription"
  on public.vendor_subscriptions
  for select
  using ( auth.uid() = vendor_id );

-- Trigger to automatically create a trial subscription for new vendors
create or replace function public.handle_new_vendor_subscription()
returns trigger as $$
begin
  insert into public.vendor_subscriptions (vendor_id, status, trial_ends_at)
  values (new.id, 'trial', now() + interval '30 days');
  return new;
end;
$$ language plpgsql;

-- Trigger execution after verified vendor creation
-- Note: 'vendors' table is populated via a trigger on auth.users or manually. 
-- We attach this to the 'vendors' table AFTER INSERT.
create trigger on_vendor_created_create_subscription
  after insert on public.vendors
  for each row execute function public.handle_new_vendor_subscription();

-- Backfill existing vendors with trial (if any exist without subscription)
insert into public.vendor_subscriptions (vendor_id, status, trial_ends_at)
select id, 'trial', now() + interval '30 days'
from public.vendors v
where not exists (select 1 from public.vendor_subscriptions vs where vs.vendor_id = v.id);
