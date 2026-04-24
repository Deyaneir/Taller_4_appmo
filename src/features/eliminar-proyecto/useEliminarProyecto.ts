import { proyectosApi } from '@entities/proyecto-tesis/api/proyectosApi';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useEliminarProyecto(id: string, onEliminado?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const confirmarEliminacion = () => {
    Alert.alert(
      '¿Seguro que deseas eliminar?',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await proyectosApi.delete(id);
              onEliminado?.();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Error desconocido';
              Alert.alert('Error', message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return { onEliminar: confirmarEliminacion, isLoading };
}
