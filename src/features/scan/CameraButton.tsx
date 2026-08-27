import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router";
import {Camera} from "lucide-react";

export function CameraButton({className, ...props}: React.ComponentProps<"div">) {
    const navigate = useNavigate();

    return (
        <div className={cn(className)} {...props}>
            <Button className="rounded-full bg-primary size-20" onClick={() => navigate("/scan")}>
                <Camera className="size-3/4" />
            </Button>
        </div>
    );
}