import {SearchBar} from "@/components/SearchBar.tsx";
import {useState} from "react";
import type {LegoSet} from "@/types";
import {SetViewDialog} from "@/components/SetViewDialog.tsx";
import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {useNavigate} from "react-router";
import {Button} from "@/components/ui/button.tsx";
import {collectionInsert} from "@/lib/api.ts";
import {toast} from "@/components/ui/toast.tsx";

export function HomePage() {
    const [legoSet, setLegoSet] = useState<LegoSet|null>(null);
    const { session } = useAuth()
    const navigate = useNavigate();

    const addToCollection = async (set: LegoSet) => {
        let toastType = ""
        let toastDescription = ""
        try {
            const { data, error } = await collectionInsert(set.id);
            if (error) {
                toastType = "error";
                toastDescription = "Failed to add set to collection";
            } else if (data) {
                toastType = "success";
                toastDescription = "Successfully added set to collection";
                setLegoSet(null);
            }
        } finally {
            toast.add({type: toastType, description: toastDescription});
        }
    }

    return (
        <>
            <div className="flex flex-row items-center gap-2">
                {session
                    ? <CustomTrigger />
                    : <Button onClick={() => navigate("/login")}>Log In</Button>}
                <SearchBar onResult={setLegoSet} className="w-full" />
            </div>
            {legoSet && <SetViewDialog set={legoSet} close={() => setLegoSet(null)}>
              <div className="text-center rounded-b-xl bg-muted/50 -m-4 p-4">
                <Button className="w-full" onClick={() => addToCollection(legoSet)}>Add To Collection</Button>
              </div>
            </SetViewDialog>}
        </>
    )
}
