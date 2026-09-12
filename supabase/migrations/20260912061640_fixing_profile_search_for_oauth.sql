-- supabase/migrations/20260911000001_search_profiles_case_folded.sql

CREATE OR REPLACE FUNCTION "public"."search_profiles"(
  "p_search" "text",
  "p_limit" integer DEFAULT 20,
  "p_exact" boolean DEFAULT false
)
RETURNS TABLE (
  "profile_id" "uuid",
  "display_name" "text",
  "avatar_url" "text",
  "connection_id" "uuid",
  "connection_status" "text",
  "direction" "text"
)
LANGUAGE "plpgsql"
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
DECLARE
me uuid := auth.uid();
  term text := btrim(p_search);
  folded text;
  escaped text;
  cap int := least(greatest(p_limit, 1), 100);
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
END IF;

  IF term = '' THEN
    RETURN;
END IF;

  folded := lower(term);

  -- Exact: own branch so the planner can use profiles_display_name_lower_key.
  -- At most one row, since that index is unique.
  IF p_exact THEN
    RETURN QUERY
SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    mc.connection_id,
    mc.status,
    mc.direction
FROM public.profiles p
         LEFT JOIN public.my_connections mc
                   ON mc.friend_id = p.id
WHERE p.id <> me
  AND lower(p.display_name) = folded;
RETURN;
END IF;

  -- backslash first, or it double-escapes the ones added after
  escaped := replace(replace(replace(folded, '\', '\\'), '%', '\%'), '_', '\_');

RETURN QUERY
SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    mc.connection_id,
    mc.status,
    mc.direction
FROM public.profiles p
         LEFT JOIN public.my_connections mc
                   ON mc.friend_id = p.id
WHERE p.id <> me
  AND lower(p.display_name) LIKE '%' || escaped || '%'
ORDER BY
    (lower(p.display_name) = folded) DESC,
    (lower(p.display_name) LIKE escaped || '%') DESC,
    lower(p.display_name)
    LIMIT cap;
END;
$$;

REVOKE ALL ON FUNCTION "public"."search_profiles"("text", integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."search_profiles"("text", integer, boolean) TO "authenticated";