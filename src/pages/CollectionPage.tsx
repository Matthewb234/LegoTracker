import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {SetSearchBar} from "@/components/SetSearchBar.tsx";
import {SetViewDialog} from "@/components/SetViewDialog.tsx";
import {useEffect, useState} from "react";
import type {CollectionItem, LegoSet} from "@/types";
import {collectionDecrement, getCollection} from "@/lib/api.ts";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "@/components/ui/toast.tsx";
import {CollectionGrid} from "@/features/collection/CollectionGrid.tsx";

type Viewing = { set: LegoSet; quantity?: number };

export function CollectionPage() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [viewing, setViewing] = useState<Viewing|null>(null);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const {session} = useAuth();

    const removeFromCollection = async (set: LegoSet) => {
        let toastType = ""
        let toastDescription = ""
        try {
            const { data, error } = await collectionDecrement(set.id);
            if (error) {
                toastType = "error";
                toastDescription = "Failed to remove set from collection";
            } else if (data.id) {
                toastType = "success";
                toastDescription = "Successfully decreased set quantity in collection";
                setViewing({ set: set, quantity: data.quantity ?? 1})
            } else {
                toastType = "success";
                toastDescription = "Successfully removed set from collection";
                setViewing(null);
            }
        } finally {
            toast.add({type: toastType, description: toastDescription});
            setRefreshKey(k => k + 1);
        }
    }

    useEffect(() => {
        const fetchItems = async ()=> {
            setLoading(true);
            const {data, error} = await getCollection(session?.user.id ?? '');
            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            setItems(data);
        }
        fetchItems().finally(() => {setLoading(false)});
    }, [session?.user.id, refreshKey]);

    return (
        <>
            <div className="flex flex-col flex-1 min-h-0">
                <div className="flex flex-row items-center gap-2 shrink-0">
                    <CustomTrigger />
                    <SetSearchBar
                        hintText="Search Your Collection..."
                        className="w-full"
                        onResult={(data: LegoSet) => {
                            const existing = items.find((item) => item.set_id === data.id);
                            setViewing({ set: data, quantity: existing?.quantity ?? undefined });
                        }}
                    />
                </div>
                <CollectionGrid
                    items={items}
                    loading={loading}
                    className="flex-1 min-h-0"
                    onSelect={(item) => setViewing({ set: item.sets, quantity: item.quantity ?? 1 })}
                />
            </div>
            {viewing && <SetViewDialog set={viewing.set} quantity={viewing.quantity} close={() => setViewing(null)}>
              <div className="text-center rounded-b-xl bg-muted/50 -m-4 p-4">
                <Button className="w-full" onClick={() => {removeFromCollection(viewing.set)}}>
                  Remove From Collection
                </Button>
              </div>
            </SetViewDialog>}
        </>
    )
}
