import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

// PUBLIC_INTERFACE
export function useToast() {
  /** Access toast methods. */
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provider for toasts showing ephemeral messages in a stack. */
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((type, message, timeout = 2000) => {
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { id, type, message }]);
    if (timeout) {
      setTimeout(() => remove(id), timeout);
    }
  }, [remove]);

  const api = useMemo(() => ({
    // PUBLIC_INTERFACE
    success(msg, timeout) { push("success", msg, timeout); },
    // PUBLIC_INTERFACE
    error(msg, timeout) { push("error", msg, timeout); },
    // PUBLIC_INTERFACE
    info(msg, timeout) { push("info", msg, timeout); },
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.type}`} role="alert">
            <span>{t.message}</span>
            <button className="btn ghost" onClick={() => remove(t.id)} aria-label="Dismiss notification">✕</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
