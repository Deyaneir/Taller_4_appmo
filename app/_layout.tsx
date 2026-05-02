// app/_layout.tsx
import { useAuthSession } from '@features/auth/useAuthSession';
import { Redirect, Slot, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../src/styles/global.css';

export default function RootLayout() {
  const { session, loading } = useAuthSession();
  const pathname = usePathname();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#1A3A5C" />
      </View>
    );
  }

  if (!session && pathname !== '/login') {
    return <Redirect href="/login" />;
  }

  if (session && pathname === '/login') {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
}