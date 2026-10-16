import { History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import { type Column, DataTable, Page } from '@/components/layout';
import { CategoryTile, EmptyState, Tag } from '@/components/ui';
import type { Delivery } from '@/data/types';
import { dateTime } from '@/lib/format';
import { useStaffUser, useStore } from '@/store';

export default function History() {
  const navigate = useNavigate();
  const me = useStaffUser()!;
  const deliveries = useStore((s) => s.deliveries);
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const rows = deliveries.filter((d) => d.assignedTo === me.id && d.status === 'Delivered').sort((a, b) => (b.deliveredAt ?? '').localeCompare(a.deliveredAt ?? ''));
  const orderOf = (d: Delivery) => orders.find((x) => x.id === d.orderId);

  const cols: Column<Delivery>[] = [
    {
      key: 'load',
      label: 'Delivery',
      render: (d) => {
        const m = machines.find((x) => x.id === orderOf(d)?.machineId);
        return (
          <div className="flex items-center gap-3">
            <CategoryTile category={m?.category ?? ''} machineId={m?.id} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{m?.name}</p>
              <p className="font-mono text-xs text-muted">{d.id}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'customer', label: 'Customer', render: (d) => customers.find((c) => c.id === orderOf(d)?.customerId)?.company },
    { key: 'at', label: 'Delivered', className: 'whitespace-nowrap', render: (d) => (d.deliveredAt ? dateTime(d.deliveredAt) : '—') },
    { key: 'proof', label: 'Proof', render: (d) => <Tag label={d.proof ?? '—'} tone="green" /> },
  ];

  return (
    <Page screen="history" title="Delivery history" subtitle={`${rows.length} completed deliver${rows.length === 1 ? 'y' : 'ies'}`}>
      <DataTable rows={rows} columns={cols} rowKey={(d) => d.id} onRowClick={(d) => navigate(`/delivery/${d.id}`)} empty={<EmptyState icon={HistoryIcon} title="No completed deliveries yet" />} />
    </Page>
  );
}
