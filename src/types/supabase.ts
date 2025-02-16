export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'job_seeker' | 'company'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'job_seeker' | 'company'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'job_seeker' | 'company'
          updated_at?: string
        }
      }
      job_seeker_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          phone: string
          address: string
          birth_date: string
          driver_license_type: string[]
          driver_license_number: string
          driver_license_expiry: string
          years_of_experience: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          phone: string
          address: string
          birth_date: string
          driver_license_type: string[]
          driver_license_number: string
          driver_license_expiry: string
          years_of_experience: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          first_name?: string
          last_name?: string
          phone?: string
          address?: string
          birth_date?: string
          driver_license_type?: string[]
          driver_license_number?: string
          driver_license_expiry?: string
          years_of_experience?: number
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          employment_type: 'full_time' | 'part_time' | 'contract'
          salary_type: 'monthly' | 'daily' | 'commission'
          salary_min: number
          salary_max: number
          work_location: string
          prefecture: string
          city: string
          working_hours: string
          required_experience: string
          required_license: string[]
          benefits: string
          status: 'active' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          employment_type: 'full_time' | 'part_time' | 'contract'
          salary_type: 'monthly' | 'daily' | 'commission'
          salary_min: number
          salary_max: number
          work_location: string
          prefecture: string
          city: string
          working_hours: string
          required_experience: string
          required_license: string[]
          benefits: string
          status: 'active' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          title?: string
          description?: string
          employment_type?: 'full_time' | 'part_time' | 'contract'
          salary_type?: 'monthly' | 'daily' | 'commission'
          salary_min?: number
          salary_max?: number
          work_location?: string
          prefecture?: string
          city?: string
          working_hours?: string
          required_experience?: string
          required_license?: string[]
          benefits?: string
          status?: 'active' | 'closed'
          updated_at?: string
        }
      }
    }
  }
} 