import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { proyectoSchema, type ProyectoFormValues } from '@shared/lib/validators/proyectoSchema';
import { useEffect, useState } from 'react';
import { useForm, type Control } from 'react-hook-form';

interface UseProjectEditResult {
  control: Control<ProyectoFormValues>;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
}

function buildForm(proyecto: ProyectoTesis): ProyectoFormValues {
  return {
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    autores: proyecto.autores,
    tutor_docente: proyecto.tutor_docente,
    tecnologias_utilizadas: proyecto.tecnologias_utilizadas,
    fecha_inicio: proyecto.fecha_inicio,
    fecha_fin: proyecto.fecha_fin ?? '',
    repositorio_github: proyecto.repositorio_github ?? '',
    estado: proyecto.estado,
  };
}

export function useProjectEdit(
  proyectoActual: ProyectoTesis,
  onSuccess?: (updated: ProyectoTesis) => void,
): UseProjectEditResult {
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<ProyectoFormValues>({
    resolver: zodResolver(proyectoSchema),
    mode: 'onChange',
    defaultValues: buildForm(proyectoActual),
  });

  useEffect(() => {
    reset(buildForm(proyectoActual));
    setError(null);
  }, [proyectoActual, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    if (!proyectoActual.id) {
      const message = 'ID inválido para actualizar el proyecto.';
      setError(message);
      throw new Error(message);
    }

    try {
      const updated = await proyectoApi.update(proyectoActual.id, values);
      onSuccess?.(updated);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido';
      setError(message);
      throw e;
    }
  });

  return { control, onSubmit, isLoading: isSubmitting, error, isValid };
}
