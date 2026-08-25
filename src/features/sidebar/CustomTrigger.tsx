import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import { Separator } from "@/components/ui/separator"

export function CustomTrigger() {
    return (
        <>
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="h-6 md:hidden" />
        </>
    )
}