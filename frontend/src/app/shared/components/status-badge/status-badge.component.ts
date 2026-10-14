import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrievanceStage, SlaStatus } from '../../../core/models/grievance.model';
import { STAGE_META } from '../../../core/constants/stages.constant';
import { SLA_META } from '../../../core/constants/sla.constant';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input() stage?: GrievanceStage | string;
  @Input() sla?: SlaStatus | string;
  @Input() customLabel?: string;
  @Input() customClass?: string;

  get stageMeta() {
    if (!this.stage) return null;
    return STAGE_META[this.stage as GrievanceStage] || {
      label: this.stage,
      badgeClass: 'badge-default',
      dotColor: '#64748B'
    };
  }

  get slaMeta() {
    if (!this.sla) return null;
    return SLA_META[this.sla as SlaStatus] || {
      label: this.sla,
      badgeClass: 'badge-sla-default'
    };
  }
}
