import {useState, useEffect, type ReactNode} from "react";
import { supabase } from "../../lib/supabase.ts";
import type { Session } from "@supabase/supabase-js";
import {AuthContext} from "./AuthContext.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() =>  {
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.log(error);
            }
            setSession(data.session);
            setLoading(false);
        }
        fetchSession();
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(event, session)
            setSession(session);
        })
        return () => {
            data.subscription.unsubscribe()
        }
    }, []);

    return (
        <AuthContext value={{session, loading}}>
            {children}
        </AuthContext>
    );
}