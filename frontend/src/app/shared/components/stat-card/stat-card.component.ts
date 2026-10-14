import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() tone: 'neutral' | 'blue' | 'amber' | 'emerald' | 'red' | 'gold' | 'lavender' | 'cyan' | 'pink' = 'blue';
  @Input() active: boolean = false;
  @Input() trend?: string;
  @Input() trendPositive?: boolean;
}
