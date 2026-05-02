import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { supabase } from '../../../shared/api/supabase';
import { Button } from '../../../shared/ui/Button';

const { width } = Dimensions.get('window');
const MARGIN = 25;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  const cardWidth = Math.min(width - (MARGIN * 2), 400);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: MARGIN }}>
        <View 
          style={{ 
            width: cardWidth,
            backgroundColor: '#FFFFFF', 
            borderRadius: 16, 
            padding: 24,
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 8, 
            elevation: 4 
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: '700', marginBottom: 4, textAlign: 'center', color: '#1A3A5C' }}>ESFOT</Text>
          <Text style={{ fontSize: 14, marginBottom: 24, textAlign: 'center', color: '#6B7280' }}>Tesis y Proyectos</Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Correo Electronico</Text>
            <View style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#DDE2E8', borderRadius: 12, overflow: 'hidden' }}>
              <TextInput
                style={{ fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, color: '#1F2937' }}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Contrasena</Text>
            <View style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#DDE2E8', borderRadius: 12, overflow: 'hidden' }}>
              <TextInput
                style={{ fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, color: '#1F2937' }}
                placeholder="********"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {errorMessage ? (
            <View style={{ borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#FEF2F2' }}>
              <Text style={{ fontSize: 13, textAlign: 'center', color: '#E74C3C' }}>{errorMessage}</Text>
            </View>
          ) : null}

          <Button 
            onPress={handleLogin} 
            disabled={loading}
            style={{ paddingVertical: 16, borderRadius: 12 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Iniciar Sesion</Text>
            )}
          </Button>
        </View>

        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Escuela de Formacion de Tecnologos</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}