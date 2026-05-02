import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useProjectSearch } from './useProjectSearch';

interface Props {
  onResults: (proyectos: ProyectoTesis[]) => void;
  refreshToken?: number;
}

export function SearchInput({ onResults, refreshToken = 0 }: Props) {
  const [query, setQuery] = useState('');
  const { proyectos, isLoading, error } = useProjectSearch(query, refreshToken);

  useEffect(() => {
    onResults(proyectos);
  }, [onResults, proyectos]);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F7FA' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE2E8', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
        <Text style={{ fontSize: 18, marginRight: 8, color: '#6B7280' }}>Buscar</Text>
        <TextInput
          style={{ flex: 1, fontSize: 16, paddingVertical: 12, color: '#374151' }}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar proyectos..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280' }}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#1A3A5C" style={{ marginTop: 12 }} />
      ) : null}
      {error ? (
        <Text style={{ fontSize: 12, marginTop: 8, color: '#E74C3C' }}>Error: {error}</Text>
      ) : null}
    </View>
  );
}