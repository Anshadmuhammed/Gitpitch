export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'recruiter' | 'developer';
  company?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface DeveloperProfile {
  id: string;
  user_id: string;
  github_username: string;
  github_id?: string;
  bio?: string;
  location?: string;
  city?: string;
  top_languages?: string[];
  top_repos?: any;
  total_commits?: number;
  total_stars?: number;
  followers?: number;
  experience_years?: number;
  open_to_work?: boolean;
  salary_min?: number;
  salary_max?: number;
  github_raw?: any;
  last_synced_at?: string;
  created_at?: string;
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  plan?: 'free' | 'starter' | 'growth' | 'enterprise';
  outreach_credits?: number;
  created_at?: string;
}

export interface Shortlist {
  id: string;
  recruiter_id: string;
  developer_id: string;
  notes?: string;
  status?: 'saved' | 'contacted' | 'replied' | 'hired' | 'rejected';
  created_at?: string;
}

export interface OutreachCampaign {
  id: string;
  recruiter_id: string;
  developer_id: string;
  subject?: string;
  body?: string;
  status?: 'draft' | 'sent' | 'opened' | 'replied' | 'bounced';
  sent_at?: string;
  replied_at?: string;
  created_at?: string;
}
