/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RotateCw, Image as ImageIcon, Video, VideoOff } from "lucide-react";
import { useCamera } from "./useCamera";
import { compressImage } from "../../utils/imageCompressor";

interface CameraScannerProps {
  onImageSelected: (base64Image: string) => void;
  isProcessing: boolean;
}

export function CameraScanner({ onImageSelected, isProcessing }: CameraScannerProps) {
  const {
    stream,
    permissionState,
    error: cameraError,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
  } = useCamera();

  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when leaving tab or unmounting
  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, stopCamera]);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawBase64 = e.target?.result as string;
      setPreviewUrl(rawBase64);
      try {
        const compressed = await compressImage(rawBase64, 1024, 1024, 0.7);
        onImageSelected(compressed);
      } catch (err) {
        console.error("Image compression failed:", err);
        onImageSelected(rawBase64); // Fallback to raw if compression fails
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleCapture = async () => {
    const photoData = await takePhoto();
    if (photoData) {
      setPreviewUrl(photoData);
      try {
        const compressed = await compressImage(photoData, 1024, 1024, 0.7);
        onImageSelected(compressed);
      } catch (err) {
        onImageSelected(photoData);
      }
      stopCamera();
    }
  };

  const toggleFacingMode = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const handleStartCamera = () => {
    startCamera(facingMode);
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden transition-all duration-300">
      <div className="flex border-b border-amber-50">
        <button
          id="scanner-tab-upload"
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-4 text-center font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === "upload"
              ? "text-amber-800 bg-amber-50/50 border-b-2 border-amber-500"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50/30"
          }`}
        >
          <Upload size={16} />
          Upload Image
        </button>
        <button
          id="scanner-tab-camera"
          type="button"
          onClick={() => {
            setActiveTab("camera");
            handleStartCamera();
          }}
          className={`flex-1 py-4 text-center font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === "camera"
              ? "text-amber-800 bg-amber-50/50 border-b-2 border-amber-500"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50/30"
          }`}
        >
          <Camera size={16} />
          Live Camera Scan
        </button>
      </div>

      <div className="p-6">
        {activeTab === "upload" ? (
          <div
            id="drag-and-drop-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onFileInputClick}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200 min-h-[280px] ${
              dragActive
                ? "border-amber-400 bg-amber-50/30 scale-[0.99]"
                : "border-neutral-200 hover:border-amber-300 hover:bg-amber-50/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelected}
              disabled={isProcessing}
            />

            {previewUrl ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative max-h-48 w-full max-w-xs overflow-hidden rounded-xl border border-neutral-100 shadow-inner">
                  <img
                    src={previewUrl}
                    alt="Fridge Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-neutral-400">Click or drag another photo to scan</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 shadow-sm">
                  <ImageIcon size={32} />
                </div>
                <h3 className="font-medium text-neutral-800 mb-1">Upload a photo of your fridge</h3>
                <p className="text-xs text-neutral-500 max-w-sm px-4 mb-2">
                  Snap a photo of your open fridge, freezer, or pantry basket. AI will detect your ingredients.
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/60 rounded-full text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                  Supports Drag & Drop
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative rounded-2xl bg-neutral-900 overflow-hidden aspect-video max-h-[360px] flex items-center justify-center text-white border border-neutral-800 shadow-md">
            {stream ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
                  <button
                    id="camera-capture-btn"
                    type="button"
                    onClick={handleCapture}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-full shadow-md text-sm transition-all duration-150 transform hover:scale-102 active:scale-98 disabled:opacity-50"
                  >
                    <Camera size={16} />
                    Take Photo
                  </button>
                  <button
                    id="camera-rotate-btn"
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-white rounded-full transition-all duration-150"
                    title="Rotate Camera"
                  >
                    <RotateCw size={16} />
                  </button>
                  <button
                    id="camera-stop-btn"
                    type="button"
                    onClick={stopCamera}
                    className="p-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-all duration-150"
                    title="Turn Off Camera"
                  >
                    <VideoOff size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-6">
                <div className="p-4 bg-neutral-800 rounded-full text-neutral-400 mb-4">
                  <Video size={32} />
                </div>
                {cameraError ? (
                  <>
                    <p className="text-red-400 text-xs max-w-xs mb-4 px-2">{cameraError}</p>
                    <button
                      id="retry-camera-btn"
                      type="button"
                      onClick={handleStartCamera}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-amber-400 text-xs font-semibold rounded-full border border-neutral-700 transition-all duration-150"
                    >
                      Allow Access
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-neutral-200 mb-1">Accessing Camera</h3>
                    <p className="text-xs text-neutral-500 max-w-xs mb-4">
                      We require camera permissions to snap a real-time photo of your fridge.
                    </p>
                    <button
                      id="start-camera-btn"
                      type="button"
                      onClick={handleStartCamera}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-full shadow transition-all duration-150"
                    >
                      Enable Camera
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {previewUrl && (
          <div className="mt-4 p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-between text-xs text-neutral-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Image loaded and optimized
            </span>
            <button
              id="clear-image-btn"
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="text-amber-700 font-semibold hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
