import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "@shared/config/env";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";


export const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    auth: {
        // Autenticación integrada con Supabase Auth para persistir la sesión en la app.
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
