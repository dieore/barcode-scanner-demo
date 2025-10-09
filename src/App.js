import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const QRBarcodeScanner = () => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const lastResultRef = useRef(""); // para ignorar duplicados consecutivos
  const scanningRef = useRef(false); // ref para verificar estado en callback

  // 🔊 beep usando Web Audio API (funciona sin autoplay)
  const beep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime); // 1000Hz
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1); // 0.1s beep
  };

  const startScan = async () => {
    if (scanning) return;

    setResult("");
    lastResultRef.current = "";
    setScanning(true);
    scanningRef.current = true;

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      await reader.decodeFromConstraints(
        {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            focusMode: "continuous", // intenta enfoque automático
          },
        },
        videoRef.current,
        (res, err) => {
          if (res && scanningRef.current) {
            const text = res.getText();
            // 🚫 ignorar si es el mismo código que el último
            if (text === lastResultRef.current) return;

            lastResultRef.current = text;
            setResult(text);
            beep();
          }
        }
      );
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      alert("No se pudo acceder a la cámara. Verifica permisos.");
      setScanning(false);
      scanningRef.current = false;
    }
  };

  const stopScan = () => {
    scanningRef.current = false;
    setScanning(false);
    
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (err) {
        console.error("Error al detener decodificador:", err);
      }
      readerRef.current = null;
    }
    
    // Detener el stream de video
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // limpieza al desmontar
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>📷 Escáner QR y Códigos de Barra</h2>

      <div
        style={{
          width: 320,
          height: 320,
          margin: "1rem auto",
          border: "2px solid #000",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
          autoPlay
          playsInline // importante para móviles
          
        />
      </div>

      {!scanning ? (
        <button onClick={startScan} style={{ padding: "0.5rem 1rem" }}>
          📷 Iniciar escaneo
        </button>
      ) : (
        <button onClick={stopScan} style={{ padding: "0.5rem 1rem" }}>
          🛑 Detener
        </button>
      )}

      {result && (
        <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>
          <strong>Resultado:</strong> {result}
        </p>
      )}
    </div>
  );
};

export default QRBarcodeScanner;
