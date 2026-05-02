// app/+not-found.tsx
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 justify-center items-center p-6 bg-gray-100">
        <Text className="text-[20px] font-semibold mb-3 text-blue-900">
          Pantalla no encontrada
        </Text>
        <Link href="/" className="text-[16px] text-cyan-600">
          Volver al inicio
        </Link>
      </View>
    </>
  );
}