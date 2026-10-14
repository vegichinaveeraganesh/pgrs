import { GrievanceStage } from '../models/grievance.model';

export interface StageMetaItem {
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

export const STAGE_META: Record<GrievanceStage, StageMetaItem> = {
  RECEIVED: {
    label: 'Received',
    badgeClass: 'badge-received',
    dotColor: '#64748B',
    description: 'Grievance synced from PGRS Andhra Pradesh portal into RDO Bhimunipatnam database.'
  },
  GIST_PREPARED: {
    label: 'Gist Prepared',
    badgeClass: 'badge-gist',
    dotColor: '#2563EB',
    description: 'Automated gist generated from the uploaded application for quick review.'
  },
  ROUTED: {
    label: 'Routed to VRO/Tahsildar',
    badgeClass: 'badge-routed',
    dotColor: '#4F46E5',
    description: 'Auto-dispatched to the concerned Tahsildar and VRO based on village–mandal mapping.'
  },
  IVRS_SENT: {
    label: 'IVRS Sent',
    badgeClass: 'badge-ivrs',
    dotColor: '#0891B2',
    description: 'IVRS call and SMS sent to the applicant with the VRO name and contact number.'
  },
  IN_PROGRESS: {
    label: 'Under Process',
    badgeClass: 'badge-progress',
    dotColor: '#D97706',
    description: 'Grievance under enquiry and process at the mandal level.'
  },
  ENDORSED: {
    label: 'Endorsement Issued',
    badgeClass: 'badge-endorsed',
    dotColor: '#059669',
    description: 'Endorsement uploaded and sent to the applicant with RDO Bhimunipatnam compliance message.'
  },
  CLOSED: {
    label: 'Closed',
    badgeClass: 'badge-closed',
    dotColor: '#1E293B',
    description: 'Citizen feedback recorded through IVRS and grievance officially closed.'
  }
};

export const STAGE_ORDER: GrievanceStage[] = [
  'RECEIVED',
  'GIST_PREPARED',
  'ROUTED',
  'IVRS_SENT',
  'IN_PROGRESS',
  'ENDORSED',
  'CLOSED'
];
