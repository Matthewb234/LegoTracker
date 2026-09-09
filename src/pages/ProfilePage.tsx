import {Pencil, User} from "lucide-react";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {useEffect, useState} from "react";
import {getProfile} from "@/lib/api.ts";
import type {Profile} from "@/types";
import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger} from "@/components/ui/popover.tsx";

export function ProfilePage() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [profile, setProfile] = useState<Profile>();
    const [loading, setLoading] = useState(false);
    const {session} = useAuth();

    useEffect(() => {
        const fetchItems = async ()=> {
            setLoading(true);
            const {data, error} = await getProfile(session?.user.id ?? '');
            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            setProfile(data);
        }
        fetchItems().finally(() => {setLoading(false)});
    }, [session?.user.id, refreshKey]);

    return(
        <div className="flex flex-col flex-1 min-w-0 gap-2">
            <div className="flex flex-row items-center gap-2">
                <CustomTrigger />
                <p>Edit Your Profile</p>
            </div>
            <div className="rounded-full outline-2 w-1/3 aspect-square outline-muted-foreground self-center">
                {profile?.avatar_url
                    ? <img className="w-full aspect-square object-cover shrink-0" src={profile.avatar_url ?? ''} alt="user avatar"/>
                    : <User className="w-full h-full stroke-muted-foreground p-2" />
                }
            </div>
            <div className="">
                <Popover>
                    <PopoverTrigger render={<Button/>}>
                        <span>{profile?.display_name ?? 'user'}</span>
                        <Pencil />
                    </PopoverTrigger>
                    <PopoverContent align="start">
                        <PopoverHeader>
                            <PopoverTitle>Edit Your Username</PopoverTitle>
                        </PopoverHeader>
                    </PopoverContent>
                </Popover>
                <Button onClick={()=>setRefreshKey(loading ? 0 : 1)}/>
            </div>
        </div>
    )
}