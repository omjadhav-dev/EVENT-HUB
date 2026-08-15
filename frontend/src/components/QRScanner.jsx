import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { X, ScanLine, KeyboardIcon } from "lucide-react";

// Scans QR codes from the camera by grabbing video frames onto a hidden
// canvas and decoding them with jsQR - a pure-JS decoder, so this works
// on any browser that supports getUserMedia (including iOS Safari, which
// doesn't implement the native BarcodeDetector API). Falls back to
// manual code entry if the camera can't be accessed at all.
function QRScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let rafId;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const tick = () => {
          if (cancelled || !videoRef.current) return;
          const video = videoRef.current;

          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code?.data) {
              onDetect(code.data);
              return;
            }
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setCameraError(
            "Couldn't access the camera. You can still enter the ticket code manually below.",
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onDetect(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#13131b] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <ScanLine className="text-violet-400" size={22} />
          <h2 className="text-xl font-bold">Scan Attendee QR</h2>
        </div>

        {!cameraError ? (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-8 border-2 border-violet-400 rounded-xl pointer-events-none animate-pulse" />
          </div>
        ) : (
          <div className="rounded-xl bg-slate-900 border border-gray-800 p-6 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
            <KeyboardIcon size={28} className="text-gray-500" />
            {cameraError}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="mt-5">
          <label className="block text-gray-400 text-sm mb-2">
            Or enter the ticket code manually
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ticket ID"
              className="flex-1 bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer"
            >
              Check In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QRScanner;
