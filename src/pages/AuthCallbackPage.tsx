import {useNavigate} from "react-router";
import {useEffect} from "react";
import {supabase} from "@/lib/supabase.ts";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) navigate('/collection', { replace: true });
        });
        return () => sub.subscription.unsubscribe();
    }, [navigate]);

    return <p>Signing you in…</p>;
}