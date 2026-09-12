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
import {useNavigate} from "react-router";
import {useState} from "react";
import {supabase} from "@/lib/supabase.ts";
import {signInWithGoogle} from "@/lib/api.ts";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string>("")
    const navigate = useNavigate()

    const submitForm = async (e: React.SubmitEvent<HTMLFormElement>)=> {
        try {
            e.preventDefault()
            setSubmitting(true)
            setError("")
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
                console.error(error)
            } else if (data) navigate("/")
        } finally {
            setSubmitting(false)
            setPassword("")
        }
    }

    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <Card className="rounded-xl">
                <div className="items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-balance text-muted-foreground">
                        Enter your email and password below to access your account
                    </p>
                </div>
                <CardContent>
                    <form id="login-form" onSubmit={(e) => submitForm(e)}>
                        <FieldGroup>
                            <Field data-invalid={error != ""}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={error != ""}
                                    required
                                />
                            </Field>
                            <Field data-invalid={error != ""}>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    {/*<Button*/}
                                    {/*    variant="link"*/}
                                    {/*    className="ml-auto inline-block text-sm "*/}
                                    {/*>*/}
                                    {/*    Forgot your password?*/}
                                    {/*</Button>*/}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={error != ""}
                                    required
                                />
                                <FieldDescription>{error}</FieldDescription>
                            </Field>
                            <Button type="submit" form="login-form" className="w-full" disabled={submitting}>
                                {submitting ? 'Submitting' : 'Login'}
                            </Button>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Or continue with
                            </FieldSeparator>
                            <Button variant="outline" type="button" onClick={signInWithGoogle}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Login with Google
                            </Button>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account? <a href="./register">Sign up</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}