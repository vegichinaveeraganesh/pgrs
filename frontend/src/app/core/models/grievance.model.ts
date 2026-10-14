export type GrievanceStage =
  | 'RECEIVED'
  | 'GIST_PREPARED'
  | 'ROUTED'
  | 'IVRS_SENT'
  | 'IN_PROGRESS'
  | 'ENDORSED'
  | 'CLOSED';

export type SlaStatus = 'on_track' | 'near_breach' | 'beyond_sla' | 'resolved';

export interface SlaInfo {
  status: SlaStatus;
  days_remaining: number | null;
  label: string;
}

export interface OfficerRef {
  name: string;
  phone: string;
  officialId?: string;
}

export interface TimelineItem {
  stage: GrievanceStage;
  label: string;
  note: string;
  at: string;
  officerName?: string;
}

export interface EndorsementInfo {
  remarks: string;
  officer_name: string;
  document_url?: string;
  original_filename?: string;
  at: string;
}

export interface FeedbackInfo {
  rating: number;
  comment?: string;
  at: string;
}

export interface Grievance {
  id: string;
  pgrs_no: string;
  applicant_name: string;
  phone: string;
  email?: string;
  mandal: string;
  mandalId?: string;
  village: string;
  villageId?: string;
  category: string;
  subject: string;
  description: string;
  gist?: string;
  stage: GrievanceStage;
  stage_label?: string;
  vro?: OfficerRef;
  tahsildar?: OfficerRef;
  sla_days: number;
  sla_deadline: string;
  sla_alert_sent?: boolean;
  timeline: TimelineItem[];
  endorsement?: EndorsementInfo | null;
  feedback?: FeedbackInfo | null;
  created_at: string;
  closed_at?: string;
  sla: SlaInfo;
}

export interface GrievanceListResponse {
  total: number;
  applications: Grievance[];
  stages: GrievanceStage[];
  stage_labels: Record<GrievanceStage, string>;
}
