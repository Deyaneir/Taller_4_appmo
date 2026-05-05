import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const ESTADO_CONFIG: Record<string, { bg: string; text: string }> = {
  'En Progreso': { bg: '#3B82F6', text: '#FFFFFF' },
  'Completado': { bg: '#10B981', text: '#FFFFFF' },
  'Suspendido': { bg: '#EF4444', text: '#FFFFFF' },
};

function TarjetaProyecto({ 
  proyecto, 
  index
}: { 
  proyecto: ProyectoTesis; 
  index: number;
}) {
  const router = useRouter();
  const estadoConfig = ESTADO_CONFIG[proyecto.estado] || ESTADO_CONFIG['En Progreso'];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400).springify()}>
      <View 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Pressable
          onPress={() => router.push(`/proyecto/${proyecto.id}`)}
        >
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
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function ListaProyectos() {
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primeraEntrada = useRef(true);

  const cargarProyectos = useCallback(async (silent = false) => {
    if (!silent) setCargando(true);
    setError(null);

    try {
      const data = await proyectoApi.getAll();
      setProyectos(data);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error desconocido";
      setError(mensaje);
    } finally {
      if (!silent) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProyectos();
  }, [cargarProyectos]);

  useFocusEffect(
    useCallback(() => {
      if (primeraEntrada.current) {
        primeraEntrada.current = false;
        return;
      }
      cargarProyectos(true);
    }, [cargarProyectos]),
  );

  if (cargando)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#1A3A5C" />
        <Text style={{ fontSize: 14, marginTop: 12, color: '#6B7280' }}>Cargando...</Text>
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', paddingHorizontal: 25 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>[!]</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#1F2937' }}>Algo salio mal</Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: '#6B7280' }}>{error}</Text>
        </View>
      </View>
    );

  if (proyectos.length === 0)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', paddingHorizontal: 25 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>[ ]</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#1F2937' }}>Sin proyectos</Text>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>No hay proyectos registrados</Text>
        </View>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: 25, paddingTop: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1A3A5C' }}>Proyectos</Text>
        <Text style={{ fontSize: 14, color: '#6B7280' }}>
          {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {proyectos.map((proyecto, index) => (
        <TarjetaProyecto
          key={proyecto.id}
          proyecto={proyecto}
          index={index}
        />
      ))}
    </View>
  );
}