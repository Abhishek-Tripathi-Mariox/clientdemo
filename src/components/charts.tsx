import { useState } from 'react';

import { cx } from '@/components/ui';
import { TONE, type Tone } from '@/lib/status';

/**
 * Single-series column chart in the brand colour with a light value grid. The hovered/focused
 * (or latest) column is solid and its value shown in the header; others are a lighter tint.
 */
export function ColumnChart({ data, format, height = 220 }: { data: { label: string; value: number }[]; format: (n: number) => string; height?: number | string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = [1, 0.5, 0];
  const shown = active ?? data.length - 1;
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-xl font-medium tracking-tight">{format(data[shown]?.value ?? 0)}</span>
        <span className="text-[13px] text-muted">{data[shown]?.label}</span>
      </div>
      <div className="relative mt-2" style={{ height }}>
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${t * 100}%` }}>
            {/* The top label sits under its gridline so it never collides with the value above the chart. */}
            <span className={cx('w-14 whitespace-nowrap text-right font-mono text-[10px] text-faint', t === 1 ? 'translate-y-3' : '-translate-y-1/2')}>{format(max * t)}</span>
            <span className="h-px flex-1 -translate-y-1/2 bg-line" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-16 right-0 flex items-end gap-3 sm:gap-5">
          {data.map((d, i) => (
            <button
              key={d.label}
              type="button"
              aria-label={`${d.label}: ${format(d.value)}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
              className="flex h-full flex-1 items-end justify-center outline-none">
              <span className={cx('block w-full max-w-12 rounded-t-[4px] transition-colors', i === shown ? 'bg-brand' : 'bg-brand-100')} style={{ height: `${Math.max(1, (d.value / max) * 100)}%` }} />
            </button>
          ))}
        </div>
      </div>
      <div className="ml-16 mt-2 flex gap-3 sm:gap-5">
        {data.map((d, i) => (
          <span key={d.label} className={cx('flex-1 text-center text-xs', i === shown ? 'font-semibold text-ink' : 'text-muted')}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** One stacked bar showing part-to-whole, with a labelled legend (counts are always printed). */
export function StackedBar({ parts }: { parts: { label: string; value: number; tone: Tone }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const shown = parts.filter((p) => p.value > 0);
  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full bg-slate-50" role="img" aria-label={shown.map((p) => `${p.label} ${p.value}`).join(', ')}>
        {shown.map((p) => (
          <span key={p.label} className={TONE[p.tone].solid} style={{ width: `${(p.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-[13px]">
            <span className={cx('size-2.5 rounded-sm', TONE[p.tone].solid)} />
            <span className="flex-1 text-ink-2">{p.label}</span>
            <span className="font-mono">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ranked list with a thin magnitude meter under each row. */
export function RankList({ rows }: { rows: { label: string; value: number; display?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="w-4 font-mono text-faint">{i + 1}</span>
            <span className="flex-1 truncate font-medium">{r.label}</span>
            <span className="font-mono">{r.display ?? r.value}</span>
          </div>
          <div className="ml-7 mt-1.5 h-1.5 rounded-full bg-slate-50">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Circular progress meter. */
export function Ring({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? value / total : 0;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" role="img" aria-label={`${label}: ${value} of ${total}`}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-brand-50)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-brand)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center text-ink">
        <span>
          <span className="block font-mono text-xl font-medium leading-none">
            {value}/{total}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
        </span>
      </div>
    </div>
  );
}
