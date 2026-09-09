-- supabase/migrations/20260903000000_add_search_profiles.sql

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
  pattern text;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
END IF;

  IF term = '' THEN
    RETURN;
END IF;

  IF p_exact THEN
    pattern := term;
ELSE
    -- backslash first, or it double-escapes the ones added after
    pattern := '%' || replace(replace(replace(term, '\', '\\'), '%', '\%'), '_', '\_') || '%';
END IF;

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
  AND (
    CASE WHEN p_exact
      THEN lower(p.display_name) = lower(pattern)
        ELSE p.display_name ILIKE pattern
        END
    )
ORDER BY
    (lower(p.display_name) = lower(term)) DESC,
    (p.display_name ILIKE term || '%') DESC,
    p.display_name
    LIMIT greatest(p_limit, 1);
END;
$$;

REVOKE ALL ON FUNCTION "public"."search_profiles"("text", integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."search_profiles"("text", integer, boolean) TO "authenticated";