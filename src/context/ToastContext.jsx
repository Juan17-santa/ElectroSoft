import { createContext, useCallback, useContext, useRef, useState } from "react";
import Alert from "../feature/dashboard/components/ui/Alert";

const ToastContext = createContext(null);

const EXIT_ANIMATION_MS = 350;
const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        delete timersRef.current[id];
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        setTimeout(() => removeToast(id), EXIT_ANIMATION_MS);
    }, [removeToast]);

    const showToast = useCallback((type, message, duration = DEFAULT_DURATION) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        timersRef.current[id] = setTimeout(() => dismissToast(id), duration);
    }, [dismissToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-3 items-stretch sm:items-end">
                {toasts.map((toast) => (
                    <Alert
                        key={toast.id}
                        type={toast.type}
                        message={toast.message}
                        isLeaving={toast.leaving}
                        onClose={() => dismissToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast debe usarse dentro de <ToastProvider>");
    }
    return context;
}
