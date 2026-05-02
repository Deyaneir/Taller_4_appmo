import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { useEliminarProyecto } from '@features/eliminar-proyecto/useEliminarProyecto';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  'En Progreso': { bg: '#EBF5FB', text: '#2E6DA4' },
  'Completado': { bg: '#E8F8F0', text: '#27AE60' },
  'Suspendido': { bg: '#FEF2F2', text: '#E74C3C' },
};

function normalizeId(id: string | string[] | undefined): string {
  return Array.isArray(id) ? id[0] ?? '' : id ?? '';
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
      {children}
    </Text>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 15, marginTop: 4, color: '#374151', lineHeight: 22 }}>
      {children}
    </Text>
  );
}

export default function ProyectoDetalleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const isFocused = useIsFocused();
  const id = normalizeId(params.id);
  const { onEliminar, isLoading: eliminando } = useEliminarProyecto(id, () => {
    router.back();
  });

  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks de animación al inicio
  const editScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);
  const editAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: editScale.value }] }));
  const deleteAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: deleteScale.value }] }));

  useEffect(() => {
    if (!id) {
      setError('ID de proyecto invalido.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let cancelled = false;

    const cargarProyecto = async () => {
      try {
        const data = await proyectoApi.getById(id);
        if (!cancelled) setProyecto(data);
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Error desconocido';
          setError(message);
          setProyecto(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void cargarProyecto();

    return () => {
      cancelled = true;
    };
  }, [id, isFocused]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#1A3A5C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#F5F7FA' }}>
        <View style={{ backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, width: '100%' }}>
          <Text style={{ fontSize: 15, textAlign: 'center', color: '#E74C3C' }}>
            Error al cargar el proyecto: {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!proyecto) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <Text style={{ fontSize: 15, color: '#E74C3C' }}>Proyecto no encontrado.</Text>
      </View>
    );
  }

  const estadoColors = ESTADO_COLORS[proyecto.estado] || ESTADO_COLORS['En Progreso'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ paddingHorizontal: 25, paddingTop: 25, paddingBottom: 25 }}>
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#EBF5FB', borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E6DA4' }}>Volver</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <AnimatedTouchable
            style={[{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1A3A5C' }, editAnimatedStyle]}
            onPress={() => router.push(`/proyecto/${id}/edit`)}
            onPressIn={() => { editScale.value = withSpring(0.95, { damping: 15, stiffness: 400 }); }}
            onPressOut={() => { editScale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Editar</Text>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={[{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#E74C3C', opacity: eliminando ? 0.7 : 1 }, deleteAnimatedStyle]}
            onPress={onEliminar}
            disabled={eliminando}
            onPressIn={() => { if (!eliminando) deleteScale.value = withSpring(0.95, { damping: 15, stiffness: 400 }); }}
            onPressOut={() => { if (!eliminando) deleteScale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
          >
            {eliminando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Eliminar</Text>
            )}
          </AnimatedTouchable>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A3A5C', flex: 1, marginRight: 12 }}>
              {proyecto.titulo}
            </Text>
            <View style={{ backgroundColor: estadoColors.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: estadoColors.text }}>{proyecto.estado}</Text>
            </View>
          </View>

          <View style={{ height: 8 }} />

          <Label>Descripcion</Label>
          <Value>{proyecto.descripcion}</Value>

          <View style={{ height: 12 }} />

          <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Label>Autores</Label>
                <Value>{proyecto.autores}</Value>
              </View>
              <View style={{ flex: 1 }}>
                <Label>Tutor</Label>
                <Value>{proyecto.tutor_docente}</Value>
              </View>
            </View>
          </View>

          <View style={{ height: 12 }} />

          <Label>Tecnologias</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {proyecto.tecnologias_utilizadas.split(',').map((tech, i) => (
              <View key={i} style={{ backgroundColor: '#EBF5FB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#2E6DA4' }}>
                  {tech.trim()}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Label>Fecha inicio</Label>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A3A5C', marginRight: 8 }} />
                <Value>{proyecto.fecha_inicio}</Value>
              </View>
            </View>
            {proyecto.fecha_fin && (
              <View style={{ flex: 1 }}>
                <Label>Fecha fin</Label>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C', marginRight: 8 }} />
                  <Value>{proyecto.fecha_fin}</Value>
                </View>
              </View>
            )}
          </View>

          {proyecto.repositorio_github && (
            <>
              <View style={{ height: 16 }} />
              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#1A3A5C' }}
                onPress={() => Linking.openURL(proyecto.repositorio_github ?? '')}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Ver Repositorio</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}