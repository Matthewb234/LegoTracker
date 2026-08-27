import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import { Separator } from "@/components/ui/separator"

export function CustomTrigger() {
    return (
        <div className="flex flex-row justify-center md:hidden">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-10" />
        </div>
    )
}