import { zodResolver } from '@hookform/resolvers/zod';
import { proyectoSchema, type ProyectoFormValues } from '@shared/lib/validators/proyectoSchema';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { createProyecto } from '../api/createProyecto';

const FORM_INICIAL: ProyectoFormValues = {
  titulo: '',
  descripcion: '',
  autores: '',
  tutor_docente: '',
  tecnologias_utilizadas: '',
  fecha_inicio: '',
  fecha_fin: '',
  repositorio_github: '',
  documento_url: '',
  estado: 'En Progreso',
};

const ESTADOS: ProyectoFormValues['estado'][] = ['En Progreso', 'Completado', 'Suspendido'];

interface Props {
  onSuccess?: () => void;
}

interface CampoProps {
  control: Control<ProyectoFormValues>;
  name: FieldPath<ProyectoFormValues>;
  label: string;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
}

function Campo({ control, name, label, placeholder, multiline = false, keyboardType = 'default' }: CampoProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.campoContenedor}>
          <Text style={styles.etiqueta}>{label}</Text>
          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              fieldState.error ? styles.inputError : null,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={(field.value ?? '') as string}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={keyboardType}
            autoCapitalize={name === 'repositorio_github' ? 'none' : 'sentences'}
          />
          {fieldState.error ? <Text style={styles.textoError}>{fieldState.error.message}</Text> : null}
        </View>
      )}
    />
  );
}

export function RegistroProyectoForm({ onSuccess }: Props) {
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<{
    name: string;
    size: number;
    type?: string;
    uri: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<ProyectoFormValues>({
    resolver: zodResolver(proyectoSchema),
    mode: 'onChange',
    defaultValues: FORM_INICIAL,
  });

  const handleSeleccionarDocumento = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setDocumentoSeleccionado({
          name: asset.name,
          size: asset.size || 0,
          type: asset.mimeType || 'application/pdf',
          uri: asset.uri,
        });
      }
    } catch (error) {
      console.error('[RegistroProyectoForm] Error al seleccionar documento:', error);
      Alert.alert('Error', 'No se pudo acceder al selector de archivos.');
    }
  };

  const handleGuardar = handleSubmit(async (values) => {
    try {
      await createProyecto(values, documentoSeleccionado || undefined);
      Alert.alert('¡Éxito!', 'Proyecto de tesis registrado correctamente.', [
        {
          text: 'OK',
          onPress: () => {
            reset(FORM_INICIAL);
            setDocumentoSeleccionado(null);
            onSuccess?.();
          },
        },
      ]);
    } catch (error) {
      console.error('[RegistroProyectoForm] Error:', error);
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el proyecto.';
      Alert.alert('Error', mensaje);
    }
  });

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Nuevo Proyecto de Tesis</Text>
      <Text style={styles.subtitulo}>ESFOT — Tecnología Superior en Desarrollo de Software</Text>

      <Campo
        control={control}
        name="titulo"
        label="Título del Proyecto *"
        placeholder="Ej: Sistema de gestión de inventarios para PYMES"
      />
      <Campo
        control={control}
        name="descripcion"
        label="Descripción *"
        placeholder="Describe brevemente el objetivo del proyecto..."
        multiline
      />
      <Campo
        control={control}
        name="autores"
        label="Autores * (separa con comas)"
        placeholder="Ej: Ana Torres, Luis Pérez"
      />
      <Campo
        control={control}
        name="tutor_docente"
        label="Tutor Docente *"
        placeholder="Ej: Ing. Juan Carlos Gonzalez Msc."
      />
      <Campo
        control={control}
        name="tecnologias_utilizadas"
        label="Tecnologías Utilizadas * (separa con comas)"
        placeholder="Ej: React Native, Node.js, PostgreSQL, AWS"
      />
      <Campo
        control={control}
        name="fecha_inicio"
        label="Fecha de Inicio * (AAAA-MM-DD)"
        placeholder="Ej: 2025-03-01"
      />
      <Campo
        control={control}
        name="fecha_fin"
        label="Fecha de Fin (AAAA-MM-DD)"
        placeholder="Ej: 2025-12-31 (dejar vacío si está en progreso)"
      />
      <Campo
        control={control}
        name="repositorio_github"
        label="Repositorio GitHub"
        placeholder="https://github.com/usuario/repositorio"
        keyboardType="url"
      />

      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Documento PDF (Opcional)</Text>
        <TouchableOpacity style={styles.botonSeleccionar} onPress={handleSeleccionarDocumento}>
          <Text style={styles.botonSeleccionarTexto}>
            {documentoSeleccionado ? '✓ ' : '📄 '}
            {documentoSeleccionado ? documentoSeleccionado.name : 'Seleccionar PDF'}
          </Text>
        </TouchableOpacity>
        {documentoSeleccionado && (
          <Text style={styles.textoDocumento}>
            Tamaño: {(documentoSeleccionado.size / 1024).toFixed(2)} KB
          </Text>
        )}
      </View>

      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Estado del Proyecto</Text>
        <Controller
          control={control}
          name="estado"
          render={({ field, fieldState }) => (
            <View>
              <View style={styles.estadoContenedor}>
                {ESTADOS.map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.estadoBoton,
                      field.value === estado && styles.estadoBotonActivo,
                    ]}
                    onPress={() => field.onChange(estado)}
                  >
                    <Text
                      style={[
                        styles.estadoTexto,
                        field.value === estado && styles.estadoTextoActivo,
                      ]}
                    >
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldState.error ? <Text style={styles.textoError}>{fieldState.error.message}</Text> : null}
            </View>
          )}
        />
      </View>

      <TouchableOpacity
        style={[styles.botonGuardar, (!isValid || isSubmitting) && styles.botonDeshabilitado]}
        onPress={handleGuardar}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Registrar Proyecto</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const AZUL = '#1A3A5C';
const AZUL_CLARO = '#2E6DA4';

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '700', color: AZUL, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 24 },
  campoContenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  inputError: { borderColor: '#E74C3C', borderWidth: 1.5 },
  textoError: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
  botonSeleccionar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSeleccionarTexto: {
    fontSize: 14,
    color: AZUL,
    fontWeight: '600',
  },
  textoDocumento: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  estadoContenedor: { flexDirection: 'row', gap: 10 },
  estadoBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE2E8',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  estadoBotonActivo: { backgroundColor: AZUL_CLARO, borderColor: AZUL_CLARO },
  estadoTexto: { fontSize: 13, color: '#555' },
  estadoTextoActivo: { color: '#fff', fontWeight: '700' },
  botonGuardar: {
    backgroundColor: AZUL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});