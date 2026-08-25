import {useState, useEffect, type ReactNode} from "react";
import { supabase } from "@/lib/supabase.ts";
import type { Session } from "@supabase/supabase-js";
import {AuthContext} from "./AuthContext.ts";
import type {Profile} from "@/types";
import {getProfile} from "@/lib/api.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() =>  {
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error(error);
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

    useEffect(() => {
        let ignore = false;
        const fetchProfile = async () => {
            if (!session) {
                if (!ignore) setProfile(null);
                return;
            }
            const { data, error } = await getProfile(session.user.id);
            if (error) {
                console.error(error);
            }
            if (!ignore) setProfile(data);
        };
        fetchProfile();
        return () => { ignore = true; };
    }, [session?.user.id]);

    return (
        <AuthContext value={{session, profile, loading}}>
            {children}
        </AuthContext>
    );
}