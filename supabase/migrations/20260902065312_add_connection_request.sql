-- supabase/migrations/20260830000003_add_send_connection_request.sql

CREATE OR REPLACE FUNCTION "public"."send_connection_request"("p_target_id" "uuid")
RETURNS "jsonb"
LANGUAGE "plpgsql"
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
me uuid := auth.uid();
  existing public.connections;
  created public.connections;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
END IF;

  IF p_target_id IS NULL OR p_target_id = me THEN
    RAISE EXCEPTION 'Cannot connect to yourself' USING ERRCODE = 'check_violation';
END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_id) THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = 'no_data_found';
END IF;

SELECT * INTO existing
FROM public.connections
WHERE (requester_id = me AND addressee_id = p_target_id)
   OR (requester_id = p_target_id AND addressee_id = me);

IF FOUND THEN
    RETURN public.resolve_existing_connection(existing, me);
END IF;

BEGIN
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES (me, p_target_id, 'pending')
    RETURNING * INTO created;

RETURN jsonb_build_object(
        'outcome', 'requested',
        'connection_id', created.id,
        'status', created.status
       );

EXCEPTION WHEN unique_violation THEN
    -- the other party inserted between our SELECT and INSERT
SELECT * INTO existing
FROM public.connections
WHERE (requester_id = me AND addressee_id = p_target_id)
   OR (requester_id = p_target_id AND addressee_id = me);

RETURN public.resolve_existing_connection(existing, me);
END;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."resolve_existing_connection"(
  "p_row" "public"."connections",
  "p_me" "uuid"
)
RETURNS "jsonb"
LANGUAGE "plpgsql"
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
accepted public.connections;
BEGIN
  IF p_row.status = 'accepted' THEN
    RETURN jsonb_build_object(
      'outcome', 'already_connected',
      'connection_id', p_row.id,
      'status', p_row.status
    );
END IF;

  -- pending, and they asked us first: treat our request as acceptance
  IF p_row.addressee_id = p_me THEN
UPDATE public.connections
SET status = 'accepted'
WHERE id = p_row.id
    RETURNING * INTO accepted;

RETURN jsonb_build_object(
        'outcome', 'accepted_existing',
        'connection_id', accepted.id,
        'status', accepted.status
       );
END IF;

RETURN jsonb_build_object(
        'outcome', 'already_requested',
        'connection_id', p_row.id,
        'status', p_row.status
       );
END;
$$;


REVOKE ALL ON FUNCTION "public"."send_connection_request"("uuid") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."send_connection_request"("uuid") TO "authenticated";

REVOKE ALL ON FUNCTION "public"."resolve_existing_connection"("public"."connections", "uuid") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."resolve_existing_connection"("public"."connections", "uuid") TO "authenticated";