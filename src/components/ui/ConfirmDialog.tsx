import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl max-w-sm w-full p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-full ${danger ? 'bg-red-500/10' : 'bg-[var(--primary-glow)]'}`}>
                <AlertTriangle size={20} className={danger ? 'text-red-500' : 'text-[var(--primary)]'} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)]">{title}</h3>
                <p className="text-sm text-[var(--text-dim)] mt-1">{message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--surface2)] transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm rounded-lg font-medium text-white transition-all ${
                  danger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[var(--primary)] hover:opacity-90'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
