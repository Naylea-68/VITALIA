import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CheckCircle2, QrCode, X } from 'lucide-react';
import { Recipe } from '../types/vitalia';
import { extractQrCodeFromScan, RecipeQrGrid } from './RecipeQrGrid';

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  open,
  onClose,
  recipes,
  onSelectRecipe,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
      setDetectedMessage(null);
      setCameraError(null);
      return () => stopCamera();
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      stopCamera();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleDecodedCode = (rawCode: string) => {
    const normalized = extractQrCodeFromScan(rawCode);
    const matched = recipes.find(
      (r) => r.qrCode.toUpperCase() === normalized || r.id.toUpperCase() === normalized
    );
    if (matched) {
      stopCamera();
      setDetectedMessage(`Código reconocido: ${matched.name}`);
      onSelectRecipe(matched);
      onClose();
    } else {
      setDetectedMessage('El código leído no corresponde a una receta registrada en VITALIA.');
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setDetectedMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Este navegador no permite abrir la cámara aquí. Puedes escanear cualquier código QR directamente con la cámara de tu celular.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          scanLoop();
        }
      }, 100);
    } catch {
      setCameraError(
        'No se otorgó permiso de cámara o no hay cámara disponible. También puedes escanear los códigos con tu celular.'
      );
      setCameraActive(false);
    }
  };

  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code?.data) {
          handleDecodedCode(code.data);
          return;
        }
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Códigos QR VITALIA para escanear"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-3xl max-h-[92dvh] rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Códigos QR VITALIA</h2>
              <p className="text-xs text-slate-500">
                Escanea con tu celular para abrir la receta al instante
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de códigos QR"
            className="min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F6FAF7]">
          {/* Compact camera scanner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {cameraActive ? (
              <div className="space-y-3 text-center">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video max-h-60 mx-auto">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none" />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <button
                  type="button"
                  onClick={stopCamera}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Detener cámara
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700">
                    Apunta con la cámara de tu celular a cualquier código QR o activa el lector aquí.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="shrink-0 min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Escanear con cámara</span>
                </button>
              </div>
            )}

            {cameraError && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                {cameraError}
              </p>
            )}

            {detectedMessage && (
              <p className="mt-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{detectedMessage}</span>
              </p>
            )}
          </div>

          {/* Functional scannable QR codes */}
          <RecipeQrGrid
            recipes={recipes}
            onSelectRecipe={(recipe) => {
              stopCamera();
              onSelectRecipe(recipe);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
