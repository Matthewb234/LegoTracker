import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {SearchBar} from "@/components/SearchBar.tsx";
import {SetViewDialog} from "@/components/SetViewDialog.tsx";
import {useEffect, useState} from "react";
import type {CollectionItem, LegoSet} from "@/types";
import {getMyCollection} from "@/lib/api.ts";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {CollectionCard} from "@/features/collection/CollectionCard.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {supabase} from "@/lib/supabase.ts";

type Viewing = { set: LegoSet; quantity?: number };

export function CollectionPage() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [viewing, setViewing] = useState<Viewing|null>(null);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const {session} = useAuth();

    const removeFromCollection = async (set: LegoSet) => {
        try {
            const { data, error } = await supabase.rpc('decrement_in_collection', {p_set_id: set.id});
            if (error) {
                console.error(error);
            } else if (data.id) {
                setViewing({ set: viewing!.set, quantity: data.quantity ?? 1})
            } else {
                setViewing(null);
            }
        } finally {
            setRefreshKey(k => k + 1);
        }
    }

    useEffect(() => {
        const fetchItems = async ()=> {
            setLoading(true);
            const {data, error} = await getMyCollection();
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
            <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                    <CustomTrigger />
                    <SearchBar onResult={(data: LegoSet) => {
                        const existing = items.find((item) => item.set_id === data.id);
                        setViewing({ set: data, quantity: existing?.quantity ?? undefined });
                    }} className="w-full" />
                </div>
                {loading
                    ? <div className="">
                        <Spinner />
                    </div>
                    : <div className="grid pt-4 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {items.map((item) => (
                            <CollectionCard
                                key={item.id}
                                item={item}
                                onClick={() => {setViewing({set: item.sets, quantity: item.quantity ?? 1})}
                                }/>
                        ))}
                    </div>
                }
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
