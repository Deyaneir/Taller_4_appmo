import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { ProyectoCard } from '@entities/proyecto-tesis/ui/ProyectoCard';
import { SearchInput } from '@features/project-search/SearchInput';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
 
export function HomeScreen() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<ProyectoTesis[] | null>(null);

  const handleResults = useCallback((results: ProyectoTesis[]) => {
    setProyectos(results);
  }, []);

  const hasNoResults = proyectos !== null && proyectos.length === 0;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.header}>Proyectos de Tesis — ESFOT</Text>
      <SearchInput onResults={handleResults} />

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
  header: { fontSize: 20, fontWeight: '700', color: '#1A3A5C',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E6EE' },
  lista: { padding: 16, paddingTop: 8 },
  vacio: { color: '#888', textAlign: 'center', padding: 40, fontSize: 15 },
});