import {Button} from "@/components/ui/button.tsx";
import {useUsernameAvailability} from "@/features/auth/useUsernameAvailability.ts";
import {useState} from "react";
import {Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Pencil} from "lucide-react";
import {UsernameInput} from "@/components/UsernameInput.tsx";
import type {Profile} from "@/types";
import {isUsernameAvailable, updateDisplayName} from "@/lib/api.ts";
import {toast} from "@/components/ui/toast.tsx";
import {useAuth} from "@/providers/auth/AuthContext.ts";

type UsernamePopoverProps = {profile: Profile} & {refresh: () => void}

export function UsernamePopover({profile, refresh}: UsernamePopoverProps) {
    const [username, setUsername] = useState<string>("")
    const [originalUsername, setOriginalUsername] = useState<string>(profile.display_name ?? "")
    const [usernameError, setUsernameError] = useState<string>("")
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [open, setOpen] = useState(false)

    const nameState = useUsernameAvailability(username)
    const {session} = useAuth()

    const unchanged = username === originalUsername;
    const canSubmit = unchanged ? false : nameState.status === 'available';

    const reset = () => {
        setUsername("")
        setOriginalUsername(profile.display_name ?? "")
        setUsernameError("")
    }

    const submit = async () => {
        const trimmed = username.trim();

        if (nameState.status === 'checking') {
            setUsernameError("Still checking that username…")
            return
        }
        if (nameState.status !== 'available') {
            setUsernameError(
                nameState.status === 'invalid'
                    ? nameState.message
                    : nameState.status === 'taken'
                        ? "That username is taken"
                        : "Please choose a username"
            )
            return
        }

        setSubmitting(true);
        try {
            const { data, error } = await updateDisplayName(profile.id, trimmed);

            if (error) {
                const { data: stillFree } = await isUsernameAvailable(trimmed, session?.user.id)
                if (stillFree === false) {
                    setUsernameError("That username was just taken")
                }else {
                    setUsernameError("Couldn't update username. Please try again.")
                }
                console.error(error)
            } else if (data) {
                setOpen(false)
                refresh()
                toast.add({
                    type: "success",
                    description: "Successfully updated username"
                })
            }
        }  catch (err) {
            console.error(err)
            setUsernameError("Couldn't update username. Please try again.")
            setSubmitting(false)
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) reset() }}>
            <PopoverTrigger render={<Button/>}>
                <span>{profile?.display_name ?? 'user'}</span>
                <Pencil />
            </PopoverTrigger>
            <PopoverContent align="start">
                <PopoverHeader>
                    <PopoverTitle>Edit Your Username</PopoverTitle>
                </PopoverHeader>
                <UsernameInput
                    value={username}
                    onChange={(v) => { setUsername(v); setUsernameError("") }}
                    state={nameState}
                    error={usernameError}
                    disabled={submitting}
                />
                <Button disabled={!canSubmit || submitting} onClick={submit}>Submit</Button>
            </PopoverContent>
        </Popover>
    )
}