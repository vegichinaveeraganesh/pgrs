export interface NotificationMessage {
  id: string;
  channel: 'SMS' | 'IVRS' | 'ALERT';
  to_name: string;
  to_phone: string;
  role: 'Applicant' | 'VRO' | 'Tahsildar' | 'RDO' | 'Staff';
  text: string;
  app_id?: string;
  pgrs_no?: string;
  status: 'simulated_sent' | 'delivered' | 'failed';
  retry_count?: number;
  at: string;
}
