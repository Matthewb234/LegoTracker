import {supabase} from "./supabase";

export function lookupSet(setNum: string) {
    return supabase.functions.invoke('set-lookup', {body: { setNum }});
}