import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldDescription,
    FieldLabel, FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {Link, useNavigate} from "react-router";
import {useState} from "react";
import {supabase} from "@/lib/supabase.ts";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {useUsernameAvailability} from "@/features/auth/useUsernameAvailability.ts";
import {Check, X} from "lucide-react";
import {isUsernameAvailable} from "@/lib/api.ts";

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [username, setUsername] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [submitting, setSubmitting] = useState(false)
    const [usernameError, setUsernameError] = useState<string>("")
    const [error, setError] = useState<string>("")

    const navigate = useNavigate()

    const nameState = useUsernameAvailability(username)
    const nameInvalid = nameState.status === 'invalid' || nameState.status === 'taken'

    const submitForm = async (e: React.SubmitEvent<HTMLFormElement>)=> {
        try {
            e.preventDefault()
            setSubmitting(true)
            setError("")

            if (nameState.status === 'taken') {
                setUsernameError("That username is taken")
                return
            } else if (nameState.status === 'invalid') {
                setUsernameError(nameState.message)
                return
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { display_name: username }
                }
            })

            if (error) {
                const { data: stillFree } = await isUsernameAvailable(username)
                if (stillFree === false) {
                    setUsernameError("That username was just taken")
                } else {
                    setError(error.message)
                }
                console.error(error)
                setPassword("")
            } else if (data) navigate("/")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <Card className="rounded-xl">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome</h1>
                    <p className="text-balance text-muted-foreground">
                        Create an account using your email and password below
                    </p>
                </div>
                <CardContent>
                    <form id="register-form" onSubmit={(e) => submitForm(e)}>
                        <FieldGroup>
                            <Field className="grid gap-2" data-invalid={nameInvalid || usernameError != ""}>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="username"
                                        type="text"
                                        placeholder="Letters, nums, _ and - only. 3–30 chars"
                                        autoComplete="off"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value.trim())
                                            setUsernameError("")
                                        }}
                                        aria-invalid={nameInvalid || usernameError != ""}
                                        required
                                    />
                                    <InputGroupAddon align="inline-end">
                                        {nameState.status === 'checking' && <Spinner />}
                                        {nameState.status === 'available' && <Check className="size-4 text-green-600" />}
                                        {nameState.status === 'invalid' || nameState.status === 'taken' && <X className="size-4 text-red-400" />}
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldDescription>
                                    {
                                        usernameError
                                        || (nameState.status === 'invalid' && nameState.message)
                                        || (nameState.status === 'taken' && "That username is taken")
                                    }
                                </FieldDescription>
                            </Field>
                            <Field className="grid gap-2" data-invalid={error != ""}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={error != ""}
                                    required
                                />
                            </Field>
                            <Field className="grid gap-2" data-invalid={error != ""}>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="*********"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={error != ""}
                                    required
                                />
                                <FieldDescription>{error}</FieldDescription>
                            </Field>
                            <Button type="submit" form="register-form" className="w-full" disabled={submitting}>
                                {submitting ? 'Submitting' : 'Sign Up'}
                            </Button>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Or continue with
                            </FieldSeparator>
                            <Button variant="outline" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Sign Up with Google
                            </Button>
                            <FieldDescription className="text-center">
                                Already have an account? <Link to="/login">Login</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}