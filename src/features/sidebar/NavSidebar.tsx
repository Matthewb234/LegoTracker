import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar.tsx";
import {NavUser} from "@/components/NavUser.tsx";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";

export function NavSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const {session} = useAuth();
    const {setOpenMobile} = useSidebar();

    useEffect(() => {
        setOpenMobile(false);
    }, [location.pathname, setOpenMobile]);

    return (
        <Sidebar variant="floating">
            <SidebarHeader />
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => {navigate("/")}}>
                            Home Page
                        </SidebarMenuButton>
                        <SidebarMenuButton onClick={() => {navigate("/collection")}}>
                            Collection Page
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                {session?.user && <NavUser />}
            </SidebarFooter>
        </Sidebar>
    );
}