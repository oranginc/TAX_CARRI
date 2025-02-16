'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import JobForm from '@/components/JobForm'
import type { Job } from '@/types/database.types'

export default function JobEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('company_id', session.session.user.id)
        .single()

      if (error) throw error
      if (!data) throw new Error('求人が見つかりません')

      setJob(data)
    } catch (err) {
      setError('求人情報の取得に失敗しました')
      console.error('Error fetching job:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (formData: Partial<Job>, isDraft: boolean = false) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) throw new Error('ログインが必要です')

      const { error } = await supabase
        .from('jobs')
        .update({
          ...formData,
          status: isDraft ? 'draft' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('company_id', session.session.user.id)

      if (error) throw error

      router.push(isDraft ? '/jobs/drafts' : '/jobs/manage')
    } catch (err) {
      setError('保存に失敗しました')
      console.error('Error saving job:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          {error || '求人情報が見つかりませんでした'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">求人を編集</h1>
      <JobForm
        initialData={job}
        onSave={handleSave}
        onSaveAsDraft={(formData) => handleSave(formData, true)}
      />
    </div>
  )
} 