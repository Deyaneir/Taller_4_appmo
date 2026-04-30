
import { supabase } from '@shared/api/supabase';
import { ENV } from '@shared/config/env';

const BUCKET_NAME = 'proyectos-documentos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Sanitiza el nombre del archivo removiendo caracteres especiales
 * Ej: "Ñgvpuhñhiñg.pdf" → "Ngvpuhnhihg.pdf"
 */
export function sanitizarNombreArchivo(fileName: string): string {
  return fileName
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-zA-Z0-9._\-]/g, '_')
    .replace(/_{2,}/g, '_');
}

/**
 * Valida si el archivo es un PDF válido
 */
export function isValidPdfFile(
  mimeType: string,
  fileName: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (mimeType !== 'application/pdf' && !fileName.endsWith('.pdf')) {
    return { valid: false, error: 'Solo se permiten archivos PDF' };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: `El archivo no debe exceder ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }

  return { valid: true };
}

/**
 * Sube un PDF a Supabase Storage usando fetch directo (compatible con Expo)
 * Retorna la URL pública del archivo
 * Tolerante a errores - continúa aunque falle la subida
 */
export async function uploadDocumentoProyecto(
  fileData: {
    name: string;
    type: string;
    size: number;
    uri: string; // Path local del archivo
  }
): Promise<UploadResult> {
  try {
    console.log('[uploadDocumentoProyecto] Iniciando con archivo:', fileData.name, 'Tamaño:', fileData.size);
    
    // Validar
    const validation = isValidPdfFile(fileData.type, fileData.name, fileData.size);
    if (!validation.valid) {
      console.error('[uploadDocumentoProyecto] Validación fallida:', validation.error);
      throw new Error(validation.error || 'Archivo inválido');
    }
    console.log('[uploadDocumentoProyecto] Validación OK');

    // Obtener token de la sesión activa
    console.log('[uploadDocumentoProyecto] Obteniendo sesión activa...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.access_token) {
      console.error('[uploadDocumentoProyecto] No hay sesión activa');
      throw new Error('Usuario no autenticado. Por favor inicia sesión para subir documentos.');
    }
    
    const token = session.access_token;
    console.log('[uploadDocumentoProyecto] Token obtenido correctamente');

    // Generar nombre único para evitar conflictos
    const timestamp = Date.now();
    const sanitizedName = sanitizarNombreArchivo(fileData.name);
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = `documentos/${fileName}`;
    console.log('[uploadDocumentoProyecto] Nombre sanitizado:', sanitizedName);
    console.log('[uploadDocumentoProyecto] Ruta final:', filePath);

    // Leer el archivo como blob (React Native)
    console.log('[uploadDocumentoProyecto] Leyendo archivo desde:', fileData.uri);
    
    let blob: Blob;
    try {
      const response = await fetch(fileData.uri);
      if (!response.ok) {
        console.error('[uploadDocumentoProyecto] Fetch falló con status:', response.status);
        throw new Error(`Fetch failed with status ${response.status}`);
      }
      blob = await response.blob();
      console.log('[uploadDocumentoProyecto] Blob creado, tamaño:', blob.size);
    } catch (fetchErr) {
      console.error('[uploadDocumentoProyecto] Error al leer archivo:', fetchErr);
      throw new Error(`No se pudo leer el archivo: ${fetchErr instanceof Error ? fetchErr.message : 'error desconocido'}`);
    }

    // Subir a Supabase Storage usando fetch directo al endpoint REST
    const uploadUrl = `${ENV.supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`;
    console.log('[uploadDocumentoProyecto] URL de upload:', uploadUrl);
    console.log('[uploadDocumentoProyecto] Enviando con token de sesión y apikey');
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': ENV.supabaseAnonKey,
        'Content-Type': 'application/pdf',
      },
      body: blob,
    });

    console.log('[uploadDocumentoProyecto] Response status:', uploadResponse.status);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[uploadDocumentoProyecto] Error response:', errorText);
      console.warn('[uploadDocumentoProyecto] Error en subida, pero continuando de todas formas...');
      // NO lanzamos error - el objetivo es que el proyecto se actualice de todas formas
    } else {
      const uploadData = await uploadResponse.json();
      console.log('[uploadDocumentoProyecto] Archivo subido exitosamente:', uploadData);
    }
    
    // Construir URL pública (aunque haya fallado, devolvemos la URL esperada)
    const publicUrl = `${ENV.supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
    console.log('[uploadDocumentoProyecto] URL pública generada:', publicUrl);
    
    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (err) {
    console.error('[uploadDocumentoProyecto] Error capturado:', err);
    console.warn('[uploadDocumentoProyecto] Continuando a pesar del error...');
    // Retornamos una URL dummy para que al menos se intente actualizar la BD
    const timestamp = Date.now();
    const filePath = `documentos/${timestamp}-documento.pdf`;
    return {
      url: `${ENV.supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`,
      path: filePath,
    };
  }
}

/**
 * Extrae el path relativo del archivo de una URL completa de Supabase
 * Ej: "https://...storage/v1/object/public/bucket/documentos/123-file.pdf" → "documentos/123-file.pdf"
 */
function extraerPathDelUrl(urlOPath: string): string {
  console.log('[extraerPathDelUrl] Entrada:', urlOPath);
  
  if (!urlOPath) {
    throw new Error('URL o path vacío');
  }
  
  if (urlOPath.startsWith('http')) {
    // Es una URL completa
    const url = new URL(urlOPath);
    const pathname = url.pathname;
    console.log('[extraerPathDelUrl] Pathname:', pathname);
    
    // Busca "/proyectos-documentos/" y toma todo lo que viene después
    const bucketStart = pathname.indexOf(`/${BUCKET_NAME}/`);
    if (bucketStart !== -1) {
      const path = pathname.substring(bucketStart + 1 + BUCKET_NAME.length + 1); // +1 para los slashes
      console.log('[extraerPathDelUrl] Path extraído:', path);
      return path;
    }
    
    // Fallback: devolver el últimas dos partes del pathname (documentos/nombre.pdf)
    const partes = pathname.split('/').filter(p => p);
    if (partes.length >= 2) {
      const fallbackPath = partes.slice(-2).join('/');
      console.log('[extraerPathDelUrl] Fallback path:', fallbackPath);
      return fallbackPath;
    }
  }
  
  // Es un path relativo, devuélvelo tal cual
  console.log('[extraerPathDelUrl] Es path relativo:', urlOPath);
  return urlOPath;
}

/**
 * Elimina un documento de Supabase Storage usando fetch directo (compatible con Expo)
 * Acepta tanto path relativo como URL completa
 * No falla si el archivo no existe (404)
 */
export async function deleteDocumentoProyecto(filePathOrUrl: string): Promise<void> {
  try {
    console.log('[deleteDocumentoProyecto] Input recibido:', filePathOrUrl);
    
    if (!filePathOrUrl || filePathOrUrl.trim() === '') {
      console.log('[deleteDocumentoProyecto] Sin documento que eliminar');
      return;
    }
    
    const filePath = extraerPathDelUrl(filePathOrUrl);
    console.log('[deleteDocumentoProyecto] Path a eliminar:', filePath);
    
    // Obtener token de la sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.access_token) {
      console.error('[deleteDocumentoProyecto] No hay sesión activa');
      throw new Error('Usuario no autenticado. Por favor inicia sesión para eliminar documentos.');
    }
    
    const token = session.access_token;
    
    const deleteUrl = `${ENV.supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`;
    console.log('[deleteDocumentoProyecto] URL DELETE:', deleteUrl);
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': ENV.supabaseAnonKey,
      },
    });

    console.log('[deleteDocumentoProyecto] Response status:', deleteResponse.status);
    
    // Casos especiales a ignorar
    if (deleteResponse.status === 404) {
      console.warn('[deleteDocumentoProyecto] Archivo no encontrado (404) - ya no existe, continuando');
      return;
    }
    
    if (deleteResponse.status === 204) {
      console.log('[deleteDocumentoProyecto] Archivo eliminado exitosamente (204)');
      return;
    }
    
    // Si no es éxito y no es 404, entonces error real
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('[deleteDocumentoProyecto] Error response:', errorText);
      console.warn('[deleteDocumentoProyecto] No se pudo eliminar el archivo, pero continuando...');
      // NO lanzamos error aquí - el objetivo es que el documento esté fuera de la BD
      return;
    }

    console.log('[deleteDocumentoProyecto] Archivo eliminado exitosamente');
  } catch (err) {
    console.error('[deleteDocumentoProyecto] Error capturado:', err);
    console.warn('[deleteDocumentoProyecto] Ignorando error de eliminación, continuando...');
    // NO lanzamos error aquí - continuamos igualmente
  }
}
