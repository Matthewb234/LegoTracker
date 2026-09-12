import {useAuth} from "@/providers/auth/AuthContext.ts";
import {Outlet} from "react-router";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import {NavSidebar} from "@/features/sidebar/NavSidebar.tsx";

export function SidebarLayout() {
    const { session, loading } = useAuth()

    if (loading)  {
        return null
    } else if (session == null) {
        return (
            <div className="flex min-h-svh w-full flex-col p-2">
                <Outlet />
            </div>
        );
    }

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "15rem",
                "--sidebar-width-icon": "3.25rem",
            } as React.CSSProperties}
            open={true} onOpenChange={() => {}}
        >
            <NavSidebar />
            <SidebarInset className="p-4">
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}