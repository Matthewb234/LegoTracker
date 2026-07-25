-- profiles: tie id directly to auth.users, drop redundant user_id, add avatar_url
ALTER TABLE "public"."profiles"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  DROP CONSTRAINT IF EXISTS "profiles_user_id_fkey";

ALTER TABLE "public"."profiles"
  DROP COLUMN "user_id";

ALTER TABLE "public"."profiles"
  ADD COLUMN "avatar_url" "text";

-- collection_items: drop FK constraints before changing column types they depend on
ALTER TABLE "public"."collection_items"
  DROP CONSTRAINT IF EXISTS "collection_items_set_id_fkey";

ALTER TABLE "public"."collection_items"
  DROP CONSTRAINT IF EXISTS "collection_items_user_id_fkey";

-- sets: change primary key type from uuid to text (Rebrickable set number)
ALTER TABLE "public"."sets"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."sets"
  ALTER COLUMN "id" TYPE "text" USING "id"::"text";

-- collection_items: change id to uuid, set_id to text, drop bad defaults, add constraints
ALTER TABLE "public"."collection_items"
  DROP CONSTRAINT IF EXISTS "collection_items_pkey";

ALTER TABLE "public"."collection_items"
  ALTER COLUMN "id" DROP IDENTITY IF EXISTS;

ALTER TABLE "public"."collection_items"
  ALTER COLUMN "id" TYPE "uuid" USING "gen_random_uuid"(),
  ALTER COLUMN "id" SET DEFAULT "gen_random_uuid"();

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."collection_items"
  ALTER COLUMN "set_id" TYPE "text" USING "set_id"::"text",
  ALTER COLUMN "set_id" DROP DEFAULT,
  ALTER COLUMN "set_id" SET NOT NULL;

ALTER TABLE "public"."collection_items"
  ALTER COLUMN "user_id" DROP DEFAULT,
  ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "public"."collection_items"
  ALTER COLUMN "quantity" SET DEFAULT 1;

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_quantity_check" CHECK ("quantity" > 0);

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_user_set_unique" UNIQUE ("user_id", "set_id");

-- recreate foreign keys with correct types
ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."collection_items"
  ADD CONSTRAINT "collection_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;