import { useEffect, useState } from 'react'
import { storage } from '#imports';
import { authService } from '@/services/authService';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await authService.getToken()
      setToken(storedToken)
      setIsLoading(false)
    }
    fetchToken()
  }, [])

  return { token, isLoading, isAuthenticated: !!token }
}