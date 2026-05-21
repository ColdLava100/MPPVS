"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspect: number;
  title: string;
  onSave: (croppedBlob: Blob) => void;
  onClose: () => void;
}

export default function CropModal({ isOpen, imageSrc, aspect, title, onSave, onClose }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPx: any) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        setCroppedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    }, "image/jpeg", 0.85);
  }, [imageSrc, croppedAreaPixels]);

  const handleConfirm = () => {
    if (croppedBlob) onSave(croppedBlob);
  };

  const handleBack = () => {
    setPreviewUrl(null);
    setCroppedBlob(null);
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCroppedBlob(null);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">
            {previewUrl ? "Preview" : title}
          </h3>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Crop Area or Preview */}
        {previewUrl ? (
          <div className="flex items-center justify-center p-6 bg-black/30">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 rounded-lg object-contain border border-white/10"
            />
          </div>
        ) : (
          <div className="relative h-72 bg-black/50">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape={aspect === 1 ? "round" : "rect"}
              showGrid={false}
              objectFit="contain"
              classes={{
                mediaClassName: "rounded-none",
                cropAreaClassName: "border-2 border-yellow-500/60",
              }}
            />
          </div>
        )}

        {/* Zoom Controls (only in crop mode) */}
        {!previewUrl && (
          <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
            <ZoomIn size={16} className="text-white/50 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
            />
            <ZoomOut size={16} className="text-white/50 shrink-0" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4">
          {previewUrl ? (
            <>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c5a021] text-black py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] hover:bg-yellow-400 transition-all"
              >
                <Check size={16} /> Confirm Upload
              </button>
              <button
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-all border border-white/10"
              >
                Re-crop
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCrop}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c5a021] text-black py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] hover:bg-yellow-400 transition-all"
              >
                <Check size={16} /> Crop & Preview
              </button>
              <button
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-all border border-white/10"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
