import { AlertTriangle, ArrowRight, Boxes, CheckCircle2, ClipboardList, Factory, IndianRupee, Inbox, PackageCheck, Truck, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { ColumnChart, Ring, StackedBar } from '@/components/charts';
import { Page, Stat } from '@/components/layout';
import { OrdersTable, RouteCard } from '@/components/ops';
import { Avatar, Button, CategoryTile, EmptyState, Panel, PanelHead, StatusTag } from '@/components/ui';
import { MONTHLY } from '@/data/seed';
import { ORDER_FLOW, type Order } from '@/data/types';
import { date, inrShort, timeAgo } from '@/lib/format';
import { ORDER_STATUS } from '@/lib/status';
import { useStaffUser, useStore } from '@/store';

export default function Dashboard() {
  const me = useStaffUser()!;
  if (me.role === 'delivery') return <DeliveryHome />;
  if (me.role === 'admin') return <AdminHome />;
  return <StaffHome />;
}

function greeting(name: string) {
  const h = new Date().getHours();
  return `Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'}, ${name.split(' ')[0]}`;
}

const todayLabel = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

const ViewAll = ({ to, label = 'View all' }: { to: string; label?: string }) => (
  <Link to={to} className="flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline">
    {label} <ArrowRight className="size-3.5" />
  </Link>
);

/** "Needs action" list: the next thing to do for each order that is waiting on the team. */
function ActionQueue({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const next: Record<string, string> = { Requested: 'Review & confirm', Confirmed: 'Start processing', Processing: 'Mark ready', Ready: 'Schedule delivery' };
  const queue = orders.filter((o) => next[o.status]).sort((a, b) => ORDER_FLOW.indexOf(a.status as never) - ORDER_FLOW.indexOf(b.status as never) || a.placedAt.localeCompare(b.placedAt));
  if (queue.length === 0) return <EmptyState icon={CheckCircle2} title="All caught up" body="Nothing is waiting on your team right now." />;
  return (
    <ul className="divide-y divide-line">
      {queue.slice(0, 6).map((o) => {
        const m = machines.find((x) => x.id === o.machineId);
        return (
          <li key={o.id}>
            <button type="button" onClick={() => navigate(`/order/${o.id}`)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-subtle">
              <CategoryTile category={m?.category ?? ''} machineId={m?.id} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold">{customers.find((c) => c.id === o.customerId)?.company}</span>
                <span className="block truncate text-xs text-muted">
                  {o.id} · {o.qty} × {m?.name} · {timeAgo(o.placedAt)}
                </span>
              </span>
              <span className="hidden sm:block">
                <StatusTag status={o.status} />
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {next[o.status]} <ArrowRight className="size-3.5" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function StaffHome() {
  const me = useStaffUser()!;
  const navigate = useNavigate();
  const orders = useStore((s) => s.orders);
  const deliveries = useStore((s) => s.deliveries);
  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const ready = orders.filter((o) => o.status === 'Ready');

  return (
    <Page screen="index" title={greeting(me.name)} subtitle={todayLabel()} actions={<Button icon={ClipboardList} variant="outline" onClick={() => navigate('/orders?view=Board')}>Open pipeline board</Button>}>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="New requests" value={String(count('Requested'))} icon={Inbox} tone="coral" foot="Waiting for review" onClick={() => navigate('/requests')} />
        <Stat label="In processing" value={String(count('Confirmed') + count('Processing'))} icon={Factory} tone="violet" foot={`${orders.filter((o) => o.status === 'Confirmed' && !o.advancePaid).length} awaiting advance`} />
        <Stat label="Ready to dispatch" value={String(ready.length)} icon={PackageCheck} tone="amber" foot="Need a driver" onClick={() => navigate('/deliveries')} />
        <Stat label="On the road" value={String(deliveries.filter((d) => d.status !== 'Delivered').length)} icon={Truck} tone="brand" foot="Assigned or in transit" onClick={() => navigate('/deliveries')} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelHead title="Needs action" sub="Orders waiting on your team, oldest step first" action={<ViewAll to="/orders" />} />
          <ActionQueue orders={orders} />
        </Panel>
        <Panel>
          <PanelHead title="Pipeline" sub="Orders by stage" />
          <div className="px-5 pb-5">
            <StackedBar parts={ORDER_FLOW.map((s) => ({ label: s, value: count(s), tone: ORDER_STATUS[s]!.tone }))} />
          </div>
        </Panel>
      </div>
    </Page>
  );
}

function DeliveryHome() {
  const me = useStaffUser()!;
  const all = useStore((s) => s.deliveries);
  const mine = all.filter((d) => d.assignedTo === me.id);
  const active = mine.filter((d) => d.status !== 'Delivered').sort((a, b) => a.scheduled.localeCompare(b.scheduled));
  const done = mine.filter((d) => d.status === 'Delivered');
  const next = active[0];

  return (
    <Page screen="index" title={greeting(me.name)} subtitle={todayLabel()}>
      <Panel className="mb-4 flex flex-col gap-5 bg-gradient-to-br from-brand to-brand-700 p-6 text-white ring-0! sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white/70">Your route</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight">
            {active.length} active deliver{active.length === 1 ? 'y' : 'ies'}
          </p>
          {next && (
            <p className="mt-1 text-[14px] text-white/80">
              Next: {next.id} · scheduled {date(next.scheduled)}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-2">
          <Ring value={done.length} total={mine.length} label="done" />
        </div>
      </Panel>

      <h2 className="mb-3 text-[15px] font-bold">Active deliveries</h2>
      {active.length === 0 ? (
        <Panel>
          <EmptyState icon={PackageCheck} title="No active deliveries" body="New assignments from operations will show up here." />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((d) => (
            <RouteCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </Page>
  );
}

/** Compact "on the road" list for the overview's side column. */
function RoadList() {
  const navigate = useNavigate();
  const deliveries = useStore((s) => s.deliveries);
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const staff = useStore((s) => s.staff);
  const active = deliveries.filter((d) => d.status !== 'Delivered').sort((a, b) => a.scheduled.localeCompare(b.scheduled));
  if (active.length === 0) return <p className="border-t border-line px-5 py-4 text-[13px] text-muted">No deliveries on the road.</p>;
  return (
    <ul className="divide-y divide-line border-t border-line">
      {active.slice(0, 3).map((d) => {
        const o = orders.find((x) => x.id === d.orderId);
        const driver = staff.find((x) => x.id === d.assignedTo);
        return (
          <li key={d.id}>
            <button type="button" onClick={() => navigate(`/delivery/${d.id}`)} className="flex w-full items-center gap-3 px-5 py-2 text-left hover:bg-subtle">
              <Avatar name={driver?.name ?? '?'} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{customers.find((c) => c.id === o?.customerId)?.company}</span>
                <span className="block truncate text-xs text-muted">
                  {d.id} · {o?.city} · {date(d.scheduled).replace(/ \d{4}$/, '')}
                </span>
              </span>
              <StatusTag status={d.status} short />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function AdminHome() {
  const navigate = useNavigate();
  const orders = useStore((s) => s.orders);
  const deliveries = useStore((s) => s.deliveries);
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const lowStock = machines.filter((m) => m.active && m.stock <= 1);
  const advanceDue = orders.filter((o) => !['Requested', 'Cancelled'].includes(o.status) && !o.advancePaid);
  const recent = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 4);

  return (
    <Page
      screen="index"
      title={
        <span className="flex flex-wrap items-baseline gap-x-3">
          Business overview <span className="text-[13px] font-medium tracking-normal text-muted">{todayLabel()}</span>
        </span>
      }>
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Customers" value={String(customers.length)} icon={Users} tone="blue" onClick={() => navigate('/customers')} />
        <Stat label="Active machinery" value={String(machines.filter((m) => m.active).length)} icon={Boxes} tone="brand" onClick={() => navigate('/machinery')} />
        <Stat label="Open requests" value={String(count('Requested'))} icon={Inbox} tone="coral" onClick={() => navigate('/orders')} />
        <Stat label="Orders in progress" value={String(orders.filter((o) => !['Requested', 'Delivered', 'Cancelled'].includes(o.status)).length)} icon={Factory} tone="violet" onClick={() => navigate('/orders')} />
        <Stat label="Pending deliveries" value={String(deliveries.filter((d) => d.status !== 'Delivered').length)} icon={Truck} tone="amber" onClick={() => navigate('/deliveries')} />
        <Stat label="Completed deliveries" value={String(deliveries.filter((d) => d.status === 'Delivered').length)} icon={CheckCircle2} tone="green" onClick={() => navigate('/deliveries')} />
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-3">
          <Panel>
            <PanelHead title="Order value · monthly (illustrative)" action={<ViewAll to="/reports" label="Reports" />} />
            <div className="px-5 pb-4">
              <ColumnChart height="clamp(72px, calc(100dvh - 662px), 200px)" data={MONTHLY.map((m) => ({ label: m.label, value: m.revenue }))} format={inrShort} />
            </div>
          </Panel>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[14px] font-bold">Latest orders</h2>
              <ViewAll to="/orders" />
            </div>
            <OrdersTable orders={recent} compact />
          </div>
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHead title="Pipeline · orders by stage" />
            <div className="px-5 pb-4">
              <StackedBar parts={ORDER_FLOW.map((s) => ({ label: s, value: count(s), tone: ORDER_STATUS[s]!.tone }))} />
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Needs attention" />
            <ul className="divide-y divide-line border-t border-line text-[13px]">
              <li>
                <button type="button" onClick={() => navigate('/machinery')} className="flex w-full items-center gap-3 px-5 py-2 text-left hover:bg-subtle">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber">
                    <AlertTriangle className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{lowStock.length} machine{lowStock.length === 1 ? '' : 's'} low on stock</span>
                    <span className="block truncate text-xs text-muted">{lowStock.map((m) => m.name).join(', ') || 'Stock levels are healthy'}</span>
                  </span>
                  <ArrowRight className="size-4 text-faint" />
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/orders')} className="flex w-full items-center gap-3 px-5 py-2 text-left hover:bg-subtle">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand">
                    <IndianRupee className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{inrShort(advanceDue.reduce((a, o) => a + o.advance, 0))} advance outstanding</span>
                    <span className="block truncate text-xs text-muted">
                      {advanceDue.length} confirmed order{advanceDue.length === 1 ? '' : 's'} not yet paid
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-faint" />
                </button>
              </li>
            </ul>
          </Panel>

          <Panel>
            <PanelHead title="On the road" action={<ViewAll to="/deliveries" />} />
            <RoadList />
          </Panel>
        </div>
      </div>
    </Page>
  );
}
