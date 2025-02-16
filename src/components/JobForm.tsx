'use client'
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import type { Job } from '@/types/database.types'
import { supabase } from '@/lib/supabase/client'

interface JobFormProps {
  initialData?: Partial<Job>
  onSave: (data: Partial<Job>) => Promise<void>
  onSaveAsDraft?: (data: Partial<Job>) => Promise<void>
}

export default function JobForm({ initialData, onSave, onSaveAsDraft }: JobFormProps) {
  const [formData, setFormData] = useState<Partial<Job>>(initialData || {
    title: '',
    description: '',
    employment_type: 'full_time',
    salary_type: 'monthly',
    salary_min: 0,
    salary_max: 0,
    prefecture: '',
    city: '',
    work_location: '',
    working_hours: '',
    required_experience: '',
    required_license: ['普通自動車第二種免許'],
    benefits: '',
    images: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) throw new Error('ログインが必要です')

      const uploads = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `job-images/${session.session.user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        return filePath
      })

      const uploadedPaths = await Promise.all(uploads)
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedPaths]
      }))
    } catch (err) {
      console.error('Error uploading images:', err)
      setError('画像のアップロードに失敗しました')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 5
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (asDraft && onSaveAsDraft) {
        await onSaveAsDraft(formData)
      } else {
        await onSave(formData)
      }
    } catch (err) {
      setError('保存に失敗しました')
      console.error('Error saving job:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setPreviewMode(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            編集に戻る
          </button>
        </div>
        
        {/* プレビュー表示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
          {/* ... 他のプレビュー要素 ... */}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      {/* 既存のフォーム要素 */}
      
      {/* 画像アップロード */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">画像</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p>
            {isDragActive
              ? 'ここにドロップ'
              : '画像をドラッグ＆ドロップ、またはクリックして選択'}
          </p>
        </div>

        {formData.images && formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((path, index) => (
              <div key={index} className="relative">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`}
                  alt={`求人画像 ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      images: prev.images?.filter((_, i) => i !== index)
                    }))
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="space-x-4">
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-200"
          >
            プレビュー
          </button>
          {onSaveAsDraft && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 disabled:opacity-50"
            >
              下書き保存
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存する'}
        </button>
      </div>
    </form>
  )
} 