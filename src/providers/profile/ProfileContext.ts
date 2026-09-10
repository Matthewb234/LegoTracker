import { createContext, useContext } from "react"
import type { Profile } from "@/types"

type ProfileContextValue = {
    profile: Profile | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function useProfile() {
    const ctx = useContext(ProfileContext)
    if (!ctx) throw new Error("useProfile must be used within a ProfileProvider")
    return ctx
}