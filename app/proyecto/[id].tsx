import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function normalizeId(id: string | string[] | undefined): string {
  return Array.isArray(id) ? id[0] ?? '' : id ?? '';
}

export default function ProyectoDetalleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const id = normalizeId(params.id);

  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cargarProyecto = async () => {
      if (!id) {
        if (isMounted) {
          setError('ID de proyecto inválido.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await proyectoApi.getById(id);
        if (isMounted) setProyecto(data);
      } catch (e) {
        if (isMounted) {
          const message = e instanceof Error ? e.message : 'Error desconocido';
          setError(message);
          setProyecto(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    cargarProyecto();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A3A5C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error al cargar el proyecto: {error}</Text>
      </View>
    );
  }

  if (!proyecto) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Proyecto no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>{proyecto.titulo}</Text>
        <Text style={styles.badge}>{proyecto.estado}</Text>

        <Text style={styles.label}>Descripción</Text>
        <Text style={styles.value}>{proyecto.descripcion}</Text>

        <Text style={styles.label}>Autores</Text>
        <Text style={styles.value}>{proyecto.autores}</Text>

        <Text style={styles.label}>Tutor Docente</Text>
        <Text style={styles.value}>{proyecto.tutor_docente}</Text>

        <Text style={styles.label}>Tecnologías Utilizadas</Text>
        <Text style={styles.value}>{proyecto.tecnologias_utilizadas}</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Fecha Inicio</Text>
            <Text style={styles.value}>{proyecto.fecha_inicio}</Text>
          </View>
          {proyecto.fecha_fin ? (
            <View style={styles.col}>
              <Text style={styles.label}>Fecha Fin</Text>
              <Text style={styles.value}>{proyecto.fecha_fin}</Text>
            </View>
          ) : null}
        </View>

        {proyecto.repositorio_github ? (
          <TouchableOpacity
            style={styles.repoButton}
            onPress={() => Linking.openURL(proyecto.repositorio_github ?? '')}
          >
            <Text style={styles.repoText}>Abrir repositorio</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#EBF5FB',
  },
  backText: {
    color: '#2E6DA4',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3A5C',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2E6DA4',
    color: '#fff',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 12,
  },
  value: {
    fontSize: 15,
    color: '#1F2937',
    marginTop: 4,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  col: {
    flex: 1,
  },
  repoButton: {
    marginTop: 18,
    backgroundColor: '#EBF5FB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  repoText: {
    color: '#2E6DA4',
    fontWeight: '700',
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
    fontSize: 15,
  },
});
