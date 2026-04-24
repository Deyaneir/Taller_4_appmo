import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "@shared/config/env";
import "react-native-url-polyfill/auto";

export const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    auth: {
        // Configuración de autenticación para React Native
        //Supabase guarda y recupera los tokens
        storage: AsyncStorage,
        //Renueva automáticamente el token de acceso cuando expire
        autoRefreshToken: true,
        //Mantiene la sesión del usuario incluso después de cerrar la aplicación
        persistSession: true,
        //En movile no se manejan callbacks de secion por URL como en web
        detectSessionInUrl: false,
    },
});
