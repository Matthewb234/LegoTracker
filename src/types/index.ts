import type { Database } from "./database.types.ts";
import type {Session} from "@supabase/supabase-js";

export type LegoSet = Database['public']['Tables']['sets']['Row'];

export type ScanState =
    {status: 'idle'}
    | {status: 'looking_up'; setNum: string}
    | {status: 'confirming'; set: LegoSet}
    | {status: 'error'; message: string};

// type SetSearchResponse = { data :  } | { error : string}

export type AuthContextValue = {session: Session | null, loading: boolean};