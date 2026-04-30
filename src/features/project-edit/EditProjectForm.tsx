import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import type { ProyectoFormValues } from '@shared/lib/validators/proyectoSchema';
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useProjectEdit } from './useProjectEdit';

interface Props {
  proyecto: ProyectoTesis;
  onSuccess?: () => void;
}

const ESTADOS: ProyectoTesis['estado'][] = ['En Progreso', 'Completado', 'Suspendido'];

/**
 * Extrae el nombre del archivo del URL de Supabase Storage
 * Ej: "https://...storage/v1/object/public/bucket/documentos/1234567890-archivo.pdf" → "1234567890-archivo.pdf"
 */
function extraerNombreDocumento(url: string): string {
  try {
    const partes = url.split('/');
    return partes[partes.length - 1] || 'Documento';
  } catch {
    return 'Documento';
  }
}

function CampoTexto({
  control,
  name,
  label,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: {
  control: Control<ProyectoFormValues>;
  name: FieldPath<ProyectoFormValues>;
  label: string;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.campo}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline, fieldState.error ? styles.inputError : null]}
            value={(field.value ?? '') as string}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            placeholderTextColor="#999"
            multiline={multiline}
            keyboardType={keyboardType}
            autoCapitalize={name === 'repositorio_github' ? 'none' : 'sentences'}
          />
          {fieldState.error ? <Text style={styles.textoError}>{fieldState.error.message}</Text> : null}
        </View>
      )}
    />
  );
}

export function EditProjectForm({ proyecto, onSuccess }: Props) {
  const { 
    control, 
    onSubmit, 
    isLoading, 
    error, 
    isValid,
    documentoSeleccionado,
    setDocumentoSeleccionado,
    documentoEliminado,
    setDocumentoEliminado,
  } = useProjectEdit(proyecto, onSuccess);

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
        setDocumentoEliminado(false); // Limpiar el estado de eliminación
      }
    } catch (err) {
      console.error('[EditProjectForm] Error al seleccionar documento:', err);
      Alert.alert('Error', 'No se pudo acceder al selector de archivos.');
    }
  };

  const handleEliminarDocumento = () => {
    Alert.alert(
      'Eliminar documento',
      '¿Estás seguro de que deseas eliminar el documento? Se eliminará permanentemente cuando guardes los cambios.',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            setDocumentoEliminado(true);
            setDocumentoSeleccionado(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Determinar qué documento mostrar
  const documentoActual = documentoEliminado ? null : (documentoSeleccionado || proyecto.documento_url);
  const tieneDocumentoActual = documentoActual && !documentoEliminado;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Editar proyecto</Text>
        <Text style={styles.subtitle}>Los campos ya vienen cargados con la información actual.</Text>

        <CampoTexto
          control={control}
          name="titulo"
          label="Título"
          placeholder="Título del proyecto"
        />
        <CampoTexto
          control={control}
          name="descripcion"
          label="Descripción"
          placeholder="Descripción del proyecto"
          multiline
        />
        <CampoTexto
          control={control}
          name="autores"
          label="Autores"
          placeholder="Autores"
        />
        <CampoTexto
          control={control}
          name="tutor_docente"
          label="Tutor Docente"
          placeholder="Tutor docente"
        />
        <CampoTexto
          control={control}
          name="tecnologias_utilizadas"
          label="Tecnologías Utilizadas"
          placeholder="Tecnologías utilizadas"
          multiline
        />
        <CampoTexto
          control={control}
          name="fecha_inicio"
          label="Fecha Inicio"
          placeholder="AAAA-MM-DD"
        />
        <CampoTexto
          control={control}
          name="fecha_fin"
          label="Fecha Fin"
          placeholder="AAAA-MM-DD"
        />
        <CampoTexto
          control={control}
          name="repositorio_github"
          label="Repositorio GitHub"
          placeholder="https://github.com/..."
          keyboardType="url"
        />

        {/* Campo para documento PDF */}
        <View style={styles.campo}>
          <Text style={styles.label}>Documento PDF</Text>
          
          {/* Mostrar documento actual o nuevo */}
          {tieneDocumentoActual && (
            <View style={styles.documentoActual}>
              <Text style={styles.documentoActualLabel}>Documento actual:</Text>
              <Text style={styles.documentoActualNombre}>
                {documentoSeleccionado 
                  ? documentoSeleccionado.name 
                  : extraerNombreDocumento(proyecto.documento_url || '')}
              </Text>
              {documentoSeleccionado && (
                <Text style={styles.documentoTamaño}>
                  {(documentoSeleccionado.size / 1024).toFixed(2)} KB
                </Text>
              )}
              
              {/* Botones para el documento actual */}
              <View style={styles.botonesFila}>
                <Pressable
                  onPress={handleEliminarDocumento}
                  style={({ pressed }) => [
                    styles.botonAccion,
                    styles.botonEliminar,
                    pressed && styles.botonPresionado,
                  ]}
                >
                  <Text style={styles.botonAccionTexto}>Eliminar</Text>
                </Pressable>
                <Pressable
                  onPress={handleSeleccionarDocumento}
                  style={({ pressed }) => [
                    styles.botonAccion,
                    styles.botonReemplazar,
                    pressed && styles.botonPresionado,
                  ]}
                >
                  <Text style={styles.botonAccionTexto}>Reemplazar</Text>
                </Pressable>
              </View>
            </View>
          )}
          
          {/* Mostrar si fue eliminado */}
          {documentoEliminado && (
            <View style={styles.documentoEliminado}>
              <Text style={styles.documentoEliminadoTexto}>Documento será eliminado</Text>
              <Pressable
                onPress={handleSeleccionarDocumento}
                style={({ pressed }) => [
                  styles.botonSeleccionar,
                  pressed && styles.botonSeleccionarPressed,
                ]}
              >
                <Text style={styles.botonSeleccionarTexto}>Seleccionar nuevo PDF</Text>
              </Pressable>
            </View>
          )}
          
          {/* Si no hay documento */}
          {!tieneDocumentoActual && !documentoEliminado && (
            <Pressable
              onPress={handleSeleccionarDocumento}
              style={({ pressed }) => [
                styles.botonSeleccionar,
                pressed && styles.botonSeleccionarPressed,
              ]}
            >
              <Text style={styles.botonSeleccionarTexto}>Seleccionar PDF</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.label}>Estado</Text>
        <Controller
          control={control}
          name="estado"
          render={({ field, fieldState }) => (
            <View>
              <View style={styles.estadoFila}>
                {ESTADOS.map((estado) => (
                  <Pressable
                    key={estado}
                    onPress={() => field.onChange(estado)}
                    style={({ pressed }) => [
                      styles.estadoBoton,
                      field.value === estado && styles.estadoBotonActivo,
                      pressed && styles.estadoBotonPressed,
                    ]}
                  >
                    <Text style={[styles.estadoTexto, field.value === estado && styles.estadoTextoActivo]}>
                      {estado}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {fieldState.error ? <Text style={styles.textoError}>{fieldState.error.message}</Text> : null}
            </View>
          )}
        />

        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={!isValid || isLoading}
          style={({ pressed }) => [
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
            (!isValid || isLoading) && styles.submitButtonDisabled,
            pressed && !isLoading && isValid && styles.submitButtonPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Guardar cambios</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3A5C',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: '#6B7280',
  },
  campo: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  estadoFila: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  estadoBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE2E8',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  estadoBotonActivo: {
    backgroundColor: '#2E6DA4',
    borderColor: '#2E6DA4',
  },
  estadoBotonPressed: {
    opacity: 0.8,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  estadoTextoActivo: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#1A3A5C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: '#E74C3C',
    marginTop: 6,
    marginBottom: 10,
  },
  textoError: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  botonSeleccionar: {
    backgroundColor: '#2E6DA4',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botonSeleccionarPressed: {
    opacity: 0.8,
  },
  botonSeleccionarTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  documentoSeleccionado: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#2E6DA4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  documentoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3A5C',
  },
  documentoTamaño: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  documentoActual: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#2E6DA4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  documentoActualLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  documentoActualNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3A5C',
  },
  documentoEliminado: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  documentoEliminadoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 10,
  },
  botonesFila: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botonAccion: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEliminar: {
    backgroundColor: '#E74C3C',
  },
  botonReemplazar: {
    backgroundColor: '#2E6DA4',
  },
  botonAccionTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  botonPresionado: {
    opacity: 0.8,
  },
});
