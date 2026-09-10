import {useAuth} from "@/providers/auth/AuthContext.ts";
import {useCallback, useEffect, useState} from "react";
import type {Profile} from "@/types";
import {getProfile} from "@/lib/api.ts";
import { ProfileContext } from "./ProfileContext";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth()
    const userId = session?.user.id

    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(!!userId)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = useCallback(async (id: string) => {
        try {
            const { data, error } = await getProfile(id)
            if (error) throw error
            setProfile(data)
            setError(null)
        } catch (err) {
            console.error(err)
            setError("Couldn't load your profile")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!userId) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchProfile(userId)
    }, [userId, fetchProfile])

    const refresh = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        await fetchProfile(userId)
    }, [userId, fetchProfile])

    return (
        <ProfileContext.Provider
            value={{
                profile: userId ? profile : null,
                loading: userId ? loading : false,
                error,
                refresh,
            }}
        >
            {children}
        </ProfileContext.Provider>
    )
}