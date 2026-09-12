import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar.tsx";
import {NavUser} from "@/components/NavUser.tsx";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {Link, useLocation} from "react-router";
import {useEffect} from "react";
import {Blocks, Home, SquareLibrary, Users} from "lucide-react";
import {useCollectionCount} from "@/features/collection/useCollectionCount.ts";

const NAV_ITEMS = [
    { title: "Home", url: "/", icon: Home },
    { title: "Collection", url: "/collection", icon: SquareLibrary },
    { title: "Friends", url: "/connections", icon: Users },
];

export function NavSidebar() {
    const location = useLocation();
    const { session } = useAuth();
    const count = useCollectionCount(session?.user.id);
    const {setOpenMobile} = useSidebar();

    useEffect(() => {
        setOpenMobile(false);
    }, [location.pathname, setOpenMobile]);

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="bg-primary text-primary-foreground
                    flex size-8 items-center justify-center rounded-md">
                        <Blocks className="size-4" />
                    </div>
                    <span className="font-semibold tracking-tight">Lego Tracker</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Browse</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {NAV_ITEMS.map((item) => {
                                const isActive =
                                    item.url === "/"
                                        ? location.pathname === "/"
                                        : location.pathname.startsWith(item.url);

                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            className="relative h-11 gap-3 rounded-lg px-3 [&_svg]:size-5
                                               data-active:before:absolute
                                               data-active:before:left-0
                                               data-active:before:top-1/2
                                               data-active:before:h-2/3
                                               data-active:before:w-1
                                               data-active:before:-translate-y-1/2
                                               data-active:before:rounded-r-full
                                               data-active:before:bg-primary"
                                            isActive={isActive}
                                            render={<Link to={item.url} />}
                                            tooltip={item.title}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="bg-sidebar-accent/60 rounded-lg px-3 py-2.5">
                <p className="text-sidebar-foreground/60 text-xs font-medium">Your collection</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {count ?? "—"}{" "}
                        <span className="text-sidebar-foreground/50 text-sm font-normal">
                            {count === 1 ? "set" : "sets"}
                        </span>
                    </p>
            </div>
                {session?.user && <NavUser />}
            </SidebarFooter>
        </Sidebar>
    );
}