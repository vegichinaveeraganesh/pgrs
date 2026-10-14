import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideInbox,
  LucideSparkles,
  LucideRoute,
  LucidePhoneCall,
  LucideClock3,
  LucideCircleCheck,
  LucideStar,
  LucideArrowRight,
  LucideShieldCheck,
  LucideLayers
} from '@lucide/angular';

export interface WorkflowStep {
  step: number;
  code: string;
  name: string;
  desc: string;
  iconName: string;
  details: string;
  responsibles: string;
  slaTag: string;
}

@Component({
  selector: 'app-workflow-pipeline',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideInbox,
    LucideSparkles,
    LucideRoute,
    LucidePhoneCall,
    LucideClock3,
    LucideCircleCheck,
    LucideStar,
    LucideArrowRight,
    LucideShieldCheck
  ],
  templateUrl: './workflow-pipeline.component.html',
  styleUrl: './workflow-pipeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowPipelineComponent {
  public activeStep = signal<number>(1);

  public readonly steps: WorkflowStep[] = [
    {
      step: 1,
      code: 'RECEIVED',
      name: 'Application Received',
      desc: 'Citizen grievance synced from central PGRS portal into RDO Bhimunipatnam registry.',
      iconName: 'inbox',
      details: 'Sync adapter imports petitions logged through the central PGRS AP portal, 1902 toll-free hotline, and Spandana / physical grievance submissions.',
      responsibles: 'PGRS Central Sync Adapter & RDO Helpdesk',
      slaTag: 'Day 0'
    },
    {
      step: 2,
      code: 'GIST_PREPARED',
      name: 'Gist Preparation',
      desc: 'Core issue summarized into a concise 2-line grievance brief.',
      iconName: 'sparkles',
      details: 'Natural language analysis extracts the core request, village name, survey numbers, and applicant relief into an actionable summary for the presiding officer.',
      responsibles: 'Automated Gist Summarizer Engine',
      slaTag: 'Day 1'
    },
    {
      step: 3,
      code: 'ROUTED',
      name: 'Mandal & Village Routing',
      desc: 'Auto-dispatched to the concerned Tahsildar and Village Revenue Officer (VRO).',
      iconName: 'route',
      details: 'Deterministic mapping assigns the grievance to the exact Village Revenue Officer and Tahsildar across Bheemunipatnam, Padmanabham, and Anandapuram mandals.',
      responsibles: 'Tahsildar & Assigned Village Revenue Officer (VRO)',
      slaTag: 'Day 1–2'
    },
    {
      step: 4,
      code: 'IVRS_SENT',
      name: 'IVRS Call & SMS Dispatch',
      desc: 'Automated voice call and SMS dispatched to citizen with assigned VRO phone number.',
      iconName: 'phone',
      details: 'Automated communication notifies the citizen that enquiry has commenced and provides the designated VRO direct contact number for field inquiries.',
      responsibles: 'AP Communication Gateway / Telephony',
      slaTag: 'Day 2'
    },
    {
      step: 5,
      code: 'IN_PROGRESS',
      name: 'Field Enquiry & SLA Clock',
      desc: '15-day SLA compliance clock with active near-breach and beyond-SLA alerts.',
      iconName: 'clock',
      details: 'VRO visits site, conducts boundary / revenue verification. Daily automated monitor checks elapsed days and dispatches escalation alerts if SLA approaches breach.',
      responsibles: 'Tahsildar, RDO Bhimili, and Divisional SLA Monitor',
      slaTag: 'Day 3–12'
    },
    {
      step: 6,
      code: 'ENDORSED',
      name: 'Endorsement & Proceedings',
      desc: 'Signed enquiry report and compliance endorsement uploaded to the portal.',
      iconName: 'check',
      details: 'Official uploads signed proceeding orders, field inquiry sketches, and compliance documentation. The citizen is notified of redressal outcome.',
      responsibles: 'Tahsildar & RDO Bhimunipatnam',
      slaTag: 'Day 13–15'
    },
    {
      step: 7,
      code: 'CLOSED',
      name: 'Citizen Feedback Loop',
      desc: 'Automated IVRS satisfaction call collects citizen rating (1 to 5 stars).',
      iconName: 'star',
      details: 'Citizen rates satisfaction from 1 to 5 stars via automated call. Feedback is linked back to the grievance record and analyzed on the RDO dashboard.',
      responsibles: 'Applicant & Divisional Leadership',
      slaTag: 'Post-Redressal'
    }
  ];

  selectStep(stepNumber: number) {
    this.activeStep.set(stepNumber);
  }
}
