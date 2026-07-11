/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from "react";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | "prompt">("prompt");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async (facingMode: "user" | "environment" = "environment") => {
    setError(null);
    try {
      // First stop any active stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      setPermissionState("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setPermissionState("denied");
      setError(err?.message || "Could not access camera. Please check your browser permissions.");
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePhoto = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !stream) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Draw the current frame from the video stream onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      resolve(dataUrl);
    });
  }, [stream]);

  return {
    stream,
    permissionState,
    error,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
  };
}
