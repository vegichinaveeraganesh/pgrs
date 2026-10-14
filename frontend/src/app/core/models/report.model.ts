export interface Report {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type?: 'summary' | 'mandal' | 'sla' | 'category' | 'custom';
  created_at: string | Date;
  updated_at?: string | Date;
  ownerName: string;
  downloadUrl: string;
  data?: any;
  mandal?: string;
  generated_by?: string;
}
