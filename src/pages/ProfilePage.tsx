import {CustomTrigger} from "@/features/sidebar/CustomTrigger.tsx";
import {UsernamePopover} from "@/features/profile/UsernamePopover.tsx";
import {AvatarSelector} from "@/features/profile/AvatarSelector.tsx";
import {useProfile} from "@/providers/profile/ProfileContext.ts";
import {ThemeToggle} from "@/components/ThemeToggle.tsx";

export function ProfilePage() {
    const { profile, refresh } = useProfile()

    return (
        <div className="flex flex-col flex-1 min-w-0">
            {/* Page header */}
            <header className="flex flex-row items-center gap-2 border-b px-4 py-3">
                <CustomTrigger />
                <h1 className="text-lg font-semibold">Profile</h1>
            </header>

            {/* Content, constrained and centred */}
            <div className="w-full px-4 py-8 flex flex-col flex-1 items-center gap-8">
                <section className="flex flex-col items-center gap-3">
                    {profile && <AvatarSelector profile={profile} refresh={refresh} />}
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-xl font-semibold">
                            {profile?.display_name ?? "…"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Tap your avatar to change it
                        </p>
                    </div>
                </section>

                {/* Settings group */}
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium text-muted-foreground px-1">
                        Account
                    </h2>
                    <div className="rounded-lg border-2 divide-y w-full">
                        <Row label="Username">
                            {profile && <UsernamePopover profile={profile} refresh={refresh} />}
                        </Row>
                        <Row label="Theme">
                            <ThemeToggle />
                        </Row>
                    </div>
                </section>
            </div>
        </div>
    )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm font-medium">{label}</span>
            {children}
        </div>
    )
}