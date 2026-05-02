import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { useEliminarProyecto } from '@features/eliminar-proyecto/useEliminarProyecto';
import React from 'react';
import { ActivityIndicator, Linking, Pressable, Text, TouchableOpacity, View } from 'react-native';
 
const BADGE_COLOR: Record<string, string> = {
  'En Progreso': '#3498DB',
  'Completado':  '#27AE60',
  'Suspendido':  '#E74C3C',
};
 
interface Props {
  proyecto: ProyectoTesis;
  onEliminado: () => void;
}
 
export function ProyectoCard({ proyecto, onEliminado }: Props) {
  const { onEliminar, isLoading } = useEliminarProyecto(proyecto.id, onEliminado);

  const abrirRepo = () => {
    if (proyecto.repositorio_github)
      Linking.openURL(proyecto.repositorio_github);
  };
 
  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-md">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-base font-bold text-blue-900 flex-1 mr-2" numberOfLines={2}>{proyecto.titulo}</Text>
        <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: BADGE_COLOR[proyecto.estado] }}>
          <Text className="text-white text-[11px] font-bold">{proyecto.estado}</Text>
        </View>
      </View>
 
      <Text className="text-[11px] text-gray-400 font-semibold mt-2">Autores</Text>
      <Text className="text-sm text-gray-700 mt-0.5">{proyecto.autores}</Text>
 
      <Text className="text-[11px] text-gray-400 font-semibold mt-2">Tutor Docente</Text>
      <Text className="text-sm text-gray-700 mt-0.5">{proyecto.tutor_docente}</Text>
 
      <Text className="text-[11px] text-gray-400 font-semibold mt-2">Tecnologías</Text>
      <Text className="text-sm text-gray-700 mt-0.5">{proyecto.tecnologias_utilizadas}</Text>
 
      <View className="flex-row gap-6 mt-2">
        <View className="flex-1">
          <Text className="text-[11px] text-gray-400 font-semibold">Inicio</Text>
          <Text className="text-sm text-gray-700 mt-0.5">{proyecto.fecha_inicio}</Text>
        </View>
        {proyecto.fecha_fin && (
          <View className="flex-1">
            <Text className="text-[11px] text-gray-400 font-semibold">Fin</Text>
            <Text className="text-sm text-gray-700 mt-0.5">{proyecto.fecha_fin}</Text>
          </View>
        )}
      </View>
 
      {proyecto.repositorio_github && (
        <TouchableOpacity className="mt-3 py-2 px-3 bg-blue-50 rounded-lg self-start" onPress={abrirRepo}>
          <Text className="text-blue-500 text-[13px] font-semibold">Ver en GitHub →</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className={`mt-3 py-2.5 px-3 rounded-lg self-start ${isLoading ? 'opacity-70' : ''}`}
        style={{ backgroundColor: '#E74C3C' }}
        onPress={onEliminar}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-[13px] font-bold">Eliminar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}