import { zodResolver } from '@hookform/resolvers/zod';
import { proyectoSchema, type ProyectoFormValues } from '@shared/lib/validators/proyectoSchema';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { createProyecto } from '../api/createProyecto';

const ESTADOS: ProyectoFormValues['estado'][] = ['En Progreso', 'Completado', 'Suspendido'];

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

function CampoInput({
  control,
  name,
  label,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: CampoProps) {
  const [isFocused, setIsFocused] = useState(false);
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
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={(field.value ?? '') as string}
              onChangeText={field.onChange}
              onBlur={() => {
                field.onBlur();
                setIsFocused(false);
                borderColor.value = fieldState.error ? '#E74C3C' : '#DDE2E8';
                borderWidth.value = 1;
              }}
              onFocus={() => {
                setIsFocused(true);
                borderColor.value = '#1A3A5C';
                borderWidth.value = 2;
              }}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              keyboardType={keyboardType}
              autoCapitalize={name === 'repositorio_github' ? 'none' : 'sentences'}
            />
          </Animated.View>
          {fieldState.error ? (
            <Text style={{ fontSize: 12, marginTop: 4, color: '#E74C3C' }}>{fieldState.error.message}</Text>
          ) : null}
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

export function RegistroProyectoForm({ onSuccess }: Props) {
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<{
    name: string;
    size: number;
    type: string;
    uri: string;
  } | null>(null);

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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
          type: asset.mimeType ?? 'application/pdf',
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
      Alert.alert('Exito', 'Proyecto de tesis registrado correctamente.', [
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
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ paddingHorizontal: 25, paddingTop: 25, paddingBottom: 25 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 4, color: '#1A3A5C' }}>Nuevo Proyecto de Tesis</Text>
          <Text style={{ fontSize: 14, marginBottom: 20, color: '#6B7280' }}>ESFOT - Tecnologia Superior en Desarrollo de Software</Text>

          <CampoInput
            control={control}
            name="titulo"
            label="Titulo"
            placeholder="Titulo del proyecto (sin numeros)"
          />
          <CampoInput
            control={control}
            name="descripcion"
            label="Descripcion"
            placeholder="Descripcion del proyecto"
            multiline
          />
          <CampoInput
            control={control}
            name="autores"
            label="Autores"
            placeholder="Nombres completos (sin numeros)"
          />
          <CampoInput
            control={control}
            name="tutor_docente"
            label="Tutor Docente"
            placeholder="Nombre del tutor (sin numeros)"
          />
          <CampoInput
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
          <CampoInput
            control={control}
            name="repositorio_github"
            label="Repositorio GitHub"
            placeholder="https://github.com/..."
            keyboardType="url"
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#6B7280', textTransform: 'uppercase' }}>Documento PDF (Opcional)</Text>
            <Pressable
              onPress={handleSeleccionarDocumento}
              style={{ 
                borderRadius: 12, 
                paddingVertical: 12, 
                paddingHorizontal: 14, 
                backgroundColor: '#FFFFFF', 
                borderWidth: 1, 
                borderColor: '#DDE2E8',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1A3A5C' }}>
                {documentoSeleccionado ? 'Seleccionado: ' : ''}
                {documentoSeleccionado ? documentoSeleccionado.name : 'Seleccionar PDF'}
              </Text>
            </Pressable>
            {documentoSeleccionado && (
              <Text style={{ fontSize: 12, marginTop: 4, color: '#6B7280' }}>
                Tamano: {(documentoSeleccionado.size / 1024).toFixed(2)} KB
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#6B7280', textTransform: 'uppercase' }}>Estado</Text>
            <Controller
              control={control}
              name="estado"
              render={({ field, fieldState }) => (
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  {ESTADOS.map((estado) => {
                    const isActive = field.value === estado;
                    return (
                      <Pressable
                        key={estado}
                        onPress={() => field.onChange(estado)}
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          paddingVertical: 10,
                          alignItems: 'center',
                          backgroundColor: isActive ? '#1A3A5C' : '#FFFFFF',
                          borderWidth: 1,
                          borderColor: isActive ? '#1A3A5C' : '#DDE2E8',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#FFFFFF' : '#4B5563' }}>
                          {estado}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          </View>

          <AnimatedPressable
            onPress={handleGuardar}
            disabled={!isValid || isSubmitting}
            style={buttonAnimatedStyle}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
            }}
          >
            <View style={{ 
              borderRadius: 12, 
              paddingVertical: 14, 
              alignItems: 'center', 
              opacity: (!isValid || isSubmitting) ? 0.7 : 1,
              backgroundColor: '#1A3A5C' 
            }}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Registrar Proyecto</Text>
              )}
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </ScrollView>
  );
}