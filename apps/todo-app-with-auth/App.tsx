import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginButton from 'readapt-plugin-simple-anonymous-auth-ui/components/LoginButton';
import PluginProvider from 'readapt-plugin-simple-anonymous-auth-ui/contexts/Plugin';
import TodoList from 'readapt-plugin-todo-ui/components/TodoList';

export default function App() {
  return (
    <PluginProvider>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <StatusBar style="auto" />
        <LoginButton />
        <TodoList />
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
