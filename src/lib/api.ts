import {supabase} from "./supabase";

export function lookupSet(setNum: string) {
    return supabase.functions.invoke('set-lookup', {body: { setNum }});
}

export function collectionInsert(setNum: string) {
    return supabase.functions.invoke('collection-insert', {body: { setNum }});
}

export async function getProfile(userId: string) {
    return await supabase.from('profiles').select('*').eq('id', userId).single();
}

export function getMyCollection() {
    return supabase.from('collection_items').select('*, sets(*)').order('added_at', {ascending: false});
}