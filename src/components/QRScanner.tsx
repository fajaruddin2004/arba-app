"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }: { onScanSuccess: (text: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    hasScannedRef.current = false;
    let isMounted = true;

    // Use a unique ID to avoid conflicts when re-mounting
    const readerId = "qr-reader-" + Date.now();
    if (containerRef.current) {
      containerRef.current.id = readerId;
    }

    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode(readerId);
        scannerRef.current = html5Qrcode;

        // Gunakan { facingMode: "environment" } agar browser otomatis memilih kamera belakang utama
        // Ini menghindari masalah salah pilih lensa (misal lensa macro/IR yang menampilkan color bars)
        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            // Stop scanner immediately
            html5Qrcode.stop().catch(() => {});
            onScanSuccess(decodedText);
          },
          () => {
            // Error per frame — ignore (normal when no QR detected)
          }
        );

        if (isMounted) {
          setIsStarting(false);
        }
      } catch (err: any) {
        console.error("QR Scanner error:", err);
        if (isMounted) {
          if (err?.toString()?.includes("NotAllowedError") || err?.toString()?.includes("Permission")) {
            setError("Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.");
          } else {
            setError("Gagal membuka kamera: " + (err?.message || err?.toString() || "Unknown error"));
          }
          setIsStarting(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(startScanner, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full text-center">
      {isStarting && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Membuka kamera...</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      <div
        ref={containerRef}
        id="qr-reader-init"
        className="overflow-hidden rounded-xl border-2 border-amber-500/50"
        style={{ minHeight: isStarting ? 0 : 300 }}
      />
      {!error && !isStarting && (
        <p className="mt-4 text-xs text-stone-400">Posisikan QR Code di dalam area kotak</p>
      )}
    </div>
  );
}
