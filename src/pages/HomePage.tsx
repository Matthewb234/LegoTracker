import { Button } from "@/components/ui/button"
import {supabase} from "@/lib/supabase.ts";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {ThemeToggle} from "@/components/ThemeToggle.tsx";

export function HomePage() {
    const authContext = useAuth();

    const logOut = async () => {
        const error = await supabase.auth.signOut();
        if (error) throw error;
    }

    return (
        <>
            <ThemeToggle></ThemeToggle>
            <Button onClick={logOut} disabled={authContext.loading || authContext.session == null}>
                Log Out
            </Button>
        </>
    )
}
