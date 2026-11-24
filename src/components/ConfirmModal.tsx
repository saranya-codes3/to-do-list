import { motion } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="fixed inset-0 bg-[#262A26]/35 dark:bg-black/65 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] shadow-xl p-6"
      >
        <h2
          id="confirm-modal-title"
          className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]"
        >
          {title}
        </h2>
        <p className="text-sm text-[#5C645C] dark:text-[#AAB5AC] mt-2 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#525A52] dark:text-[#B3BDB5] hover:bg-[#FAF7F0] dark:hover:bg-[#2A332D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#9B4D42] dark:bg-[#E8CFC8] text-[#FFFDF9] dark:text-[#2A1815] text-sm font-semibold hover:bg-[#823D34] dark:hover:bg-[#DFBEB5] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
