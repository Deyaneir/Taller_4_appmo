// app/_layout.tsx

import { useAuthSession } from '@features/auth/useAuthSession';
import { Redirect, Slot, usePathname } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function RootLayout() {
  const { session, loading } = useAuthSession();
  const pathname = usePathname();

  if (loading) {
    return (
      <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
