-- supabase/migrations/20260829000000_add_display_name_constraints.sql

-- ---------- backfill existing rows before constraints can apply ----------

-- trim whitespace
UPDATE "public"."profiles"
SET "display_name" = btrim("display_name")
WHERE "display_name" IS DISTINCT FROM btrim("display_name");

-- replace illegal characters
UPDATE "public"."profiles"
SET "display_name" = regexp_replace("display_name", '[^A-Za-z0-9_-]', '_', 'g')
WHERE "display_name" IS NOT NULL
  AND "display_name" !~ '^[A-Za-z0-9_-]+$';

-- fill nulls and anything now too short
UPDATE "public"."profiles"
SET "display_name" = 'user_' || substring("id"::"text" FROM 1 FOR 8)
WHERE "display_name" IS NULL OR length("display_name") < 3;

-- truncate anything too long
UPDATE "public"."profiles"
SET "display_name" = substring("display_name" FROM 1 FOR 30)
WHERE length("display_name") > 30;

-- resolve case-insensitive duplicates, keeping the oldest profile's name intact
WITH "ranked" AS (
    SELECT "id",
           "display_name",
           row_number() OVER (
           PARTITION BY lower("display_name")
           ORDER BY "created_at", "id"
         ) AS "rn"
    FROM "public"."profiles"
)
UPDATE "public"."profiles" "p"
SET "display_name" = substring("r"."display_name" FROM 1 FOR 26) || '_' || "r"."rn"
    FROM "ranked" "r"
WHERE "p"."id" = "r"."id" AND "r"."rn" > 1;

-- ---------- constraints ----------

ALTER TABLE "public"."profiles"
    ALTER COLUMN "display_name" SET NOT NULL;

ALTER TABLE "public"."profiles"
    ADD CONSTRAINT "profiles_display_name_format_check"
        CHECK ("display_name" ~ '^[A-Za-z0-9_-]{3,30}$');

CREATE UNIQUE INDEX "profiles_display_name_lower_idx"
    ON "public"."profiles" (lower("display_name"));

-- ---------- trigger now validates instead of silently writing null ----------

CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
requested_name text;
BEGIN
  requested_name := btrim(NEW.raw_user_meta_data->>'display_name');

  IF requested_name IS NULL OR requested_name = '' THEN
    RAISE EXCEPTION 'A display name is required to sign up'
      USING ERRCODE = 'check_violation';
END IF;

INSERT INTO public.profiles (id, display_name)
VALUES (NEW.id, requested_name);

RETURN NEW;
END;
$$;