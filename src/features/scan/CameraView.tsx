import {cn} from "@/lib/utils.ts";
import {useEffect, useRef, useState} from "react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {useQrScanner} from "@/features/scan/useQrScanner.ts";

const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
        facingMode: {ideal: 'environment'}
    }
};

type CameraStatus = "starting" | "streaming" | "denied" | "not-found" | "error";

type CameraViewProps = {
    className: string;
    onDecode: (data: string) => void;
    active: boolean;
};

export function CameraView({ className, onDecode, active }: CameraViewProps) {
    const videoRef = useRef<HTMLVideoElement|null>(null);
    const streamRef = useRef<MediaStream|null>(null);

    const [status, setStatus] = useState<CameraStatus>('starting')

    useQrScanner({ videoRef, onDecode, active});

    useEffect(() => {
        let ignore = false;

        const stopStream = () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
        };

        const startStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (ignore) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                const video = videoRef.current;
                if (!video) return;

                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play()
                        .then(() => {
                            if (!ignore) setStatus("streaming");
                        })
                        .catch((err) => {
                            console.error("Video play failed:", err);
                            if (!ignore) setStatus("error");
                        });
                };
            } catch (err) {
                if (ignore) return;
                if (err instanceof DOMException && err.name === "NotAllowedError") {
                    setStatus("denied");
                } else if (err instanceof DOMException && err.name === "NotFoundError") {
                    setStatus("not-found");
                } else {
                    console.error("getUserMedia failed:", err);
                    setStatus("error");
                }
            }
        }
        startStream();
        return () => {
            ignore = true;
            stopStream();
        }
    }, [])
    return (
        <div className={cn("relative", className)}>
            <video ref={videoRef} playsInline muted className="rounded-lg w-full h-full object-cover" />
            {status !== "streaming" && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-sm">
                    {status === "starting" && (
                        <Skeleton className="rounded-lg w-full h-full object-cover flex items-center justify-center">
                            <p>Starting camera…</p>
                        </Skeleton>
                    )}
                    {status === "denied" && "Camera access was denied. Enable it in your browser settings and reload."}
                    {status === "not-found" && "No camera found on this device."}
                    {status === "error" && "Something went wrong starting the camera."}
                </div>
            )}
        </div>
    )
}
