-- supabase/migrations/20260829000001_add_connections_table.sql

CREATE TABLE IF NOT EXISTS "public"."connections" (
                                                      "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
    );

ALTER TABLE "public"."connections" OWNER TO "postgres";

ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."connections"
    ADD CONSTRAINT "connections_no_self_check"
        CHECK ("requester_id" <> "addressee_id");

ALTER TABLE "public"."connections"
    ADD CONSTRAINT "connections_status_check"
        CHECK ("status" IN ('pending', 'accepted'));

ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id")
    REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_addressee_id_fkey" FOREIGN KEY ("addressee_id")
    REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- one row per pair regardless of direction
CREATE UNIQUE INDEX "connections_unique_pair_idx" ON "public"."connections" (
                                                                             LEAST("requester_id", "addressee_id"),
                                                                             GREATEST("requester_id", "addressee_id")
    );

CREATE INDEX "connections_requester_id_idx"
    ON "public"."connections" ("requester_id");
CREATE INDEX "connections_addressee_id_idx"
    ON "public"."connections" ("addressee_id");

ALTER TABLE "public"."connections" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."connections" TO "authenticated";
GRANT ALL ON TABLE "public"."connections" TO "service_role";