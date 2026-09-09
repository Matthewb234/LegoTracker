import {Card, CardContent} from "@/components/ui/card.tsx";
import type {Connection, ConnectionType} from "@/types";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Minus, Star, User} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

type ConnectionCardProps = { connection: Connection }
    & {type: ConnectionType}
    & {onButtonClick: () => void}
    & { onRemove: () => void }
    & { onFavorite: () => void };

export function ConnectionCard({ connection, type, onButtonClick, onRemove, onFavorite }: ConnectionCardProps) {

    return (
        <Card className="rounded-md outline-2 outline-primary">
            <CardContent className="flex flex-col items-center gap-1 -m-2">
                <div className="flex flex-row w-full gap-1">
                    <Minus className="-mt-1 stroke-3  hover:stroke-red-500 hover:stroke-4" onClick={onRemove}/>
                    <div className="rounded-full outline-2 w-full h-full aspect-square outline-muted-foreground">
                        {connection.friend_avatar_url
                            ? <img className="w-full aspect-square object-cover shrink-0" src={connection.friend_avatar_url ?? ''} alt="user avatar"/>
                            : <User className="w-full h-full stroke-muted-foreground p-2" />
                        }
                    </div>
                    <Star
                        className={
                            `-mt-1 stroke-3 
                            ${connection.favorited ? "stroke-amber-300 fill-amber-300" : ""}
                            ${type.status != 'accepted' ? "invisible pointer-events-none" : ""}`
                        }
                        onClick={type.status != 'accepted' ? undefined : onFavorite}
                    />
                </div>
                <p className="text-xs font-bold my-2">{connection.friend_display_name}</p>
                {type.status === 'accepted' && (
                    <Button className="text-xs" onClick={onButtonClick}>
                        View Collection
                    </Button>
                )}
                {type.status === 'pending' && type.dir === 'incoming' && (
                    <Button className="text-xs" onClick={onButtonClick}>
                        Accept Request
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export function ConnectionCardSkeleton() {
    return (
        <Card className="rounded-md outline-2 outline-primary">
            <CardContent className="flex flex-col items-center gap-1 -m-2">
                <div className="flex flex-row w-full gap-1">
                    <Minus className="-mt-1 stroke-3 text-muted-foreground/30" />
                    <Skeleton className="rounded-full w-full h-full aspect-square" />
                    <Star className="-mt-1 stroke-3 text-muted-foreground/30" />
                </div>
                <Skeleton className="h-4 w-3/4 my-2" />
                <Skeleton className="h-8 w-full rounded-md" />
            </CardContent>
        </Card>
    )
}