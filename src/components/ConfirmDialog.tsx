"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<{ options: ConfirmOptions; resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    if (dialog) {
      dialog.resolve(true);
      setDialog(null);
    }
  };

  const handleCancel = () => {
    if (dialog) {
      dialog.resolve(false);
      setDialog(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 bg-black/40 z-[9998]"
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-8 max-w-md shadow-2xl pointer-events-auto relative overflow-hidden">
                {/* Accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${dialog.options.isDangerous ? 'bg-red-500' : 'bg-blue-500'}`} />

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  {dialog.options.isDangerous ? (
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {dialog.options.title || (dialog.options.isDangerous ? "Confirmar ação" : "Confirmar")}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      {dialog.options.message}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {dialog.options.cancelText || "Cancelar"}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${
                      dialog.options.isDangerous
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {dialog.options.confirmText || "Confirmar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context.confirm;
}
