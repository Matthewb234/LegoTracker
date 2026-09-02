CREATE OR REPLACE FUNCTION "public"."are_connected"("p_a" "uuid", "p_b" "uuid")
RETURNS boolean
LANGUAGE "sql"
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND (
        (requester_id = p_a AND addressee_id = p_b)
            OR (requester_id = p_b AND addressee_id = p_a)
        )
);
$$;

REVOKE ALL ON FUNCTION "public"."are_connected"("uuid", "uuid") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."are_connected"("uuid", "uuid") TO "authenticated";