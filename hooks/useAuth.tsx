import { useEffect, useState } from 'react'
import { storage } from '#imports';
import { authService } from '@/services/authService';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAuth = async () => {
      const storedToken = await authService.getToken()
      setToken(storedToken)
      // Connected when an endpoint is configured; the token is optional
      setIsAuthenticated(await authService.isAuthenticated())
      setIsLoading(false)
    }
    fetchAuth()
  }, [])

  return { token, isLoading, isAuthenticated }
}