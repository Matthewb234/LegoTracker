import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar.tsx";
import {NavUser} from "@/components/NavUser.tsx";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";
import {Home, SquareLibrary, Users} from "lucide-react";

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
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => {navigate("/")}}>
                            <Home />
                            <span>Home</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => {navigate("/collection")}}>
                            <SquareLibrary />
                            <span>Collection Page</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => {navigate("/connections")}}>
                            <Users />
                            <span>Friends</span>
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