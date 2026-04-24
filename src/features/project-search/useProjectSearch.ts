import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { useEffect, useState } from 'react';

interface UseProjectSearchResult {
  proyectos: ProyectoTesis[];
  isLoading: boolean;
  error: string | null;
}

export function useProjectSearch(query: string, refreshToken = 0): UseProjectSearchResult {
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await proyectoApi.search(query);
        if (!isCancelled) setProyectos(data);
      } catch (e) {
        if (!isCancelled) {
          const message = e instanceof Error ? e.message : 'Error desconocido';
          setError(message);
          setProyectos([]);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, refreshToken]);

  return { proyectos, isLoading, error };
}
