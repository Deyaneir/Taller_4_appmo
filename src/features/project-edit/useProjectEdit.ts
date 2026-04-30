import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { deleteDocumentoProyecto, uploadDocumentoProyecto } from '@features/registro-proyecto/api/uploadDocumento';
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
  documentoSeleccionado: {
    name: string;
    size: number;
    type?: string;
    uri: string;
  } | null;
  setDocumentoSeleccionado: (doc: any) => void;
  documentoEliminado: boolean;
  setDocumentoEliminado: (eliminado: boolean) => void;
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
    documento_url: proyecto.documento_url ?? '',
    estado: proyecto.estado,
  };
}

export function useProjectEdit(
  proyectoActual: ProyectoTesis,
  onSuccess?: (updated: ProyectoTesis) => void,
): UseProjectEditResult {
  const [error, setError] = useState<string | null>(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<any>(null);
  const [documentoEliminado, setDocumentoEliminado] = useState(false);
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
    setDocumentoSeleccionado(null);
    setDocumentoEliminado(false);
  }, [proyectoActual, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    if (!proyectoActual.id) {
      const message = 'ID inválido para actualizar el proyecto.';
      setError(message);
      throw new Error(message);
    }

    try {
      let nuevoDocumentoUrl = values.documento_url;

      // Si el usuario marcó eliminar documento
      if (documentoEliminado) {
        if (proyectoActual.documento_url) {
          try {
            console.log('[useProjectEdit] Eliminando documento...');
            await deleteDocumentoProyecto(proyectoActual.documento_url);
          } catch (deleteErr) {
            console.warn('[useProjectEdit] Error al eliminar documento:', deleteErr);
            // No fallar si no se puede eliminar
          }
        }
        nuevoDocumentoUrl = undefined;
      }
      // Si hay nuevo documento, subirlo y obtener la URL
      else if (documentoSeleccionado) {
        try {
          console.log('[useProjectEdit] Subiendo nuevo documento...');
          const uploadResult = await uploadDocumentoProyecto(documentoSeleccionado);
          nuevoDocumentoUrl = uploadResult.url;
          
          // Eliminar documento anterior si existía
          if (proyectoActual.documento_url) {
            try {
              console.log('[useProjectEdit] Eliminando documento anterior...');
              await deleteDocumentoProyecto(proyectoActual.documento_url);
            } catch (deleteErr) {
              console.warn('[useProjectEdit] Error al eliminar documento anterior:', deleteErr);
              // No fallar si no se puede eliminar el anterior
            }
          }
        } catch (uploadErr) {
          const message = uploadErr instanceof Error ? uploadErr.message : 'Error al subir documento';
          setError(message);
          throw new Error(message);
        }
      }

      // Actualizar proyecto con nueva URL si aplica
      const actualizacion: any = {
        titulo: values.titulo,
        descripcion: values.descripcion,
        autores: values.autores,
        tutor_docente: values.tutor_docente,
        tecnologias_utilizadas: values.tecnologias_utilizadas,
        fecha_inicio: values.fecha_inicio,
        fecha_fin: values.fecha_fin || undefined,
        repositorio_github: values.repositorio_github || undefined,
        estado: values.estado,
      };
      
      // Manejar documento_url explícitamente
      if (documentoEliminado) {
        actualizacion.documento_url = null; // Null para eliminar
      } else if (documentoSeleccionado || nuevoDocumentoUrl) {
        actualizacion.documento_url = nuevoDocumentoUrl;
      } else {
        // No cambiar documento_url si no se seleccionó nuevo
        actualizacion.documento_url = values.documento_url || undefined;
      }
      
      console.log('[useProjectEdit] Payload a enviar:', actualizacion);

      const updated = await proyectoApi.update(proyectoActual.id, actualizacion);
      setDocumentoSeleccionado(null);
      setDocumentoEliminado(false);
      onSuccess?.(updated);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido';
      setError(message);
      throw e;
    }
  });

  return { 
    control, 
    onSubmit, 
    isLoading: isSubmitting, 
    error, 
    isValid,
    documentoSeleccionado,
    setDocumentoSeleccionado,
    documentoEliminado,
    setDocumentoEliminado,
  };
}
