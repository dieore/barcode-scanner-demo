import React, { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const QRScanner = () => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [reader] = useState(() => new BrowserMultiFormatReader());

  const startScan = async () => {
    if (scanning) return;
    setResult("");
    setScanning(true);

    try {
      const devices = await reader.listVideoInputDevices();
      const backCam =
        devices.find((d) => d.label.toLowerCase().includes("back")) ||
        devices[0];

      await reader.decodeFromVideoDevice(
        backCam.deviceId,
        videoRef.current,
        (res, err) => {
          if (res) {
            setResult(res.getText());
            stopScan();
          }
        }
      );
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      setScanning(false);
    }
  };

  const stopScan = () => {
    reader.reset();
    setScanning(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>Escáner QR / Código de Barras</h2>

      <div
        style={{
          width: 300,
          height: 300,
          border: "2px solid #000",
          margin: "1rem auto",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {!scanning ? (
        <button onClick={startScan}>📷 Iniciar escaneo</button>
      ) : (
        <button onClick={stopScan}>🛑 Detener</button>
      )}

      {result && (
        <p style={{ marginTop: "1rem" }}>
          <strong>Resultado:</strong> {result}
        </p>
      )}
    </div>
  );
};

export default QRScanner;
