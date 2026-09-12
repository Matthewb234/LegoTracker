create or replace function public.normalize_email(raw text)
returns text
language plpgsql
immutable
as $$
declare
local_part text;
  domain_part text;
begin
  if raw is null or position('@' in raw) = 0 then
    return null;
end if;

  raw := lower(trim(raw));
  local_part := split_part(raw, '@', 1);
  domain_part := split_part(raw, '@', 2);

  -- plus-addressing: gmail, outlook, icloud, fastmail all support it
  local_part := split_part(local_part, '+', 1);

  -- gmail also ignores dots in the local part
  if domain_part in ('gmail.com', 'googlemail.com') then
    local_part := replace(local_part, '.', '');
    domain_part := 'gmail.com';
end if;

return local_part || '@' || domain_part;
end;
$$;

create table public.allowed_emails (
                                       id uuid primary key default gen_random_uuid(),
                                       email text not null,
                                       email_normalized text generated always as (public.normalize_email(email)) stored,
                                       note text,
                                       created_at timestamptz not null default now()
);

create unique index allowed_emails_normalized_idx
    on public.allowed_emails (email_normalized);


create or replace function public.hook_restrict_signup_to_allowlist(event jsonb)
returns jsonb
language plpgsql
as $$
declare
submitted text;
  normalized text;
  is_allowed boolean;
begin
  submitted := event->'user'->>'email';
  normalized := public.normalize_email(submitted);

  if normalized is null then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'A valid email address is required.',
        'http_code', 400
      )
    );
end if;

select exists (
    select 1 from public.allowed_emails
    where email_normalized = normalized
) into is_allowed;

if is_allowed then
    return '{}'::jsonb;
end if;

return jsonb_build_object(
        'error', jsonb_build_object(
                'message', format('%s is not on the invite list.', submitted),
                'http_code', 403
                 )
       );
end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute on function public.normalize_email(text) to supabase_auth_admin;
grant execute on function public.hook_restrict_signup_to_allowlist(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup_to_allowlist(jsonb)
    from authenticated, anon, public;

revoke all on table public.allowed_emails from authenticated, anon, public;

alter table public.allowed_emails enable row level security;

create policy "auth admin reads allowlist"
  on public.allowed_emails
  for select
                 to supabase_auth_admin
                 using (true);

insert into public.allowed_emails (email, note) values
    ('bubba.beaudin@gmail.com', 'me'),
    ('melaniechi06@gmail.com', 'Mel');