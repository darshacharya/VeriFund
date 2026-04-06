export interface User {
  id: number;
  email: string;
  name: string;
  role: "seeker" | "donor" | "admin";
  created_at: string;
}

export interface FundBreakdown {
  id: number;
  label: string;
  amount: number;
}

export interface Document {
  id: number;
  doc_type: string;
  original_filename: string;
  admin_verified: boolean;
  donor_visible: boolean;
}

export interface Donation {
  id: number;
  donor_id: number;
  case_id: number;
  amount: number;
  payment_id?: string;
  status: string;
  created_at: string;
  donor?: User;
}

export interface FundUsage {
  id: number;
  case_id: number;
  description: string;
  amount: number;
  receipt_path?: string;
  created_at: string;
}

export interface CaseUpdate {
  id: number;
  case_id: number;
  content: string;
  update_type: string;
  created_at: string;
}

export interface Case {
  id: number;
  seeker_id: number;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  status: string;
  urgency: string;
  admin_notes?: string;
  created_at: string;
  seeker?: User;
  fund_breakdowns: FundBreakdown[];
}

export interface CaseDetail extends Case {
  documents: Document[];
  donations: Donation[];
  fund_usages: FundUsage[];
  updates: CaseUpdate[];
}

export interface Notification {
  id: number;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}
