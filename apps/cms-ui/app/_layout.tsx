import AuthProvider, { AuthContext, Status } from '@kingstinct/react/contexts/Auth'
import UrqlProvider from '@kingstinct/react/contexts/Urql'
import { Stack, router, useSegments } from 'expo-router'
import { useContext, useEffect } from 'react'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

import createClientWithToken from '../clients/urql'
import { useColorScheme } from 'react-native'

function useProtectedRoute(token: string | null, status: Status) {
  const segments = useSegments()

  useEffect(() => {
    if (status !== Status.INITIALIZING) {
      const inAuthGroup = segments[0] === '(auth)'

      if (
        // If the user is not signed in and the initial segment is not anything in the auth group.
        !token && !inAuthGroup
      ) {
        // Redirect to the sign-in page.
        router.replace('/login')
      } else if (token && inAuthGroup) {
        // Redirect away from the sign-in page.
        router.replace('/(tabs)/(content)/index')
      }
    }
  }, [token, segments, status])
}

const App = () => {
  const { token, status } = useContext(AuthContext)
  useProtectedRoute(token, status)

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          animation: 'flip',
          headerShown: false,
          animationTypeForReplace: 'pop',
        }}
      >
        {/* <Stack.Screen
          name='(tabs)/index'
          options={{
            title: 'cms-ui',
            headerShown: false,
          }}
        /> */}
        <Stack.Screen
          name='(auth)/login'
          options={{
            title: 'Login',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}

export default () => {
  let colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <PaperProvider>
      <AuthProvider>
        <UrqlProvider
          onError={(error) => alert(error.message)}
          createClient={createClientWithToken}
        >
          <App />
        </UrqlProvider>
      </AuthProvider>
    </PaperProvider>
    </ThemeProvider>
  )
  
} 