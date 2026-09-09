import {SetSearchBar} from "@/components/SetSearchBar.tsx";
import {useState} from "react";
import type {LegoSet} from "@/types";
import {SetViewDialog} from "@/components/SetViewDialog.tsx";
import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {useAuth} from "@/providers/auth/AuthContext.ts";
import {useNavigate} from "react-router";
import {Button} from "@/components/ui/button.tsx";
import {CameraButton} from "@/features/scan/CameraButton.tsx";
import {addToCollection} from "@/features/collection/collectionUtils.ts";

import DinoIcon from '../assets/sad-dino.svg?react';
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle} from "@/components/ui/empty.tsx";
import {LogIn} from "lucide-react";

export function HomePage() {
    const [legoSet, setLegoSet] = useState<LegoSet|null>(null);
    const { session } = useAuth()
    const navigate = useNavigate();

    return (
        <>
            <div className="flex flex-col flex-1 min-h-0">
                <div className="flex flex-row items-center gap-2">
                    {session && (<CustomTrigger />)}
                    <SetSearchBar onResult={setLegoSet} hintText="Search Sets..." className="w-full" />
                </div>
                {session == null && (
                    <div className="flex flex-1 items-center justify-center">
                        <Empty>
                            <EmptyHeader>
                                <DinoIcon className="size-50 fill-primary"/>
                                <EmptyTitle>You're Not Signed In</EmptyTitle>
                                <EmptyDescription>You can log in using the button below to access your collection</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => navigate("/login")}>
                                    <LogIn />
                                    <span>Log In</span>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </div>
                )}
            </div>

            <CameraButton className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40"/>

            {legoSet && <SetViewDialog set={legoSet} close={() => setLegoSet(null)}>
              <div className="text-center rounded-b-xl bg-muted/50 -m-4 p-4">
                <Button className="w-full" onClick={() => addToCollection({legoSet, onClose: () => setLegoSet(null)})}>
                  Add To Collection
                </Button>
              </div>
            </SetViewDialog>}
        </>
    )
}