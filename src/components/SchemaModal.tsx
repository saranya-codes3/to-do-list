import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SNIPPET = `-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT,
  category TEXT DEFAULT 'Personal',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE USING (auth.uid() = user_id);`;

export default function SchemaModal({ isOpen, onClose }: SchemaModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
    >
      <div
        className="fixed inset-0 bg-[#262A26]/35 dark:bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] shadow-xl p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2
              id="schema-modal-title"
              className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]"
            >
              Supabase Setup & SQL Schema
            </h2>
            <p className="text-xs text-[#6B7268] dark:text-[#9CA89E] mt-1">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, then run supabase/schema.sql.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup guide"
            className="p-2 -mr-2 -mt-1 rounded-xl text-[#6B7268] dark:text-[#9CA89E] hover:bg-[#FAF7F0] dark:hover:bg-[#2A332D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 overflow-auto rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] p-4">
          <button
            type="button"
            onClick={handleCopy}
            className="sticky top-0 float-right inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-xs font-medium text-[#344E41] dark:text-[#A3B18A] hover:bg-[#EDE5D8]/50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </>
            )}
          </button>
          <pre className="text-xs font-mono text-[#344E41] dark:text-[#C8D1C9] whitespace-pre-wrap leading-relaxed">
            {SQL_SNIPPET}
          </pre>
        </div>
      </div>
    </div>
  );
}
