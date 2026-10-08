-- FreelanceOS — Phase 2: invoices, line items, payments.
--
-- Integrity lives in the database, not the browser:
--   - Totals (subtotal, discount, tax, total) and amount_paid are always
--     recomputed by triggers from invoice_items / payments. Client-sent
--     values for those columns are ignored.
--   - Invoices start as drafts without a number. Moving draft → sent assigns
--     the next number from a per-org counter (row-locked, so no duplicates
--     and no gaps from deleted drafts) and snapshots the business + client
--     details printed on the invoice.
--   - Sent invoices are locked (only sent → void). Line items can only change
--     on drafts; payments only on sent invoices, never above the balance.
--
-- Rounding (mirrored in src/lib/freelanceos/invoice-math.ts):
--   line     = round(quantity × unit_price)
--   discount = round(subtotal × discount_rate / 100)
--   tax      = round((subtotal − discount) × tax_rate / 100)
--   total    = subtotal − discount + tax
--
-- Run in Supabase → SQL Editor after 013.

-- ── Per-org invoice counter (not client-writable: absent from column grants) ─

alter table public.organizations
  add column if not exists next_invoice_number integer not null default 1
    check (next_invoice_number > 0);

-- Target for invoices' composite FK (project must be in the same org).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_org_id_id_key') then
    alter table public.projects add constraint projects_org_id_id_key unique (org_id, id);
  end if;
end $$;

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null,
  project_id uuid,
  number text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'void')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  issue_date date not null default current_date,
  due_date date not null,
  tax_rate numeric(5, 2) not null default 0 check (tax_rate between 0 and 100),
  discount_rate numeric(5, 2) not null default 0 check (discount_rate between 0 and 100),
  notes text check (notes is null or char_length(notes) <= 5000),
  -- Computed by trigger:
  subtotal_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  tax_minor bigint not null default 0,
  total_minor bigint not null default 0,
  amount_paid_minor bigint not null default 0,
  -- Set when sent:
  sent_at timestamptz,
  from_snapshot jsonb,
  bill_to_snapshot jsonb,
  payment_details text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date >= issue_date),
  unique (org_id, number),
  unique (org_id, id),
  foreign key (org_id, client_id) references public.clients (org_id, id),
  foreign key (org_id, project_id) references public.projects (org_id, id)
);

create index if not exists invoices_org_status_idx on public.invoices (org_id, status, due_date);
create index if not exists invoices_client_idx on public.invoices (client_id);
create index if not exists invoices_project_idx on public.invoices (project_id);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  invoice_id uuid not null,
  position integer not null default 0,
  description text not null check (char_length(btrim(description)) between 1 and 500),
  quantity numeric(12, 2) not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  amount_minor bigint generated always as (round(quantity * unit_price_minor)::bigint) stored,
  foreign key (org_id, invoice_id) references public.invoices (org_id, id) on delete cascade
);

create index if not exists invoice_items_invoice_idx on public.invoice_items (invoice_id, position);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  invoice_id uuid not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'USD', -- copied from the invoice by trigger
  paid_on date not null default current_date,
  method text check (method is null or char_length(method) <= 60),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (org_id, invoice_id) references public.invoices (org_id, id) on delete cascade
);

create index if not exists payments_org_paid_on_idx on public.payments (org_id, paid_on);
create index if not exists payments_invoice_idx on public.payments (invoice_id);

-- ── Invoice compute + state machine (BEFORE INSERT/UPDATE) ───────────────────
-- SECURITY DEFINER: bumps the org counter (not client-writable) and reads
-- snapshots; the invoice row itself has already passed RLS.

create or replace function public.invoices_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number integer;
  v_prefix text;
begin
  -- Derived money, always from source rows.
  select coalesce(sum(amount_minor), 0) into new.subtotal_minor
  from public.invoice_items where invoice_id = new.id;
  new.discount_minor := round(new.subtotal_minor * new.discount_rate / 100);
  new.tax_minor := round((new.subtotal_minor - new.discount_minor) * new.tax_rate / 100);
  new.total_minor := new.subtotal_minor - new.discount_minor + new.tax_minor;
  select coalesce(sum(amount_minor), 0) into new.amount_paid_minor
  from public.payments where invoice_id = new.id;
  new.updated_at := now();

  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'New invoices must be drafts' using errcode = '22023';
    end if;
    new.number := null;
    new.sent_at := null;
    new.from_snapshot := null;
    new.bill_to_snapshot := null;
    new.payment_details := null;
    return new;
  end if;

  -- Number, sent_at and snapshots are only ever set by the transition below.
  new.number := old.number;
  new.sent_at := old.sent_at;
  new.from_snapshot := old.from_snapshot;
  new.bill_to_snapshot := old.bill_to_snapshot;
  new.payment_details := old.payment_details;

  if old.status <> 'draft' and (
    new.client_id, new.project_id, new.currency, new.issue_date,
    new.due_date, new.tax_rate, new.discount_rate, new.notes, new.org_id
  ) is distinct from (
    old.client_id, old.project_id, old.currency, old.issue_date,
    old.due_date, old.tax_rate, old.discount_rate, old.notes, old.org_id
  ) then
    raise exception 'Sent invoices can''t be edited' using errcode = '22023';
  end if;

  if new.status is distinct from old.status then
    if old.status = 'draft' and new.status = 'sent' then
      if not exists (select 1 from public.invoice_items where invoice_id = new.id) then
        raise exception 'Add at least one line item before sending' using errcode = '22023';
      end if;

      update public.organizations
      set next_invoice_number = next_invoice_number + 1
      where id = new.org_id
      returning next_invoice_number - 1, invoice_prefix into v_number, v_prefix;

      new.number := coalesce(v_prefix, '') || lpad(v_number::text, 4, '0');
      new.sent_at := now();

      select jsonb_build_object(
               'name', o.name, 'email', o.email, 'phone', o.phone,
               'address', o.address, 'tax_id', o.tax_id),
             o.payment_details
      into new.from_snapshot, new.payment_details
      from public.organizations o where o.id = new.org_id;

      select jsonb_build_object(
               'name', c.name, 'company', c.company, 'email', c.email,
               'phone', c.phone, 'country', c.country)
      into new.bill_to_snapshot
      from public.clients c where c.id = new.client_id;
    elsif old.status = 'sent' and new.status = 'void' then
      null;
    else
      raise exception 'Invoices can only go draft → sent → void' using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.invoices_before_write() from public, anon, authenticated;

drop trigger if exists invoices_before_write on public.invoices;
create trigger invoices_before_write
  before insert or update on public.invoices
  for each row execute function public.invoices_before_write();

-- ── Line items: drafts only; recompute the parent afterwards ─────────────────

create or replace function public.invoice_items_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status from public.invoices
  where id = coalesce(new.invoice_id, old.invoice_id);
  -- Parent missing = cascade delete in progress; allow.
  if v_status is not null and v_status <> 'draft' then
    raise exception 'Line items can only change on draft invoices' using errcode = '22023';
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.invoice_touch_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.invoices set updated_at = now()
  where id = coalesce(new.invoice_id, old.invoice_id);
  return null;
end;
$$;

revoke all on function public.invoice_items_guard() from public, anon, authenticated;
revoke all on function public.invoice_touch_parent() from public, anon, authenticated;

drop trigger if exists invoice_items_guard on public.invoice_items;
create trigger invoice_items_guard
  before insert or update or delete on public.invoice_items
  for each row execute function public.invoice_items_guard();

drop trigger if exists invoice_items_touch_parent on public.invoice_items;
create trigger invoice_items_touch_parent
  after insert or update or delete on public.invoice_items
  for each row execute function public.invoice_touch_parent();

-- ── Payments: sent invoices only, never above the balance ────────────────────

create or replace function public.payments_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.invoices;
begin
  select * into v_inv from public.invoices where id = new.invoice_id;
  if v_inv.id is null or v_inv.org_id <> new.org_id then
    raise exception 'Invoice not found' using errcode = '22023';
  end if;
  if v_inv.status <> 'sent' then
    raise exception 'Payments can only be recorded on sent invoices' using errcode = '22023';
  end if;
  if new.amount_minor > v_inv.total_minor - v_inv.amount_paid_minor then
    raise exception 'Payment is more than the balance due' using errcode = '22023';
  end if;
  new.currency := v_inv.currency;
  return new;
end;
$$;

revoke all on function public.payments_guard() from public, anon, authenticated;

drop trigger if exists payments_guard on public.payments;
create trigger payments_guard
  before insert on public.payments
  for each row execute function public.payments_guard();

drop trigger if exists payments_touch_parent on public.payments;
create trigger payments_touch_parent
  after insert or delete on public.payments
  for each row execute function public.invoice_touch_parent();

-- Payments are append/delete only (no edits).
-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

revoke all on public.invoices from anon;
revoke all on public.invoice_items from anon;
revoke all on public.payments from anon;
revoke update on public.payments from authenticated;

drop policy if exists "invoices_member_select" on public.invoices;
create policy "invoices_member_select" on public.invoices for select
  to authenticated using (public.is_org_member(org_id));

drop policy if exists "invoices_member_insert" on public.invoices;
create policy "invoices_member_insert" on public.invoices for insert
  to authenticated with check (public.is_org_member(org_id));

drop policy if exists "invoices_member_update" on public.invoices;
create policy "invoices_member_update" on public.invoices for update
  to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

-- Only drafts can be deleted; sent invoices are voided instead.
drop policy if exists "invoices_member_delete_draft" on public.invoices;
create policy "invoices_member_delete_draft" on public.invoices for delete
  to authenticated using (public.is_org_member(org_id) and status = 'draft');

drop policy if exists "invoice_items_member_all" on public.invoice_items;
create policy "invoice_items_member_all" on public.invoice_items for all
  to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

drop policy if exists "payments_member_all" on public.payments;
create policy "payments_member_all" on public.payments for all
  to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

-- ── Atomic draft save (invoice + items in one transaction) ───────────────────
-- SECURITY INVOKER: runs as the caller, so RLS and all triggers apply.

create or replace function public.save_invoice_draft(
  p_invoice_id uuid,
  p_org_id uuid,
  p_fields jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Add at least one line item' using errcode = '22023';
  end if;

  if p_invoice_id is null then
    insert into public.invoices (
      org_id, client_id, project_id, currency, issue_date, due_date,
      tax_rate, discount_rate, notes
    ) values (
      p_org_id,
      (p_fields ->> 'client_id')::uuid,
      nullif(p_fields ->> 'project_id', '')::uuid,
      p_fields ->> 'currency',
      (p_fields ->> 'issue_date')::date,
      (p_fields ->> 'due_date')::date,
      coalesce((p_fields ->> 'tax_rate')::numeric, 0),
      coalesce((p_fields ->> 'discount_rate')::numeric, 0),
      nullif(p_fields ->> 'notes', '')
    )
    returning id into v_id;
  else
    update public.invoices set
      client_id = (p_fields ->> 'client_id')::uuid,
      project_id = nullif(p_fields ->> 'project_id', '')::uuid,
      currency = p_fields ->> 'currency',
      issue_date = (p_fields ->> 'issue_date')::date,
      due_date = (p_fields ->> 'due_date')::date,
      tax_rate = coalesce((p_fields ->> 'tax_rate')::numeric, 0),
      discount_rate = coalesce((p_fields ->> 'discount_rate')::numeric, 0),
      notes = nullif(p_fields ->> 'notes', '')
    where id = p_invoice_id and org_id = p_org_id and status = 'draft'
    returning id into v_id;

    if v_id is null then
      raise exception 'Draft invoice not found' using errcode = 'P0002';
    end if;

    delete from public.invoice_items where invoice_id = v_id;
  end if;

  insert into public.invoice_items (org_id, invoice_id, position, description, quantity, unit_price_minor)
  select p_org_id, v_id, t.ord::integer, t.item ->> 'description',
         (t.item ->> 'quantity')::numeric, (t.item ->> 'unit_price_minor')::bigint
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  return v_id;
end;
$$;

revoke all on function public.save_invoice_draft(uuid, uuid, jsonb, jsonb) from public, anon;
grant execute on function public.save_invoice_draft(uuid, uuid, jsonb, jsonb) to authenticated;

-- ── Activity log: invoice events ─────────────────────────────────────────────

alter table public.activity_log drop constraint if exists activity_log_entity_type_check;
alter table public.activity_log add constraint activity_log_entity_type_check
  check (entity_type in ('client', 'project', 'invoice'));

create or replace function public.log_invoice_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_details jsonb := '{}'::jsonb;
  v_client text;
begin
  if tg_op = 'INSERT' then
    v_action := 'created';
  elsif old.status = 'draft' and new.status = 'sent' then
    v_action := 'sent';
  elsif old.status = 'sent' and new.status = 'void' then
    v_action := 'voided';
  elsif new.amount_paid_minor > old.amount_paid_minor then
    v_action := case when new.amount_paid_minor >= new.total_minor then 'paid' else 'payment_recorded' end;
    v_details := jsonb_build_object(
      'amount_minor', new.amount_paid_minor - old.amount_paid_minor, 'currency', new.currency);
  else
    return null; -- draft edits and recomputes aren't worth a feed entry
  end if;

  select name into v_client from public.clients where id = new.client_id;
  insert into public.activity_log (org_id, actor_id, entity_type, entity_id, action, summary, details)
  values (
    new.org_id, auth.uid(), 'invoice', new.id, v_action,
    coalesce(new.number, 'Draft invoice') || coalesce(' · ' || v_client, ''),
    v_details
  );
  return null;
end;
$$;

revoke all on function public.log_invoice_activity() from public, anon, authenticated;

drop trigger if exists invoices_log_activity on public.invoices;
create trigger invoices_log_activity
  after insert or update on public.invoices
  for each row execute function public.log_invoice_activity();
