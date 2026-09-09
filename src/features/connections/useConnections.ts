import { useState, useEffect, useCallback } from "react";
import type { Connection } from "@/types";
import {
    getConnections,
    deleteConnection,
    favoriteConnection,
    unfavoriteConnection, acceptConnectionRequest
} from "@/lib/api.ts";
import { useAuth } from "@/providers/auth/AuthContext.ts";
import { toast } from "@/components/ui/toast.tsx";

export type ConnectionType =
    | { status: 'accepted' }
    | { status: 'pending'; dir: 'incoming' | 'outgoing' };

export function useConnections(type: ConnectionType) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { session } = useAuth();

    const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

    useEffect(() => {
        let ignore = false;

        const fetchConnections = async () => {
            setLoading(true);
            const { data, error } = type.status === 'accepted'
                ? await getConnections('accepted')
                : await getConnections('pending', type.dir);

            if (ignore) return;
            if (error) {
                console.error(error);
                return;
            }
            setConnections(data ?? []);
        };

        fetchConnections().finally(() => {
            if (!ignore) setLoading(false);
        });

        return () => { ignore = true; };
    }, [session?.user.id, type, refreshKey]);

    const remove = useCallback(async (connection: Connection) => {
        const { data, error } = await deleteConnection(connection.connection_id!);
        const failed = error || !data?.length;

        toast.add({
            type: failed ? "error" : "success",
            description: failed
                ? `Failed to remove ${connection.friend_display_name}`
                : `Removed ${connection.friend_display_name}`
        });

        if (!failed) {
            setConnections(prev =>
                prev.filter(c => c.connection_id !== connection.connection_id)
            );
        }
    }, []);

    const toggleFavorite = useCallback(async (connection: Connection) => {
        const id = connection.connection_id!;
        const next = !connection.favorited;

        const setFavorited = (value: boolean) =>
            setConnections(prev => prev.map(c =>
                c.connection_id === id ? { ...c, favorited: value } : c
            ));

        setFavorited(next);

        const { error } = next
            ? await favoriteConnection(session!.user.id, id)
            : await unfavoriteConnection(session!.user.id, id);

        if (error) {
            setFavorited(!next);
            console.error(error);
            toast.add({
                type: "error",
                description: `Failed to update ${connection.friend_display_name}`
            });
        }
    }, [session]);

    const accept = useCallback(async (connection: Connection) => {
        const { data, error } = await acceptConnectionRequest(connection.connection_id!);
        const failed = error || !data?.length;

        toast.add({
            type: failed ? "error" : "success",
            description: failed
                ? `Failed to add ${connection.friend_display_name} to friends`
                : `Added ${connection.friend_display_name} to friends`
        });

        if (!failed) {
            setConnections(prev =>
                prev.filter(c => c.connection_id !== connection.connection_id)
            );
        }
    }, []);

    return { connections, loading, refresh, remove, toggleFavorite, accept };
}