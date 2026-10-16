import { Columns3, Rows3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Page } from '@/components/layout';
import { OrdersBoard, OrdersTable } from '@/components/ops';
import { Panel, SearchInput, Segmented, Tabs } from '@/components/ui';
import { ORDER_FLOW, type OrderStatus } from '@/data/types';
import { useStore } from '@/store';

const FILTERS = ['All', ...ORDER_FLOW, 'Cancelled'] as const;
type Filter = (typeof FILTERS)[number];
const VIEWS = ['List', 'Board'] as const;

/** Orders list/board; `preset` turns it into the "Incoming requests" queue. */
export default function Orders({ preset }: { preset?: OrderStatus }) {
  const [params, setParams] = useSearchParams();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const [filter, setFilter] = useState<Filter>('All');
  const [q, setQ] = useState('');
  const view = !preset && params.get('view') === 'Board' ? 'Board' : 'List';
  const active: Filter = preset ?? filter;

  const searched = useMemo(() => {
    const n = q.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (!n) return true;
        const c = customers.find((x) => x.id === o.customerId);
        const m = machines.find((x) => x.id === o.machineId);
        return `${o.id} ${c?.name} ${c?.company} ${o.city} ${m?.name}`.toLowerCase().includes(n);
      })
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [orders, customers, machines, q]);
  const rows = searched.filter((o) => active === 'All' || o.status === active);
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === 'All' ? searched.length : searched.filter((o) => o.status === f).length])) as Record<Filter, number>;

  return (
    <Page
      screen={preset ? 'requests' : 'orders'}
      title={preset ? 'Incoming requests' : 'Orders'}
      subtitle={preset ? `${rows.length} new request${rows.length === 1 ? '' : 's'} from customers, oldest needs attention first` : 'Every request and order across the pipeline'}
      actions={!preset && <Segmented label="View" options={VIEWS} value={view} onChange={(v) => setParams(v === 'Board' ? { view: v } : {})} icons={{ List: Rows3, Board: Columns3 }} />}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={q} onChange={setQ} placeholder="Search by order no., customer, city or machine" />
      </div>
      {view === 'Board' ? (
        <OrdersBoard orders={searched} />
      ) : (
        <>
          {!preset && (
            <Panel className="mb-3 px-4 pt-2">
              <Tabs options={FILTERS} value={filter} onChange={setFilter} counts={counts} />
            </Panel>
          )}
          <OrdersTable orders={preset ? [...rows].reverse() : rows} emptyText={preset ? 'No new requests — inbox zero' : 'No orders match'} />
        </>
      )}
    </Page>
  );
}
