-- Replace the yearly-only month/day/year columns with a real start_date
-- plus an explicit recurrence pattern, so a reminder can repeat weekly,
-- biweekly, monthly, or yearly — or not repeat at all.
alter table public.reminders
  add column if not exists start_date date,
  add column if not exists recurrence text;

-- Backfill existing rows — everything under the old model was implicitly
-- yearly, so that's the correct recurrence to assign on migration.
update public.reminders
set
  start_date = make_date(coalesce(year, extract(year from now())::int), month, day),
  recurrence = 'yearly'
where start_date is null;

alter table public.reminders
  alter column start_date set not null,
  alter column recurrence set not null,
  alter column recurrence set default 'yearly',
  add constraint reminders_recurrence_check
    check (recurrence in ('none', 'weekly', 'biweekly', 'monthly', 'yearly'));

alter table public.reminders
  drop column if exists month,
  drop column if exists day,
  drop column if exists year;

drop index if exists reminders_month_day_idx;
