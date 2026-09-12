import {useEffect, useState} from "react";
import type {UsernameState} from "@/types";
import {isUsernameAvailable} from "@/lib/api.ts";
import {useAuth} from "@/providers/auth/AuthContext.ts";

const ALLOWED_CHARS = /^[A-Za-z0-9_-]*$/;

export type ValidationResult = { valid: true } | { valid: false; message: string };

export function useUsernameAvailability(username: string) {
    const [usernameState, setUsernameState] = useState<UsernameState>({status: "idle"})

    const {session} = useAuth()

    useEffect(() => {
        let ignore = false;
        let timer = 0;
        const checkAvailability = () => {
            if (username === "") {
                setUsernameState({ status: 'idle' });
                return;
            }

            const result = validateDisplayName(username);
            if (!result.valid) {
                setUsernameState({ status: 'invalid', message: result.message });
                return;
            }

            setUsernameState({ status: 'checking' });

            timer = setTimeout(async () => {
                const { data, error } = await isUsernameAvailable(username, session?.user.id);
                if (ignore) return;
                if (error) {
                    console.error(error);
                    setUsernameState({ status: 'unknown' });
                    return;
                }
                setUsernameState(data ? { status: 'available' } : { status: 'taken' });
            }, 400);

        }

        checkAvailability();

        return () => {
            clearTimeout(timer);
            ignore = true;
        };
    }, [username]);

    return usernameState;
}

export function validateDisplayName(name: string): ValidationResult {
    if (!ALLOWED_CHARS.test(name)) {
        return { valid: false, message: "Only letters, numbers, _ and - are allowed" };
    }
    if (name.length < 3) {
        return { valid: false, message: "Must be at least 3 characters" };
    }
    if (name.length > 30) {
        return { valid: false, message: "Must be 30 characters or fewer" };
    }
    return { valid: true };
}