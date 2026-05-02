import React from 'react';
import { View, Text } from 'react-native';

export function TestUniwind() {
  return (
    <View className="flex-1 bg-gray-100 p-6">
      <View 
        className="bg-white rounded-xl p-4"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
      >
        <Text className="text-lg font-bold text-[#1A3A5C]">Test Uniwind</Text>
        <Text className="text-sm text-gray-600 mt-2">Si esto se ve con estilos, Uniwind funciona</Text>
      </View>
    </View>
  );
}