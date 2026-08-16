import {createContext, type Context, useContext} from "react";
import type {AuthContextValue} from "../types";

export const AuthContext : Context<AuthContextValue | undefined> = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within AuthContext");
    }
    return context;
}