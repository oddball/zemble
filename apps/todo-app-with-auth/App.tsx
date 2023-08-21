import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginButton from 'readapt-plugin-simple-anonymous-auth-ui/components/LoginButton';
import PluginProvider from 'readapt-plugin-simple-anonymous-auth-ui/contexts/Plugin';

export default function App() {
  return (
    <PluginProvider>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <StatusBar style="auto" />
        <LoginButton />
      </View>
    </PluginProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
