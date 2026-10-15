import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  FlipHorizontal,
  Flashlight,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Upload,
  UserCheck,
  Armchair,
  Check,
} from 'lucide-react';
import { api } from '../lib/api';

interface ScannerViewProps {
  onScanSuccess?: (result: any) => void;
  onScanFail?: (result: any) => void;
  onClose?: () => void;
  activePassengers?: Array<{
    ticketQrToken: string;
    passengerName: string;
    seatNumbers: string[];
    isCheckedIn: boolean;
  }>;
  isInline?: boolean;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanSuccess,
  onScanFail,
  onClose,
  activePassengers = [],
  isInline = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [validating, setValidating] = useState(false);

  // Validation response state for immediate feedback overlay
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    passengerName?: string;
    seatNumbers?: string[];
    origin?: string;
    destination?: string;
    bookingNumber?: string;
    vehicleRegistration?: string;
  } | null>(null);

  // Play pleasant audio tone on scan
  const playSound = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = success ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(success ? 880 : 280, audioCtx.currentTime);
      if (success) {
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
      }

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } catch {
      // AudioContext may be restricted before user gesture
    }
  };

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser/frame');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera not accessible in this environment.'
      );
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Server-side Ticket Validation call
  const validateTokenWithServer = useCallback(
    async (token: string) => {
      if (validating) return;
      setIsScanning(false);
      setValidating(true);

      try {
        const res = await api.verifyTicket(token);
        playSound(res.valid);
        setValidationResult(res);
        if (res.valid) {
          if (onScanSuccess) onScanSuccess(res);
        } else {
          if (onScanFail) onScanFail(res);
        }
      } catch (err: any) {
        playSound(false);
        const failRes = {
          valid: false,
          message: err.message || 'Ticket verification failed on server database',
        };
        setValidationResult(failRes);
        if (onScanFail) onScanFail(failRes);
      } finally {
        setValidating(false);
      }
    },
    [validating, onScanSuccess, onScanFail]
  );

  // Real-time Video Frame Processing Loop with jsQR
  useEffect(() => {
    if (!isScanning) return;

    let animationFrameId: number;

    const scanFrame = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && code.data.trim().length > 0) {
            validateTokenWithServer(code.data.trim());
            return; // stop loop while processing validation
          }
        }
      }

      if (isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
    };

    animationFrameId = requestAnimationFrame(scanFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScanning, validateTokenWithServer]);

  // Toggle Camera Facing
  const toggleFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && (track.getCapabilities as any)?.()?.torch) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } catch (err) {
        console.warn('Torch failed:', err);
      }
    }
  };

  // Upload QR Image File Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            validateTokenWithServer(code.data);
          } else {
            playSound(false);
            setValidationResult({
              valid: false,
              message: 'No readable QR code found in uploaded image file.',
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Resume Scanner for next passenger
  const handleScanNext = () => {
    setValidationResult(null);
    setIsScanning(true);
  };

  const containerClasses = isInline
    ? 'w-full relative space-y-3'
    : 'fixed inset-0 z-50 bg-[#08111e]/98 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in select-none';

  return (
    <div className={containerClasses}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between text-white w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F28C28]/20 border border-[#F28C28]/40 flex items-center justify-center text-[#F28C28]">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">Camera QR Scanner</h3>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Live Database Validation Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleFacing}
            className="p-2 rounded-xl bg-[#14283d] text-slate-300 hover:text-white border border-[#1b3a5a] transition-colors"
            title="Switch Camera (Front/Rear)"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleTorch}
            className={`p-2 rounded-xl border transition-colors ${
              torchOn
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-[#14283d] text-slate-300 hover:text-white border-[#1b3a5a]'
            }`}
            title="Toggle Flashlight"
          >
            <Flashlight className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Scanner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Camera Viewfinder Container */}
      <div className="relative w-full aspect-square max-h-[320px] sm:max-h-[350px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-[#1e3c5f] shadow-2xl flex items-center justify-center">
        {/* Real Video Feed */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Permission / Fallback State */}
        {cameraError && (
          <div className="p-4 sm:p-6 text-center space-y-2.5 bg-[#0a1726] w-full h-full flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-200">{cameraError}</p>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              In preview iframes, camera hardware may be simulated. Test instant QR validation using passenger tokens or file upload below.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-[#1a3b5c] text-blue-200 text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#F28C28] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Scanner Viewfinder Box with Laser Sweeper (when scanning is active) */}
        {!cameraError && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-dashed border-[#F28C28]/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Viewfinder Corners */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#F28C28] rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#F28C28] rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#F28C28] rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#F28C28] rounded-br-lg" />

              {/* Pulsing laser line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#F28C28] to-transparent shadow-[0_0_10px_#F28C28] animate-pulse absolute top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Validating Progress Spinner */}
        {validating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white z-20">
            <RefreshCw className="w-7 h-7 text-[#F28C28] animate-spin" />
            <span className="text-xs font-bold tracking-wide">Validating with BUSWAY Database...</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* IMMEDIATE SUCCESS / FAIL UI FEEDBACK OVERLAY AFTER SCANNING A QR CODE     */}
        {/* ========================================================================= */}
        {validationResult && (
          <div className="absolute inset-0 p-4 sm:p-5 bg-[#091524]/95 backdrop-blur-lg flex flex-col justify-between text-left animate-in zoom-in-95 z-30">
            <div className="space-y-3">
              {/* Status Header Pill */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3 shadow-xl ${
                  validationResult.valid
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-4 ring-emerald-500/10'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-4 ring-rose-500/10'
                }`}
              >
                {validationResult.valid ? (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-rose-500/30 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                    {validationResult.valid ? 'Boarding Approved' : 'Boarding Rejected'}
                  </h4>
                  <p className="text-[11px] mt-0.5 opacity-90 leading-snug">
                    {validationResult.message}
                  </p>
                </div>
              </div>

              {/* Success Passenger Manifest Card */}
              {validationResult.valid ? (
                <div className="bg-[#102438] border border-[#1b3a5a] rounded-xl p-3.5 space-y-2.5 text-xs shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Passenger</span>
                    <span className="font-extrabold text-white text-sm">
                      {validationResult.passengerName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5 text-slate-400" />
                      Assigned Seat
                    </span>
                    <span className="font-mono font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-2.5 py-0.5 rounded-md border border-amber-500 text-sm shadow">
                      {validationResult.seatNumbers?.join(', ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Boarding Route</span>
                    <span className="font-semibold text-slate-200">
                      {validationResult.origin} → {validationResult.destination}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-500">Booking Ref</span>
                    <span className="font-mono text-slate-400">
                      {validationResult.bookingNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3 text-[11px] text-rose-300 space-y-1">
                  <p className="font-bold text-rose-200">Security Warning:</p>
                  <p className="text-slate-300">
                    This ticket cannot be used for boarding. If the passenger was previously boarded, check the manifest list for timestamp verification.
                  </p>
                </div>
              )}
            </div>

            {/* Scan Next Action Button */}
            <button
              type="button"
              onClick={handleScanNext}
              className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                validationResult.valid
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                  : 'bg-[#F28C28] hover:bg-[#e07b1a] text-white shadow-[#F28C28]/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Scan Next Passenger</span>
            </button>
          </div>
        )}

        {/* Hidden File Input for QR Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Fast Manifest Quick-Scan Simulator Pills */}
      <div className="w-full space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Passenger QR Scan</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[#60a5fa] hover:text-white flex items-center gap-1 text-[11px]"
          >
            <Upload className="w-3 h-3" />
            <span>Upload QR Image</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {activePassengers.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => validateTokenWithServer(p.ticketQrToken)}
              className={`p-2 rounded-xl text-left border shrink-0 transition-all text-xs flex items-center gap-2 ${
                p.isCheckedIn
                  ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300 opacity-60'
                  : 'bg-[#0a1827] hover:bg-[#152e47] border-[#1b3a5a] text-slate-200'
              }`}
              title={p.isCheckedIn ? 'Already Boarded' : 'Simulate Camera Scan for this passenger'}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#F28C28]" />
              <div>
                <span className="font-bold block leading-none">{p.passengerName}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Seat {p.seatNumbers.join(', ')} {p.isCheckedIn && '✓'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
