import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RegistroProyectoForm }
  from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { router } from 'expo-router';
 
export function RegistroScreen() {
  return (
    <View style={styles.contenedor}>
      <RegistroProyectoForm onSuccess={() => router.back()} />
    </View>
  );
}
 
const styles = StyleSheet.create({
  contenedor: { flex: 1 },
});