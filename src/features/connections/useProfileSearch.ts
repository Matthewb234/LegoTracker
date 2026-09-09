import {useCallback, useEffect, useState} from "react";
import {searchProfiles, sendConnectionRequest} from "@/lib/api.ts";
import type {ProfileSearchResult} from "@/types";
import {toast} from "@/components/ui/toast.tsx";

type SearchStatus = "idle" | "looking_up" | "error";
type UseProfileSearchProps = {onConnectionChanged: () => void}
type ConnectionRequestOutcome = {
    outcome: 'requested' | 'already_requested' | 'accepted_existing' | 'already_connected';
    connection_id: string;
    status: 'pending' | 'accepted';
};

export function useProfileSearch({onConnectionChanged}: UseProfileSearchProps) {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<ProfileSearchResult[]>([]);
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        let ignore = false;
        let timer: ReturnType<typeof setTimeout>;

        const search = () => {
            const term = query.trim();
            if (term === "") {
                setResults([]);
                setStatus('idle');
                return;
            }

            setStatus('looking_up');

            timer = setTimeout(async () => {
                const { data, error } = await searchProfiles(query);
                if (ignore) return;
                if (error) {
                    console.error(error);
                    setStatus('error');
                    return;
                }
                setResults(data ?? []);
                setStatus('idle');
            }, 400);

        }

        search();

        return () => {
            clearTimeout(timer);
            ignore = true;
        };
    }, [query]);

    const sendRequest = useCallback(async (user: ProfileSearchResult) => {
        const id = user.profile_id;

        if (pendingIds.has(id)) return;
        setPendingIds(prev => new Set(prev).add(id));

        const patchRow = (patch: Partial<ProfileSearchResult>) =>
            setResults(prev => prev.map(c =>
                c.profile_id === id ? { ...c, ...patch } : c
            ));

        try {
            const { data, error } = await sendConnectionRequest(id);

            if (error) {
                console.error(error);
                toast.add({
                    type: "error",
                    description: `Failed to send friend request`
                });
                return
            }

            if (data) {
                let toastDescription;
                let connectionChanged = true;
                const result = data as ConnectionRequestOutcome;
                switch (result.outcome) {
                    case "requested":
                        patchRow({ connection_status: 'pending', direction: 'outgoing', connection_id: result.connection_id });
                        toastDescription = "Successfully sent friend request";
                        break;
                    case "already_requested":
                        patchRow({ connection_status: 'pending', direction: 'outgoing' });
                        toastDescription = "You've already sent this user a request";
                        connectionChanged = false;
                        break;
                    case "accepted_existing":
                        patchRow({ connection_status: 'accepted' });
                        toastDescription = `Added ${user.display_name} to friends`;
                        break;
                    case "already_connected":
                        patchRow({ connection_status: 'accepted' });
                        toastDescription = `You're already friends with ${user.display_name}`;
                        connectionChanged = false;
                        break;
                    default:
                        toast.add({
                            type: "error",
                            description: `Failed to process friend request`
                        });
                        return;
                }
                toast.add({
                    type: toastDescription ? "success" : "error",
                    description: toastDescription ?? `Failed to process friend request`
                });
                if (connectionChanged) onConnectionChanged();
            }
        } finally {
            setPendingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }, [onConnectionChanged, pendingIds]);

    return { query, setQuery, results, pendingIds, status, sendRequest };
}