import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { CustomTrigger } from "@/features/sidebar/CustomTrigger.tsx";
import { SetViewDialog } from "@/components/SetViewDialog.tsx";
import { CollectionGrid } from "@/features/collection/CollectionGrid.tsx";
import { getCollection, getProfile } from "@/lib/api.ts";
import type { CollectionItem, LegoSet, Profile } from "@/types";

type Viewing = { set: LegoSet; quantity?: number };

export function FriendCollectionPage() {
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewing, setViewing] = useState<Viewing | null>(null);

    useEffect(() => {
        if (!userId) return;
        let ignore = false;

        const fetch = async () => {
            setLoading(true);
            const [profileRes, itemsRes] = await Promise.all([
                getProfile(userId),
                getCollection(userId)
            ]);
            if (ignore) return;

            if (profileRes.error) console.error(profileRes.error);
            else setProfile(profileRes.data);

            if (itemsRes.error) console.error(itemsRes.error);
            else setItems(itemsRes.data ?? []);
        };

        fetch().finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [userId]);

    return (
        <>
            <div className="flex flex-col flex-1 min-h-0">
                <div className="flex flex-row items-center gap-2 shrink-0">
                    <CustomTrigger />
                    <p className="text-lg font-bold">
                        {profile ? `${profile.display_name}'s Collection` : "Collection"}
                    </p>
                </div>
                <CollectionGrid
                    items={items}
                    loading={loading}
                    className="flex-1 min-h-0"
                    onSelect={(item) => setViewing({ set: item.sets, quantity: item.quantity ?? 1 })}
                />
            </div>
            {viewing && (
                <SetViewDialog
                    set={viewing.set}
                    quantity={viewing.quantity}
                    close={() => setViewing(null)}
                />
            )}
        </>
    );
}