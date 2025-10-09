import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const QRBarcodeScanner = () => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");

  const startScan = async () => {
    if (scanning) return;

    setResult("");
    setScanning(true);

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // 🔹 Inicia escaneo desde cámara trasera con resolución y enfoque
      await reader.decodeFromConstraints(
        {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            focusMode: "continuous", // enfoque automático si el dispositivo lo soporta
          },
        },
        videoRef.current,
        (res, err) => {
          if (res) {
            setResult(res.getText());
            // 👇 comentar la siguiente línea si querés escanear varios códigos seguidos
            // stopScan();
          }
          // ignorar errores normales de detección
        }
      );
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      alert("No se pudo acceder a la cámara. Verifica permisos.");
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.stopContinuousDecode();
      } catch (err) {
        console.error("Error al detener cámara:", err);
      }
      readerRef.current = null;
    }
    setScanning(false);
  };

  // Limpieza al desmontar
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
