import { Grievance, GrievanceStage } from './grievance.model';
import { NotificationMessage } from './notification.model';

export interface PgrsCategoryCard {
  id: string;
  label: string;
  count: number;
  badge?: string | null;
  color: string;
  icon?: string;
}

export interface PgrsMyDashboardStats {
  received: number;
  in_progress: {
    total: number;
    percentage: number;
    beyond_sla: number;
    beyond_sla_pct: number;
    within_sla: number;
    within_sla_pct: number;
  };
  redressed: {
    total: number;
    percentage: number;
    beyond_sla: number;
    beyond_sla_pct: number;
    within_sla: number;
    within_sla_pct: number;
  };
  reopened: {
    total: number;
    percentage: number;
  };
}

export interface DashboardSummary {
  total: number;
  active: number;
  resolved: number;
  beyond_sla: number;
  satisfaction: number;
  feedback_count: number;
  sla_days: number;
  by_mandal: Record<string, number>;
  by_category: Record<string, number>;
  by_stage: Record<GrievanceStage, number>;
  stage_labels: Record<GrievanceStage, string>;
  beyond_sla_list: Grievance[];
  recent_messages: NotificationMessage[];
  pgrs_categories?: PgrsCategoryCard[];
  pgrs_my_dashboard?: PgrsMyDashboardStats;
}
