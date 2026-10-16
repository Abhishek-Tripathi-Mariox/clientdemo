import { priceQuote } from '@/lib/pricing';

import type { Activity, Customer, Delivery, Machine, Notification, Order, OrderStatus, StaffMember, StatusEvent } from './types';
import { ORDER_FLOW } from './types';

/** Catalog structure from the proposal; final categories are agreed during implementation. */
export const CATEGORIES = ['Excavators', 'Loaders', 'Cranes', 'Earth Moving', 'Construction Equipment', 'Industrial Machinery'] as const;

type M = Omit<Machine, 'active' | 'description'> & { description?: string };
const machine = (m: M): Machine => ({ active: true, description: m.tagline, ...m });

export const MACHINES: Machine[] = [
  machine({
    id: 'MH-EX220',
    name: 'Hydraulic Excavator EX-220',
    category: 'Excavators',
    brand: 'Kaveri Earthmovers',
    price: 5240000,
    tagline: '22 T crawler excavator for mining, quarry and highway cutting',
    specs: [
      { label: 'Operating weight', value: '22,400 kg' },
      { label: 'Bucket capacity', value: '1.3 m³' },
      { label: 'Engine', value: '132 kW, BS-V' },
      { label: 'Max digging depth', value: '6.8 m' },
      { label: 'Warranty', value: '24 months / 5000 hrs' },
    ],
    stock: 5,
    availability: 'In stock',
    leadTimeDays: 10,
  }),
  machine({
    id: 'MH-CX75',
    name: 'Compact Excavator CX-75',
    category: 'Excavators',
    brand: 'Kaveri Earthmovers',
    price: 2890000,
    tagline: '7.5 T zero-tail-swing excavator for city and utility work',
    specs: [
      { label: 'Operating weight', value: '7,600 kg' },
      { label: 'Bucket capacity', value: '0.28 m³' },
      { label: 'Engine', value: '48 kW' },
      { label: 'Tail swing', value: 'Zero' },
      { label: 'Warranty', value: '24 months / 4000 hrs' },
    ],
    stock: 9,
    availability: 'In stock',
    leadTimeDays: 7,
  }),
  machine({
    id: 'MH-WL36',
    name: 'Wheel Loader WL-36',
    category: 'Loaders',
    brand: 'Sahyadri Machines',
    price: 3550000,
    tagline: '3.6 m³ high-lift loader for aggregate and port handling',
    specs: [
      { label: 'Operating weight', value: '17,200 kg' },
      { label: 'Bucket capacity', value: '3.6 m³' },
      { label: 'Engine', value: '170 kW' },
      { label: 'Transmission', value: '4F / 4R powershift' },
      { label: 'Warranty', value: '18 months / 3000 hrs' },
    ],
    stock: 3,
    availability: 'Limited',
    leadTimeDays: 14,
  }),
  machine({
    id: 'MH-BH90',
    name: 'Backhoe Loader BH-90',
    category: 'Loaders',
    brand: 'Sahyadri Machines',
    price: 2650000,
    tagline: '4WD backhoe loader with servo controls and side-shift',
    specs: [
      { label: 'Operating weight', value: '8,100 kg' },
      { label: 'Loader bucket', value: '1.1 m³' },
      { label: 'Engine', value: '68 kW' },
      { label: 'Dig depth', value: '4.9 m' },
      { label: 'Warranty', value: '12 months / 2000 hrs' },
    ],
    stock: 6,
    availability: 'In stock',
    leadTimeDays: 7,
  }),
  machine({
    id: 'MH-TC30',
    name: 'Truck Crane TC-30',
    category: 'Cranes',
    brand: 'Vindhya Lifting',
    price: 7420000,
    tagline: '30 T road-going crane with 38 m telescopic boom',
    specs: [
      { label: 'Max capacity', value: '30,000 kg' },
      { label: 'Boom length', value: '11 – 38 m' },
      { label: 'Max lift height', value: '48 m' },
      { label: 'Travel speed', value: '80 km/h' },
      { label: 'Warranty', value: '24 months' },
    ],
    stock: 2,
    availability: 'Limited',
    leadTimeDays: 21,
  }),
  machine({
    id: 'MH-PC14',
    name: 'Pick & Carry Crane PC-14',
    category: 'Cranes',
    brand: 'Vindhya Lifting',
    price: 2180000,
    tagline: '14 T articulated pick-and-carry crane for plants and yards',
    specs: [
      { label: 'Max capacity', value: '14,000 kg' },
      { label: 'Boom length', value: '17.5 m' },
      { label: 'Engine', value: '75 kW' },
      { label: 'Turning radius', value: '6.2 m' },
      { label: 'Warranty', value: '18 months' },
    ],
    stock: 4,
    availability: 'In stock',
    leadTimeDays: 10,
  }),
  machine({
    id: 'MH-MG180',
    name: 'Motor Grader MG-180',
    category: 'Earth Moving',
    brand: 'Kaveri Earthmovers',
    price: 6150000,
    tagline: '180 hp grader with 3.7 m moldboard for road formation',
    specs: [
      { label: 'Operating weight', value: '15,800 kg' },
      { label: 'Moldboard', value: '3.7 m' },
      { label: 'Engine', value: '134 kW' },
      { label: 'Drive', value: '6 × 4' },
      { label: 'Warranty', value: '24 months / 4000 hrs' },
    ],
    stock: 1,
    availability: 'Limited',
    leadTimeDays: 28,
  }),
  machine({
    id: 'MH-VR110',
    name: 'Soil Compactor VR-110',
    category: 'Earth Moving',
    brand: 'Narmada Roadtech',
    price: 2380000,
    tagline: '11 T single-drum vibratory roller for embankments',
    specs: [
      { label: 'Operating weight', value: '11,200 kg' },
      { label: 'Drum width', value: '2.13 m' },
      { label: 'Centrifugal force', value: '260 kN' },
      { label: 'Engine', value: '82 kW' },
      { label: 'Warranty', value: '18 months' },
    ],
    stock: 0,
    availability: 'Made to order',
    leadTimeDays: 35,
  }),
  machine({
    id: 'MH-CB45',
    name: 'Concrete Batching Plant CB-45',
    category: 'Construction Equipment',
    brand: 'Narmada Roadtech',
    price: 4690000,
    tagline: '45 m³/hr mobile batching plant with pan mixer',
    specs: [
      { label: 'Output', value: '45 m³ / hr' },
      { label: 'Mixer', value: 'Planetary 750 L' },
      { label: 'Aggregate bins', value: '3 × 12 m³' },
      { label: 'Control', value: 'PLC + SCADA' },
      { label: 'Installation', value: 'Included' },
    ],
    stock: 2,
    availability: 'In stock',
    leadTimeDays: 30,
  }),
  machine({
    id: 'MH-TM6',
    name: 'Transit Mixer TM-6',
    category: 'Construction Equipment',
    brand: 'Narmada Roadtech',
    price: 3120000,
    tagline: '6 m³ truck-mounted mixer with hydraulic drum drive',
    specs: [
      { label: 'Drum capacity', value: '6 m³' },
      { label: 'Drum speed', value: '0 – 14 rpm' },
      { label: 'Chassis', value: '6 × 4, 28 T GVW' },
      { label: 'Water tank', value: '400 L' },
      { label: 'Warranty', value: '12 months' },
    ],
    stock: 4,
    availability: 'In stock',
    leadTimeDays: 12,
  }),
  machine({
    id: 'MH-FL30',
    name: 'Diesel Forklift FL-30',
    category: 'Industrial Machinery',
    brand: 'Godavari Industrial',
    price: 1890000,
    tagline: '3 T diesel forklift for yards, plants and loading docks',
    specs: [
      { label: 'Rated capacity', value: '3,000 kg' },
      { label: 'Lift height', value: '4.5 m' },
      { label: 'Engine', value: '45 kW diesel' },
      { label: 'Tyres', value: 'Pneumatic' },
      { label: 'Warranty', value: '24 months / 3000 hrs' },
    ],
    stock: 7,
    availability: 'In stock',
    leadTimeDays: 5,
  }),
  machine({
    id: 'MH-TH17',
    name: 'Telehandler TH-17',
    category: 'Industrial Machinery',
    brand: 'Godavari Industrial',
    price: 4120000,
    tagline: '17 m telescopic handler for lifting materials on site',
    specs: [
      { label: 'Max lift capacity', value: '4,000 kg' },
      { label: 'Max lift height', value: '17 m' },
      { label: 'Engine', value: '74 kW' },
      { label: 'Drive', value: '4WD, 4-wheel steer' },
      { label: 'Warranty', value: '24 months' },
    ],
    stock: 3,
    availability: 'Limited',
    leadTimeDays: 12,
  }),
];

export const CUSTOMERS: Customer[] = [
  { id: 'CU-2001', name: 'Ankit Sharma', company: 'Shree Ganesh Infracon', city: 'Indore', address: 'Sector C, Sanwer Road Industrial Area', phone: '+91 98260 11447', email: 'ankit@shreeganeshinfra.in', joinedAt: '2026-04-11T10:00:00' },
  { id: 'CU-2002', name: 'Lakshmi Narayanan', company: 'Coromandel Buildtech', city: 'Chennai', address: '41, SIDCO Industrial Estate, Ambattur', phone: '+91 94440 26318', email: 'lakshmi@coromandelbuild.in', joinedAt: '2026-05-02T10:00:00' },
  { id: 'CU-2003', name: 'Gurpreet Kaur', company: 'Punjab Road Builders', city: 'Amritsar', address: 'GT Road Bypass, near Verka Chowk', phone: '+91 98140 77215', email: 'gurpreet@punjabroad.in', joinedAt: '2026-05-19T10:00:00' },
  { id: 'CU-2004', name: 'Sameer Kulkarni', company: 'Deccan Highways Ltd', city: 'Nagpur', address: 'Plot 22, Butibori MIDC', phone: '+91 98230 50982', email: 'sameer@deccanhighways.in', joinedAt: '2026-06-08T10:00:00' },
  { id: 'CU-2005', name: 'Fatima Sheikh', company: 'Gulf Coast Projects', city: 'Surat', address: 'Hazira Industrial Belt, Gate 4', phone: '+91 99250 31876', email: 'fatima@gulfcoastprojects.in', joinedAt: '2026-07-14T10:00:00' },
  { id: 'CU-2006', name: 'Rohit Bansal', company: 'Bansal Mining Co.', city: 'Raipur', address: 'Urla Industrial Complex, Phase 3', phone: '+91 94252 64410', email: 'rohit@bansalmining.in', joinedAt: '2026-08-01T10:00:00' },
  { id: 'CU-2007', name: 'Deepa Menon', company: 'Malabar Constructions', city: 'Kozhikode', address: 'Kinfra Park, Ramanattukara', phone: '+91 94470 58123', email: 'deepa@malabarconstructions.in', joinedAt: '2026-09-21T10:00:00' },
  { id: 'CU-2008', name: 'Arvind Rao', company: 'Godavari Infra', city: 'Vijayawada', address: 'Auto Nagar, 3rd Cross Road', phone: '+91 98490 72660', email: 'arvind@godavariinfra.in', joinedAt: '2026-10-09T10:00:00' },
];

export const DEMO_PASSWORD = 'demo123';

export const STAFF: StaffMember[] = [
  { id: 'ST-11', name: 'Karan Malhotra', role: 'staff', title: 'Sales & Operations', email: 'staff@demo.com', phone: '+91 98100 23456', active: true },
  { id: 'ST-12', name: 'Pooja Iyer', role: 'staff', title: 'Operations Manager', email: 'pooja@demo.com', phone: '+91 98100 67812', active: true },
  { id: 'ST-21', name: 'Manoj Tiwari', role: 'delivery', title: 'Delivery Executive', email: 'delivery@demo.com', phone: '+91 97170 44321', active: true },
  { id: 'ST-22', name: 'Ravi Chauhan', role: 'delivery', title: 'Delivery Executive', email: 'ravi@demo.com', phone: '+91 97170 90876', active: true },
  { id: 'ST-31', name: 'Meghna Joshi', role: 'admin', title: 'Super Admin', email: 'admin@demo.com', phone: '+91 98110 55001', active: true },
  { id: 'ST-13', name: 'Nikhil Verma', role: 'staff', title: 'Sales & Operations', email: 'nikhil@demo.com', phone: '+91 98100 31290', active: false },
];

/** Status history that walks the flow up to `status`, one step every `stepDays`. */
function history(status: OrderStatus, placedAt: string, stepDays = 2): StatusEvent[] {
  const end = status === 'Cancelled' ? 1 : ORDER_FLOW.indexOf(status);
  const start = new Date(placedAt).getTime();
  const by = (s: OrderStatus) => (s === 'Requested' ? 'Customer' : s === 'In transit' || s === 'Delivered' ? 'Manoj Tiwari' : 'Karan Malhotra');
  const events: StatusEvent[] = ORDER_FLOW.slice(0, end + 1).map((s, i) => ({ status: s, at: new Date(start + i * stepDays * 86400000).toISOString(), by: by(s) }));
  if (status === 'Cancelled')
    events.push({ status: 'Cancelled', at: new Date(start + 3 * 86400000).toISOString(), by: 'Pooja Iyer', note: 'Customer deferred the project' });
  return events;
}

function order(id: string, customerId: string, machineId: string, qty: number, status: OrderStatus, placedAt: string, extra: Partial<Order> = {}): Order {
  const m = MACHINES.find((x) => x.id === machineId)!;
  const c = CUSTOMERS.find((x) => x.id === customerId)!;
  const q = priceQuote(m.price, qty);
  const reached = (s: (typeof ORDER_FLOW)[number]) => status !== 'Cancelled' && ORDER_FLOW.indexOf(status) >= ORDER_FLOW.indexOf(s);
  return {
    id,
    customerId,
    machineId,
    qty,
    unitPrice: q.unitPrice,
    discount: q.discount,
    gst: q.gst,
    total: q.total,
    advance: q.advance,
    advancePaid: reached('Processing'),
    balancePaid: reached('Delivered'),
    status,
    siteAddress: c.address,
    city: c.city,
    placedAt,
    handledBy: status === 'Requested' ? undefined : 'ST-11',
    history: history(status, placedAt),
    ...extra,
  };
}

export const ORDERS: Order[] = [
  order('SO-1058', 'CU-2008', 'MH-MG180', 1, 'Requested', '2026-10-15T16:40:00', { note: 'State highway package starting December. Wants operator training included.' }),
  order('SO-1057', 'CU-2007', 'MH-CX75', 2, 'Requested', '2026-10-15T11:05:00', { note: 'Two units for a drainage project inside the city; zero tail swing is a must.' }),
  order('SO-1056', 'CU-2006', 'MH-TH17', 2, 'Requested', '2026-10-14T09:30:00', { note: 'Material handling at our limestone plant. Quote for two units.' }),
  order('SO-1055', 'CU-2004', 'MH-VR110', 2, 'Confirmed', '2026-10-12T12:10:00', { note: 'Will release the advance once the project LOI is signed.' }),
  order('SO-1054', 'CU-2005', 'MH-TC30', 1, 'Processing', '2026-10-08T10:00:00', { handledBy: 'ST-12' }),
  order('SO-1053', 'CU-2002', 'MH-TM6', 2, 'Processing', '2026-10-07T15:20:00'),
  order('SO-1052', 'CU-2003', 'MH-WL36', 1, 'Ready', '2026-10-05T09:45:00'),
  order('SO-1051', 'CU-2001', 'MH-EX220', 1, 'Assigned', '2026-10-03T10:00:00', { deliveryId: 'DN-3014' }),
  order('SO-1050', 'CU-2006', 'MH-FL30', 2, 'In transit', '2026-10-01T10:00:00', { deliveryId: 'DN-3013' }),
  order('SO-1047', 'CU-2002', 'MH-CB45', 1, 'Delivered', '2026-09-10T10:00:00', { deliveryId: 'DN-3009' }),
  order('SO-1044', 'CU-2003', 'MH-PC14', 1, 'Delivered', '2026-08-26T10:00:00', { deliveryId: 'DN-3006' }),
  order('SO-1041', 'CU-2001', 'MH-BH90', 2, 'Delivered', '2026-08-12T10:00:00', { deliveryId: 'DN-3004' }),
  order('SO-1046', 'CU-2005', 'MH-CX75', 1, 'Cancelled', '2026-09-04T10:00:00'),
];

function log(status: Delivery['status'], from: string) {
  const steps: Delivery['status'][] = ['Assigned', 'In transit', 'Delivered'];
  const t = new Date(from).getTime();
  return steps.slice(0, steps.indexOf(status) + 1).map((s, i) => ({ status: s, at: new Date(t + i * 86400000).toISOString() }));
}

export const DELIVERIES: Delivery[] = [
  { id: 'DN-3014', orderId: 'SO-1051', assignedTo: 'ST-21', status: 'Assigned', scheduled: '2026-10-18', priority: 'High', vehicle: 'MP-09-HG-2231 · Hydraulic low-bed', log: log('Assigned', '2026-10-15T12:00:00') },
  { id: 'DN-3013', orderId: 'SO-1050', assignedTo: 'ST-21', status: 'In transit', scheduled: '2026-10-17', priority: 'Normal', vehicle: 'CG-04-MK-5520 · 32 ft trailer', log: log('In transit', '2026-10-15T08:00:00') },
  { id: 'DN-3009', orderId: 'SO-1047', assignedTo: 'ST-22', status: 'Delivered', scheduled: '2026-09-29', priority: 'Normal', vehicle: 'TN-01-BX-7744 · Multi-axle trailer', receivedBy: 'K. Raman, Plant Head', proof: 'Signature captured', deliveredAt: '2026-09-29T15:20:00', log: log('Delivered', '2026-09-27T09:00:00') },
  { id: 'DN-3006', orderId: 'SO-1044', assignedTo: 'ST-21', status: 'Delivered', scheduled: '2026-09-12', priority: 'Normal', vehicle: 'PB-02-DL-1190 · Low-bed trailer', receivedBy: 'Gurpreet Kaur', proof: 'OTP verified', deliveredAt: '2026-09-12T12:05:00', log: log('Delivered', '2026-09-10T09:00:00') },
  { id: 'DN-3004', orderId: 'SO-1041', assignedTo: 'ST-21', status: 'Delivered', scheduled: '2026-08-27', priority: 'Normal', vehicle: 'MP-09-HG-2231 · Hydraulic low-bed', receivedBy: 'Site engineer, Shree Ganesh Infracon', proof: 'Photo proof uploaded', deliveredAt: '2026-08-28T10:40:00', log: log('Delivered', '2026-08-26T09:00:00') },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'NT-101', audience: 'staff', title: 'New request SO-1058', body: 'Arvind Rao (Godavari Infra) requested 1 × Motor Grader MG-180.', at: '2026-10-15T16:40:00', read: false, link: '/order/SO-1058' },
  { id: 'NT-102', audience: 'staff', title: 'New request SO-1057', body: 'Deepa Menon (Malabar Constructions) requested 2 × Compact Excavator CX-75.', at: '2026-10-15T11:05:00', read: false, link: '/order/SO-1057' },
  { id: 'NT-103', audience: 'staff', title: 'SO-1052 ready for dispatch', body: 'Wheel Loader WL-36 for Punjab Road Builders passed final QC.', at: '2026-10-14T18:10:00', read: true, link: '/order/SO-1052' },
  { id: 'NT-104', audience: 'delivery', userId: 'ST-21', title: 'New delivery assigned: DN-3014', body: 'Hydraulic Excavator EX-220 to Shree Ganesh Infracon, Indore. Scheduled 18 Oct.', at: '2026-10-15T12:00:00', read: false, link: '/delivery/DN-3014' },
  { id: 'NT-105', audience: 'admin', title: 'SO-1052 waiting for a driver', body: 'Wheel Loader WL-36 is ready for dispatch and has no delivery assigned.', at: '2026-10-14T18:10:00', read: false, link: '/order/SO-1052' },
  { id: 'NT-106', audience: 'admin', title: 'Low stock: Motor Grader MG-180', body: 'Only 1 unit left and a new request is pending.', at: '2026-10-15T16:45:00', read: false, link: '/machinery' },
];

export const ACTIVITY: Activity[] = [
  { id: 'AC-201', actor: 'Arvind Rao', role: 'customer', action: 'Submitted request', target: 'SO-1058', at: '2026-10-15T16:40:00' },
  { id: 'AC-202', actor: 'Karan Malhotra', role: 'staff', action: 'Assigned delivery', target: 'SO-1051 → Manoj Tiwari', at: '2026-10-15T12:00:00' },
  { id: 'AC-203', actor: 'Deepa Menon', role: 'customer', action: 'Submitted request', target: 'SO-1057', at: '2026-10-15T11:05:00' },
  { id: 'AC-204', actor: 'Manoj Tiwari', role: 'delivery', action: 'Updated delivery status', target: 'DN-3013 → In transit', at: '2026-10-15T08:00:00' },
  { id: 'AC-205', actor: 'Pooja Iyer', role: 'staff', action: 'Moved order to Processing', target: 'SO-1054', at: '2026-10-14T10:30:00' },
  { id: 'AC-206', actor: 'Meghna Joshi', role: 'admin', action: 'Edited machinery record', target: 'MH-MG180', at: '2026-10-13T17:15:00' },
];

/** Monthly order value and count for reports (illustrative). */
export const MONTHLY = [
  { label: 'May', orders: 18, revenue: 31200000 },
  { label: 'Jun', orders: 22, revenue: 38900000 },
  { label: 'Jul', orders: 19, revenue: 34100000 },
  { label: 'Aug', orders: 27, revenue: 46800000 },
  { label: 'Sep', orders: 24, revenue: 42300000 },
  { label: 'Oct', orders: 16, revenue: 29500000 },
];
