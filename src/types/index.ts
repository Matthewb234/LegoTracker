import type { Database } from "./database.types.ts";
import type {Session} from "@supabase/supabase-js";
import {type getCollection} from "@/lib/api.ts";

export type Theme = "dark" | "light" | "system"

export type LegoSet = Database['public']['Tables']['sets']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Connection = Database['public']['Views']['my_connections']['Row'];
export type ProfileSearchResult = Database['public']['Functions']['search_profiles']['Returns'][number];

export type CollectionItem = NonNullable<Awaited<ReturnType<typeof getCollection>>['data']>[number];

export type SearchState =
    {status: 'idle'}
    | {status: 'looking_up'; setNum: string}
    | {status: 'viewing'; set: LegoSet}
    | {status: 'error'; message: string};

export type UsernameState =
    { status: 'idle' }
    | { status: 'invalid'; message: string }
    | { status: 'checking' }
    | { status: 'available' }
    | { status: 'taken' }
    | { status: 'unknown' };

export type ConnectionType =
    { status: 'accepted' }
    | { status: 'pending', dir: 'outgoing' }
    | { status: 'pending', dir: 'incoming' };

export type AuthContextValue = {session: Session | null, profile: Profile | null, loading: boolean};