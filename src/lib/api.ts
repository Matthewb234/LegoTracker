import {supabase} from "./supabase";
import type {Profile} from "@/types";

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

export function updateDisplayName(userId: string, displayName: string) {
    return supabase.from('profiles').update({ display_name: displayName }).eq('id', userId).select('*');
}

export async function updateAvatar(userId: string, avatar: Blob) {
    const path = `${userId}/avatar.jpg`
    const { error } = await supabase.storage.from('avatars').upload(path, avatar, {
        upsert: true,
        contentType: avatar.type,
    })

    if (error) {
        return {error: error};
    }
    return await supabase.from('profiles').update({ avatar_url: path }).eq('id', userId)
}

export function getAvatarUrl(profile: Profile) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile?.avatar_url ?? '')
    return `${data.publicUrl}?v=${profile.updated_at}`
}

export function getAvatarUrlFromUrl(url: string, timeStamp: string) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(url)
    return `${data.publicUrl}?v=${timeStamp}`
}

export function getCollection(userId: string) {
    return supabase.from('collection_items')
        .select('*, sets(*)')
        .order('added_at', {ascending: false})
        .eq('user_id', userId);
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