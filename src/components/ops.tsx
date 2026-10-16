import { ArrowRight, CalendarDays, ClipboardList, Flag, Phone, Truck, Warehouse } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

import { BRAND } from '@/brand';
import { type Column, DataTable } from '@/components/layout';
import { toast } from '@/components/toast';
import { Avatar, Button, CategoryTile, ChoiceGrid, cx, EmptyState, Field, Modal, Panel, StatusTag, Tag } from '@/components/ui';
import { ORDER_FLOW, type Delivery, type Order } from '@/data/types';
import { date, inrShort, timeAgo } from '@/lib/format';
import { ORDER_STATUS, TONE } from '@/lib/status';
import { useStore } from '@/store';

/** `compact` drops secondary columns for half-width placements such as the dashboard. */
export function OrdersTable({ orders, emptyText = 'No orders match', compact }: { orders: Order[]; emptyText?: string; compact?: boolean }) {
  const navigate = useNavigate();
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const all: Column<Order>[] = [
    {
      key: 'order',
      label: 'Order',
      render: (o) => {
        const m = machines.find((x) => x.id === o.machineId);
        return (
          <div className="flex items-center gap-3">
            <CategoryTile category={m?.category ?? ''} machineId={m?.id} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {o.qty} × {m?.name}
              </p>
              <p className="font-mono text-xs text-muted">{o.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (o) => {
        const c = customers.find((x) => x.id === o.customerId);
        return (
          <div className="min-w-0">
            <p className="truncate font-medium">{c?.company}</p>
            <p className="truncate text-xs text-muted">{o.city}</p>
          </div>
        );
      },
    },
    { key: 'value', label: 'Value', className: 'whitespace-nowrap text-right', render: (o) => <span className="font-mono">{inrShort(o.total)}</span> },
    { key: 'advance', label: 'Advance', hideOnMobile: true, render: (o) => <Tag label={o.advancePaid ? 'Paid' : 'Pending'} /> },
    { key: 'age', label: 'Placed', hideOnMobile: true, className: 'whitespace-nowrap', render: (o) => <span className="text-muted">{timeAgo(o.placedAt)}</span> },
    { key: 'status', label: 'Status', className: 'whitespace-nowrap', render: (o) => <StatusTag status={o.status} /> },
  ];
  const cols = all.filter((c) => !compact || !['advance', 'age'].includes(c.key));
  return <DataTable rows={orders} columns={cols} rowKey={(o) => o.id} onRowClick={(o) => navigate(`/order/${o.id}`)} empty={<EmptyState icon={ClipboardList} title={emptyText} />} />;
}

/** Kanban view of the pipeline: one column per status. */
export function OrdersBoard({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-3 2xl:min-w-0">
        {ORDER_FLOW.map((status) => {
          const col = orders.filter((o) => o.status === status);
          const meta = ORDER_STATUS[status]!;
          return (
            <section key={status} aria-label={status} className="w-[264px] shrink-0 2xl:w-auto 2xl:flex-1 rounded-2xl bg-slate-50 p-2 ring-1 ring-inset ring-line">
              <header className="flex items-center gap-2 px-2 pb-2 pt-1">
                <span className={cx('size-2 rounded-full', TONE[meta.tone].solid)} />
                <h3 className="flex-1 text-[13px] font-bold">{status}</h3>
                <span className="font-mono text-xs text-muted">{col.length}</span>
              </header>
              <div className="space-y-2">
                {col.map((o) => {
                  const m = machines.find((x) => x.id === o.machineId);
                  const c = customers.find((x) => x.id === o.customerId);
                  return (
                    <Panel key={o.id} onClick={() => navigate(`/order/${o.id}`)} className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-muted">{o.id}</span>
                        <span className="text-[11px] text-faint">{timeAgo(o.placedAt)}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug">
                        {o.qty} × {m?.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">{c?.company}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-mono text-[13px]">{inrShort(o.total)}</span>
                        {!o.advancePaid && status !== 'Requested' && <Tag label="Advance due" tone="amber" />}
                      </div>
                    </Panel>
                  );
                })}
                {col.length === 0 && <p className="px-2 py-6 text-center text-xs text-faint">No orders</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function DeliveriesTable({ deliveries, compact }: { deliveries: Delivery[]; compact?: boolean }) {
  const navigate = useNavigate();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const staff = useStore((s) => s.staff);
  const all: Column<Delivery>[] = [
    {
      key: 'id',
      label: 'Delivery',
      render: (d) => {
        const o = orders.find((x) => x.id === d.orderId);
        return (
          <div className="min-w-0">
            <p className="truncate font-semibold">{customers.find((c) => c.id === o?.customerId)?.company}</p>
            <p className="font-mono text-xs text-muted">
              {d.id} · {o?.city}
            </p>
          </div>
        );
      },
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (d) => {
        const s = staff.find((x) => x.id === d.assignedTo);
        return s ? (
          <span className="flex items-center gap-2">
            <Avatar name={s.name} size="sm" />
            <span className="hidden lg:inline">{s.name}</span>
            <span className="lg:hidden">{s.name.split(' ')[0]}</span>
          </span>
        ) : (
          '—'
        );
      },
    },
    { key: 'when', label: 'Scheduled', className: 'whitespace-nowrap', render: (d) => date(d.scheduled) },
    { key: 'priority', label: 'Priority', hideOnMobile: true, render: (d) => (d.priority === 'High' ? <Tag label="High" icon={Flag} /> : <span className="text-muted">Normal</span>) },
    { key: 'status', label: 'Status', className: 'whitespace-nowrap', render: (d) => <StatusTag status={d.status} short /> },
  ];
  const cols = all.filter((c) => !compact || c.key !== 'priority');
  return <DataTable rows={deliveries} columns={cols} rowKey={(d) => d.id} onRowClick={(d) => navigate(`/delivery/${d.id}`)} empty={<EmptyState icon={Truck} title="No deliveries here" />} />;
}

/** Route card: yard → site, used in the delivery executive's queue. */
export function RouteCard({ d }: { d: Delivery }) {
  const navigate = useNavigate();
  const o = useStore((s) => s.orders.find((x) => x.id === d.orderId));
  const c = useStore((s) => s.customers.find((x) => x.id === o?.customerId));
  const m = useStore((s) => s.machines.find((x) => x.id === o?.machineId));
  const moving = d.status === 'In transit';
  return (
    <Panel onClick={() => navigate(`/delivery/${d.id}`)} className={cx('overflow-hidden', moving && 'ring-2! ring-brand!')}>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <CategoryTile category={m?.category ?? ''} machineId={m?.id} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {o?.qty} × {m?.name}
          </p>
          <p className="font-mono text-xs text-muted">
            {d.id} · {d.orderId}
          </p>
        </div>
        <StatusTag status={d.status} short />
      </div>
      <div className="grid grid-cols-[20px_1fr] gap-x-3 px-4 py-3.5 text-[13px]">
        <Warehouse className="size-4 text-faint" />
        <p className="text-muted">{BRAND.name} yard · {d.vehicle.split(' · ')[1] ?? d.vehicle}</p>
        <span className="ml-[7px] h-4 border-l-2 border-dashed border-line-strong" />
        <span />
        <Flag className={cx('size-4', moving ? 'text-brand' : 'text-coral')} />
        <div>
          <p className="font-semibold">{c?.company}</p>
          <p className="text-muted">
            {o?.siteAddress}, {o?.city}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between bg-subtle px-4 py-2.5 text-[13px]">
        <span className="flex items-center gap-1.5 text-ink-2">
          <CalendarDays className="size-4 text-faint" /> {date(d.scheduled)}
          {d.priority === 'High' && <Tag label="High" icon={Flag} className="ml-1" />}
        </span>
        <span className="flex items-center gap-1 font-semibold text-brand">
          Open <ArrowRight className="size-4" />
        </span>
      </div>
    </Panel>
  );
}

function nextDays(n: number) {
  const today = Date.now();
  return Array.from({ length: n }, (_, i) => new Date(today + (i + 1) * 86400000).toISOString().slice(0, 10));
}

export function AssignDeliveryModal({ order, open, onClose }: { order: Order; open: boolean; onClose: () => void }) {
  const drivers = useStore(useShallow((s) => s.staff.filter((m) => m.role === 'delivery' && m.active)));
  const deliveries = useStore((s) => s.deliveries);
  const current = deliveries.find((d) => d.id === order.deliveryId);
  const [days] = useState(() => nextDays(6));
  const [driver, setDriver] = useState(current?.assignedTo ?? drivers[0]?.id ?? '');
  const [day, setDay] = useState(current?.scheduled ?? days[1]!);
  const [vehicle, setVehicle] = useState(current?.vehicle ?? '');
  const [priority, setPriority] = useState<'Normal' | 'High'>(current?.priority ?? 'Normal');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={current ? 'Reassign delivery' : 'Schedule delivery'}
      sub={`${order.id} · ${order.city}`}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-[2]"
            icon={Truck}
            disabled={!driver}
            onClick={() => {
              useStore.getState().assignDelivery(order.id, { staffId: driver, scheduled: day, vehicle: vehicle.trim() || 'Low-bed trailer', priority });
              toast(current ? 'Delivery reassigned' : 'Delivery scheduled · driver notified');
              onClose();
            }}>
            {current ? 'Reassign' : 'Schedule delivery'}
          </Button>
        </>
      }>
      <div>
        <p className="mb-2 text-[13px] font-semibold text-ink-2">Driver</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {drivers.map((d) => {
            const load = deliveries.filter((x) => x.assignedTo === d.id && x.status !== 'Delivered').length;
            const on = driver === d.id;
            return (
              <button key={d.id} type="button" role="radio" aria-checked={on} onClick={() => setDriver(d.id)} className={cx('flex items-center gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition', on ? 'bg-brand-50 ring-2 ring-brand' : 'ring-line-strong hover:bg-subtle')}>
                <Avatar name={d.name} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{d.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Phone className="size-3" /> {load} on route
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[13px] font-semibold text-ink-2">Delivery date</p>
        <ChoiceGrid
          options={days}
          value={day}
          onChange={setDay}
          render={(d) => {
            const dt = new Date(d);
            return (
              <span className="block text-center leading-tight">
                <span className="block text-[11px] font-medium opacity-70">{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                <span className="block">{dt.getDate()} {dt.toLocaleDateString('en-IN', { month: 'short' })}</span>
              </span>
            );
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-[13px] font-semibold text-ink-2">Priority</p>
        <ChoiceGrid options={['Normal', 'High'] as const} value={priority} onChange={setPriority} />
      </div>
      <Field label="Vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="e.g. MP-09-HG-2231 · Hydraulic low-bed" />
    </Modal>
  );
}
