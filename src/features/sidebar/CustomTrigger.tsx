import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import { Separator } from "@/components/ui/separator"
import {useIsMobile} from "@/hooks/use-mobile.ts";

export function CustomTrigger() {
    const isMobile = useIsMobile();
    return (
        isMobile && (
            <div className="flex flex-row items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-10" />
            </div>
        )
    )
}