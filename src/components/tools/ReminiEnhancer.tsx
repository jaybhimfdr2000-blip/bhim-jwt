import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';

interface ReminiEnhancerProps {
  onBack: () => void;
}

export const ReminiEnhancer: React.FC<ReminiEnhancerProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ size: string; dimensions: string; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setErrorMsg('Please select a JPG, PNG, or WebP image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10MB.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setEnhancedUrl(null);
    setProgress(0);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Read dimensions
    const img = new Image();
    img.onload = () => {
      setFileDetails({
        size: (file.size / 1024).toFixed(1) + ' KB',
        dimensions: `${img.width} × ${img.height} px`,
        type: file.type.split('/')[1].toUpperCase(),
      });
    };
    img.src = objectUrl;
  };

  const startEnhancement = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusText('Uploading photo to Remini AI engine...');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setProgress(35);
      setStatusText('Applying AI super-resolution and face recovery...');

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      setProgress(75);
      setStatusText('Finalizing textures and colors...');

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed');
      }

      setProgress(100);
      setStatusText('Complete! Rendering result...');

      setTimeout(() => {
        setEnhancedUrl(data.enhanced_url);
        setIsProcessing(false);
        setSliderPosition(50);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to enhance image. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onMouseUp = () => setIsDraggingSlider(false);

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDraggingSlider]);

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEnhancedUrl(null);
    setFileDetails(null);
    setErrorMsg(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadResult = () => {
    if (!enhancedUrl) return;
    // Proxy download to prevent CORS blocking
    const downloadUrl = `/api/proxy-image?url=${encodeURIComponent(enhancedUrl)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Enhanced_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative my-6 rounded-3xl bg-[#090e1c] border border-white/10 p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪄</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Remini AI - Pro Image Enhancer</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ultra HD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transform low-res, pixelated Free Fire screenshots &amp; profile photos into crystal clear HD
            </p>
          </div>
        </div>

        {enhancedUrl && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Enhance Another</span>
          </button>
        )}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="my-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      {!previewUrl && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="my-8 border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-3xl p-10 sm:p-14 text-center cursor-pointer bg-white/[0.02] hover:bg-emerald-500/[0.03] transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            Click to upload or drag &amp; drop your image
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            Supports Free Fire banners, avatars, screenshots (JPG, PNG, WebP up to 10MB)
          </p>
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
            Powered by Remini Pro Neural Model
          </span>
        </div>
      )}

      {/* Preview & Action State */}
      {previewUrl && !enhancedUrl && (
        <div className="my-6 max-w-xl mx-auto space-y-5">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#050810] shadow-xl">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-full max-h-[380px] object-contain mx-auto"
            />
          </div>

          {/* Details strip */}
          {fileDetails && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Format</span>
                <span className="font-semibold text-slate-200">{fileDetails.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Dimensions</span>
                <span className="font-semibold text-slate-200">{fileDetails.dimensions}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">File Size</span>
                <span className="font-semibold text-slate-200">{fileDetails.size}</span>
              </div>
            </div>
          )}

          {/* Progress or Button */}
          {isProcessing ? (
            <div className="space-y-3 bg-[#050810] p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                  {statusText}
                </span>
                <span className="font-mono text-slate-300">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={resetAll}
                className="w-1/3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
              >
                Change Photo
              </button>
              <button
                onClick={startEnhancement}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enhance to Ultra HD</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Slider (When Enhanced) */}
      {enhancedUrl && previewUrl && (
        <div className="my-6 max-w-2xl mx-auto space-y-4">
          <div
            ref={containerRef}
            onMouseDown={() => setIsDraggingSlider(true)}
            onTouchStart={() => setIsDraggingSlider(true)}
            className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/15 bg-black cursor-ew-resize select-none shadow-2xl"
          >
            {/* Base layer: Original image */}
            <img
              src={previewUrl}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-400 uppercase tracking-wider border border-white/10">
              Original
            </div>

            {/* Top clipped layer: Enhanced Image */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={`/api/proxy-image?url=${encodeURIComponent(enhancedUrl)}`}
                alt="Enhanced Result"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{
                  width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                }}
              />
              <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-md bg-emerald-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                Remini Enhanced HD
              </div>
            </div>

            {/* Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-30 pointer-events-none -translate-x-1/2"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl border-2 border-emerald-500 text-xs font-bold">
                ⇔
              </div>
            </div>
          </div>

          {/* Slider instruction */}
          <p className="text-center text-xs text-slate-400">
            👈 Drag slider left and right to inspect before &amp; after comparison 👉
          </p>

          {/* Download & Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={downloadResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Enhanced Image (HD)</span>
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              Enhance Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
