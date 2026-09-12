import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {useState} from "react";
import {ConnectionCard, ConnectionCardSkeleton} from "@/features/connections/ConnectionCard.tsx";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select.tsx";
import {useConnections} from "@/features/connections/useConnections.ts";
import {ConnectionSearchBar} from "@/features/connections/ConnectionSearchBar.tsx";
import {useNavigate} from "react-router";
import {Empty, EmptyDescription, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {UserRoundX} from "lucide-react";

const TYPE_OPTIONS = {
    accepted:  { status: 'accepted' },
    outgoing:  { status: 'pending', dir: 'outgoing' },
    incoming:  { status: 'pending', dir: 'incoming' },
} as const;

type TypeKey = keyof typeof TYPE_OPTIONS;

export function ConnectionsPage() {
    const [typeKey, setTypeKey] = useState<TypeKey>('accepted');
    const type = TYPE_OPTIONS[typeKey];

    const { connections, loading, refresh, remove, toggleFavorite, accept } = useConnections(type);
    const navigate = useNavigate();


    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-row items-center gap-2">
                <CustomTrigger />
                <NativeSelect
                    value={typeKey}
                    onChange={(e) => setTypeKey(e.target.value as TypeKey)}
                >
                    <NativeSelectOption value="accepted">Friends</NativeSelectOption>
                    <NativeSelectOption value="outgoing">Sent</NativeSelectOption>
                    <NativeSelectOption value="incoming">Received</NativeSelectOption>
                </NativeSelect>
                <div className="ml-auto">
                    <ConnectionSearchBar onConnectionChanged={refresh} />
                </div>
            </div>
            {!loading && connections.length === 0
                ? <div className="flex flex-1 items-center justify-center">
                    <Empty>
                        <EmptyMedia variant="icon" className="size-18">
                            <UserRoundX className="size-10"/>
                        </EmptyMedia>
                        <EmptyTitle>No Users</EmptyTitle>
                        <EmptyDescription>
                            {type.status === 'accepted'
                                ? "You Have No Users Added Yet"
                                : type.dir === 'outgoing'
                                    ? "You Haven't Sent Any Requests"
                                    : "You Haven't Received Any Requests"
                            }
                        </EmptyDescription>
                    </Empty>
                </div>
                : <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain -mx-4 -mb-4">
                    <div className="grid p-4 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {loading
                            ? Array.from({ length: 10 }).map((_, i) => <ConnectionCardSkeleton key={i} />)
                            : connections.map((item) => (
                                <ConnectionCard
                                    key={item.connection_id}
                                    connection={item}
                                    type={type}
                                    onButtonClick={ type.status === 'accepted'
                                        ? () => {
                                            navigate(`/collection/${item.friend_id}`);
                                        }
                                        : () => accept(item)
                                    }
                                    onRemove={() => remove(item)}
                                    onFavorite={() => toggleFavorite(item)}
                                />
                            ))
                        }
                    </div>
                </div>
            }
        </div>
    )
}
