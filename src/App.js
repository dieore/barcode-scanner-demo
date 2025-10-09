import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const QRBarcodeScanner = () => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const streamRef = useRef(null); // guardar referencia al stream
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [flashOn, setFlashOn] = useState(false);
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

      // ⚡ Configurar hints para optimizar velocidad de detección
      const hints = new Map();
      const { DecodeHintType, BarcodeFormat } = await import("@zxing/library");
      
      // Intentar más rápido con menos precisión
      hints.set(DecodeHintType.TRY_HARDER, false); // false = más rápido
      
      // 🎯 Solo QR y códigos de barras más comunes (2-3x más rápido)
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,        // QR codes
        // BarcodeFormat.EAN_13,         // Barcode productos (13 dígitos)
        BarcodeFormat.EAN_8,          // Barcode productos (8 dígitos)
        BarcodeFormat.CODE_128,       // Barcode alfanumérico común
        BarcodeFormat.CODE_39,        // Barcode alfanumérico
        // BarcodeFormat.UPC_A,          // Barcode USA/Canadá
        // BarcodeFormat.UPC_E,          // Barcode USA/Canadá compacto
      ]);

      reader.hints = hints;

      await reader.decodeFromConstraints(
        {
          video: {
            facingMode: "environment",
            // 🎯 Resolución alta para mejor detección
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            // 🚀 Framerate alto para capturar más frames
            frameRate: { ideal: 60, min: 30 },
            // 📸 Enfoque continuo y automático
            focusMode: "continuous",
            // Otras optimizaciones de cámara
            aspectRatio: { ideal: 16/9 },
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

      // Guardar referencia al stream para controlar flash/enfoque
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject;
      }
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
    setFlashOn(false);
    
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
    
    streamRef.current = null;
  };

  // 💡 Toggle flash (linterna)
  // const toggleFlash = async () => {
  //   if (!streamRef.current) return;

  //   const track = streamRef.current.getVideoTracks()[0];
  //   if (!track) return;

  //   try {
  //     const capabilities = track.getCapabilities();
  //     if (capabilities.torch) {
  //       await track.applyConstraints({
  //         advanced: [{ torch: !flashOn }]
  //       });
  //       setFlashOn(!flashOn);
  //     } else {
  //       alert("Tu dispositivo no soporta flash/linterna");
  //     }
  //   } catch (err) {
  //     console.error("Error al controlar flash:", err);
  //     alert("No se pudo activar el flash");
  //   }
  // };

  // 🎯 Forzar enfoque manual
  // const triggerFocus = async () => {
  //   if (!streamRef.current) return;

  //   const track = streamRef.current.getVideoTracks()[0];
  //   if (!track) return;

  //   try {
  //     const capabilities = track.getCapabilities();
  //     if (capabilities.focusMode && capabilities.focusMode.includes('single-shot')) {
  //       // Cambiar temporalmente a single-shot para forzar enfoque
  //       await track.applyConstraints({
  //         advanced: [{ focusMode: 'single-shot' }]
  //       });
  //       // Volver a continuous después de un momento
  //       setTimeout(async () => {
  //         try {
  //           await track.applyConstraints({
  //             advanced: [{ focusMode: 'continuous' }]
  //           });
  //         } catch (e) {
  //           console.error("Error al volver a continuous:", e);
  //         }
  //       }, 500);
  //     } else {
  //       alert("Tu dispositivo no soporta enfoque manual");
  //     }
  //   } catch (err) {
  //     console.error("Error al enfocar:", err);
  //     alert("No se pudo enfocar");
  //   }
  // };

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

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        {!scanning ? (
          <button onClick={startScan} style={{ padding: "0.5rem 1rem" }}>
            📷 Iniciar escaneo
          </button>
        ) : (
          <>
            <button onClick={stopScan} style={{ padding: "0.5rem 1rem" }}>
              🛑 Detener
            </button>
            {/* <button 
              onClick={toggleFlash} 
              style={{ 
                padding: "0.5rem 1rem",
                backgroundColor: flashOn ? "#ffd700" : "#fff",
                border: "1px solid #000"
              }}
            >
              {flashOn ? "💡 Flash ON" : "🔦 Flash"}
            </button>
            <button onClick={triggerFocus} style={{ padding: "0.5rem 1rem" }}>
              🎯 Enfocar
            </button> */}
          </>
        )}
      </div>

      {result && (
        <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>
          <strong>Resultado:</strong> {result}
        </p>
      )}
    </div>
  );
};

export default QRBarcodeScanner;
