import { useState } from 'react'
import { Button, SafeAreaView, Text } from 'react-native'
import { ShowForAuthenticated } from 'readapt-plugin-auth-expo/components/ShowForAuthenticated'
import { ShowForUnauthenticated } from 'readapt-plugin-auth-expo/components/ShowForUnauthenticated'

import LogoutButton from './components/LogoutButton'
import { AuthProvider } from './contexts/Auth'

export default function App() {
  const [token, setToken] = useState<string | null>(null)

  return (
    <SafeAreaView>
      <AuthProvider token={token} setToken={setToken}>
        <ShowForAuthenticated>
          <Text>Logged in!</Text>
          <LogoutButton />
        </ShowForAuthenticated>
        <ShowForUnauthenticated>
          <Text>Not logged in</Text>
          <Button title='Log in' onPress={() => setToken('a-very-real-token')} />
        </ShowForUnauthenticated>
      </AuthProvider>
    </SafeAreaView>
  )
}
