import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ESTADO_CONFIG: Record<string, { bg: string; text: string }> = {
  'En Progreso': { bg: '#3B82F6', text: '#FFFFFF' },
  'Completado': { bg: '#10B981', text: '#FFFFFF' },
  'Suspendido': { bg: '#EF4444', text: '#FFFFFF' },
};

interface Props {
  proyecto: ProyectoTesis;
  index?: number;
}

function BotonAccion({ onPress, children, color = '#2563EB' }: { onPress?: () => void; children: React.ReactNode; color?: string }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        style={{ backgroundColor: color, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flex: 1, alignItems: 'center' }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ProyectoCard({ proyecto, index = 0 }: Props) {
  const router = useRouter();
  const estadoConfig = ESTADO_CONFIG[proyecto.estado] || ESTADO_CONFIG['En Progreso'];
  const cardScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400).springify()} style={cardAnimatedStyle}>
      <Pressable
        onPress={() => router.push(`/proyecto/${proyecto.id}`)}
        onPressIn={() => {
          cardScale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          cardScale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
      >
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A3A5C', flex: 1, marginRight: 8 }} numberOfLines={2}>
              {proyecto.titulo}
            </Text>
            <View style={{ backgroundColor: estadoConfig.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
              <Text style={{ color: estadoConfig.text, fontSize: 12, fontWeight: '600' }}>{proyecto.estado}</Text>
            </View>
          </View>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280' }}>Autor:</Text>
            <Text style={{ fontSize: 14, color: '#374151' }}>{proyecto.autores}</Text>
          </View>

          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280' }}>Tutor:</Text>
            <Text style={{ fontSize: 14, color: '#374151' }}>{proyecto.tutor_docente}</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280' }}>Fechas:</Text>
            <Text style={{ fontSize: 14, color: '#374151' }}>
              {proyecto.fecha_inicio}{proyecto.fecha_fin ? ` - ${proyecto.fecha_fin}` : ''}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <BotonAccion onPress={() => router.push(`/proyecto/${proyecto.id}/edit`)} color="#2563EB">
              Editar
            </BotonAccion>
            <BotonAccion onPress={() => {}} color="#EF4444">
              Eliminar
            </BotonAccion>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}