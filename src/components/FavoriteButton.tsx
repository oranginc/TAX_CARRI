'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface FavoriteButtonProps {
  jobId: string
}

export default function FavoriteButton({ jobId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkFavoriteStatus()
  }, [jobId])

  const checkFavoriteStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('job_id', jobId)
        .eq('job_seeker_id', session.session.user.id)
        .single()

      setIsFavorited(!!data)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        // ログインページへリダイレクト
        window.location.href = '/auth/login'
        return
      }

      if (isFavorited) {
        // お気に入りから削除
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', jobId)
          .eq('job_seeker_id', session.session.user.id)
      } else {
        // お気に入りに追加
        await supabase
          .from('saved_jobs')
          .insert({
            job_id: jobId,
            job_seeker_id: session.session.user.id
          })
      }

      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (isLoading) return null

  return (
    <button
      onClick={toggleFavorite}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
    >
      {isFavorited ? (
        <HeartSolidIcon className="h-6 w-6 text-red-500" />
      ) : (
        <HeartIcon className="h-6 w-6 text-gray-400" />
      )}
    </button>
  )
} 