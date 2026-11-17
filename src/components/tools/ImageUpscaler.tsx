import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, UploadCloud, Download, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageUpscalerProps {
  onBack: () => void;
}

export const ImageUpscaler: React.FC<ImageUpscalerProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setErrorMsg('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setUpscaledUrl(null);
    setProgress(0);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const startUpscale = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(10);
    setStatusText('Uploading photo to neural upscaling server...');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('myfile', selectedFile);

    try {
      const uploadRes = await fetch('/api/hd-upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.error || !uploadData.code) {
        throw new Error(uploadData.message || 'Upload failed');
      }

      setStatusText('Processing 4X Super Resolution Upscaling...');
      pollStatus(uploadData.code);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to start upscale process');
      setIsProcessing(false);
    }
  };

  const pollStatus = (code: string) => {
    let tries = 0;
    const maxTries = 40;

    const interval = setInterval(async () => {
      tries++;
      setProgress(Math.min(95, Math.round(15 + (tries / maxTries) * 80)));

      try {
        const res = await fetch('/api/hd-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, scaleRadio: 4 }),
        });

        const result = await res.json();
        if (result.code === 200 && result.data?.status === 'success') {
          clearInterval(interval);
          setProgress(100);
          setStatusText('Upscaled 4X Successfully! ✅');
          const finalUrl = result.data.downloadUrls[0];
          setUpscaledUrl(finalUrl);
          setIsProcessing(false);
        } else if (result.data?.status === 'failed') {
          clearInterval(interval);
          throw new Error('Upscaling engine failed to process image');
        }
      } catch (err: any) {
        clearInterval(interval);
        setErrorMsg(err.message || 'Status check failed');
        setIsProcessing(false);
      }

      if (tries >= maxTries) {
        clearInterval(interval);
        setErrorMsg('Process timed out. Please try again.');
        setIsProcessing(false);
      }
    }, 2500);
  };

  const downloadImage = () => {
    if (!upscaledUrl) return;
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(upscaledUrl)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = `Upscaled_4X_${selectedFile?.name || 'image.png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUpscaledUrl(null);
    setProgress(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              <span className="text-xl">✨</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">AI Image Upscaler</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                4X Scale
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Increase image resolution by 400% with AI deep learning super-resolution
            </p>
          </div>
        </div>

        {upscaledUrl && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Upscale Another</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="my-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!previewUrl && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="my-8 border-2 border-dashed border-white/15 hover:border-cyan-500/50 rounded-3xl p-10 sm:p-14 text-center cursor-pointer bg-white/[0.02] hover:bg-cyan-500/[0.03] transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            Select an image to upscale 4X
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            Free Fire wallpapers, guild logos, character screenshots, banner art
          </p>
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
            Powered by ImgLarger Super-Resolution Model
          </span>
        </div>
      )}

      {/* Processing or Action */}
      {previewUrl && !upscaledUrl && (
        <div className="my-6 max-w-md mx-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#050810] shadow-xl">
            <img
              src={previewUrl}
              alt="Source"
              className="w-full max-h-[350px] object-contain mx-auto"
            />
          </div>

          {isProcessing ? (
            <div className="space-y-3 bg-[#050810] p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                  {statusText}
                </span>
                <span className="font-mono text-slate-300">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
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
                onClick={startUpscale}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-[0_0_25px_rgba(0,212,255,0.35)] hover:shadow-[0_0_35px_rgba(0,212,255,0.55)] transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start 4X Upscale</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result Display */}
      {upscaledUrl && (
        <div className="my-6 max-w-xl mx-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#050810] shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <img
              src={`/api/proxy-image?url=${encodeURIComponent(upscaledUrl)}`}
              alt="Upscaled result"
              className="w-full max-h-[450px] object-contain mx-auto"
            />
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-500 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              4X Ultra HD
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={downloadImage}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download 4X Image</span>
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              Upscale Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
