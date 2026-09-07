import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import "../components/Toast.css";

const ToastContext = createContext(null);

export const extractErrorMessage = (err, fallback = "An unexpected error occurred.") => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.response?.data) {
    const data = err.response.data;

    // 1. Array of field errors: [ { field: "eventDate", defaultMessage: "Event date cannot be in the past" } ]
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === "string") return first;
      return first.defaultMessage || first.message || fallback;
    }

    // 2. Object of field errors: { eventDate: "Event date cannot be in the past" }
    if (typeof data.errors === "object" && data.errors !== null && !Array.isArray(data.errors)) {
      const keys = Object.keys(data.errors);
      if (keys.length > 0 && data.errors[keys[0]]) {
        return data.errors[keys[0]];
      }
    }

    // 3. String message
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    // 4. String error
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  return err.message || fallback;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "error", title) => {
      const id = Date.now() + Math.random();
      const resolvedTitle =
        title ||
        (type === "error"
          ? "Error"
          : type === "warning"
          ? "Warning"
          : type === "success"
          ? "Success"
          : "Notice");

      const newToast = {
        id,
        message,
        type,
        title: resolvedTitle,
      };

      // Keep maximum 3 toasts visible at once, newest first
      setToasts((prev) => [newToast, ...prev].slice(0, 3));

      const timer = setTimeout(() => {
        dismissToast(id);
      }, 4500);

      timersRef.current.set(id, timer);
      return id;
    },
    [dismissToast]
  );

  const showError = useCallback(
    (message, title = "Error") => showToast(message, "error", title),
    [showToast]
  );

  const showSuccess = useCallback(
    (message, title = "Success") => showToast(message, "success", title),
    [showToast]
  );

  const showWarning = useCallback(
    (message, title = "Warning") => showToast(message, "warning", title),
    [showToast]
  );

  const showInfo = useCallback(
    (message, title = "Notice") => showToast(message, "info", title),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        dismissToast,
        extractErrorMessage,
      }}
    >
      {children}

      {/* Floating Side Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-container" role="region" aria-label="Notifications">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`side-toast-notification toast-${toast.type}`}
              role="alert"
            >
              <div className="toast-icon-wrapper">
                {toast.type === "warning" && <AlertTriangle size={20} />}
                {toast.type === "error" && <AlertCircle size={20} />}
                {toast.type === "success" && <CheckCircle2 size={20} />}
                {toast.type === "info" && <Info size={20} />}
              </div>
              <div className="toast-body-wrapper">
                <h4 className="toast-title">{toast.title}</h4>
                <p className="toast-text">{toast.message}</p>
              </div>
              <button
                type="button"
                className="toast-close-btn"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
              <div className="toast-progress-bar">
                <div className="toast-progress-track" />
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

