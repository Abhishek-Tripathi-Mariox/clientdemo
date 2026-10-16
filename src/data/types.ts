export type Availability = 'In stock' | 'Limited' | 'Made to order';

export type Machine = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  stock: number;
  availability: Availability;
  leadTimeDays: number;
  active: boolean;
};

export type Customer = {
  id: string;
  name: string;
  company: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  joinedAt: string;
};

export type Role = 'staff' | 'delivery' | 'admin';

export type StaffMember = {
  id: string;
  name: string;
  role: Role;
  title: string;
  email: string;
  phone: string;
  active: boolean;
};

/** Order lifecycle shared by every panel — the single source of truth for status. */
export const ORDER_FLOW = [
  'Requested',
  'Confirmed',
  'Processing',
  'Ready',
  'Assigned',
  'In transit',
  'Delivered',
] as const;
export type OrderStatus = (typeof ORDER_FLOW)[number] | 'Cancelled';

export type StatusEvent = { status: OrderStatus; at: string; by: string; note?: string };

export type Order = {
  id: string;
  customerId: string;
  machineId: string;
  qty: number;
  unitPrice: number;
  discount: number;
  gst: number;
  total: number;
  advance: number;
  advancePaid: boolean;
  balancePaid: boolean;
  status: OrderStatus;
  siteAddress: string;
  city: string;
  note?: string;
  placedAt: string;
  handledBy?: string;
  deliveryId?: string;
  history: StatusEvent[];
};

export type DeliveryStatus = 'Assigned' | 'In transit' | 'Delivered';

export type Delivery = {
  id: string;
  orderId: string;
  assignedTo: string;
  status: DeliveryStatus;
  scheduled: string;
  priority: 'High' | 'Normal';
  vehicle: string;
  receivedBy?: string;
  proof?: string;
  deliveredAt?: string;
  log: { status: DeliveryStatus; at: string; note?: string }[];
};

export type Audience = Role;

export type Notification = {
  id: string;
  audience: Audience;
  /** Staff id; omitted means every user with that role. */
  userId?: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  link?: string;
};

export type Activity = {
  id: string;
  actor: string;
  role: Role | 'customer';
  action: string;
  target: string;
  at: string;
};
