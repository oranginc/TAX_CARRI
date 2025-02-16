# タクシー会社求人サイト データ設計

## Supabase テーブル設計

### users（ユーザーテーブル）
- id: uuid (PK)
- email: string
- password_hash: string
- role: enum ['job_seeker', 'company']
- created_at: timestamp
- updated_at: timestamp

### job_seeker_profiles（求職者プロフィール）
- id: uuid (PK)
- user_id: uuid (FK -> users.id)
- first_name: string
- last_name: string
- phone: string
- address: string
- birth_date: date
- driver_license_type: string[]
- driver_license_number: string
- driver_license_expiry: date
- years_of_experience: number
- created_at: timestamp
- updated_at: timestamp

### companies（企業テーブル）
- id: uuid (PK)
- user_id: uuid (FK -> users.id)
- company_name: string
- company_name_kana: string
- representative: string
- phone: string
- email: string
- website: string
- address: string
- prefecture: string
- city: string
- business_license: string
- establishment_year: number
- company_size: number
- fleet_size: number
- operation_area: string[]
- description: text
- benefits: text
- training_system: text
- created_at: timestamp
- updated_at: timestamp

### company_images（企業画像）
- id: uuid (PK)
- company_id: uuid (FK -> companies.id)
- image_url: string
- image_type: enum ['office', 'vehicle', 'staff', 'other']
- caption: string
- created_at: timestamp

### jobs（求人情報）
- id: uuid (PK)
- company_id: uuid (FK -> companies.id)
- title: string
- description: text
- employment_type: enum ['full_time', 'part_time', 'contract']
- salary_type: enum ['monthly', 'daily', 'commission']
- salary_min: number
- salary_max: number
- work_location: string
- prefecture: string
- city: string
- working_hours: text
- required_experience: text
- required_license: string[]
- benefits: text
- status: enum ['active', 'closed']
- created_at: timestamp
- updated_at: timestamp

### job_applications（応募情報）
- id: uuid (PK)
- job_id: uuid (FK -> jobs.id)
- job_seeker_id: uuid (FK -> job_seeker_profiles.id)
- status: enum ['pending', 'reviewed', 'interviewed', 'accepted', 'rejected']
- cover_letter: text
- resume_url: string
- created_at: timestamp
- updated_at: timestamp

### driver_interviews（ドライバーインタビュー）
- id: uuid (PK)
- company_id: uuid (FK -> companies.id)
- driver_name: string
- position: string
- years_of_service: number
- content: text
- image_url: string
- created_at: timestamp

### saved_jobs（保存した求人）
- id: uuid (PK)
- job_id: uuid (FK -> jobs.id)
- job_seeker_id: uuid (FK -> job_seeker_profiles.id)
- created_at: timestamp

## インデックス設計

### users
- email (unique)

### companies
- prefecture, city
- company_name
- company_name_kana

### jobs
- prefecture, city
- employment_type
- salary_type
- status
- company_id

## Storage バケット構成

### company-images/
- 企業画像保存用
- パス形式: company-images/{company_id}/{image_id}.{ext}

### resumes/
- 履歴書保存用
- パス形式: resumes/{job_seeker_id}/{timestamp}.{ext}

### licenses/
- 免許証画像保存用
- パス形式: licenses/{job_seeker_id}/{type}.{ext}

## 認証・認可ポリシー

### 公開データ
- 企業基本情報
- 求人情報
- ドライバーインタビュー

### 認証必須データ
- 求職者：応募履歴、保存した求人
- 企業：応募者情報、求人管理

### Row Level Security (RLS)
- 求職者は自身のプロフィールのみ編集可能
- 企業は自社の求人情報のみ編集可能
- 応募情報は関係する求職者と企業のみアクセス可能 