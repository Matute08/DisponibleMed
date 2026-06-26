import { PropsWithChildren } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`rounded-lg border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70 backdrop-blur ${className}`}>{children}</section>;
}

export function Button({ children, loading, className = '', ...props }: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }>) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-med-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-med-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-med-600 focus:ring-4 focus:ring-med-100" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-med-600 focus:ring-4 focus:ring-med-100" {...props} />;
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`h-7 w-12 rounded-full p-1 shadow-inner transition ${checked ? 'bg-med-600' : 'bg-slate-300'}`}>
      <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export function EmptyState({ title }: { title: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-600">{title}</div>;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ color: '#475569', fontSize: 14 }}>{description}</DialogContent>
      <DialogActions sx={{ padding: '16px 24px 20px' }}>
        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={onCancel}>Cancelar</button>
        <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={onConfirm}>{confirmLabel}</button>
      </DialogActions>
    </Dialog>
  );
}
