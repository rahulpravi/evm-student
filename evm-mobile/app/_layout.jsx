import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';

export default function Layout() {
  return (
    <SettingsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SettingsProvider>
  );
}
