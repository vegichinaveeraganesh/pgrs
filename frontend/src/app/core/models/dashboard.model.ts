import { Grievance, GrievanceStage } from './grievance.model';
import { NotificationMessage } from './notification.model';

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
}
