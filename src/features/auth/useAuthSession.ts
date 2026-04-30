import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '../../shared/api/supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Obtener sesión inicial
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Error obteniendo sesión:', error.message);
          setSession(null);
        } else {
          setSession(initialSession);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error en getSession:', err);
        setSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Inicializar sesión
    initAuth();

    // Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { session, loading };
}
