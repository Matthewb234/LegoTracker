import {CameraView} from "@/features/scan/CameraView.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router";
import {useState} from "react";
import {lookupSet} from "@/lib/api.ts";
import type {SearchState} from "@/types";
import {SetViewDialog} from "@/components/SetViewDialog.tsx";
import {addToCollection} from "@/features/collection/collectionUtils.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

export function ScanPage() {
    const [state, setState] = useState<SearchState>({status: 'idle'});
    const navigate = useNavigate();

    const onDecode = async (qrData: string)=> {
        const setNum = parseSetNumberFromQr(qrData);
        if (!setNum) {
            setState({status: 'error', message: 'Failed to decode QR Data'});
            return;
        }
        setState({status: 'looking_up', setNum: setNum});
        const {data, error} = await lookupSet(setNum);
        if (error) {
            setState({status: 'error', message: error.message});
            console.error(error)
        } else if (data) {
            setState({status: "viewing", set: data.data})
        }
    }

    const onClose = () => setState({status: 'idle'});

    return (
        <div className="flex flex-col flex-1 min-h-0 relative">
            <Button
                className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-[calc(1rem+env(safe-area-inset-left))] z-40 rounded-full size-15 sm:hidden"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="size-3/4"/>
            </Button>
            <CameraView
                className="flex-1 min-h-0 w-full object-cover"
                onDecode={(data) => onDecode(data)}
                active={state.status === 'idle'}
            />
            {state.status === 'looking_up' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Spinner className="size-30 text-primary" />
                </div>
            )}
            {state.status === 'viewing' && (
                <SetViewDialog set={state.set} close={onClose}>
                    <div className="text-center rounded-b-xl bg-muted/50 -m-4 p-4">
                        <Button className="w-full" onClick={() => addToCollection({legoSet: state.set, onClose})}>
                            Add To Collection
                        </Button>
                    </div>
                </SetViewDialog>
            )}
        </div>
    )
}

const LEGO_QR_PATTERN = /^https?:\/\/(?:www\.)?lego\.com\/go\/38\/(\d+)\//i;

function parseSetNumberFromQr(raw: string): string | null {
    const match = LEGO_QR_PATTERN.exec(raw.trim());
    if (!match) return null;
    return String(Number(match[1]));
}


