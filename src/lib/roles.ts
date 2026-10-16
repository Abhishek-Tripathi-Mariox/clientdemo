import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  History,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Package,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';

import type { Role } from '@/data/types';

export type NavItem = { to: string; label: string; icon: LucideIcon; screen: string };

const item = (screen: string, label: string, icon: LucideIcon): NavItem => ({
  screen,
  label,
  icon,
  to: screen === 'index' ? '/' : `/${screen}`,
});

export const NAV: Record<Role, NavItem[]> = {
  staff: [
    item('index', 'Home', LayoutDashboard),
    item('requests', 'Requests', Inbox),
    item('orders', 'Orders', ClipboardList),
    item('deliveries', 'Deliveries', Truck),
    item('customers', 'Customers', Users),
    item('notifications', 'Notifications', Bell),
    item('activity', 'Audit log', Activity),
  ],
  delivery: [
    item('index', 'My route', Truck),
    item('history', 'Delivery history', History),
    item('notifications', 'Notifications', Bell),
  ],
  admin: [
    item('index', 'Overview', LayoutDashboard),
    item('orders', 'Orders', ClipboardList),
    item('deliveries', 'Deliveries', Truck),
    item('customers', 'Customers', Users),
    item('machinery', 'Machinery', Package),
    item('staff', 'Team', ShieldCheck),
    item('reports', 'Reports', BarChart3),
    item('notifications', 'Notifications', Bell),
    item('activity', 'Audit log', Activity),
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  staff: 'Staff Operations',
  delivery: 'Delivery Panel',
  admin: 'Admin Control Centre',
};

/** Screens reachable by role, including detail screens that are not in the nav. */
const EXTRA: Record<Role, string[]> = {
  staff: ['order', 'delivery'],
  delivery: ['delivery'],
  admin: ['order', 'delivery', 'requests'],
};

export function canAccess(role: Role, screen: string) {
  return NAV[role].some((n) => n.screen === screen) || EXTRA[role].includes(screen);
}

/** Granular permission matrix shown on the Staff & roles screen (RBAC). */
export const PERMISSIONS: { key: string; label: string; roles: Role[] }[] = [
  { key: 'requests.review', label: 'Review & confirm requests', roles: ['staff', 'admin'] },
  { key: 'orders.status', label: 'Update order status', roles: ['staff', 'admin'] },
  { key: 'delivery.assign', label: 'Assign deliveries', roles: ['staff', 'admin'] },
  { key: 'delivery.update', label: 'Update delivery status & proof', roles: ['delivery', 'admin'] },
  { key: 'customers.view', label: 'View customer records', roles: ['staff', 'admin'] },
  { key: 'catalog.manage', label: 'Manage machinery catalog', roles: ['admin'] },
  { key: 'staff.manage', label: 'Manage staff & roles', roles: ['admin'] },
  { key: 'reports.view', label: 'View reports & audit log', roles: ['admin'] },
];
