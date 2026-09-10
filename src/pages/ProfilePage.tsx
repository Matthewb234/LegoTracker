import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {UsernamePopover} from "@/features/profile/UsernamePopover.tsx";
import {AvatarSelector} from "@/features/profile/AvatarSelector.tsx";
import {useProfile} from "@/providers/profile/ProfileContext.ts";

export function ProfilePage() {
    const {profile, refresh} = useProfile();

    return(
        <div className="flex flex-col flex-1 min-w-0 gap-4">
            <div className="flex flex-row items-center gap-2">
                <CustomTrigger />
                <p>Edit Your Profile</p>
            </div>
            {profile && (<AvatarSelector profile={profile} refresh={refresh} />)}
            <div className="">
                {profile && (<UsernamePopover profile={profile} refresh={refresh} />)}
            </div>
        </div>
    )
}