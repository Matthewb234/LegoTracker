import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.ts";

export function useCollectionCount(userId: string | undefined) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;

        const fetchCount = async () => {
            const { count, error } = await supabase
                .from("collection_items")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId);

            if (!cancelled && !error) setCount(count ?? 0);
        };

        fetchCount();

        const channel = supabase
            .channel(`collection-count:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "collection_items",
                    filter: `user_id=eq.${userId}`,
                },
                () => fetchCount(),
            )
            .subscribe();

        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return count;
}