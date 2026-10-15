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
} from 'lucide-react';
import { api } from '../lib/api';

interface ScannerViewProps {
  onScanSuccess?: (result: any) => void;
  onClose: () => void;
  activePassengers?: Array<{
    ticketQrToken: string;
    passengerName: string;
    seatNumbers: string[];
    isCheckedIn: boolean;
  }>;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanSuccess,
  onClose,
  activePassengers = [],
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

  // Validation response state
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
      osc.frequency.setValueAtTime(success ? 880 : 320, audioCtx.currentTime);
      if (success) {
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
      }

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
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
        throw new Error('Camera API not available in this environment');
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
        if (onScanSuccess) {
          onScanSuccess(res);
        }
      } catch (err: any) {
        playSound(false);
        setValidationResult({
          valid: false,
          message: err.message || 'Ticket verification failed on server',
        });
      } finally {
        setValidating(false);
      }
    },
    [validating, onScanSuccess]
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
            return; // stop scanning while validating
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
            setValidationResult({
              valid: false,
              message: 'No readable QR code found in uploaded image.',
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

  return (
    <div className="fixed inset-0 z-50 bg-[#08111e]/98 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between text-white max-w-lg mx-auto w-full pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F28C28]/20 border border-[#F28C28]/40 flex items-center justify-center text-[#F28C28]">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Camera QR Scanner</h2>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Live Ticket Validation Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFacing}
            className="p-2 rounded-xl bg-[#14283d] text-slate-300 hover:text-white border border-[#1b3a5a] transition-colors"
            title="Switch Camera (Front/Rear)"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTorch}
            className={`p-2 rounded-xl border transition-colors ${
              torchOn
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-[#14283d] text-slate-300 hover:text-white border-[#1b3a5a]'
            }`}
            title="Toggle Flashlight"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder / Camera Feed */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 relative max-w-lg mx-auto w-full">
        <div className="relative w-full aspect-square max-h-[360px] rounded-3xl overflow-hidden bg-black border-2 border-[#1e3c5f] shadow-2xl flex items-center justify-center">
          {/* Real Video Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Permission / Fallback State */}
          {cameraError && (
            <div className="p-6 text-center space-y-3 bg-[#0a1726] w-full h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">{cameraError}</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Camera access may be restricted in iframe preview mode. You can test validation instantly using the sample passenger tokens below or upload a QR image.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-[#1a3b5c] text-blue-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#F28C28] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Scanner Viewfinder Box with Laser Sweeper (when scanning active) */}
          {!cameraError && isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-dashed border-[#F28C28]/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                {/* Viewfinder Corners */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#F28C28] rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#F28C28] rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#F28C28] rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#F28C28] rounded-br-lg" />

                {/* Laser animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#F28C28] to-transparent shadow-[0_0_8px_#F28C28] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Validating Spinner Overlay */}
          {validating && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
              <RefreshCw className="w-8 h-8 text-[#F28C28] animate-spin" />
              <span className="text-xs font-bold tracking-wide">Validating with BUSWAY Database...</span>
            </div>
          )}

          {/* Server Validation Result Overlay */}
          {validationResult && (
            <div className="absolute inset-0 p-5 bg-[#0a1827]/95 backdrop-blur-md flex flex-col justify-between text-left animate-in zoom-in-95">
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 ${
                    validationResult.valid
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {validationResult.valid ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-extrabold leading-tight">
                      {validationResult.valid ? 'VALID TICKET - BOARDED' : 'BOARDING DENIED'}
                    </h3>
                    <p className="text-[11px] mt-0.5 opacity-90">{validationResult.message}</p>
                  </div>
                </div>

                {validationResult.valid && (
                  <div className="bg-[#102438] border border-[#1b3a5a] rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passenger:</span>
                      <span className="font-bold text-white text-sm">
                        {validationResult.passengerName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Assigned Seat:</span>
                      <span className="font-mono font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40 text-sm">
                        {validationResult.seatNumbers?.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Journey:</span>
                      <span className="font-semibold text-slate-200">
                        {validationResult.origin} → {validationResult.destination}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Booking Ref:</span>
                      <span className="font-mono text-slate-300">
                        {validationResult.bookingNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleScanNext}
                className="w-full bg-[#F28C28] hover:bg-[#e07b1a] active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#F28C28]/25"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Next Passenger</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input for QR Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Bottom Fast Testing Simulation Bar */}
      <div className="max-w-lg mx-auto w-full space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manifest Quick Validation (Simulate Scan)</span>
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#60a5fa] hover:text-white flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Passenger quick-scan pills from manifest */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {activePassengers.map((p, idx) => (
            <button
              key={idx}
              onClick={() => validateTokenWithServer(p.ticketQrToken)}
              className={`p-2 rounded-xl text-left border shrink-0 transition-all text-xs flex items-center gap-2 ${
                p.isCheckedIn
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 opacity-60'
                  : 'bg-[#102438] hover:bg-[#1a385b] border-[#1b3a5a] text-slate-200'
              }`}
              title={p.isCheckedIn ? 'Already Boarded' : 'Simulate Camera Scan for this passenger'}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#F28C28]" />
              <div>
                <span className="font-bold block leading-none">{p.passengerName}</span>
                <span className="text-[10px] text-slate-400 font-mono">Seat {p.seatNumbers.join(', ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
