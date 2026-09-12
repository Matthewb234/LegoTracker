import { Moon, Sun, SunMoon } from "lucide-react"

import { useTheme } from "@/providers/theme/ThemeContext.ts"

const options = [
    { value: "light",  label: "Light",  Icon: Sun },
    { value: "dark",   label: "Dark",   Icon: Moon },
    { value: "system", label: "System", Icon: SunMoon },
] as const

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="inline-flex rounded-lg border-2 p-1 gap-1">
            {options.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                        theme === value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Icon className="size-4" />
                    {label}
                </button>
            ))}
        </div>
    )
}