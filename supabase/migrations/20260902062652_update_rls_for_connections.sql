-- ---------- profiles: open to all signed-in users ----------

DROP POLICY IF EXISTS "profiles_select_own" ON "public"."profiles";

CREATE POLICY "profiles_select_authenticated" ON "public"."profiles"
  FOR SELECT
                      TO authenticated
                      USING (true);

-- ---------- collection_items: own or connected ----------

DROP POLICY IF EXISTS "collection_items_select_own" ON "public"."collection_items";

CREATE POLICY "collection_items_select_own_or_connected" ON "public"."collection_items"
  FOR SELECT
                      TO authenticated
                      USING (
                      user_id = auth.uid()
                      OR public.are_connected(auth.uid(), user_id)
                      );

-- ---------- connections ----------

CREATE POLICY "connections_select_participant" ON "public"."connections"
  FOR SELECT
                 TO authenticated
                 USING (auth.uid() IN (requester_id, addressee_id));

CREATE POLICY "connections_insert_as_requester" ON "public"."connections"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND status = 'pending'
  );

CREATE POLICY "connections_update_addressee" ON "public"."connections"
  FOR UPDATE
                        TO authenticated
                        USING (addressee_id = auth.uid() AND status = 'pending')
      WITH CHECK (addressee_id = auth.uid() AND status = 'accepted');

CREATE POLICY "connections_delete_participant" ON "public"."connections"
  FOR DELETE
TO authenticated
  USING (auth.uid() IN (requester_id, addressee_id));

-- ---------- freeze the columns policies cannot protect ----------

CREATE OR REPLACE FUNCTION "public"."connections_prevent_key_changes"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SET search_path = public
AS $$
BEGIN
  IF NEW.requester_id <> OLD.requester_id
     OR NEW.addressee_id <> OLD.addressee_id
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Connection participants cannot be modified';
END IF;
RETURN NEW;
END;
$$;

CREATE TRIGGER "connections_freeze_participants"
    BEFORE UPDATE ON "public"."connections"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."connections_prevent_key_changes"();