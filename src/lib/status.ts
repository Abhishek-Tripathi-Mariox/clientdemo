import {
  Ban,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Factory,
  type LucideIcon,
  PackageCheck,
  Send,
  Truck,
  UserCheck,
} from 'lucide-react';

export type Tone = 'slate' | 'blue' | 'violet' | 'amber' | 'green' | 'red' | 'coral' | 'brand';

export const TONE: Record<Tone, { chip: string; dot: string; solid: string }> = {
  slate: { chip: 'bg-slate-50 text-ink-2', dot: 'bg-faint', solid: 'bg-ink-2' },
  blue: { chip: 'bg-blue-50 text-blue', dot: 'bg-blue', solid: 'bg-blue' },
  violet: { chip: 'bg-violet-50 text-violet', dot: 'bg-violet', solid: 'bg-violet' },
  amber: { chip: 'bg-amber-50 text-amber', dot: 'bg-amber', solid: 'bg-amber' },
  green: { chip: 'bg-green-50 text-green', dot: 'bg-green', solid: 'bg-green' },
  red: { chip: 'bg-red-50 text-red', dot: 'bg-red', solid: 'bg-red' },
  coral: { chip: 'bg-coral-50 text-coral', dot: 'bg-coral', solid: 'bg-coral' },
  brand: { chip: 'bg-brand-50 text-brand-700', dot: 'bg-brand', solid: 'bg-brand' },
};

/** Every order status has a tone and an icon, so status is never conveyed by colour alone. */
export const ORDER_STATUS: Record<string, { tone: Tone; icon: LucideIcon; label: string }> = {
  Requested: { tone: 'coral', icon: Send, label: 'New request' },
  Confirmed: { tone: 'blue', icon: UserCheck, label: 'Confirmed' },
  Processing: { tone: 'violet', icon: Factory, label: 'In processing' },
  Ready: { tone: 'amber', icon: PackageCheck, label: 'Ready to dispatch' },
  Assigned: { tone: 'amber', icon: CircleDot, label: 'Driver assigned' },
  'In transit': { tone: 'brand', icon: Truck, label: 'In transit' },
  Delivered: { tone: 'green', icon: CheckCircle2, label: 'Delivered' },
  Cancelled: { tone: 'red', icon: Ban, label: 'Cancelled' },
};

const OTHER: Record<string, Tone> = {
  'In stock': 'green',
  Limited: 'amber',
  'Made to order': 'slate',
  Active: 'green',
  Inactive: 'slate',
  Paid: 'green',
  Pending: 'amber',
  High: 'red',
  Normal: 'slate',
};

export const toneFor = (s: string): Tone => ORDER_STATUS[s]?.tone ?? OTHER[s] ?? 'slate';
export const iconFor = (s: string): LucideIcon => ORDER_STATUS[s]?.icon ?? CircleDashed;
