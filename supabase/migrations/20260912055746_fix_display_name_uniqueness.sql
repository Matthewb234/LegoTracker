-- 1. Safety: fail loudly if existing rows already collide case-insensitively.
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

-- 2. Drop any existing case-sensitive unique constraint/index on display_name.
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

-- 3. The real fix: uniqueness on the folded value.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_lower_key
    ON public.profiles (lower(display_name));

-- 4. Truncate before trimming, so a cut landing on a separator doesn't leave one dangling.
CREATE OR REPLACE FUNCTION public.derive_display_name_base(p_meta jsonb, p_email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
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