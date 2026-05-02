import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { EditProjectForm } from '@features/project-edit/EditProjectForm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

function normalizeId(id: string | string[] | undefined): string {
  return Array.isArray(id) ? id[0] ?? '' : id ?? '';
}

export default function EditProjectScreen() {
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
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#1A3A5C" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-5 bg-gray-100">
        <View className="bg-red-50 p-4 rounded-xl w-full">
          <Text className="text-[15px] text-center text-red-500">
            Error al cargar el proyecto: {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!proyecto) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-[15px] text-red-500">Proyecto no encontrado.</Text>
      </View>
    );
  }

  return (
    <EditProjectForm
      proyecto={proyecto}
      onSuccess={() => {
        router.back();
      }}
    />
  );
}