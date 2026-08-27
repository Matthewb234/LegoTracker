import type { Database } from "./database.types.ts";
import type {Session} from "@supabase/supabase-js";
import type {getMyCollection} from "@/lib/api.ts";

export type Theme = "dark" | "light" | "system"

export type LegoSet = Database['public']['Tables']['sets']['Row'];

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type CollectionItem = NonNullable<Awaited<ReturnType<typeof getMyCollection>>['data']>[number];

export type SearchState =
    {status: 'idle'}
    | {status: 'looking_up'; setNum: string}
    | {status: 'viewing'; set: LegoSet}
    | {status: 'error'; message: string};

export type AuthContextValue = {session: Session | null, profile: Profile | null, loading: boolean};