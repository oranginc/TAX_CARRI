import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const SignInForm = dynamic(() => import('./SignInForm'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
} 