import { CheckCircle2, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Page } from '@/components/layout';
import { AssignDeliveryModal, DeliveriesTable } from '@/components/ops';
import { Button, CategoryTile, Panel, PanelHead, Tabs } from '@/components/ui';
import type { Order } from '@/data/types';
import { inrShort, timeAgo } from '@/lib/format';
import { useStore } from '@/store';

const FILTERS = ['Active', 'Assigned', 'In transit', 'Delivered', 'All'] as const;
type Filter = (typeof FILTERS)[number];

export default function Deliveries() {
  const navigate = useNavigate();
  const deliveries = useStore((s) => s.deliveries);
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const [filter, setFilter] = useState<Filter>('Active');
  const [assigning, setAssigning] = useState<Order | null>(null);

  const match = (status: string, f: Filter) => (f === 'All' ? true : f === 'Active' ? status !== 'Delivered' : status === f);
  const ready = orders.filter((o) => o.status === 'Ready');
  const rows = deliveries.filter((d) => match(d.status, filter)).sort((a, b) => b.scheduled.localeCompare(a.scheduled));
  const counts = Object.fromEntries(FILTERS.map((f) => [f, deliveries.filter((d) => match(d.status, f)).length])) as Record<Filter, number>;

  return (
    <Page screen="deliveries" title="Deliveries" subtitle="Schedule ready orders and follow every delivery to completion">
      <Panel className="mb-4">
        <PanelHead title="Ready for dispatch" sub={ready.length ? `${ready.length} order${ready.length === 1 ? '' : 's'} waiting for a driver` : 'Every ready order has a driver'} />
        {ready.length === 0 ? (
          <p className="flex items-center gap-2 border-t border-line px-5 py-4 text-[13px] text-muted">
            <CheckCircle2 className="size-4 text-green" /> Nothing to schedule right now.
          </p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {ready.map((o) => {
              const m = machines.find((x) => x.id === o.machineId);
              const c = customers.find((x) => x.id === o.customerId);
              return (
                <li key={o.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CategoryTile category={m?.category ?? ''} machineId={m?.id} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {o.qty} × {m?.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {o.id} · {c?.company}, {o.city} · {inrShort(o.total)} · ready {timeAgo(o.history.at(-1)!.at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/order/${o.id}`)}>
                      Details
                    </Button>
                    <Button size="sm" icon={Truck} onClick={() => setAssigning(o)}>
                      Schedule delivery
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel className="mb-3 px-4 pt-2">
        <Tabs options={FILTERS} value={filter} onChange={setFilter} counts={counts} />
      </Panel>
      <DeliveriesTable deliveries={rows} />

      {assigning && <AssignDeliveryModal order={assigning} open onClose={() => setAssigning(null)} />}
    </Page>
  );
}
