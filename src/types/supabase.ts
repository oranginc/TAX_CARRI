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
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          employment_type: string
          salary_type: string
          salary_min: number
          salary_max: number
          prefecture: string
          city: string
          work_location: string
          working_hours: string
          required_experience: string
          required_license: string[]
          benefits: string
          status: string
          company_id: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
} 