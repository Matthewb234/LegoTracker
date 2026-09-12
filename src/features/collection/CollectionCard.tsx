import {Card, CardContent} from "@/components/ui/card.tsx";
import type {CollectionItem} from "@/types";
import {Skeleton} from "@/components/ui/skeleton.tsx";

type CollectionCardProps = {item: CollectionItem} & {onClick: () => void}

export function CollectionCard({ item, onClick }: CollectionCardProps) {
    return (
        <Card className="rounded-md outline-2 outline-primary" onClick={onClick}>
            <CardContent className="flex flex-col gap-2 -m-2">
                <img className="rounded-lg w-full aspect-4/3 object-contain shrink-0" src={item.sets.image_url ?? ''} alt="set image"/>
                <p className="-mb-2 text-xl font-bold line-clamp-2 min-h-[2lh]">{item.sets.name}</p>
                <p className="mt-auto">{"Pcs: " + (item.sets.piece_count)}</p>
            </CardContent>
        </Card>
    )
}

export function CollectionCardSkeleton() {
    return (
        <Card className="rounded-md outline-2 outline-primary">
            <CardContent className="flex flex-col gap-2 -m-2">
                <Skeleton className="rounded-lg w-full aspect-4/3 shrink-0" />
                <div className="-mb-2 min-h-[2lh] flex flex-col gap-1.5 justify-start">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/5" />
                </div>
                <Skeleton className="mt-auto h-5 w-16" />
            </CardContent>
        </Card>
    )
}