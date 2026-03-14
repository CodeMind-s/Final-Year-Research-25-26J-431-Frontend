"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface UseVisionCameraOptions {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

export function useVisionCamera(options: UseVisionCameraOptions = {}) {
  const { width = 320, height = 320, facingMode = "environment" } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isReadyRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode,
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;

          const onLoadedMetadata = () => {
            video.removeEventListener("loadedmetadata", onLoadedMetadata);
            resolve();
          };

          const onError = () => {
            video.removeEventListener("error", onError);
            reject(new Error("Video failed to load"));
          };

          video.addEventListener("loadedmetadata", onLoadedMetadata);
          video.addEventListener("error", onError);

          if (video.readyState >= 1) {
            video.removeEventListener("loadedmetadata", onLoadedMetadata);
            resolve();
          }
        });

        await videoRef.current.play();
        setIsReady(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access camera";
      setError(message);
      console.error("Camera error:", err);
    }
  }, [width, height, facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  const captureFrame = useCallback(async (): Promise<ArrayBuffer | null> => {
    if (!videoRef.current || !canvasRef.current || !isReadyRef.current) {
      return null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    return new Promise<ArrayBuffer | null>((resolve) => {
      canvasRef.current!.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          blob.arrayBuffer().then(resolve).catch(() => resolve(null));
        },
        "image/jpeg",
        0.6,
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isReady,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
}
