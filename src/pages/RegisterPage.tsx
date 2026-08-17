import {RegisterForm} from "@/features/auth/RegisterForm.tsx";

export function RegisterPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center">
            <div className="w-full max-w-sm">
                <RegisterForm />
            </div>
        </div>
    )
}
