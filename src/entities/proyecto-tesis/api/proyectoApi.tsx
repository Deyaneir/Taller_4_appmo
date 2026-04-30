import { supabase } from "@shared/api/supabase";
import type { CreateProyectoDto, ProyectoTesis, UpdateProyectoDto } from "../model/types";

const TABLE = "proyectos_tesis";

export const proyectoApi = {
  /** Obtiene todos los proyectos ordenados por fecha de creación */
  async getAll(): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[proyectoApi.getAll]", error.message);
      throw new Error(error.message);
    }
    return data ?? [];
  },

  /** Obtiene un proyecto por su ID */
  async getById(id: string): Promise<ProyectoTesis> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /** Elimina un proyecto por su ID */
  async delete(id: string): Promise<void> {
    const recordId = String(id ?? '').trim();

    console.log('[proyectoApi.delete] id:', recordId, 'type:', typeof recordId);

    if (!recordId) {
      throw new Error('ID inválido para eliminar el proyecto.');
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error('[proyectoApi.delete]', error.message);
      throw new Error(error.message);
    }
  },

  /** Cambiado: actualiza un proyecto por su ID para la edición */
  async update(id: string, datos: UpdateProyectoDto): Promise<ProyectoTesis> {
    const recordId = String(id ?? '').trim();

    // Cambiado: el payload se arma de forma explícita y se filtran undefined
    // NOTA: null se incluye intencionalmente para eliminar campos (ej: documento_url)
    // pero undefined se filtra para no actualizar ese campo
    const payload = Object.fromEntries(
      Object.entries({
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        autores: datos.autores,
        tutor_docente: datos.tutor_docente,
        tecnologias_utilizadas: datos.tecnologias_utilizadas,
        fecha_inicio: datos.fecha_inicio,
        fecha_fin: datos.fecha_fin?.trim() ? datos.fecha_fin : undefined,
        repositorio_github: datos.repositorio_github?.trim() ? datos.repositorio_github : undefined,
        documento_url: datos.documento_url === null ? null : (datos.documento_url?.trim() ? datos.documento_url : undefined),
        estado: datos.estado,
      }).filter(([, value]) => value !== undefined)
    ) as UpdateProyectoDto;

    // Cambiado: logs para confirmar que el id y el payload no llegan vacíos.
    console.log("[proyectoApi.update] id:", recordId, "type:", typeof recordId);
    console.log("[proyectoApi.update] payload:", payload);

    if (!recordId) {
      throw new Error("ID inválido para actualizar el proyecto.");
    }

    // La app ya trabaja con proyectos_tesis en getAll/getById/search; aquí mantenemos la
    // misma tabla y pedimos la fila actualizada con select() para confirmar la ejecución.
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", recordId)
      .select();

    console.log("[proyectoApi.update] response:", data);

    if (error) {
      console.error("[proyectoApi.update]", error.message);
      throw new Error(error.message);
    }

    const updated = data?.[0];

    if (!updated) {
      throw new Error("No se pudo actualizar el proyecto.");
    }

    return updated;
  },

  /** Crea un nuevo proyecto de tesis */
  async create(dto: CreateProyectoDto): Promise<ProyectoTesis> {
    const payload: CreateProyectoDto = { ...dto };

    // Evita enviar strings vacios a columnas opcionales
    if (!payload.fecha_fin?.trim()) delete payload.fecha_fin;
    if (!payload.repositorio_github?.trim()) delete payload.repositorio_github;
    if (!payload.documento_url?.trim()) delete payload.documento_url;

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[proyectoApi.create]", error.message);
      throw new Error(error.message);
    }
    return data;
  },

  /** Busca proyectos por título */
  async search(query: string): Promise<ProyectoTesis[]> {
    const normalizedQuery = query.trim();

    let request = supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (normalizedQuery) {
      request = request.ilike("titulo", `%${normalizedQuery}%`);
    }

    const { data, error } = await request;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
};