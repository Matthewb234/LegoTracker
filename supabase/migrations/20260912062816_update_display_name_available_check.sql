CREATE OR REPLACE FUNCTION "public"."is_display_name_available"(
  "p_name" "text",
  "p_exclude" "uuid" DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
SELECT btrim(p_name) ~ '^[A-Za-z0-9_-]{3,30}$'
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE lower(display_name) = lower(btrim(p_name))
         AND (p_exclude IS NULL OR id <> p_exclude)
     );
$$;