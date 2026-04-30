import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput } from 'react-native';

import { supabase } from '@shared/api/supabase';
import { Button } from '@shared/ui/Button';

import { ThemedText } from '../../../../components/themed-text';
import { ThemedView } from '../../../../components/themed-view';

const ERROR_COLOR = '#E74C3C';

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

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.titulo}>
          Bienvenido
        </ThemedText>
        <ThemedText style={styles.subtitulo}>Inicia sesión para continuar</ThemedText>

        <ThemedView style={styles.campoContenedor}>
          <ThemedText style={styles.etiqueta}>Correo electrónico</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </ThemedView>

        <ThemedView style={styles.campoContenedor}>
          <ThemedText style={styles.etiqueta}>Contraseña</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </ThemedView>

        {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

        <ThemedView style={styles.acciones}>
          <Button onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ThemedText style={styles.botonTexto}>Iniciar sesión</ThemedText>
            )}
          </Button>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F5F7FA',
    padding: 24,
    borderRadius: 16,
    gap: 12,
  },
  titulo: {
    textAlign: 'center',
  },
  subtitulo: {
    textAlign: 'center',
  },
  campoContenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  acciones: {
    marginTop: 6,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    textAlign: 'center',
  },
});
