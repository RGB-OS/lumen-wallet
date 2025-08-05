import { useEffect, useState } from 'react'
import { storage } from '#imports';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await storage.getItem<string>('local:access-token')
      if (storedToken) {
        const [, payloadBase64] = storedToken.split('.')
        const payloadJson = atob(payloadBase64)
        const payload = JSON.parse(payloadJson)
        const now = Date.now() / 1000 // in seconds
        if (payload.exp && payload.exp < now) {
          console.warn('Token expired')
          await storage.removeItem('local:access-token')
          setToken(null)
        } else {
          setToken(storedToken)
        }
      }else{
      setToken(null)
    }
      setIsLoading(false)
    }
    fetchToken()
  }, [])

  return { token, isLoading, isAuthenticated: !!token }
}