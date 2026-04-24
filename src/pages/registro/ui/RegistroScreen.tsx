import { RegistroProyectoForm } from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { LogoEPN } from '@shared/ui/LogoEPN';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
 
export function RegistroScreen() {
  return (
    <View style={styles.contenedor}>
      <View style={styles.brand}>
        <LogoEPN size="mediano" />
        <Text style={styles.titulo}>ESFOT - EPN</Text>
        <Text style={styles.subtitulo}>Sistema de Gestión de Tesis</Text>
      </View>
      <RegistroProyectoForm onSuccess={() => router.back()} />
    </View>
  );
}
 
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  brand: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 6,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#003087',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#C8102E',
    textAlign: 'center',
    fontWeight: '600',
  },
});