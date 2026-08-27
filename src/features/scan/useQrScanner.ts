import {type RefObject, useEffect, useRef} from "react";
import jsQR from "jsqr";

type UseQrScannerProps = {
    onDecode: (data: string) => void;
    videoRef: RefObject<HTMLVideoElement | null>;
    active: boolean;
};

export function useQrScanner({onDecode, videoRef, active}: UseQrScannerProps) {
    const animationFrameRef = useRef<number|null>(null);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);

    useEffect(() => {
        if (!active) return;
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx || !video) return;

        const processFrameLoop = () => {
            if (video.readyState >= video.HAVE_CURRENT_DATA && !video.paused && !video.ended) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, canvas.width, canvas.height);

                    if (code) {
                        animationFrameRef.current = null;
                        onDecode(code.data);
                        return;
                    }
                } catch (error) {
                    console.error("Failed to parse video frame data:", error);
                }
            }

            animationFrameRef.current = requestAnimationFrame(processFrameLoop);
        };

        const handlePlay = () => {
            if (animationFrameRef.current !== null) return;
            animationFrameRef.current = requestAnimationFrame(processFrameLoop);
        };

        video.addEventListener('play', handlePlay);

        if (!video.paused) {
            handlePlay();
        }

        return () => {
            video.removeEventListener('play', handlePlay);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [active]);
}