CREATE OR REPLACE FUNCTION "public"."is_display_name_available"("p_name" "text")
RETURNS boolean
LANGUAGE "sql"
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
SELECT btrim(p_name) ~ '^[A-Za-z0-9_-]{3,30}$'
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE lower(display_name) = lower(btrim(p_name))
     );
$$;

REVOKE ALL ON FUNCTION "public"."is_display_name_available"("text") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."is_display_name_available"("text") TO "anon";
GRANT EXECUTE ON FUNCTION "public"."is_display_name_available"("text") TO "authenticated";