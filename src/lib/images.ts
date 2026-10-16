import bh90 from '@/assets/machines/bh90.jpg';
import cb45 from '@/assets/machines/cb45.jpg';
import cx75 from '@/assets/machines/cx75.jpg';
import ex220 from '@/assets/machines/ex220.jpg';
import fl30 from '@/assets/machines/fl30.jpg';
import mg180 from '@/assets/machines/mg180.jpg';
import pc14 from '@/assets/machines/pc14.jpg';
import tc30 from '@/assets/machines/tc30.jpg';
import th17 from '@/assets/machines/th17.jpg';
import tm6 from '@/assets/machines/tm6.jpg';
import vr110 from '@/assets/machines/vr110.jpg';
import wl36 from '@/assets/machines/wl36.jpg';

// Public-domain photos (see src/assets/machines/CREDITS.md), keyed by machine id.
const BY_ID: Record<string, string> = {
  'MH-EX220': ex220,
  'MH-CX75': cx75,
  'MH-WL36': wl36,
  'MH-BH90': bh90,
  'MH-TC30': tc30,
  'MH-PC14': pc14,
  'MH-MG180': mg180,
  'MH-VR110': vr110,
  'MH-CB45': cb45,
  'MH-TM6': tm6,
  'MH-FL30': fl30,
  'MH-TH17': th17,
};

const BY_CATEGORY: Record<string, string> = {
  Excavators: ex220,
  Loaders: wl36,
  Cranes: tc30,
  'Earth Moving': mg180,
  'Construction Equipment': tm6,
  'Industrial Machinery': fl30,
};

export const categoryImage = (category: string) => BY_CATEGORY[category] ?? ex220;

/** Machine photo, falling back to its category photo for catalog items added without one. */
export const machineImage = (id: string | undefined, category: string) => (id && BY_ID[id]) || categoryImage(category);
