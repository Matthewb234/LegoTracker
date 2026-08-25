import {cn} from "@/lib/utils.ts";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {Search} from "lucide-react";
import {useState} from "react";
import {lookupSet} from "@/lib/api.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import type {LegoSet, SearchState} from "@/types";

type SearchBarProps = React.ComponentProps<"div"> & {
    onResult: (set: LegoSet) => void;
};

export function SearchBar({
    onResult,
    className
}: SearchBarProps) {
    const [setNum, setSetNum] = useState<string>("");
    const [state, setState] = useState<SearchState>({status: 'idle'});

    const searchSet = async (e: React.SubmitEvent<HTMLFormElement>)=> {
        try {
            e.preventDefault()
            setState({status: 'looking_up', setNum: setNum});
            const {data, error} = await lookupSet(setNum);
            if (error) {
                setState({status: 'error', message: error.message});
                console.error(error)
            } else if (data) {
                onResult(data.data)
                console.log(data)
                setState({status: 'idle'});
            }
        } finally {
            setSetNum("");
        }
    }

    return (
        <div className={cn("flex flex-col", className)}>
            <form onSubmit={searchSet}>
                <InputGroup className="group" aria-invalid={state.status === 'error'}>
                    <InputGroupInput className="group-aria-invalid:placeholder:text-destructive"
                        value={setNum}
                        placeholder={"Search Sets..."}
                        onInput={() => setState({status: 'idle'})}
                        onChange={(e) => setSetNum(e.target.value)}
                        disabled={state.status == 'looking_up'}
                        aria-invalid={state.status == 'error'}
                    />
                    <InputGroupAddon>
                        {state.status == 'looking_up'
                            ? (<Spinner />)
                            : <Search className="group-aria-invalid:text-destructive"/>
                        }
                    </InputGroupAddon>
                </InputGroup>
            </form>
        </div>
    )
}