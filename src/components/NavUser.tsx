import {
    ChevronsUpDown,
    LogOut, User, UserRoundPen,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {supabase} from "@/lib/supabase.ts";
import {ThemeToggle} from "@/components/ThemeToggle.tsx";
import {useNavigate} from "react-router";
import {getAvatarUrl} from "@/lib/api.ts";
import {useProfile} from "@/providers/profile/ProfileContext.ts";

export function NavUser() {
    const { isMobile } = useSidebar()
    const { session } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();
    const user = session?.user;

    const logOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error)  {
            console.error(error)
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="size-8 rounded-full outline-2 outline-primary">
                                {profile?.avatar_url
                                    ? <img className="rounded-full w-full aspect-square shrink-0" src={getAvatarUrl(profile)} alt="user avatar"/>
                                    : <User className="w-full h-full stroke-muted-foreground p-2" />
                                }
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{profile?.display_name ?? 'user'}</span>
                                <span className="truncate text-xs">{user?.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.display_name}/>
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{profile?.display_name}</span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => navigate("/edit-profile")}>
                            <UserRoundPen />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <ThemeToggle></ThemeToggle>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logOut}>
                            <LogOut/>
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
