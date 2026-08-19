import type {LegoSet} from "@/types";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog"
import {collectionInsert} from "@/lib/api.ts";

type ResultSetDialogProps = {set: LegoSet} & { close: () => void };

export function ResultSetDialog({ set, close } : ResultSetDialogProps) {
    const addToCollection = async (set: LegoSet) => {
        try {
            const { data, error } = await collectionInsert(set.id);
            if (error) {
                console.error(error)
            } else if (data) {
                console.log(data)
            }
        } finally {
            console.log("Added")
        }
    }

    return (
        <Dialog defaultOpen={Boolean(set)}  onOpenChange={close}>
            <form>
                <DialogContent className="sm:max-w-sm" showCloseButton={false}>
                    <img src={set.image_url!} alt="set image"/>
                    <p>{set.theme}</p>
                    <DialogTitle>{set.name}</DialogTitle>
                    <p className="text-xs">{set.piece_count}</p>
                    <DialogFooter>
                        <Button className="w-2/3" onClick={() => addToCollection(set)}>Add To Collection</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}