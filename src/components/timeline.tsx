import { Check } from 'lucide-react';

import { cx, StatusTag } from '@/components/ui';
import { ORDER_FLOW, type Order } from '@/data/types';
import { date, dateTime } from '@/lib/format';
import { ORDER_STATUS } from '@/lib/status';

/** Horizontal progress tracker across the shared order flow (wraps to a grid on phones). */
export function Stepper({ order }: { order: Order }) {
  const current = ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]);
  const reached = new Map(order.history.map((h) => [h.status, h]));
  if (order.status === 'Cancelled')
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red">
        <StatusTag status="Cancelled" />
        {order.history.at(-1)?.note ?? 'This order was cancelled.'}
      </div>
    );
  return (
    <ol className="grid grid-cols-4 gap-y-5 sm:grid-cols-7">
      {ORDER_FLOW.map((s, i) => {
        const done = i < current;
        const now = i === current;
        const Icon = ORDER_STATUS[s]!.icon;
        return (
          <li key={s} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={cx('absolute right-1/2 top-[15px] hidden h-0.5 w-full sm:block', i <= current ? 'bg-brand' : 'bg-line')} />}
            <span
              className={cx(
                'relative z-10 grid size-8 place-items-center rounded-full ring-4 ring-surface',
                done ? 'bg-brand text-white' : now ? 'bg-ink text-white' : 'bg-slate-50 text-faint ring-1 ring-inset ring-line',
              )}>
              {done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
            </span>
            <span className={cx('mt-2 text-[12px] font-semibold leading-tight', !done && !now && 'text-faint')}>{s}</span>
            <span className="text-[11px] text-muted">{reached.get(s) ? date(reached.get(s)!.at).replace(/ \d{4}$/, '') : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Reverse-chronological activity feed built from the order history. */
export function ActivityFeed({ items }: { items: { title: string; by?: string; at: string; note?: string }[] }) {
  return (
    <ul className="space-y-4">
      {items.map((it, i) => (
        <li key={`${it.title}-${it.at}-${i}`} className="flex gap-3">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand ring-4 ring-brand-50" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px]">
              <span className="font-semibold">{it.title}</span>
              {it.by && <span className="text-muted"> by {it.by}</span>}
            </p>
            {it.note && <p className="text-[13px] text-ink-2">{it.note}</p>}
            <p className="text-xs text-faint">{dateTime(it.at)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
