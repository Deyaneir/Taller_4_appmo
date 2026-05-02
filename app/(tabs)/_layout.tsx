// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View } from 'react-native';
import { supabase } from '@shared/api/supabase';
  
export default function TabLayout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A3A5C',
        headerStyle: { backgroundColor: '#1A3A5C' },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#E74C3C', borderRadius: 8 }}
            onPress={handleLogout}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Salir</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}