import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/') // Redirect to sign-in inside popup
      }
    }, [isLoading, isAuthenticated])
  
    if (isLoading) return <div>Loading...</div>
    return <>{children}</>
  }