CREATE TABLE IF NOT EXISTS "public"."connection_favorites" (
                                                               "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "connection_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
    );

ALTER TABLE "public"."connection_favorites" OWNER TO "postgres";

ALTER TABLE ONLY "public"."connection_favorites"
    ADD CONSTRAINT "connection_favorites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."connection_favorites"
    ADD CONSTRAINT "connection_favorites_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."connection_favorites"
    ADD CONSTRAINT "connection_favorites_connection_id_fkey" FOREIGN KEY ("connection_id")
    REFERENCES "public"."connections"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- one favorite per user per connection
ALTER TABLE ONLY "public"."connection_favorites"
    ADD CONSTRAINT "connection_favorites_unique"
    UNIQUE ("user_id", "connection_id");

CREATE INDEX "connection_favorites_user_id_idx"
    ON "public"."connection_favorites" ("user_id");

ALTER TABLE "public"."connection_favorites" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connection_favorites_select_own"
  ON "public"."connection_favorites"
  FOR SELECT TO "authenticated"
                 USING (auth.uid() = user_id);

CREATE POLICY "connection_favorites_insert_own"
  ON "public"."connection_favorites"
  FOR INSERT TO "authenticated"
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
        AND (c.requester_id = auth.uid() OR c.addressee_id = auth.uid())
    )
  );

CREATE POLICY "connection_favorites_delete_own"
  ON "public"."connection_favorites"
  FOR DELETE TO "authenticated"
  USING (auth.uid() = user_id);

GRANT ALL ON TABLE "public"."connection_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."connection_favorites" TO "service_role";