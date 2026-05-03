"use client";

import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }: { onScanSuccess: (text: string) => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasScannedRef = useRef(false); // Lock agar tidak scan berkali-kali

  useEffect(() => {
    hasScannedRef.current = false;

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 5, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // KUNCI: Cegah callback dipanggil berkali-kali
        if (hasScannedRef.current) return;
        hasScannedRef.current = true;

        // Hentikan scanner segera
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Diabaikan — terjadi setiap frame saat belum ada QR
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []); // Hanya jalankan sekali saat mount

  return (
    <div className="w-full text-center">
      <div id="reader" className="overflow-hidden rounded-xl bg-black border-2 border-amber-500/50"></div>
      <p className="mt-4 text-xs text-stone-400">Posisikan QR Code di dalam area</p>
    </div>
  );
}
