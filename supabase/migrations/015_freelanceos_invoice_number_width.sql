-- FreelanceOS — fix invoice numbers past 9999.
--
-- 014 formatted numbers with lpad(n, 4, '0'), but Postgres lpad TRUNCATES
-- longer strings: invoice #10000 became "1000", colliding with an existing
-- number and making finalize fail. Same function, with a width of at least
-- 4 digits that grows as needed (mirrored by formatInvoiceNumber in
-- src/lib/freelanceos/invoice-math.ts).
--
-- Run in Supabase → SQL Editor after 014.

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

      -- At least 4 digits; never truncate (lpad cuts longer strings: 10000 → '1000').
      new.number := coalesce(v_prefix, '') || lpad(v_number::text, greatest(4, length(v_number::text)), '0');
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
