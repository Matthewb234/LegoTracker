import {Card, CardContent} from "@/components/ui/card.tsx";
import type {CollectionItem} from "@/types";

type CollectionCardProps = {item: CollectionItem} & {onClick: () => void}

export function CollectionCard({ item, onClick }: CollectionCardProps) {
    return (
        <Card className="rounded-md outline-2 outline-primary" onClick={onClick}>
            <CardContent className="flex flex-col gap-2 -m-2">
                <img className="rounded-lg w-full aspect-4/3 object-contain shrink-0" src={item.sets.image_url ?? ''} alt="set image"/>
                <p className="-mb-2 text-xl font-bold line-clamp-2 min-h-[2lh]">{item.sets.name}</p>
                <p className="mt-auto">{"Qty: " + (item.quantity ?? 1)}</p>
            </CardContent>
        </Card>
    )
}