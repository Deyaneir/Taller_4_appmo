// src/features/registro-proyecto/api/createProyecto.ts
import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { CreateProyectoDto } from "@entities/proyecto-tesis/model/types";
import { uploadDocumentoProyecto } from "./uploadDocumento";

export interface ValidationError {
  field: keyof CreateProyectoDto;
  message: string;
}

/** Valida el formulario antes de enviar a Supabase */
export function validateProyecto(
  dto: Partial<CreateProyectoDto>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!dto.titulo?.trim())
    errors.push({ field: "titulo", message: "El título es obligatorio" });

  if (!dto.autores?.trim())
    errors.push({ field: "autores", message: "Ingresa al menos un autor" });

  if (!dto.tutor_docente?.trim())
    errors.push({
      field: "tutor_docente",
      message: "El tutor docente es obligatorio",
    });

  if (!dto.tecnologias_utilizadas?.trim())
    errors.push({
      field: "tecnologias_utilizadas",
      message: "Especifica las tecnologías",
    });

  if (!dto.fecha_inicio?.trim())
    errors.push({
      field: "fecha_inicio",
      message: "La fecha de inicio es obligatoria",
    });

  if (dto.fecha_inicio && !/^\d{4}-\d{2}-\d{2}$/.test(dto.fecha_inicio))
    errors.push({ field: "fecha_inicio", message: "Formato: AAAA-MM-DD" });

  if (dto.repositorio_github && !/^https?:\/\/.+/.test(dto.repositorio_github))
    errors.push({
      field: "repositorio_github",
      message: "Debe ser una URL válida",
    });

  return errors;
}

/** Crea el proyecto tras validar y subir documento si existe */
export async function createProyecto(
  dto: CreateProyectoDto,
  documentoFile?: {
    name: string;
    type: string;
    size: number;
    uri: string;
  }
) {
  try {
    let documentoUrl: string | undefined;

    // Si hay documento, subirlo primero
    if (documentoFile) {
      try {
        const uploadResult = await uploadDocumentoProyecto(documentoFile);
        documentoUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('[createProyecto] Error al subir documento:', uploadError);
        throw new Error(
          uploadError instanceof Error
            ? uploadError.message
            : 'Error al subir el documento'
        );
      }
    }

    // Crear proyecto con documento_url si existe
    const payloadProyecto: CreateProyectoDto = {
      ...dto,
      documento_url: documentoUrl,
    };

    return await proyectoApi.create(payloadProyecto);
  } catch (err) {
    console.error('[createProyecto] Error:', err);
    throw err;
  }
}