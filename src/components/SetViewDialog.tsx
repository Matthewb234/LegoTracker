import type {LegoSet} from "@/types";
import { useRef } from "react";
import {
    Dialog,
    DialogContent
} from "@/components/ui/dialog.tsx"
import BrickIcon from '../assets/brick-icon.svg?react';
import CalendarIcon from '../assets/calendar-icon.svg?react';
import PoundIcon from '../assets/pound-icon.svg?react';


interface SetViewDialogProps {
    set: LegoSet;
    quantity?: number;
    close: () => void;
    children: React.ReactNode;
}

export function SetViewDialog({ set, quantity, close, children } : SetViewDialogProps) {
    const focusRef = useRef<HTMLDivElement>(null);

    return (
        <Dialog defaultOpen={Boolean(set)} onOpenChange={close}>
            <DialogContent
                className="max-h-9/10 outline-2 outline-primary text-center"
                showCloseButton={false}
                initialFocus={focusRef}
            >
                <div className="bg-primary-darkened rounded-t-xl rounded-b-[2rem] outline-2 outline-primary p-4 -m-4 sm:p-6" ref={focusRef}>
                    <img className="rounded-xl w-full aspect-4/3 object-contain" src={set.image_url!} alt="set image"/>
                </div>
                <div className="pt-2 sm:pt-4 ">
                    <p className="text-xs">{"Lego " + set.theme}</p>
                    <p className="text-xl font-bold">{set.name}</p>
                    {quantity && <p>{"Qty: " + quantity}</p>}
                </div>
                <div className="grid grid-cols-3 text-xs pb-4">
                    <div className="flex flex-col items-center">
                        <BrickIcon className="size-6"/>
                        <p>Pieces</p>
                        <p>{set.piece_count}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <CalendarIcon className="size-6"/>
                        <p>Year</p>
                        <p>{set.year_released}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <PoundIcon className="size-6"/>
                        <p>Set</p>
                        <p>{set.id}</p>
                    </div>
                </div>
                {children}
            </DialogContent>
        </Dialog>
    )
}