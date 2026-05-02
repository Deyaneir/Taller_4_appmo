import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { ProyectoCard } from '@entities/proyecto-tesis/ui/ProyectoCard';
import { SearchInput } from '@features/project-search/SearchInput';
import { useFocusEffect } from '@react-navigation/native';
import { LogoEPN } from '@shared/ui/LogoEPN';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

export function HomeScreen() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<ProyectoTesis[] | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleResults = useCallback((results: ProyectoTesis[]) => {
    setProyectos(results);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
    }, []),
  );

  const hasNoResults = proyectos !== null && proyectos.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 25, paddingTop: 16, paddingBottom: 16 }}>
        <View style={{ alignItems: 'center' }}>
          <LogoEPN size="mediano" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 12, color: '#1A3A5C' }}>
          Proyectos de Tesis - ESFOT
        </Text>
      </View>

      {/* Buscador */}
      <View style={{ paddingHorizontal: 25 }}>
        <SearchInput onResults={handleResults} refreshToken={refreshToken} />
      </View>

      {/* Lista */}
      {hasNoResults ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: '#9CA3AF' }}>Sin resultados</Text>
        </View>
      ) : (
        <FlatList
          data={proyectos ?? []}
          keyExtractor={(p) => p.id}
          renderItem={({ item, index }) => (
            <View style={{ paddingHorizontal: 25, paddingTop: index === 0 ? 8 : 0 }}>
              <ProyectoCard
                proyecto={item}
                index={index}
                onPress={() => router.push(`/proyecto/${item.id}`)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 25 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}