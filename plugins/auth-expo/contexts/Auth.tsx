import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createContext, useCallback, useEffect, useMemo,
} from 'react'

import { TOKEN_KEY } from '../config'
import getToken from '../utils/getToken'

export const AuthContext = createContext({
  token: null as string | null,
  logout: () => {},
})

export const ReadToken = async (): Promise<string | null> => AsyncStorage.getItem(TOKEN_KEY)

export const AuthProvider: React.FC<React.PropsWithChildren<{ readonly token: string | null, readonly setToken: (token: string | null) => void }>> = ({ children, token, setToken }) => {
  useEffect(() => {
    getToken().then(setToken)
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={useMemo(() => ({
      token,
      logout,
    }), [token])}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
