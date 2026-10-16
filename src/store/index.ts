import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  ACTIVITY,
  CUSTOMERS,
  DELIVERIES,
  DEMO_PASSWORD,
  MACHINES,
  NOTIFICATIONS,
  ORDERS,
  STAFF,
} from '@/data/seed';
import type {
  Activity,
  Audience,
  Customer,
  Delivery,
  Machine,
  Notification,
  Order,
  OrderStatus,
  StaffMember,
} from '@/data/types';
import { nowIso } from '@/lib/format';

type Data = {
  machines: Machine[];
  customers: Customer[];
  staff: StaffMember[];
  orders: Order[];
  deliveries: Delivery[];
  notifications: Notification[];
  activity: Activity[];
  staffId: string | null;
  seq: number;
};

type Actions = {
  loginStaff: (email: string, password: string) => string | null;
  logoutStaff: () => void;

  setOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  assignDelivery: (
    orderId: string,
    input: { staffId: string; scheduled: string; vehicle: string; priority: Delivery['priority'] },
  ) => void;
  startDelivery: (deliveryId: string) => void;
  completeDelivery: (deliveryId: string, receivedBy: string, proof: string) => void;

  saveMachine: (m: Machine) => void;
  toggleMachine: (id: string) => void;
  saveStaff: (s: StaffMember) => void;
  toggleStaff: (id: string) => void;

  markNotificationsRead: (audience: Audience, userId?: string) => void;
  resetDemo: () => void;
};

export type Store = Data & Actions;

const initial = (): Data => ({
  machines: MACHINES,
  customers: CUSTOMERS,
  staff: STAFF,
  orders: ORDERS,
  deliveries: DELIVERIES,
  notifications: NOTIFICATIONS,
  activity: ACTIVITY,
  staffId: null,
  seq: 1060,
});

/** localStorage key of the persisted demo data. */
export const STORAGE_KEY = 'kaviraj-demo-panel';

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const nextId = (prefix: string) => {
        const seq = get().seq + 1;
        set({ seq });
        return `${prefix}-${seq}`;
      };

      const notify = (n: Omit<Notification, 'id' | 'at' | 'read'>) =>
        set((s) => ({
          notifications: [
            { ...n, id: `NT-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: nowIso(), read: false },
            ...s.notifications,
          ],
        }));

      const log = (action: string, target: string, by?: { name: string; role: Activity['role'] }) => {
        const actor = by ?? currentStaff();
        if (!actor) return;
        set((s) => ({
          activity: [
            { id: `AC-${Date.now().toString(36)}`, actor: actor.name, role: actor.role, action, target, at: nowIso() },
            ...s.activity,
          ],
        }));
      };

      const currentStaff = () => {
        const { staff, staffId } = get();
        return staff.find((x) => x.id === staffId) ?? null;
      };

      const patchOrder = (id: string, patch: (o: Order) => Partial<Order>) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch(o) } : o)) }));

      const pushStatus = (id: string, status: OrderStatus, by: string, note?: string) =>
        patchOrder(id, (o) => ({ status, history: [...o.history, { status, at: nowIso(), by, note }] }));

      const machineName = (id: string) => get().machines.find((m) => m.id === id)?.name ?? id;

      return {
        ...initial(),

        loginStaff: (email, password) => {
          const m = get().staff.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
          if (!m || password !== DEMO_PASSWORD) return 'Email or password is incorrect.';
          if (!m.active) return 'This account is inactive. Contact your administrator.';
          set({ staffId: m.id });
          log('Signed in', m.title, { name: m.name, role: m.role });
          return null;
        },
        logoutStaff: () => set({ staffId: null }),

        setOrderStatus: (id, status, note) => {
          const me = currentStaff();
          pushStatus(id, status, me?.name ?? 'System', note);
          if (me && status === 'Confirmed') patchOrder(id, () => ({ handledBy: me.id }));
          const o = get().orders.find((x) => x.id === id)!;
          if (status === 'Ready')
            notify({ audience: 'admin', title: `${id} ready for dispatch`, body: `${machineName(o.machineId)} is waiting for a delivery assignment.`, link: `/order/${id}` });
          log(`Moved order to ${status}`, id);
        },

        assignDelivery: (orderId, { staffId, scheduled, vehicle, priority }) => {
          const o = get().orders.find((x) => x.id === orderId)!;
          const driver = get().staff.find((x) => x.id === staffId)!;
          const at = nowIso();
          // Reassigning an order replaces its open delivery rather than creating a second one.
          const existing = o.deliveryId ? get().deliveries.find((d) => d.id === o.deliveryId) : undefined;
          const d: Delivery = existing
            ? { ...existing, assignedTo: staffId, scheduled, vehicle, priority, log: [...existing.log, { status: 'Assigned', at, note: `Reassigned to ${driver.name}` }] }
            : { id: nextId('DN'), orderId, assignedTo: staffId, status: 'Assigned', scheduled, vehicle, priority, log: [{ status: 'Assigned', at }] };
          set((s) => ({ deliveries: existing ? s.deliveries.map((x) => (x.id === d.id ? d : x)) : [d, ...s.deliveries] }));
          patchOrder(orderId, () => ({ deliveryId: d.id }));
          if (o.status !== 'Assigned') pushStatus(orderId, 'Assigned', currentStaff()?.name ?? 'System', `Delivery ${d.id} → ${driver.name}`);
          notify({ audience: 'delivery', userId: staffId, title: `New delivery assigned: ${d.id}`, body: `${machineName(o.machineId)} to ${o.city}. Scheduled ${scheduled}.`, link: `/delivery/${d.id}` });
          log('Assigned delivery', `${orderId} → ${driver.name}`);
        },

        startDelivery: (id) => {
          const at = nowIso();
          set((s) => ({ deliveries: s.deliveries.map((d) => (d.id === id ? { ...d, status: 'In transit', log: [...d.log, { status: 'In transit', at }] } : d)) }));
          const d = get().deliveries.find((x) => x.id === id)!;
          const o = get().orders.find((x) => x.id === d.orderId)!;
          pushStatus(o.id, 'In transit', currentStaff()?.name ?? 'Delivery');
          notify({ audience: 'staff', title: `${id} in transit`, body: `Delivery for ${o.id} has started.`, link: `/delivery/${id}` });
          log('Updated delivery status', `${id} → In transit`);
        },

        completeDelivery: (id, receivedBy, proof) => {
          const at = nowIso();
          set((s) => ({
            deliveries: s.deliveries.map((d) =>
              d.id === id ? { ...d, status: 'Delivered', receivedBy, proof, deliveredAt: at, log: [...d.log, { status: 'Delivered', at, note: `Received by ${receivedBy}` }] } : d,
            ),
          }));
          const d = get().deliveries.find((x) => x.id === id)!;
          const o = get().orders.find((x) => x.id === d.orderId)!;
          pushStatus(o.id, 'Delivered', currentStaff()?.name ?? 'Delivery', `Received by ${receivedBy}`);
          for (const audience of ['staff', 'admin'] as const)
            notify({ audience, title: `${id} completed`, body: `${machineName(o.machineId)} delivered to ${o.city}. ${proof}.`, link: `/delivery/${id}` });
          log('Completed delivery', `${id} · ${proof}`);
        },

        saveMachine: (m) => {
          const exists = get().machines.some((x) => x.id === m.id);
          set((s) => ({ machines: exists ? s.machines.map((x) => (x.id === m.id ? m : x)) : [m, ...s.machines] }));
          log(exists ? 'Edited machinery record' : 'Added machinery', m.id);
        },
        toggleMachine: (id) => {
          set((s) => ({ machines: s.machines.map((m) => (m.id === id ? { ...m, active: !m.active } : m)) }));
          const m = get().machines.find((x) => x.id === id)!;
          log(m.active ? 'Published machinery' : 'Unpublished machinery', id);
        },
        saveStaff: (member) => {
          const exists = get().staff.some((x) => x.id === member.id);
          set((s) => ({ staff: exists ? s.staff.map((x) => (x.id === member.id ? member : x)) : [...s.staff, member] }));
          log(exists ? 'Updated staff account' : 'Created staff account', `${member.name} · ${member.title}`);
        },
        toggleStaff: (id) => {
          set((s) => ({ staff: s.staff.map((m) => (m.id === id ? { ...m, active: !m.active } : m)) }));
          const m = get().staff.find((x) => x.id === id)!;
          log(m.active ? 'Activated staff account' : 'Deactivated staff account', m.name);
        },

        markNotificationsRead: (audience, userId) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.audience === audience && (!n.userId || n.userId === userId) ? { ...n, read: true } : n,
            ),
          })),

        resetDemo: () => set(initial()),
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ---- Selectors -------------------------------------------------------------

export const useStaffUser = () => useStore((s) => s.staff.find((m) => m.id === s.staffId) ?? null);

export function notificationsFor(s: Store, audience: Audience, userId?: string | null) {
  return s.notifications.filter((n) => n.audience === audience && (!n.userId || n.userId === userId));
}
