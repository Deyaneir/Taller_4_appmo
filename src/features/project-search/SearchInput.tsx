import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useProjectSearch } from './useProjectSearch';

interface Props {
  onResults: (proyectos: ProyectoTesis[]) => void;
}

export function SearchInput({ onResults }: Props) {
  const [query, setQuery] = useState('');
  const { proyectos, isLoading, error } = useProjectSearch(query);

  useEffect(() => {
    onResults(proyectos);
  }, [onResults, proyectos]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por titulo..."
        placeholderTextColor="#8A94A6"
        autoCapitalize="none"
      />

      {isLoading ? <ActivityIndicator size="small" color="#1A3A5C" style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>Error: {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F5F7FA',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  loader: {
    marginTop: 8,
  },
  error: {
    marginTop: 8,
    color: '#E74C3C',
    fontSize: 12,
  },
});
