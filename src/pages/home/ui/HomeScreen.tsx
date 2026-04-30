import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { ProyectoCard } from '@entities/proyecto-tesis/ui/ProyectoCard';
import { SearchInput } from '@features/project-search/SearchInput';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@shared/api/supabase';
import { LogoEPN } from '@shared/ui/LogoEPN';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function HomeScreen() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<ProyectoTesis[] | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleResults = useCallback((results: ProyectoTesis[]) => {
    setProyectos(results);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
    }, []),
  );

  const hasNoResults = proyectos !== null && proyectos.length === 0;

  return (
    <View style={styles.contenedor}>
      <View style={styles.brand}>
        <View style={styles.brandHeader}>
          <LogoEPN size="mediano" />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Proyectos de Tesis — ESFOT</Text>
      </View>
      <SearchInput onResults={handleResults} refreshToken={refreshToken} />

      {hasNoResults ? (
        <Text style={styles.vacio}>Sin resultados</Text>
      ) : (
        <FlatList
          data={proyectos ?? []}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <ProyectoCard
              proyecto={item}
              onPress={() => router.push(`/proyecto/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  brand: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  brandHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003087',
    textAlign: 'center',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E74C3C',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  lista: { padding: 16, paddingTop: 8 },
  vacio: { color: '#888', textAlign: 'center', padding: 40, fontSize: 15 },
});