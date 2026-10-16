import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { create } from 'zustand';

type ToastState = { msg: string | null; kind: 'success' | 'error'; key: number };

const useToast = create<ToastState>(() => ({ msg: null, kind: 'success', key: 0 }));

let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(msg: string, kind: ToastState['kind'] = 'success') {
  useToast.setState((s) => ({ msg, kind, key: s.key + 1 }));
  clearTimeout(timer);
  timer = setTimeout(() => useToast.setState({ msg: null }), 3000);
}

export function ToastHost() {
  const { msg, kind, key } = useToast();
  if (!msg) return null;
  const ok = kind === 'success';
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6" role="status" aria-live="polite">
      <div key={key} className="pointer-events-auto flex w-[320px] max-w-[calc(100vw-2rem)] animate-pop items-start gap-3 rounded-2xl bg-surface p-4 shadow-pop ring-1 ring-line">
        <span className={ok ? 'grid size-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand' : 'grid size-8 shrink-0 place-items-center rounded-xl bg-red-50 text-red'}>
          <Icon className="size-[18px]" />
        </span>
        <p className="flex-1 pt-1.5 text-[13.5px] font-semibold">{msg}</p>
        <button type="button" aria-label="Dismiss" onClick={() => useToast.setState({ msg: null })} className="pt-1 text-faint hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
