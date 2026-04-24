import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { EditProjectForm } from '@features/project-edit/EditProjectForm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function normalizeId(id: string | string[] | undefined): string {
  return Array.isArray(id) ? id[0] ?? '' : id ?? '';
}

export default function EditProjectScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const id = normalizeId(params.id);

  React.useEffect(() => {
    // Cambiado: log para confirmar que el id de la ruta llega bien a la pantalla de edición.
    console.log('[EditProjectScreen] id:', id);
  }, [id]);

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
    <EditProjectForm
      proyecto={proyecto}
      onSuccess={() => {
        // Cambiado: al guardar con éxito regresa a la pantalla de detalle.
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
    fontSize: 15,
  },
});
