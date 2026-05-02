import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import type { ProyectoFormValues } from '@shared/lib/validators/proyectoSchema';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useProjectEdit } from './useProjectEdit';

interface Props {
  proyecto: ProyectoTesis;
  onSuccess?: () => void;
}

const ESTADOS: ProyectoTesis['estado'][] = ['En Progreso', 'Completado', 'Suspendido'];

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
  const borderColor = useSharedValue('#DDE2E8');
  const borderWidth = useSharedValue(1);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#6B7280', textTransform: 'uppercase' }}>{label}</Text>
          <Animated.View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, overflow: 'hidden', ...animatedBorderStyle }}>
            <TextInput
              style={{
                fontSize: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: 'transparent',
                minHeight: multiline ? 80 : 0,
                textAlignVertical: multiline ? 'top' : 'center',
                color: '#1F2937',
              }}
              value={(field.value ?? '') as string}
              onChangeText={field.onChange}
              onBlur={() => {
                field.onBlur();
                borderColor.value = fieldState.error ? '#E74C3C' : '#DDE2E8';
                borderWidth.value = 1;
              }}
              onFocus={() => {
                borderColor.value = '#1A3A5C';
                borderWidth.value = 2;
              }}
              placeholder={placeholder}
              placeholderTextColor="#999"
              multiline={multiline}
              keyboardType={keyboardType}
              autoCapitalize={name === 'repositorio_github' ? 'none' : 'sentences'}
            />
          </Animated.View>
          {fieldState.error ? <Text style={{ fontSize: 12, marginTop: 4, color: '#E74C3C' }}>{fieldState.error.message}</Text> : null}
        </View>
      )}
    />
  );
}

interface CampoFechaProps {
  control: Control<ProyectoFormValues>;
  name: FieldPath<ProyectoFormValues>;
  label: string;
  placeholder: string;
}

function CampoFecha({ control, name, label, placeholder }: CampoFechaProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const dateValue = field.value ? new Date(field.value + 'T00:00:00') : new Date();
        
        const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (Platform.OS === 'android') {
            setShowPicker(false);
          }
          if (event.type === 'set' && selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            field.onChange(formattedDate);
          }
        };

        return (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#6B7280', textTransform: 'uppercase' }}>{label}</Text>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={{
                backgroundColor: '#F9FAFB',
                borderWidth: fieldState.error ? 1 : 1,
                borderColor: fieldState.error ? '#E74C3C' : '#DDE2E8',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <Text style={{ fontSize: 16, color: field.value ? '#1F2937' : '#999' }}>
                {field.value || placeholder}
              </Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleChange}
              />
            )}
            {fieldState.error ? (
              <Text style={{ fontSize: 12, marginTop: 4, color: '#E74C3C' }}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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
        setDocumentoEliminado(false);
      }
    } catch (err) {
      console.error('[EditProjectForm] Error al seleccionar documento:', err);
      Alert.alert('Error', 'No se pudo acceder al selector de archivos.');
    }
  };

  const handleEliminarDocumento = () => {
    Alert.alert(
      'Eliminar documento',
      'Estas seguro de que deseas eliminar el documento?',
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

  const documentoActual = documentoEliminado ? null : (documentoSeleccionado || proyecto.documento_url);
  const tieneDocumentoActual = documentoActual && !documentoEliminado;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ paddingHorizontal: 25, paddingTop: 25, paddingBottom: 25 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 4, color: '#1A3A5C' }}>Editar proyecto</Text>
          <Text style={{ fontSize: 14, marginBottom: 20, color: '#6B7280' }}>Los campos ya vienen cargados con la informacion actual.</Text>

          <CampoTexto
            control={control}
            name="titulo"
            label="Titulo"
            placeholder="Titulo del proyecto (sin numeros)"
          />
          <CampoTexto
            control={control}
            name="descripcion"
            label="Descripcion"
            placeholder="Descripcion del proyecto"
            multiline
          />
          <CampoTexto
            control={control}
            name="autores"
            label="Autores"
            placeholder="Nombres completos (sin numeros)"
          />
          <CampoTexto
            control={control}
            name="tutor_docente"
            label="Tutor Docente"
            placeholder="Nombre del tutor (sin numeros)"
          />
          <CampoTexto
            control={control}
            name="tecnologias_utilizadas"
            label="Tecnologias"
            placeholder="Tecnologias"
            multiline
          />
          <CampoFecha
            control={control}
            name="fecha_inicio"
            label="Fecha Inicio"
            placeholder="Seleccionar fecha"
          />
          <CampoFecha
            control={control}
            name="fecha_fin"
            label="Fecha Fin"
            placeholder="Seleccionar fecha (opcional)"
          />
          <CampoTexto
            control={control}
            name="repositorio_github"
            label="Repositorio GitHub"
            placeholder="https://github.com/..."
            keyboardType="url"
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#6B7280', textTransform: 'uppercase' }}>Documento PDF</Text>
            
            {tieneDocumentoActual && (
              <View style={{ backgroundColor: '#EBF5FB', padding: 12, borderRadius: 12, marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Documento actual:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1A3A5C', marginBottom: 4 }}>
                  {documentoSeleccionado 
                    ? documentoSeleccionado.name 
                    : extraerNombreDocumento(proyecto.documento_url || '')}
                </Text>
                {documentoSeleccionado && (
                  <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                    {(documentoSeleccionado.size / 1024).toFixed(2)} KB
                  </Text>
                )}
                
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Pressable onPress={handleEliminarDocumento} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#E74C3C' }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Eliminar</Text>
                  </Pressable>
                  <Pressable onPress={handleSeleccionarDocumento} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#2E6DA4' }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Reemplazar</Text>
                  </Pressable>
                </View>
              </View>
            )}
            
            {documentoEliminado && (
              <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginTop: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#E74C3C', marginBottom: 8 }}>Documento sera eliminado</Text>
                <Pressable onPress={handleSeleccionarDocumento} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDE2E8', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#1A3A5C', fontWeight: '600' }}>Seleccionar nuevo PDF</Text>
                </Pressable>
              </View>
            )}
            
            {!tieneDocumentoActual && !documentoEliminado && (
              <Pressable onPress={handleSeleccionarDocumento} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDE2E8', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: '#1A3A5C', fontWeight: '600' }}>Seleccionar PDF</Text>
              </Pressable>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#6B7280', textTransform: 'uppercase' }}>Estado</Text>
            <Controller
              control={control}
              name="estado"
              render={({ field, fieldState }) => (
                <View>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    {ESTADOS.map((estado) => {
                      const isActive = field.value === estado;
                      return (
                        <Pressable
                          key={estado}
                          onPress={() => field.onChange(estado)}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isActive ? '#1A3A5C' : '#DDE2E8',
                            alignItems: 'center',
                            backgroundColor: isActive ? '#1A3A5C' : '#fff',
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#FFFFFF' : '#4B5563' }}>
                            {estado}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {fieldState.error ? <Text style={{ fontSize: 12, color: '#E74C3C' }}>{fieldState.error.message}</Text> : null}
                </View>
              )}
            />
          </View>

          {error ? (
            <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#E74C3C', fontSize: 13 }}>Error: {error}</Text>
            </View>
          ) : null}

          <AnimatedPressable
            onPress={onSubmit}
            disabled={!isValid || isLoading}
            style={buttonAnimatedStyle}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
            }}
          >
            <View style={{ 
              marginTop: 8,
              backgroundColor: '#1A3A5C',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: (!isValid || isLoading) ? 0.7 : 1,
            }}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Guardar cambios</Text>
              )}
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </ScrollView>
  );
}