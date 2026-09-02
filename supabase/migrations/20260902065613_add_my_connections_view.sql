-- supabase/migrations/20260830000004_add_my_connections_view.sql

CREATE OR REPLACE VIEW "public"."my_connections"
WITH (security_invoker = true)
AS
SELECT
    c.id                AS connection_id,
    c.status,
    c.created_at,
    CASE WHEN c.requester_id = auth.uid() THEN 'outgoing' ELSE 'incoming' END AS direction,
    p.id                AS friend_id,
    p.display_name      AS friend_display_name,
    p.avatar_url        AS friend_avatar_url,
    (f.id IS NOT NULL)  AS favorited
FROM public.connections c
         JOIN public.profiles p
              ON p.id = CASE
                            WHEN c.requester_id = auth.uid() THEN c.addressee_id
                            ELSE c.requester_id
                  END
         LEFT JOIN public.connection_favorites f
                   ON f.connection_id = c.id
                       AND f.user_id = auth.uid()
WHERE auth.uid() IN (c.requester_id, c.addressee_id);

ALTER VIEW "public"."my_connections" OWNER TO "postgres";

GRANT SELECT ON "public"."my_connections" TO "authenticated";