import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error' | 'warning';
}

interface ToastContextType {
    addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`p-4 rounded shadow-2xl border min-w-[300px] flex justify-between items-start gap-4 ${toast.type === 'success' ? 'bg-green-950/90 border-green-900 text-green-100' :
                                    toast.type === 'error' ? 'bg-red-950/90 border-red-900 text-red-100' :
                                        toast.type === 'warning' ? 'bg-yellow-950/90 border-yellow-900 text-yellow-100' :
                                            'bg-zinc-900/90 border-zinc-700 text-zinc-100'
                                }`}
                        >
                            <div>
                                {toast.type === 'success' && <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-1">New Lead Found</div>}
                                {toast.type === 'info' && <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">System Alert</div>}
                                <div className="text-sm">{toast.message}</div>
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white">✕</button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
