import { RegistroProyectoForm } from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { LogoEPN } from '@shared/ui/LogoEPN';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

export function RegistroScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center' }}>
        <LogoEPN size="mediano" />
        <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 8, color: '#1A3A5C' }}>
          ESFOT - EPN
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#E74C3C' }}>
          Sistema de Gestión de Tesis
        </Text>
      </View>
      <RegistroProyectoForm onSuccess={() => router.back()} />
    </View>
  );
}