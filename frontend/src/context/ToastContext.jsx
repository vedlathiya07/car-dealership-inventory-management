import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => removeToast(t.id)}
                        className={`p-4 rounded-2xl shadow-lg border text-sm font-bold flex items-center justify-between cursor-pointer pointer-events-auto transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-5 ${
                            t.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : t.type === 'error'
                                ? 'bg-rose-50 text-rose-800 border-rose-100'
                                : 'bg-blue-50 text-blue-800 border-blue-100'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">
                                {t.type === 'success' ? '🟢' : t.type === 'error' ? '🔴' : '🔵'}
                            </span>
                            <span>{t.message}</span>
                        </div>
                        <button className="ml-4 text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return { showToast: () => {} };
    }
    return context;
}
