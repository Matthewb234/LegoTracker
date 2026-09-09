import {supabase} from "./supabase";

function escapeLikePattern(input: string) {
    // \ must be escaped first, or it would double-escape the ones added after
    return input.replace(/[\\%_]/g, '\\$&');
}

//---------------------------------Function CALLS-----------------------------------
export function lookupSet(setNum: string) {
    return supabase.functions.invoke('set-lookup', {body: { setNum }});
}

export function collectionInsert(setNum: string) {
    return supabase.functions.invoke('collection-insert', {body: { setNum }});
}

//---------------------------------RPC CALLS-----------------------------------
export function collectionDecrement(setNum: string) {
    return supabase.rpc('decrement_in_collection', {p_set_id: setNum})
}

export function isUsernameAvailable(username: string) {
    return supabase.rpc('is_display_name_available', { p_name: username });
}

export function sendConnectionRequest(targetId:string) {
    return supabase.rpc('send_connection_request', { p_target_id: targetId });
}

export function searchProfiles(search: string, limit = 5, exact = false) {
    return supabase.rpc('search_profiles', {
        p_search: search,
        p_limit: limit,
        p_exact: exact
    });
}

//---------------------------------TABLE PROCESSES-----------------------------------
export function getProfile(userId: string) {
    return supabase.from('profiles').select('*').eq('id', userId).single();
}

export function getCollection(userId: string) {
    return supabase.from('collection_items')
        .select('*, sets(*)')
        .order('added_at', {ascending: false})
        .eq('user_id', userId);
}

export function getProfiles(userId: string, targetUsername: string, limit: number) {
    const term = targetUsername.trim();
    if (term === "") return null;

    return supabase.from('profiles').select('*')
        .ilike('display_name', `%${escapeLikePattern(term)}%`)
        .neq('id', userId)
        .order('display_name')
        .limit(limit);
}

export function acceptConnectionRequest(connectionId:string) {
    return supabase.from('connections').update({ 'status': 'accepted' }).eq('id', connectionId).select('*');
}

export function deleteConnection(connectionId:string) {
    return supabase.from('connections').delete().eq('id', connectionId).select('*');
}

export function favoriteConnection(userId:string, connectionId:string) {
    return supabase.from('connection_favorites').insert({user_id: userId, connection_id: connectionId}).select('*');
}

export function unfavoriteConnection(userId:string, connectionId:string) {
    return supabase.from('connection_favorites').delete().eq('connection_id', connectionId).eq('user_id', userId);
}

export function getConnections(
    status: 'pending' | 'accepted',
    direction?: 'incoming' | 'outgoing'
) {
    const query = supabase.from('my_connections')
        .select('*')
        .eq('status', status);

    if (direction) query.eq('direction', direction);

    return status === 'accepted'
        ? query.order('favorited', { ascending: false })
            .order('friend_display_name')
        : query.order('created_at', { ascending: false });
}