import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInTicket } from "../api/organizerApi";
import { useToast } from "../context/ToastContext";
import "./Organizer.css";

export default function CheckInPage() {
  const { showError, showSuccess, extractErrorMessage } = useToast();
  const [scanMode, setScanMode] = useState("CAMERA"); // "CAMERA" | "MANUAL"
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef(null);

  // Initialize and start camera scanner
  const startCamera = async () => {
    setResult(null);

    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Prioritize back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // On successful QR scan
          handleScannedQr(decodedText);
        },
        (errorMessage) => {
          // Scanner frame error (silent)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Camera start error:", err);
      setIsScanning(false);
      showError(
        "Could not access camera. Please allow camera permissions or use Manual Input mode.",
        "Camera Permission"
      );
    }
  };

  // Stop camera stream safely
  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Camera stop warning:", err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Process a scanned QR code
  const handleScannedQr = async (scannedPayload) => {
    await stopCamera();
    setLoading(true);
    setResult(null);

    try {
      const response = await checkInTicket(scannedPayload.trim());
      setResult(response.data);
      showSuccess(response.data?.message || "Check-in successful!", "Ticket Validated");
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Invalid, expired, or already used ticket QR code."
      );
      showError(msg, "Check-In Failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual input form submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await checkInTicket(qrCodeInput.trim());
      setResult(response.data);
      setQrCodeInput("");
      showSuccess(response.data?.message || "Check-in successful!", "Ticket Validated");
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Invalid, expired, or already used ticket QR code."
      );
      showError(msg, "Check-In Failed");
    } finally {
      setLoading(false);
    }
  };

  // Start camera when entering CAMERA mode and result is cleared
  useEffect(() => {
    if (scanMode === "CAMERA" && !result && !loading) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMode, result]);

  const handleScanNext = () => {
    setResult(null);
    setQrCodeInput("");
    if (scanMode === "CAMERA") {
      startCamera();
    }
  };

  return (
    <div className="organizer-container">
      <div className="checkin-card">
        <h1
          style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "8px" }}
        >
          Attendee Check-In
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            marginBottom: "20px",
          }}
        >
          Scan attendee's ticket QR code via camera or enter the code manually to
          validate their entry.
        </p>

        {/* Mode Selector Tabs */}
        <div className="checkin-mode-tabs">
          <button
            type="button"
            className={`tab-btn ${scanMode === "CAMERA" ? "active" : ""}`}
            onClick={() => {
              setScanMode("CAMERA");
            }}
          >
            📸 Live Camera Scanner
          </button>
          <button
            type="button"
            className={`tab-btn ${scanMode === "MANUAL" ? "active" : ""}`}
            onClick={() => {
              setScanMode("MANUAL");
            }}
          >
            ⌨️ Manual Entry
          </button>
        </div>

        {/* CAMERA SCANNER VIEW */}
        {scanMode === "CAMERA" && !result && (
          <div className="scanner-container">
            <div id="qr-reader" className="qr-reader-viewport"></div>
            {isScanning && (
              <p className="scanner-hint">
                🎯 Point camera at the Attendee's ticket QR code
              </p>
            )}
            {loading && (
              <p style={{ marginTop: "12px", fontWeight: "600", color: "var(--primary)" }}>
                ⏳ Validating Ticket...
              </p>
            )}
          </div>
        )}

        {/* MANUAL INPUT VIEW */}
        {scanMode === "MANUAL" && !result && (
          <form onSubmit={handleManualSubmit} className="auth-form" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <input
                type="text"
                required
                placeholder="Paste or type ticket QR payload UUID..."
                className="form-input"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? "Verifying..." : "Validate & Check-In"}
            </button>
          </form>
        )}

        {/* SUCCESS VERIFICATION DISPLAY */}
        {result && (
          <div className="checkin-result">
            <h4>✅ {result.message || "Check-In Successful!"}</h4>
            <div className="checkin-details-row">
              <strong>Attendee:</strong> <span>{result.userName}</span>
            </div>
            <div className="checkin-details-row">
              <strong>Event:</strong> <span>{result.eventName}</span>
            </div>
            <div className="checkin-details-row">
              <strong>Ticket Tier:</strong> <span>{result.ticketType}</span>
            </div>
            <div className="checkin-details-row">
              <strong>Ticket Number:</strong> <span>{result.ticketNumber}</span>
            </div>

            <button
              onClick={handleScanNext}
              className="btn-auth-submit"
              style={{ marginTop: "20px", width: "100%" }}
            >
              📷 Scan Next Attendee
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
