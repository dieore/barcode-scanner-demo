import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = () => {
  const qrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState(null);

  const startScan = async () => {
    if (scanning) return;

    const elementId = "qr-reader";
    const qr = new Html5Qrcode(elementId);
    setHtml5QrCode(qr);
    setResult("");

    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        alert("No se encontraron cámaras");
        return;
      }

      const cameraId =
        devices.find((d) => d.label.toLowerCase().includes("back"))
          ?.id || devices[0].id;

      await qr.start(
        { deviceId: { exact: cameraId } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setResult(decodedText);
          stopScan(); // detener después de leer uno
        },
        (errorMessage) => {
          // errores de lectura normales, ignorar
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Error al iniciar escaneo:", err);
      alert("Error al iniciar cámara");
    }
  };

  const stopScan = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        await html5QrCode.clear();
      } catch (err) {
        console.error("Error al detener cámara:", err);
      }
      setScanning(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>Escáner QR / Código de Barras</h2>

      <div
        id="qr-reader"
        ref={qrRef}
        style={{
          width: "300px",
          height: "300px",
          border: "2px solid #000",
          margin: "1rem auto",
        }}
      />

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
