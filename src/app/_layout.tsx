import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PhoneFrame from '../components/PhoneFrame';
import { TasksProvider } from '../state/TasksContext';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TasksProvider>
        <PhoneFrame>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="list" options={{ animation: 'fade' }} />
          </Stack>
          <StatusBar style="dark" />
        </PhoneFrame>
      </TasksProvider>
    </SafeAreaProvider>
  );
}
