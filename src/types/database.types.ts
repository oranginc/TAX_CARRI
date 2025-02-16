export type User = {
  id: string;
  email: string;
  role: 'job_seeker' | 'company';
};

export type JobSeekerProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  // ... 他のプロフィール情報
};

export type Company = {
  id: string;
  userId: string;
  companyName: string;
  // ... 他の会社情報
};

export interface Job {
  id: string;
  title: string;
  description: string;
  employment_type: 'full_time' | 'part_time' | 'contract';
  salary_type: 'monthly' | 'daily' | 'commission';
  salary_min: number;
  salary_max: number;
  prefecture: string;
  city: string;
  work_location: string;
  working_hours: string;
  required_experience: string;
  required_license: string[];
  benefits: string;
  status: 'active' | 'draft' | 'closed';
  company_id: string;
  created_at: string;
  updated_at: string;
  images?: string[];
  companies?: {
    company_name: string;
    prefecture: string;
    city: string;
    description: string;
    benefits: string;
    training_system: string;
  };
} 