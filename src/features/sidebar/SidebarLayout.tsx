import {useAuth} from "@/providers/auth/AuthContext.ts";
import {Outlet} from "react-router";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import {NavSidebar} from "@/features/sidebar/NavSidebar.tsx";

export function SidebarLayout() {
    const { session, loading } = useAuth()

    if (loading)  {
        return null
    } else if (session == null) {
        return <Outlet />
    }

    return (
        <SidebarProvider open={true} onOpenChange={() => {}}>
            <NavSidebar />
            <SidebarInset className="p-2">
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}