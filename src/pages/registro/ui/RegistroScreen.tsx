import { RegistroProyectoForm } from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { LogoEPN } from '@shared/ui/LogoEPN';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export function RegistroScreen() {
  return (
    <View className="flex-1 bg-gray-100">
      <View className="pt-4 px-4 pb-2 items-center">
        <LogoEPN size="mediano" />
        <Text className="text-[22px] font-bold text-center mt-2 text-blue-900">
          ESFOT - EPN
        </Text>
        <Text className="text-[14px] font-semibold text-center text-red-600">
          Sistema de Gestión de Tesis
        </Text>
      </View>
      <RegistroProyectoForm onSuccess={() => router.back()} />
    </View>
  );
}