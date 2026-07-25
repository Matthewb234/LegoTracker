-- profiles
CREATE POLICY "profiles_select_own" ON "public"."profiles"
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- sets
CREATE POLICY "sets_select_authenticated" ON "public"."sets"
  FOR SELECT
  TO authenticated
  USING (true);

-- collection_items
CREATE POLICY "collection_items_select_own" ON "public"."collection_items"
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "collection_items_insert_own" ON "public"."collection_items"
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "collection_items_update_own" ON "public"."collection_items"
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "collection_items_delete_own" ON "public"."collection_items"
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());