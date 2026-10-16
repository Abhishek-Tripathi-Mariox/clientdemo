import type { LucideIcon } from 'lucide-react';
import { Loader2, Search, X } from 'lucide-react';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

import { machineImage } from '@/lib/images';
import { initials } from '@/lib/format';
import { iconFor, ORDER_STATUS, TONE, type Tone, toneFor } from '@/lib/status';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---- Buttons ---------------------------------------------------------------

const VARIANT = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]',
  dark: 'bg-ink text-white hover:bg-ink-2',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  outline: 'bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-subtle',
  ghost: 'bg-transparent text-ink-2 hover:bg-slate-50',
  danger: 'bg-surface text-red ring-1 ring-inset ring-red/25 hover:bg-red-50',
};
const SIZE = { sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg', md: 'h-10 px-4 text-sm gap-2 rounded-xl', lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl' };

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANT; size?: keyof typeof SIZE; icon?: LucideIcon; iconRight?: LucideIcon; loading?: boolean };

export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={cx('inline-flex shrink-0 items-center justify-center font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-45', VARIANT[variant], SIZE[size], className)}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" strokeWidth={2.2} />}
      {children}
      {IconRight && !loading && <IconRight className="size-4" strokeWidth={2.2} />}
    </button>
  );
}

export function IconBtn({ icon: Icon, label, onClick, dot, className }: { icon: LucideIcon; label: string; onClick?: () => void; dot?: boolean; className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cx('relative grid size-9 place-items-center rounded-xl text-ink-2 transition hover:bg-slate-50', className)}>
      <Icon className="size-[18px]" />
      {dot && <span className="absolute right-2 top-2 size-2 rounded-full bg-coral ring-2 ring-surface" />}
    </button>
  );
}

// ---- Surfaces --------------------------------------------------------------

const PANEL = 'rounded-2xl bg-surface ring-1 ring-line shadow-card';

/** Card surface. Clickable panels use a div with button semantics so they can contain controls. */
export function Panel({ children, className, onClick, as: Tag = 'div' }: { children: ReactNode; className?: string; onClick?: () => void; as?: 'div' | 'section' }) {
  if (onClick)
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault();
          onClick();
        }}
        className={cx(PANEL, 'cursor-pointer outline-none transition hover:ring-line-strong hover:shadow-[0_6px_20px_-8px_rgba(12,26,38,0.18)] focus-visible:ring-2 focus-visible:ring-brand', className)}>
        {children}
      </div>
    );
  return <Tag className={cx(PANEL, className)}>{children}</Tag>;
}

export function PanelHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-3">
      <div>
        <h3 className="text-[15px] font-bold">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Tags, avatars, tiles --------------------------------------------------

export function Tag({ label, tone, icon: Icon, className }: { label: string; tone?: Tone; icon?: LucideIcon; className?: string }) {
  const t = TONE[tone ?? toneFor(label)];
  return (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-semibold', t.chip, className)}>
      {Icon ? <Icon className="size-3.5" strokeWidth={2.4} /> : <span className={cx('size-1.5 rounded-full', t.dot)} />}
      {label}
    </span>
  );
}

/** Order status tag: always icon + text. */
export function StatusTag({ status, short }: { status: string; short?: boolean }) {
  return <Tag label={short ? status : (ORDER_STATUS[status]?.label ?? status)} tone={toneFor(status)} icon={iconFor(status)} />;
}

const AVATAR_TONES: Tone[] = ['brand', 'blue', 'violet', 'coral', 'amber', 'green'];

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'size-8 text-[11px] rounded-lg', md: 'size-10 text-[13px] rounded-xl', lg: 'size-14 text-base rounded-2xl' }[size];
  const tone = AVATAR_TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_TONES.length]!;
  return <span className={cx('grid shrink-0 place-items-center font-bold', s, TONE[tone].chip)}>{initials(name)}</span>;
}

/** Machine photo thumbnail. Pass `machineId` for the exact machine, otherwise the category photo is used. */
export function CategoryTile({ category, machineId, size = 'md' }: { category: string; machineId?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const s = { sm: 'size-9 rounded-lg', md: 'size-11 rounded-xl', lg: 'size-16 rounded-2xl', xl: 'h-40 w-full rounded-none' }[size];
  return <img src={machineImage(machineId, category)} alt="" loading="lazy" className={cx('shrink-0 bg-slate-50 object-cover', s)} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('text-[11px] font-semibold uppercase tracking-[0.12em] text-faint', className)}>{children}</span>;
}

/** Definition list row. */
export function Row({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 text-[13.5px]">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={cx('min-w-0 text-right font-medium', mono && 'font-mono text-[13px]')}>{children}</dd>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand">
        <Icon className="size-6" />
      </span>
      <p className="text-base font-bold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-[13px] text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---- Form controls ---------------------------------------------------------

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string; icon?: LucideIcon; suffix?: ReactNode };

export function Field({ label, error, hint, icon: Icon, suffix, className, ...rest }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
          {label}
        </label>
      )}
      <div className={cx('flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 ring-1 ring-inset transition focus-within:ring-2 focus-within:ring-brand', error ? 'ring-red' : 'ring-line-strong')}>
        {Icon && <Icon className="size-4 shrink-0 text-faint" />}
        <input id={id} {...rest} className={cx('h-full w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-faint', className)} />
        {suffix}
      </div>
      {error ? <span className="text-xs font-medium text-red">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}

export function TextArea({ label, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
          {label}
        </label>
      )}
      <textarea id={id} rows={3} {...rest} className="rounded-xl bg-surface px-3.5 py-2.5 text-[14px] outline-none ring-1 ring-inset ring-line-strong transition placeholder:text-faint focus:ring-2 focus:ring-brand" />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-surface px-3 ring-1 ring-inset ring-line-strong focus-within:ring-2 focus-within:ring-brand">
      <Search className="size-4 shrink-0 text-faint" />
      <input type="search" aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-faint" />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="text-faint hover:text-ink">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Segmented control: options sit in one track, the selected one is raised. */
export function Segmented<T extends string>({ options, value, onChange, icons, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; icons?: Partial<Record<T, LucideIcon>>; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-50 p-1 ring-1 ring-inset ring-line scrollbar-none">
      {options.map((o) => {
        const Icon = icons?.[o] as LucideIcon | undefined;
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={cx('inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition', on ? 'bg-surface text-ink shadow-card ring-1 ring-line' : 'text-muted hover:text-ink')}>
            {Icon && <Icon className="size-4" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Underlined tab strip with counts, used for status filters. */
export function Tabs<T extends string>({ options, value, onChange, counts, labels }: { options: readonly T[]; value: T; onChange: (v: T) => void; counts?: Partial<Record<T, number>>; labels?: Partial<Record<T, string>> }) {
  return (
    <div role="tablist" className="-mb-px flex gap-5 overflow-x-auto border-b border-line scrollbar-none">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o)}
            className={cx('flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-[13px] font-semibold transition', on ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink')}>
            {labels?.[o] ?? o}
            {counts?.[o] !== undefined && <span className={cx('rounded-md px-1.5 text-[11px] font-bold', on ? 'bg-brand text-white' : 'bg-slate-50 text-muted')}>{counts[o]}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Choice cards — larger options with a title and caption. */
export function ChoiceGrid<T extends string>({ options, value, onChange, render }: { options: readonly T[]; value: T; onChange: (v: T) => void; render?: (o: T) => ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={cx('rounded-xl px-3.5 py-2 text-left text-[13px] font-semibold ring-1 ring-inset transition', o === value ? 'bg-brand-50 text-brand-700 ring-2 ring-brand' : 'bg-surface ring-line-strong hover:bg-subtle')}>
          {render ? render(o) : o}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cx('relative h-[22px] w-10 shrink-0 rounded-full transition', checked ? 'bg-brand' : 'bg-line-strong')}>
      <span className={cx('absolute top-[3px] size-4 rounded-full bg-white shadow transition-all', checked ? 'left-[21px]' : 'left-[3px]')} />
    </button>
  );
}

// ---- Overlays --------------------------------------------------------------

/**
 * Centred dialog on desktop, bottom sheet on phones. Rendered into <body> so no page container
 * can clip it; the body scrolls while header and footer stay pinned.
 */
export function Modal({ open, onClose, title, sub, children, footer, wide }: { open: boolean; onClose: () => void; title: string; sub?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cx(
          'relative flex max-h-[92dvh] w-full animate-sheet flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop sm:max-h-[calc(100dvh-4rem)] sm:rounded-3xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-xl',
        )}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            {sub && <p className="mt-1 text-[13.5px] text-muted">{sub}</p>}
          </div>
          <IconBtn icon={X} label="Close" onClick={onClose} className="-mr-2" />
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
        {footer && <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-line bg-subtle px-6 py-4 sm:flex-row sm:justify-end sm:px-8 sm:*:min-w-36 sm:*:flex-none">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
