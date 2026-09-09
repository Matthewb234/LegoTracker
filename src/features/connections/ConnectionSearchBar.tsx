import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger
} from "@/components/ui/popover.tsx";
import {UserRound, UserRoundArrowLeft, UserRoundCheck, UserRoundPlus, UserRoundSearch} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList
} from "@/components/ui/combobox.tsx";
import {useProfileSearch} from "@/features/connections/useProfileSearch.ts";
import type {ProfileSearchResult} from "@/types";
import {useState} from "react";

export function ConnectionSearchBar({ onConnectionChanged }: { onConnectionChanged: () => void }) {
    const { query, setQuery, results, status, pendingIds, sendRequest } = useProfileSearch({ onConnectionChanged });
    const [open, setOpen] = useState(false);

    return (
        <Popover onOpenChangeComplete={() => setQuery('')}>
            <PopoverTrigger render={<Button/>}>
                <UserRoundPlus/>
                <span>Add Friend</span>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverHeader>
                    <PopoverTitle>Send a Friend Request</PopoverTitle>
                </PopoverHeader>
                <Combobox
                    items={results}
                    openOnInputClick={false}
                    open={open}
                    onOpenChange={(open, eventDetails) => {
                        if (eventDetails.reason === 'item-press') return;   // stay open on selection
                        setOpen(open);
                    }}
                >
                    <ComboboxInput
                        placeholder="Search For a User..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <ComboboxContent>
                        {query != '' && (<ComboboxEmpty>
                            {status === 'looking_up' ? "Searching..." : "No users found"}
                        </ComboboxEmpty>)}
                        <ComboboxList>
                            {(item:ProfileSearchResult) => (
                                <ComboboxItem
                                    key={item.profile_id}
                                    value={item}
                                    disabled={pendingIds.has(item.profile_id)}
                                    onClick={() => sendRequest(item)}
                                >
                                    <div className="flex flex-row w-full gap-2">
                                        {item.connection_status == null && (<UserRound />)}
                                        {item.connection_status === 'accepted' && (<UserRoundCheck />)}
                                        {item.connection_status === 'pending' && (item.direction === 'incoming'
                                            ? <UserRoundArrowLeft />
                                            : <UserRoundSearch />
                                        )}
                                        {item.display_name}
                                    </div>
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </PopoverContent>
        </Popover>
    )
}