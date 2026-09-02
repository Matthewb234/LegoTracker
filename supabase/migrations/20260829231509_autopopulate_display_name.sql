-- supabase/migrations/20260829000002_autopopulate_display_name.sql

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
    nullif(btrim(p_meta->>'display_name'), ''),
    nullif(btrim(p_meta->>'preferred_username'), ''),
    nullif(btrim(p_meta->>'user_name'), ''),
    nullif(btrim(p_meta->>'full_name'), ''),
    nullif(btrim(p_meta->>'name'), ''),
    nullif(split_part(coalesce(p_email, ''), '@', 1), ''),
    'user'
  );

  base := regexp_replace(source, '[^A-Za-z0-9_-]', '_', 'g');
  base := regexp_replace(base, '_+', '_', 'g');
  base := btrim(base, '_-');
  base := substring(base FROM 1 FOR 26);

  IF base IS NULL OR length(base) < 3 THEN
    base := 'user';
END IF;

RETURN base;
END;
$$;


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

  -- explicit name: validate, and let a collision fail loudly
  IF requested_name IS NOT NULL THEN
    IF requested_name !~ '^[A-Za-z0-9_-]{3,30}$' THEN
      RAISE EXCEPTION 'Display name must be 3-30 characters, letters, digits, _ or - only'
        USING ERRCODE = 'check_violation';
END IF;

INSERT INTO public.profiles (id, display_name)
VALUES (NEW.id, requested_name);

RETURN NEW;
END IF;

  -- no name supplied: derive one and disambiguate silently
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
        -- give up guessing and use something that cannot collide
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