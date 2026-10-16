import { CheckCircle2, Clock, IndianRupee, Wallet } from 'lucide-react';
import { useState } from 'react';

import { ColumnChart, RankList, StackedBar } from '@/components/charts';
import { Page, Stat } from '@/components/layout';
import { Panel, PanelHead, Segmented } from '@/components/ui';
import { CATEGORIES, MONTHLY } from '@/data/seed';
import { ORDER_FLOW } from '@/data/types';
import { inrShort } from '@/lib/format';
import { ORDER_STATUS } from '@/lib/status';
import { useStore } from '@/store';

const METRICS = ['Order value', 'Order count'] as const;

export default function Reports() {
  const orders = useStore((s) => s.orders);
  const machines = useStore((s) => s.machines);
  const deliveries = useStore((s) => s.deliveries);
  const staff = useStore((s) => s.staff);
  const customers = useStore((s) => s.customers);
  const [metric, setMetric] = useState<(typeof METRICS)[number]>('Order value');

  const live = orders.filter((o) => o.status !== 'Cancelled');
  const value = live.reduce((a, o) => a + o.total, 0);
  const collected = live.reduce((a, o) => a + (o.advancePaid ? o.advance : 0) + (o.balancePaid ? o.total - o.advance : 0), 0);
  const delivered = deliveries.filter((d) => d.status === 'Delivered');
  const onTime = delivered.filter((d) => d.deliveredAt && d.deliveredAt.slice(0, 10) <= d.scheduled).length;

  const byCategory = CATEGORIES.map((c) => {
    const v = live.filter((o) => machines.find((m) => m.id === o.machineId)?.category === c).reduce((a, o) => a + o.total, 0);
    return { label: c, value: v, display: inrShort(v) };
  })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const byCustomer = customers
    .map((c) => {
      const v = live.filter((o) => o.customerId === c.id).reduce((a, o) => a + o.total, 0);
      return { label: c.company, value: v, display: inrShort(v) };
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const drivers = staff.filter((m) => m.role === 'delivery').map((m) => ({ label: m.name, value: delivered.filter((d) => d.assignedTo === m.id).length }));

  return (
    <Page screen="reports" title="Reports" subtitle="Orders, collections and delivery performance">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Order value" value={inrShort(value)} icon={IndianRupee} foot={`${live.length} orders, excluding cancelled`} />
        <Stat label="Collected" value={inrShort(collected)} icon={Wallet} tone="green" foot={`${Math.round((collected / Math.max(1, value)) * 100)}% of order value`} />
        <Stat label="Outstanding" value={inrShort(value - collected)} icon={Clock} tone="amber" foot="Advance and balance due" />
        <Stat label="On-time delivery" value={delivered.length ? `${Math.round((onTime / delivered.length) * 100)}%` : '—'} icon={CheckCircle2} tone="blue" foot={`${delivered.length} deliveries completed`} />
      </div>

      <Panel className="mb-4">
        <PanelHead title={metric === 'Order value' ? 'Order value by month' : 'Orders by month'} sub="Illustrative trend · last 6 months" action={<Segmented label="Metric" options={METRICS} value={metric} onChange={setMetric} />} />
        <div className="px-5 pb-5">
          <ColumnChart key={metric} height={240} data={MONTHLY.map((m) => ({ label: m.label, value: metric === 'Order value' ? m.revenue : m.orders }))} format={metric === 'Order value' ? inrShort : (n) => String(Math.round(n))} />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead title="By category" sub="Order value" />
          <div className="px-5 pb-5">
            <RankList rows={byCategory} />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Top customers" sub="Order value" />
          <div className="px-5 pb-5">
            <RankList rows={byCustomer} />
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel>
            <PanelHead title="Pipeline mix" sub="Current orders by stage" />
            <div className="px-5 pb-5">
              <StackedBar parts={ORDER_FLOW.map((s) => ({ label: s, value: orders.filter((o) => o.status === s).length, tone: ORDER_STATUS[s]!.tone }))} />
            </div>
          </Panel>
          <Panel>
            <PanelHead title="Deliveries by driver" sub="Completed" />
            <div className="px-5 pb-5">
              <RankList rows={drivers} />
            </div>
          </Panel>
        </div>
      </div>
    </Page>
  );
}
