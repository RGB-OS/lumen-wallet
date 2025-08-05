import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { token, isLoading } = useAuth()
    const navigate = useNavigate()
  console.log('RequireAuth component rendered', { token, isLoading })
    useEffect(() => {
      if (!isLoading && !token) {
        navigate('/') // Redirect to sign-in
      }
    }, [isLoading, token])
  
    if (isLoading) return <div>Loading...</div>
    return <>{children}</>
  }