import { Activity as ActivityIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Page } from '@/components/layout';
import { Avatar, EmptyState, Panel, SearchInput, Segmented, Tag } from '@/components/ui';
import type { Activity as Entry } from '@/data/types';
import { dateTime } from '@/lib/format';
import { useStore } from '@/store';

const FILTERS = ['All', 'Customer', 'Staff', 'Delivery', 'Admin'] as const;
const ROLE_TONE = { customer: 'coral', staff: 'blue', delivery: 'brand', admin: 'violet' } as const;

export default function Activity() {
  const activity = useStore((s) => s.activity);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return activity.filter((a) => (filter === 'All' || a.role === filter.toLowerCase()) && (!n || `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(n)));
  }, [activity, filter, q]);

  const groups = rows.reduce<Record<string, Entry[]>>((acc, a) => {
    const k = new Date(a.at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    return { ...acc, [k]: [...(acc[k] ?? []), a] };
  }, {});

  return (
    <Page screen="activity" title="Audit log" subtitle="Every action across customers, staff, delivery and admin">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={q} onChange={setQ} placeholder="Search user, action or record" />
        <Segmented label="Filter by role" options={FILTERS} value={filter} onChange={setFilter} />
      </div>
      {rows.length === 0 ? (
        <Panel>
          <EmptyState icon={ActivityIcon} title="No activity matches" />
        </Panel>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-2 text-[13px] font-semibold text-muted">{day}</h2>
              <Panel className="divide-y divide-line">
                {list.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={a.actor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px]">
                        <span className="font-semibold">{a.actor}</span> <span className="text-ink-2">{a.action.toLowerCase()}</span> <span className="font-mono text-[12.5px]">{a.target}</span>
                      </p>
                      <p className="text-xs text-faint">{dateTime(a.at)}</p>
                    </div>
                    <Tag label={a.role} tone={ROLE_TONE[a.role]} className="hidden capitalize sm:inline-flex" />
                  </div>
                ))}
              </Panel>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
