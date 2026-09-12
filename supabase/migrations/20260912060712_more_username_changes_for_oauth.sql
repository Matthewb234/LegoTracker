-- supabase/migrations/20260911000000_display_name_case_insensitive.sql

-- 1. Bail out if existing rows already collide case-insensitively.
DO $$
DECLARE
dupes int;
BEGIN
SELECT count(*) INTO dupes
FROM (
         SELECT lower(display_name)
         FROM public.profiles
         GROUP BY lower(display_name)
         HAVING count(*) > 1
     ) d;

IF dupes > 0 THEN
    RAISE EXCEPTION
      'Cannot add case-insensitive unique index: % display name(s) already collide. Resolve them first.', dupes;
END IF;
END $$;

-- 2. Drop the existing case-sensitive unique constraint on display_name, if present.
DO $$
DECLARE
conname_found text;
BEGIN
SELECT c.conname INTO conname_found
FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND t.relname = 'profiles'
  AND c.contype = 'u'
  AND c.conkey = ARRAY[(
    SELECT attnum FROM pg_attribute
    WHERE attrelid = t.oid AND attname = 'display_name'
)]::smallint[];

IF conname_found IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', conname_found);
END IF;
END $$;

-- 3. Uniqueness on the folded value. This is what makes the availability
--    check honest and lets the trigger's collision loop see case variants.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_lower_key
    ON public.profiles (lower(display_name));

-- 4. Truncate before trimming, so a cut landing on a separator doesn't
--    leave one dangling. Also drops the unreachable display_name entry:
--    handle_new_user takes the explicit branch whenever that key is set,
--    so this function is only ever called when it is absent or blank.
CREATE OR REPLACE FUNCTION "public"."derive_display_name_base"(
  "p_meta" "jsonb",
  "p_email" "text"
)
RETURNS "text"
LANGUAGE "plpgsql"
IMMUTABLE
SET search_path = public
AS $$
DECLARE
source text;
  base text;
BEGIN
  source := coalesce(
    nullif(btrim(p_meta->>'preferred_username'), ''),
    nullif(btrim(p_meta->>'user_name'), ''),
    nullif(btrim(p_meta->>'full_name'), ''),
    nullif(btrim(p_meta->>'name'), ''),
    nullif(split_part(coalesce(p_email, ''), '@', 1), ''),
    'user'
  );

  base := regexp_replace(source, '[^A-Za-z0-9_-]', '_', 'g');
  base := regexp_replace(base, '_+', '_', 'g');
  base := substring(base FROM 1 FOR 26);
  base := btrim(base, '_-');

  IF base IS NULL OR length(base) < 3 THEN
    base := 'user';
END IF;

RETURN base;
END;
$$;

-- 5. Wrap the explicit-name insert so a collision surfaces as a readable
--    message instead of a raw constraint violation. Behaviour is otherwise
--    unchanged from 20260829000002.
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
requested_name text;
  base_name text;
  candidate text;
  attempt int := 0;
BEGIN
  requested_name := nullif(btrim(NEW.raw_user_meta_data->>'display_name'), '');

  IF requested_name IS NOT NULL THEN
    IF requested_name !~ '^[A-Za-z0-9_-]{3,30}$' THEN
      RAISE EXCEPTION 'Display name must be 3-30 characters, letters, digits, _ or - only'
        USING ERRCODE = 'check_violation';
END IF;

BEGIN
INSERT INTO public.profiles (id, display_name)
VALUES (NEW.id, requested_name);
EXCEPTION WHEN unique_violation THEN
      RAISE EXCEPTION 'Display name is already taken'
        USING ERRCODE = 'unique_violation';
END;

RETURN NEW;
END IF;

  base_name := public.derive_display_name_base(NEW.raw_user_meta_data, NEW.email);

  LOOP
attempt := attempt + 1;
    candidate := CASE
      WHEN attempt = 1 THEN base_name
      ELSE base_name || '_' || attempt
END;

BEGIN
INSERT INTO public.profiles (id, display_name)
VALUES (NEW.id, candidate);
RETURN NEW;
EXCEPTION WHEN unique_violation THEN
      IF attempt >= 20 THEN
        candidate := substring(base_name FROM 1 FOR 21) || '_'
                     || substring(replace(NEW.id::"text", '-', '') FROM 1 FOR 8);
INSERT INTO public.profiles (id, display_name)
VALUES (NEW.id, candidate);
RETURN NEW;
END IF;
END;
END LOOP;
END;
$$;