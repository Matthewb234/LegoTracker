import {Pencil, User} from "lucide-react";
import {useRef, useState} from "react";
import type {Profile} from "@/types";
import {Button} from "@base-ui/react";
import {getAvatarUrl, updateAvatar} from "@/lib/api.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {toast} from "@/components/ui/toast.tsx";

type AvatarSelectorProps = {profile: Profile} & {refresh: () => void}

export function AvatarSelector({profile, refresh}: AvatarSelectorProps) {
    const [preview, setPreview] = useState<string|null>(null);
    const [submitting, setSubmitting] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            setSubmitting(true);
            const imageBitmap = await createImageBitmap(
                file,
                {imageOrientation: "from-image"}
            );
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error('Context failed to load')

            canvas.width = 400;
            canvas.height = 400;
            const size = Math.min(imageBitmap.width, imageBitmap.height)
            const sx = (imageBitmap.width - size) / 2
            const sy = (imageBitmap.height - size) / 2
            ctx.drawImage(imageBitmap, sx, sy, size, size, 0, 0, 400, 400);
            imageBitmap.close();

            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/webp', 0.85)
            )
            if (!blob) throw new Error('Encoding failed')

            const { error } = await updateAvatar(profile!.id, blob);

            if (error) {
                throw error;
            } else {
                const localUrl = URL.createObjectURL(blob)
                setPreview(localUrl)
                refresh();
            }
        } catch (error) {
            console.error('Error creating image:', error);
            toast.add({
                type: "error",
                description: "Failed to update avatar",
            })
            return;
        } finally {
            setSubmitting(false);
            e.target.value = ""
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
            />
            {submitting
                ? <AvatarSelectorSkeleton />
                : <Button
                    type="button"
                    disabled={submitting}
                    className="relative rounded-full outline-4 w-1/3 aspect-square bg-secondary outline-muted-foreground hover:outline-primary p-0"
                    onClick={() => inputRef.current?.click()}
                    aria-label={profile?.avatar_url ? "Change profile picture" : "Add profile picture"}
                >
                    {profile?.avatar_url
                        ? <img className="rounded-full w-full aspect-square shrink-0" src={preview ?? getAvatarUrl(profile)} alt="user avatar"/>
                        : <User className="w-full h-full stroke-muted-foreground p-2" />
                    }
                    <div className="absolute bottom-1/15 right-1/15 rounded-full bg-primary outline-2 outline-muted-foreground size-1/6 grid place-items-center">
                        <Pencil className="size-2/3"/>
                    </div>
                </Button>
            }
        </>
    )
}

export function AvatarSelectorSkeleton() {
    return (
        <span className="flex items-center justify-center rounded-full outline-4 w-1/3 aspect-square outline-muted-foreground">
            <Spinner className="size-1/5"/>
        </span>
    )
}