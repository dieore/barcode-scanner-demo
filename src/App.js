import { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function App() {
    const [data, setData] = useState("");
    const [active, setActive] = useState(false);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#f9fafb",
                fontFamily: "sans-serif",
            }}
        >
            <h1>📷 Barcode / QR Scanner</h1>

            {!active ? (
                <button
                    onClick={() => setActive(true)}
                    style={{
                        marginTop: 20,
                        padding: "10px 20px",
                        fontSize: 16,
                        borderRadius: 8,
                        border: "none",
                        background: "#2563eb",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                >
                    Activar cámara
                </button>
            ) : (
                <>
                    <BarcodeScannerComponent
                        width={400}
                        height={300}
                        onUpdate={(err, result) => {
                            if (result) setData(result.text);
                        }}
                    />
                    <p style={{ marginTop: 20 }}>
                        Resultado: <strong>{data || "Esperando escaneo..."}</strong>
                    </p>

                    <button
                        onClick={() => setActive(false)}
                        style={{
                            marginTop: 20,
                            padding: "8px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Desactivar cámara
                    </button>
                </>
            )}
        </div>
    );
}

export default App;
