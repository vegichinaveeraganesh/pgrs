import { SlaStatus } from '../models/grievance.model';

export interface SlaMetaItem {
  label: string;
  badgeClass: string;
  cardClass: string;
}

export const SLA_META: Record<SlaStatus, SlaMetaItem> = {
  on_track: {
    label: 'On Track',
    badgeClass: 'badge-sla-on-track',
    cardClass: 'border-emerald-200 bg-emerald-50 text-emerald-800'
  },
  near_breach: {
    label: 'Near Breach',
    badgeClass: 'badge-sla-near-breach',
    cardClass: 'border-amber-200 bg-amber-50 text-amber-800'
  },
  beyond_sla: {
    label: 'Beyond SLA',
    badgeClass: 'badge-sla-beyond',
    cardClass: 'border-red-200 bg-red-50 text-red-800'
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'badge-sla-resolved',
    cardClass: 'border-slate-200 bg-slate-50 text-slate-700'
  }
};

export const SLA_OPTIONS = [
  { value: 'on_track', label: 'On Track' },
  { value: 'near_breach', label: 'Near Breach' },
  { value: 'beyond_sla', label: 'Beyond SLA' },
  { value: 'resolved', label: 'Resolved' }
];

export const MANDALS = [
  'Bheemunipatnam',
  'Anandapuram',
  'Padmanabham',
  'Visakhapatnam Rural',
  'Seethammadhara'
];
