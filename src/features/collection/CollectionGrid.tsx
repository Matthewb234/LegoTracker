import type { CollectionItem } from "@/types";
import { CollectionCard, CollectionCardSkeleton } from "./CollectionCard.tsx";
import {Empty, EmptyDescription, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {PackageX} from "lucide-react";

type CollectionGridProps = {
    items: CollectionItem[];
    loading: boolean;
    onSelect: (item: CollectionItem) => void;
};

export function CollectionGrid({ items, loading, onSelect }: CollectionGridProps) {
    if (!loading && items.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Empty>
                    <EmptyMedia variant="icon" className="size-18">
                        <PackageX className="size-10"/>
                    </EmptyMedia>
                    <EmptyTitle>Collection Empty</EmptyTitle>
                    <EmptyDescription>
                        There Are No Sets In This Collection
                    </EmptyDescription>
                </Empty>
            </div>
        );
    }

    return (
        <div className="grid pt-4 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading
                ? Array.from({ length: 8 }).map((_, i) => <CollectionCardSkeleton key={i} />)
                : items.map((item) => (
                    <CollectionCard key={item.id} item={item} onClick={() => onSelect(item)} />
                ))
            }
        </div>
    );
}