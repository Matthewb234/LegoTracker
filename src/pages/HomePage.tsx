import { Button } from "@/components/ui/button"
import {supabase} from "@/lib/supabase.ts";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {ThemeToggle} from "@/components/ThemeToggle.tsx";
import {SearchBar} from "@/features/search/SearchBar.tsx";
import {useState} from "react";
import type {LegoSet} from "@/types";
import {ResultSetDialog} from "@/features/search/ResultSetDialog.tsx";

export function HomePage() {
    const authContext = useAuth();
    const [legoSet, setLegoSet] = useState<LegoSet|null>(null);

    const logOut = async () => {
        const error = await supabase.auth.signOut();
        if (error) throw error;
    }

    return (
        <>
            <SearchBar onResult={setLegoSet}></SearchBar>
            <ThemeToggle></ThemeToggle>
            <Button onClick={logOut} disabled={authContext.loading || authContext.session == null}>
                Log Out
            </Button>
            {legoSet && <ResultSetDialog set={legoSet} close={() => setLegoSet(null)}></ResultSetDialog>}
        </>
    )
}
