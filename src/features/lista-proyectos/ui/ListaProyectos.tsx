import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { ProyectoCard } from "@entities/proyecto-tesis/ui/ProyectoCard";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";

export function ListaProyectos() {
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primeraEntrada = useRef(true);

  const cargarProyectos = useCallback(async (silent = false) => {
    if (!silent) setCargando(true);
    setError(null);

    try {
      const data = await proyectoApi.getAll();
      setProyectos(data);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error desconocido";
      setError(mensaje);
    } finally {
      if (!silent) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProyectos();
  }, [cargarProyectos]);

  useFocusEffect(
    useCallback(() => {
      if (primeraEntrada.current) {
        primeraEntrada.current = false;
        return;
      }

      cargarProyectos(true);
    }, [cargarProyectos]),
  );

  if (cargando)
    return (
      <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />
    );

  if (error)
    return <Text style={styles.error}>Error al cargar proyectos: {error}</Text>;

  if (proyectos.length === 0)
    return <Text style={styles.vacio}>No hay proyectos registrados aún.</Text>;

  return (
    <FlatList
      data={proyectos}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <ProyectoCard
          proyecto={item}
          onEliminado={() => cargarProyectos(true)}
        />
      )}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16 },
  centro: { flex: 1, justifyContent: "center" },
  error: { color: "#E74C3C", textAlign: "center", padding: 20 },
  vacio: { color: "#888", textAlign: "center", padding: 40 },
});