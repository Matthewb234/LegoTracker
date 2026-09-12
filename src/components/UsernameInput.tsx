import {Field, FieldDescription, FieldLabel} from "@/components/ui/field.tsx";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Check, X} from "lucide-react";
import type {UsernameState} from "@/types";

type UsernameInputProps = {
    id?: string
    label?: string
    value: string
    onChange: (value: string) => void
    state: UsernameState
    error?: string
    disabled?: boolean
}

export function UsernameInput({
    id = "username",
    label = "Username",
    value,
    onChange,
    state,
    error = "",
    disabled = false
}: UsernameInputProps) {

    const invalid = error !== "" || state.status === 'invalid' || state.status === 'taken'

    const message =
        error
        || (state.status === 'invalid' ? state.message : "")
        || (state.status === 'taken' ? "That username is taken" : "")

    return (
        <Field className="grid gap-2" data-invalid={invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type="text"
                    placeholder="Letters, nums, _ and - only. 3–30 chars"
                    autoComplete="off"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-invalid={invalid}
                    disabled={disabled}
                    required
                />
                <InputGroupAddon align="inline-end">
                    {state.status === 'checking' && <Spinner />}
                    {state.status === 'available' && <Check className="size-4 text-green-600" />}
                    {(state.status === 'invalid' || state.status === 'taken') && <X className="size-4 text-red-400" />}
                </InputGroupAddon>
            </InputGroup>
            <FieldDescription>{message}</FieldDescription>
        </Field>
    )
}