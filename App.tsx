import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
