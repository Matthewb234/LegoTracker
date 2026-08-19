import type { Database } from "./database.types.ts";
import type {Session} from "@supabase/supabase-js";

export type Theme = "dark" | "light" | "system"

export type LegoSet = Database['public']['Tables']['sets']['Row'];

export type SearchState =
    {status: 'idle'}
    | {status: 'looking_up'; setNum: string}
    | {status: 'error'; message: string};

// type SetSearchResponse = { data :  } | { error : string}

export type AuthContextValue = {session: Session | null, loading: boolean};